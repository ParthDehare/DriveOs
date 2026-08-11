import { supabaseAdmin } from "@/lib/supabase";
import { requireRole, getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

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

export async function GET(request, { params }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== 'admin' && session.user.id !== params.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin.from('users').select('id, name, email, phone, role, school_id, avatar, is_active, created_at, updated_at').eq('id', params.id).single();
    if (error || !data) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(mapUser(data));
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
    if (updateData.isActive !== undefined) {
      updateData.is_active = updateData.isActive;
      delete updateData.isActive;
    }

    const { data, error } = await supabaseAdmin.from('users').update(updateData).eq('id', params.id).select('id, name, email, phone, role, school_id, avatar, is_active, created_at, updated_at').single();
    if (error || !data) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(mapUser(data));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin.from('users').update({ is_active: false }).eq('id', params.id).select('id, name, email, phone, role, school_id, avatar, is_active, created_at, updated_at').single();
    if (error || !data) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
