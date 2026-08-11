import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import Session from "@/models/Session";
import Payment from "@/models/Payment";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;
  
  const schoolId = auth.session.user.schoolId;

  try {
    const totalStudents = await Enrollment.countDocuments({ schoolId, status: 'active' });
    const totalInstructors = await User.countDocuments({ schoolId, role: 'instructor', isActive: true });
    const totalVehicles = await Vehicle.countDocuments({ schoolId, isActive: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await Session.countDocuments({
      schoolId,
      scheduledAt: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] }
    });

    const allPayments = await Payment.find({ schoolId });
    
    let pendingPayments = 0;
    let overduePayments = 0;
    let monthlyRevenue = 0;
    let totalPaid = 0;
    let totalDue = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allPayments.forEach(payment => {
      totalDue += payment.amount;
      
      if (payment.status === 'paid') {
        totalPaid += payment.amount;
        if (payment.paidAt) {
          const paidDate = new Date(payment.paidAt);
          if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
            monthlyRevenue += payment.amount;
          }
        }
      } else {
        if (new Date(payment.dueDate) < now) {
          overduePayments += payment.amount;
        } else if (payment.status === 'pending') {
          pendingPayments += payment.amount;
        }
      }
    });

    const collectionRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    const recentEnrollments = await Enrollment.find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('studentId', 'name email')
      .populate('packageId', 'name');

    return NextResponse.json({
      totalStudents,
      totalInstructors,
      totalVehicles,
      todaySessions,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      collectionRate,
      recentEnrollments
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
