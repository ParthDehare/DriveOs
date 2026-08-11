import connectDB from "@/lib/mongodb";
import LicenseInfo from "@/models/LicenseInfo";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const licenses = await LicenseInfo.find({ schoolId: auth.session.user.schoolId }).populate('studentId', 'name email');
    return NextResponse.json(licenses);
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
    body.schoolId = auth.session.user.schoolId;

    let license = await LicenseInfo.findOne({ studentId: body.studentId });
    if (license) {
      license = await LicenseInfo.findOneAndUpdate({ studentId: body.studentId }, body, { new: true });
    } else {
      license = new LicenseInfo(body);
      await license.save();
    }
    
    return NextResponse.json(license, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
