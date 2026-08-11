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

export async function GET(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabaseAdmin.from('vehicles').select('*').eq('school_id', auth.session.user.schoolId).eq('is_active', true);
    if (error) throw error;
    return NextResponse.json(data.map(mapVehicle));
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
    
    if (insertData.isActive !== undefined) {
      insertData.is_active = insertData.isActive;
      delete insertData.isActive;
    }

    const { data, error } = await supabaseAdmin.from('vehicles').insert(insertData).select().single();
    if (error) throw error;
    return NextResponse.json(mapVehicle(data), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
