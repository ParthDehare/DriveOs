import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const vehicles = await Vehicle.find({ schoolId: auth.session.user.schoolId, isActive: true });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const vehicle = new Vehicle({ ...body, schoolId: auth.session.user.schoolId });
    await vehicle.save();
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
