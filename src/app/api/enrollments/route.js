import { supabaseAdmin } from '@/lib/supabase';
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    let query = supabaseAdmin.from('enrollments').select('*, studentId:users!student_id(*), packageId:packages!package_id(*)');
    if (session.user.role === 'student') {
      query = query.eq('student_id', session.user.id);
    } else if (session.user.role === 'admin') {
      query = query.eq('school_id', session.user.schoolId);
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedData = data.map(item => ({
      ...item,
      _id: item.id,
      studentId: item.studentId ? { ...item.studentId, _id: item.studentId.id } : null,
      packageId: item.packageId ? { ...item.packageId, _id: item.packageId.id } : null,
      schoolId: item.school_id,
      startDate: item.start_date,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { studentId, packageId, startDate } = body;
    const schoolId = auth.session.user.schoolId;

    const { data: pkg, error: pkgError } = await supabaseAdmin.from('packages').select('*').eq('id', packageId).single();
    if (pkgError || !pkg) throw new Error("Package not found");

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin.from('enrollments').insert({
      student_id: studentId,
      package_id: packageId,
      school_id: schoolId,
      start_date: startDate || new Date().toISOString()
    }).select().single();

    if (enrollmentError) throw enrollmentError;

    const { data: installments, error: instError } = await supabaseAdmin.from('installment_plans').select('*').eq('package_id', packageId);
    if (instError) throw instError;

    if (installments && installments.length > 0) {
      const paymentDocs = installments.map(inst => {
        const dueDate = new Date(enrollment.start_date);
        dueDate.setDate(dueDate.getDate() + inst.due_days_after_enrollment);

        return {
          enrollment_id: enrollment.id,
          school_id: schoolId,
          amount: (pkg.price * inst.percentage_of_total) / 100,
          due_date: dueDate.toISOString(),
          status: 'pending',
          tranche_number: inst.tranche_number
        };
      });

      const { error: payError } = await supabaseAdmin.from('payments').insert(paymentDocs);
      if (payError) throw payError;
    } else {
      // Full payment upfront
      const { error: payError } = await supabaseAdmin.from('payments').insert({
        enrollment_id: enrollment.id,
        school_id: schoolId,
        amount: pkg.price,
        due_date: enrollment.start_date,
        status: 'pending',
        tranche_number: 1
      });
      if (payError) throw payError;
    }

    const formattedEnrollment = {
      ...enrollment,
      _id: enrollment.id,
      studentId: enrollment.student_id,
      packageId: enrollment.package_id,
      schoolId: enrollment.school_id,
      startDate: enrollment.start_date
    };

    return NextResponse.json(formattedEnrollment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
