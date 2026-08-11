import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const auth = await requireRole(['admin', 'student']);
  if (auth.error) return auth.error;

  try {
    const { data: enrollment, error } = await supabaseAdmin.from('enrollments')
      .select('*, studentId:users!student_id(*), packageId:packages!package_id(*)')
      .eq('id', params.id).single();
      
    if (error || !enrollment) return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });

    // Students can only see their own
    if (auth.session.user.role === 'student' && enrollment.student_id !== auth.session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data: payments, error: payError } = await supabaseAdmin.from('payments').select('*').eq('enrollment_id', enrollment.id);
    if (payError) throw payError;

    const formattedEnrollment = {
      ...enrollment,
      _id: enrollment.id,
      studentId: enrollment.studentId ? { ...enrollment.studentId, _id: enrollment.studentId.id } : null,
      packageId: enrollment.packageId ? { ...enrollment.packageId, _id: enrollment.packageId.id } : null,
      schoolId: enrollment.school_id,
      startDate: enrollment.start_date
    };

    const formattedPayments = payments.map(p => ({
      ...p,
      _id: p.id,
      enrollmentId: p.enrollment_id,
      schoolId: p.school_id,
      dueDate: p.due_date,
      trancheNumber: p.tranche_number
    }));

    return NextResponse.json({ enrollment: formattedEnrollment, payments: formattedPayments });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { status } = await request.json();
    const { data: enrollment, error } = await supabaseAdmin.from('enrollments')
      .update({ status })
      .eq('id', params.id).select().single();
      
    if (error || !enrollment) return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
    
    const formattedEnrollment = {
      ...enrollment,
      _id: enrollment.id,
      studentId: enrollment.student_id,
      packageId: enrollment.package_id,
      schoolId: enrollment.school_id,
      startDate: enrollment.start_date
    };
    return NextResponse.json(formattedEnrollment);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
