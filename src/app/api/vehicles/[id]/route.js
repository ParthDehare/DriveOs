import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const vehicle = await Vehicle.findById(params.id);
    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const vehicle = await Vehicle.findByIdAndUpdate(params.id, body, { new: true });
    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const vehicle = await Vehicle.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
