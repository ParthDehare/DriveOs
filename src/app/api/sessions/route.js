import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import { createSession } from "@/services/scheduling";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkStudentPaymentStatus } from "@/services/payments";

export async function GET(request) {
  await connectDB();
  const userSession = await getServerSession();
  if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = {};
  
  if (userSession.user.role === 'admin') {
    query.schoolId = userSession.user.schoolId;
  } else if (userSession.user.role === 'instructor') {
    query.instructorId = userSession.user.id;
  } else if (userSession.user.role === 'student') {
    // We would need to find enrollments for the student first, or lookup by enrollmentId
    // Simplified for now, in a real app we'd join or use multiple queries
    const enrollments = await require('@/models/Enrollment').default.find({ studentId: userSession.user.id });
    const enrollmentIds = enrollments.map(e => e._id);
    query.enrollmentId = { $in: enrollmentIds };
  }

  if (from || to) {
    query.scheduledAt = {};
    if (from) query.scheduledAt.$gte = new Date(from);
    if (to) query.scheduledAt.$lte = new Date(to);
  }

  try {
    const sessions = await Session.find(query)
      .populate('instructorId', 'name')
      .populate('vehicleId', 'make model licensePlate')
      .populate('enrollmentId');
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    body.schoolId = auth.session.user.schoolId;
    
    const paymentStatus = await checkStudentPaymentStatus(body.enrollmentId);
    if (paymentStatus.hasOverdue && !body.overrideLockout) {
      return NextResponse.json({
        message: 'Student has overdue payments',
        overdueCount: paymentStatus.overdueCount,
        overdueAmount: paymentStatus.overdueAmount,
        requiresOverride: true
      }, { status: 402 });
    }
    
    const session = await createSession(body);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
