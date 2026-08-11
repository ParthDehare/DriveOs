import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const pkg = await Package.findById(params.id);
    if (!pkg) return NextResponse.json({ message: "Package not found" }, { status: 404 });
    return NextResponse.json(pkg);
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
    const pkg = await Package.findByIdAndUpdate(params.id, body, { new: true });
    if (!pkg) return NextResponse.json({ message: "Package not found" }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const pkg = await Package.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!pkg) return NextResponse.json({ message: "Package not found" }, { status: 404 });
    return NextResponse.json({ message: "Package deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
