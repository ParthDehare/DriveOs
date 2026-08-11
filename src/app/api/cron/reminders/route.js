import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Session from '@/models/Session';
import LicenseInfo from '@/models/LicenseInfo';
import Enrollment from '@/models/Enrollment';
import { sendNotification } from '@/services/notifications';

export async function GET(request) {
  try {
    const cronKey = request.headers.get('x-cron-key');
    if (cronKey && cronKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    
    // A. Payment Reminders (due between now and 3 days from now)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const pendingPayments = await Payment.find({
      status: 'pending',
      dueDate: { $gte: now, $lte: threeDaysFromNow }
    });

    let paymentCount = 0;
    for (const payment of pendingPayments) {
      // Find the enrollment -> studentId
      const enrollment = await Enrollment.findById(payment.enrollmentId || payment.enrollment);
      const studentId = enrollment?.studentId || payment.studentId;
      if (studentId) {
        await sendNotification(studentId, 'Your payment is due soon...');
        paymentCount++;
      }
    }

    // B. Class Reminders (scheduledAt is tomorrow)
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const upcomingSessions = await Session.find({
      scheduledAt: { $gte: startOfTomorrow, $lte: endOfTomorrow }
    });

    let classCount = 0;
    for (const session of upcomingSessions) {
      if (session.studentId) {
        await sendNotification(session.studentId, 'Reminder for your class tomorrow...');
      }
      if (session.instructorId) {
        await sendNotification(session.instructorId, 'Reminder for your class tomorrow...');
      }
      classCount++;
    }

    // C. LL Expiry Alerts (llExpiryDate is between now and 30 days from now)
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringLicenses = await LicenseInfo.find({
      llExpiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    });

    let licenseCount = 0;
    for (const license of expiringLicenses) {
      if (license.studentId) {
        await sendNotification(license.studentId, 'Your Learners License is expiring soon...');
        licenseCount++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        payments: paymentCount,
        classes: classCount,
        licenses: licenseCount
      }
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
