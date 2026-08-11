import connectDB from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import Session from "@/models/Session";
import Evaluation from "@/models/Evaluation";

export async function POST(request) {
  await connectDB();
  
  const auth = await requireRole(['instructor']);
  if (auth.error) return auth.error;

  const { session: { user } } = auth;

  try {
    const { sessionId, ratings, notes } = await request.json();

    if (!sessionId || !ratings || !Array.isArray(ratings)) {
      return NextResponse.json({ message: "Missing or invalid required fields" }, { status: 400 });
    }

    const sessionRecord = await Session.findById(sessionId);
    if (!sessionRecord) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (sessionRecord.instructorId.toString() !== user.id) {
      return NextResponse.json({ message: "Forbidden: Session does not belong to you" }, { status: 403 });
    }

    // Check if evaluation already exists
    const existingEvaluation = await Evaluation.findOne({ sessionId });
    if (existingEvaluation) {
      return NextResponse.json({ message: "Evaluation already submitted for this session" }, { status: 400 });
    }

    const evaluation = new Evaluation({
      sessionId,
      instructorId: user.id,
      ratings,
      notes
    });

    await evaluation.save();

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
