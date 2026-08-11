import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin', 'student']);
  if (auth.error) return auth.error;

  try {
    const enrollment = await Enrollment.findById(params.id)
      .populate('studentId', '-password')
      .populate('packageId');
      
    if (!enrollment) return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });

    // Students can only see their own
    if (auth.session.user.role === 'student' && enrollment.studentId._id.toString() !== auth.session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const payments = await Payment.find({ enrollmentId: enrollment._id });

    return NextResponse.json({ enrollment, payments });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const { status } = await request.json();
    const enrollment = await Enrollment.findByIdAndUpdate(params.id, { status }, { new: true });
    if (!enrollment) return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
    return NextResponse.json(enrollment);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
