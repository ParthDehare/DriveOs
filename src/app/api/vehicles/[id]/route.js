import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

const mapVehicle = (vehicle) => {
  if (!vehicle) return vehicle;
  const { id, school_id, is_active, ...rest } = vehicle;
  return {
    ...rest,
    _id: id,
    schoolId: school_id,
    isActive: is_active
  };
};

export async function GET(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin.from('vehicles').select('*').eq('id', params.id).single();
    if (error || !data) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(mapVehicle(data));
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

    const { data, error } = await supabaseAdmin.from('vehicles').update(updateData).eq('id', params.id).select().single();
    if (error || !data) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(mapVehicle(data));
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin.from('vehicles').update({ is_active: false }).eq('id', params.id).select().single();
    if (error || !data) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
