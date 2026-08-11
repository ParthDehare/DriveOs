import { supabaseAdmin } from '@/lib/supabase';
import { rescheduleSession, cancelSession } from "@/services/scheduling";
import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const auth = await requireRole(['admin', 'instructor', 'student']);
  if (auth.error) return auth.error;

  try {
    const { data: session, error } = await supabaseAdmin.from('sessions')
      .select('*, instructorId:instructor_id(id, name), vehicleId:vehicle_id(id, make, model, license_plate), enrollmentId:enrollment_id(*)')
      .eq('id', params.id).single();
    
    if (error || !session) return NextResponse.json({ message: "Session not found" }, { status: 404 });
    
    const formattedSession = {
      ...session,
      _id: session.id,
      schoolId: session.school_id,
      instructorId: session.instructorId ? { ...session.instructorId, _id: session.instructorId.id } : null,
      vehicleId: session.vehicleId ? { ...session.vehicleId, _id: session.vehicleId.id, licensePlate: session.vehicleId.license_plate } : null,
      enrollmentId: session.enrollmentId ? { ...session.enrollmentId, _id: session.enrollmentId.id } : null,
      scheduledAt: session.scheduled_at
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireRole(['admin', 'instructor']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    let updatedSession;

    if (body.scheduledAt) {
      updatedSession = await rescheduleSession(params.id, body.scheduledAt);
    } else if (body.status) {
      const { data, error } = await supabaseAdmin.from('sessions').update({ status: body.status }).eq('id', params.id).select().single();
      if (error) throw error;
      updatedSession = { ...data, _id: data.id, scheduledAt: data.scheduled_at, schoolId: data.school_id, instructorId: data.instructor_id, vehicleId: data.vehicle_id, enrollmentId: data.enrollment_id };
    } else {
      const updateData = { ...body };
      if (updateData.instructorId) { updateData.instructor_id = updateData.instructorId; delete updateData.instructorId; }
      if (updateData.vehicleId) { updateData.vehicle_id = updateData.vehicleId; delete updateData.vehicleId; }
      if (updateData.enrollmentId) { updateData.enrollment_id = updateData.enrollmentId; delete updateData.enrollmentId; }
      
      const { data, error } = await supabaseAdmin.from('sessions').update(updateData).eq('id', params.id).select().single();
      if (error) throw error;
      updatedSession = { ...data, _id: data.id, scheduledAt: data.scheduled_at, schoolId: data.school_id, instructorId: data.instructor_id, vehicleId: data.vehicle_id, enrollmentId: data.enrollment_id };
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireRole(['admin']);
  if (auth.error) return auth.error;

  try {
    const session = await cancelSession(params.id, "Cancelled by Admin");
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
