import connectDB from "@/lib/mongodb";
import Session from "@/models/Session";
import { rescheduleSession, cancelSession } from "@/services/scheduling";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin', 'instructor', 'student']);
  if (auth.error) return auth.error;

  try {
    const session = await Session.findById(params.id)
      .populate('instructorId', 'name')
      .populate('vehicleId', 'make model licensePlate')
      .populate('enrollmentId');
    
    if (!session) return NextResponse.json({ message: "Session not found" }, { status: 404 });
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin', 'instructor']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    let updatedSession;

    if (body.scheduledAt) {
      updatedSession = await rescheduleSession(params.id, body.scheduledAt);
    } else if (body.status) {
      updatedSession = await Session.findByIdAndUpdate(params.id, { status: body.status }, { new: true });
    } else {
      updatedSession = await Session.findByIdAndUpdate(params.id, body, { new: true });
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const session = await cancelSession(params.id, "Cancelled by Admin");
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
