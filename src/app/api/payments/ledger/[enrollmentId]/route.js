import connectDB from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";
import { getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getStudentLedger } from "@/services/payments";

export async function GET(request, { params }) {
  await connectDB();
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { enrollmentId } = params;

  try {
    // Check permissions
    if (session.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        _id: enrollmentId,
        studentId: session.user.id
      });
      if (!enrollment) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const ledger = await getStudentLedger(enrollmentId);
    return NextResponse.json(ledger);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
