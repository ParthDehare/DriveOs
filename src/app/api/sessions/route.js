import { supabaseAdmin } from '@/lib/supabase';
import { createSession } from "@/services/scheduling";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkStudentPaymentStatus } from "@/services/payments";

export async function GET(request) {
  const userSession = await getServerSession();
  if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    let query = supabaseAdmin.from('sessions').select('*, instructorId:users!instructor_id(id, name), vehicleId:vehicles!vehicle_id(id, make, model, license_plate), enrollmentId:enrollments!enrollment_id(*)');
    
    if (userSession.user.role === 'admin') {
      query = query.eq('school_id', userSession.user.schoolId);
    } else if (userSession.user.role === 'instructor') {
      query = query.eq('instructor_id', userSession.user.id);
    } else if (userSession.user.role === 'student') {
      const { data: enrollments } = await supabaseAdmin.from('enrollments').select('id').eq('student_id', userSession.user.id);
      const enrollmentIds = enrollments ? enrollments.map(e => e.id) : [];
      if (enrollmentIds.length > 0) {
        query = query.in('enrollment_id', enrollmentIds);
      } else {
        return NextResponse.json([]);
      }
    }

    if (from) query = query.gte('scheduled_at', new Date(from).toISOString());
    if (to) query = query.lte('scheduled_at', new Date(to).toISOString());

    const { data: sessions, error } = await query;
    if (error) throw error;

    const formattedSessions = sessions.map(s => ({
      ...s,
      _id: s.id,
      schoolId: s.school_id,
      instructorId: s.instructorId ? { ...s.instructorId, _id: s.instructorId.id } : null,
      vehicleId: s.vehicleId ? { ...s.vehicleId, _id: s.vehicleId.id, licensePlate: s.vehicleId.license_plate } : null,
      enrollmentId: s.enrollmentId ? { ...s.enrollmentId, _id: s.enrollmentId.id } : null,
      scheduledAt: s.scheduled_at
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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
