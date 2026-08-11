import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

const mapLicense = (license) => {
  if (!license) return license;
  const { id, school_id, student_id, users, ...rest } = license;
  
  let studentId = student_id;
  if (users) {
    studentId = {
      _id: users.id,
      name: users.name,
      email: users.email
    };
  }
  
  return {
    ...rest,
    _id: id,
    schoolId: school_id,
    studentId: studentId
  };
};

export async function GET(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin.from('license_info').select('*, users!student_id(id, name, email)').eq('school_id', auth.session.user.schoolId);
    if (error) throw error;
    return NextResponse.json(data.map(mapLicense));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const insertData = { ...body, school_id: auth.session.user.schoolId };
    
    if (insertData.studentId) {
      insertData.student_id = insertData.studentId;
      delete insertData.studentId;
    }
    
    const { data: existing, error: existError } = await supabaseAdmin.from('license_info').select('*').eq('student_id', insertData.student_id).single();
    
    let license;
    if (existing) {
      const { data, error } = await supabaseAdmin.from('license_info').update(insertData).eq('student_id', insertData.student_id).select().single();
      if (error) throw error;
      license = data;
    } else {
      const { data, error } = await supabaseAdmin.from('license_info').insert(insertData).select().single();
      if (error) throw error;
      license = data;
    }
    
    return NextResponse.json(mapLicense(license), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
