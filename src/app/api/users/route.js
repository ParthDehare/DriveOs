import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const mapUser = (user) => {
  if (!user) return user;
  const { id, school_id, is_active, ...rest } = user;
  return {
    ...rest,
    _id: id,
    schoolId: school_id,
    isActive: is_active
  };
};

export async function GET(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  try {
    let query = supabaseAdmin.from('users').select('id, name, email, phone, role, school_id, avatar, is_active, created_at, updated_at');
    if (role) {
      query = query.eq('role', role);
    }
    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json(data.map(mapUser));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, email, phone, password, role, schoolId, avatar } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin.from('users').insert({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      school_id: schoolId || auth.session.user.schoolId,
      avatar,
      is_active: true
    }).select('id, name, email, phone, role, school_id, avatar, is_active, created_at, updated_at').single();

    if (error) throw error;

    return NextResponse.json(mapUser(data), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
