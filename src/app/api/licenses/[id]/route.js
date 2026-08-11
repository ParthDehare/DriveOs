import connectDB from "@/lib/mongodb";
import LicenseInfo from "@/models/LicenseInfo";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin', 'student']);
  if (auth.error) return auth.error;

  try {
    const license = await LicenseInfo.findOne({ studentId: params.id });
    if (!license) return NextResponse.json({ message: "License info not found" }, { status: 404 });

    if (auth.session.user.role === 'student' && license.studentId.toString() !== auth.session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(license);
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
    const license = await LicenseInfo.findOneAndUpdate({ studentId: params.id }, body, { new: true });
    if (!license) return NextResponse.json({ message: "License info not found" }, { status: 404 });
    return NextResponse.json(license);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
