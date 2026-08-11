import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

const mapVehicle = (vehicle) => {
  if (!vehicle) return vehicle;
  const { id, school_id, is_active, license_plate, transmission_type, fuel_type, created_at, updated_at, ...rest } = vehicle;
  return {
    ...rest,
    _id: id,
    schoolId: school_id,
    isActive: is_active,
    licensePlate: license_plate,
    transmissionType: transmission_type,
    fuelType: fuel_type,
    createdAt: created_at,
    updatedAt: updated_at
  };
};

export async function GET(request) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    let query = supabaseAdmin.from('vehicles').select('*').eq('is_active', true);
    if (auth.session.user.schoolId) {
      query = query.eq('school_id', auth.session.user.schoolId);
    }
    const { data, error } = await query;
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
    const { licensePlate, make, model, year, transmissionType, fuelType } = body;

    const { data, error } = await supabaseAdmin.from('vehicles').insert({
      school_id: auth.session.user.schoolId,
      license_plate: licensePlate,
      make,
      model,
      year: year ? parseInt(year) : null,
      transmission_type: (transmissionType || 'manual').toLowerCase(),
      fuel_type: (fuelType || 'petrol').toLowerCase(),
      is_active: true
    }).select().single();

    if (error) throw error;
    return NextResponse.json(mapVehicle(data), { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
