import { supabaseAdmin } from "@/lib/supabase";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const mapPackage = (pkg) => {
  if (!pkg) return pkg;
  const { id, school_id, is_active, ...rest } = pkg;
  return {
    ...rest,
    _id: id,
    schoolId: school_id,
    isActive: is_active
  };
};

export async function GET(request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { data, error } = await supabaseAdmin.from('packages').select('*').eq('school_id', session.user.schoolId).eq('is_active', true);
    if (error) throw error;
    return NextResponse.json(data.map(mapPackage));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { installments, ...packageData } = body;

    const insertData = { ...packageData, school_id: auth.session.user.schoolId };
    if (insertData.isActive !== undefined) {
      insertData.is_active = insertData.isActive;
      delete insertData.isActive;
    }
    
    const { data: newPackage, error } = await supabaseAdmin.from('packages').insert(insertData).select().single();
    if (error) throw error;

    if (installments && Array.isArray(installments)) {
      const installmentDocs = installments.map((inst, index) => ({
        package_id: newPackage.id,
        tranche_number: index + 1,
        percentage_of_total: inst.percentageOfTotal,
        due_days_after_enrollment: inst.dueDaysAfterEnrollment
      }));
      const { error: instError } = await supabaseAdmin.from('installment_plans').insert(installmentDocs);
      if (instError) {
        await supabaseAdmin.from('packages').delete().eq('id', newPackage.id);
        throw instError;
      }
    }

    return NextResponse.json(mapPackage(newPackage), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
