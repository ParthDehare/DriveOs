import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  const auth = await requireRole(['instructor']);
  if (auth.error) return auth.error;

  const { session: { user } } = auth;

  try {
    const { sessionId, ratings, notes } = await request.json();

    if (!sessionId || !ratings || !Array.isArray(ratings)) {
      return NextResponse.json({ message: "Missing or invalid required fields" }, { status: 400 });
    }

    const { data: sessionRecord, error: sessionError } = await supabaseAdmin.from('sessions').select('*').eq('id', sessionId).single();
    if (sessionError || !sessionRecord) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    if (sessionRecord.instructor_id !== user.id) {
      return NextResponse.json({ message: "Forbidden: Session does not belong to you" }, { status: 403 });
    }

    // Check if evaluation already exists
    const { data: existingEvaluation } = await supabaseAdmin.from('evaluations').select('*').eq('session_id', sessionId).single();
    if (existingEvaluation) {
      return NextResponse.json({ message: "Evaluation already submitted for this session" }, { status: 400 });
    }

    const { data: evaluation, error: evalError } = await supabaseAdmin.from('evaluations').insert({
      session_id: sessionId,
      instructor_id: user.id,
      ratings,
      notes
    }).select().single();
    
    if (evalError) throw evalError;

    const formattedEvaluation = {
      ...evaluation,
      _id: evaluation.id,
      sessionId: evaluation.session_id,
      instructorId: evaluation.instructor_id
    };

    return NextResponse.json(formattedEvaluation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
