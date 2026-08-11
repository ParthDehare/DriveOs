import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  const auth = await requireRole(['instructor', 'admin']);
  if (auth.error) return auth.error;

  const { session: { user } } = auth;

  try {
    const { sessionId, studentPresent, notes } = await request.json();

    if (!sessionId || studentPresent === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const { data: sessionRecord, error: sessionError } = await supabaseAdmin.from('sessions').select('*').eq('id', sessionId).single();
    if (sessionError || !sessionRecord) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (user.role === 'instructor' && sessionRecord.instructor_id !== user.id) {
      return NextResponse.json({ message: "Forbidden: Session does not belong to you" }, { status: 403 });
    }

    if (user.role === 'admin' && sessionRecord.school_id !== user.schoolId) {
      return NextResponse.json({ message: "Forbidden: Session outside your school" }, { status: 403 });
    }

    // Check if attendance already marked
    const { data: existingAttendance } = await supabaseAdmin.from('attendance').select('*').eq('session_id', sessionId).single();
    if (existingAttendance) {
      return NextResponse.json({ message: "Attendance already marked for this session" }, { status: 400 });
    }

    // 1. Create Attendance
    const { data: attendance, error: attError } = await supabaseAdmin.from('attendance').insert({
      session_id: sessionId,
      marked_by: user.id,
      student_present: studentPresent,
      notes
    }).select().single();
    
    if (attError) throw attError;

    // 2. Update Session status
    await supabaseAdmin.from('sessions').update({ status: studentPresent ? 'completed' : 'no_show' }).eq('id', sessionId);

    // 3. Update Enrollment if present
    if (studentPresent && sessionRecord.enrollment_id) {
      const { data: enrollment } = await supabaseAdmin.from('enrollments').select('sessions_completed').eq('id', sessionRecord.enrollment_id).single();
      if (enrollment) {
        await supabaseAdmin.from('enrollments').update({ sessions_completed: (enrollment.sessions_completed || 0) + 1 }).eq('id', sessionRecord.enrollment_id);
      }
    }

    const formattedAttendance = {
      ...attendance,
      _id: attendance.id,
      sessionId: attendance.session_id,
      markedBy: attendance.marked_by,
      studentPresent: attendance.student_present
    };

    return NextResponse.json(formattedAttendance, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
