import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNotification } from '@/services/notifications';

function formatToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => formatToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const finalKey = camelKey === 'id' ? '_id' : camelKey;
      result[finalKey] = formatToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export async function GET(request) {
  try {
    const cronKey = request.headers.get('x-cron-key');
    if (cronKey && cronKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // A. Payment Reminders (due between now and 3 days from now)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const { data: pendingPaymentsData } = await supabaseAdmin.from('payments')
      .select('*')
      .eq('status', 'pending')
      .gte('due_date', now.toISOString())
      .lte('due_date', threeDaysFromNow.toISOString());

    const pendingPayments = formatToCamelCase(pendingPaymentsData || []);

    let paymentCount = 0;
    for (const payment of pendingPayments) {
      const enrollmentId = payment.enrollmentId || payment.enrollment;
      const { data: enrollment } = await supabaseAdmin.from('enrollments').select('student_id').eq('id', enrollmentId).single();
      const studentId = enrollment?.student_id || payment.studentId;
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

    const { data: upcomingSessionsData } = await supabaseAdmin.from('sessions')
      .select('*')
      .gte('scheduled_at', startOfTomorrow.toISOString())
      .lte('scheduled_at', endOfTomorrow.toISOString());

    const upcomingSessions = formatToCamelCase(upcomingSessionsData || []);

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

    const { data: expiringLicensesData } = await supabaseAdmin.from('license_info')
      .select('*')
      .gte('ll_expiry_date', now.toISOString())
      .lte('ll_expiry_date', thirtyDaysFromNow.toISOString());

    const expiringLicenses = formatToCamelCase(expiringLicensesData || []);

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
