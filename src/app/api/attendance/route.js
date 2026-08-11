import connectDB from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import Session from "@/models/Session";
import Attendance from "@/models/Attendance";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

export async function POST(request) {
  await connectDB();
  
  const auth = await requireRole(['instructor', 'admin']);
  if (auth.error) return auth.error;

  const { session: { user } } = auth;

  try {
    const { sessionId, studentPresent, notes } = await request.json();

    if (!sessionId || studentPresent === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const sessionRecord = await Session.findById(sessionId);
    if (!sessionRecord) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (user.role === 'instructor' && sessionRecord.instructorId.toString() !== user.id) {
      return NextResponse.json({ message: "Forbidden: Session does not belong to you" }, { status: 403 });
    }

    if (user.role === 'admin' && sessionRecord.schoolId.toString() !== user.schoolId) {
      return NextResponse.json({ message: "Forbidden: Session outside your school" }, { status: 403 });
    }

    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({ sessionId });
    if (existingAttendance) {
      return NextResponse.json({ message: "Attendance already marked for this session" }, { status: 400 });
    }

    const sessionClient = await mongoose.startSession();
    sessionClient.startTransaction();

    try {
      // 1. Create Attendance
      const attendance = new Attendance({
        sessionId,
        markedBy: user.id,
        studentPresent,
        notes
      });
      await attendance.save({ session: sessionClient });

      // 2. Update Session status
      sessionRecord.status = studentPresent ? 'completed' : 'no_show';
      await sessionRecord.save({ session: sessionClient });

      // 3. Update Enrollment if present
      if (studentPresent) {
        await Enrollment.findByIdAndUpdate(
          sessionRecord.enrollmentId,
          { $inc: { sessionsCompleted: 1 } },
          { session: sessionClient }
        );
      }

      await sessionClient.commitTransaction();
      sessionClient.endSession();

      return NextResponse.json(attendance, { status: 201 });
    } catch (txError) {
      await sessionClient.abortTransaction();
      sessionClient.endSession();
      throw txError;
    }

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
