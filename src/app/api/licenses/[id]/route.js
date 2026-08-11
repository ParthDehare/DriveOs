import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

const mapLicense = (license) => {
  if (!license) return license;
  const { id, school_id, student_id, ...rest } = license;
  
  return {
    ...rest,
    _id: id,
    schoolId: school_id,
    studentId: student_id
  };
};

export async function GET(request, { params }) {
  const auth = await requireRole(['admin', 'student']);
  if (auth.error) return auth.error;

  try {
    const { data: license, error } = await supabaseAdmin.from('license_info').select('*').eq('student_id', params.id).single();
    if (error || !license) return NextResponse.json({ message: "License info not found" }, { status: 404 });

    if (auth.session.user.role === 'student' && license.student_id !== auth.session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(mapLicense(license));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updateData = { ...body };
    if (updateData.schoolId !== undefined) {
      updateData.school_id = updateData.schoolId;
      delete updateData.schoolId;
    }
    if (updateData.studentId !== undefined) {
      updateData.student_id = updateData.studentId;
      delete updateData.studentId;
    }

    const { data: license, error } = await supabaseAdmin.from('license_info').update(updateData).eq('student_id', params.id).select().single();
    if (error || !license) return NextResponse.json({ message: "License info not found" }, { status: 404 });
    return NextResponse.json(mapLicense(license));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
