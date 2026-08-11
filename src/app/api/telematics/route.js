import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { supabaseAdmin } from '@/lib/supabase';
import { pusherServer } from "@/lib/pusher";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "instructor") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, lat, lng, speed, timestamp, isEnded, routeHistory } = body;

    if (!isEnded) {
      await pusherServer.trigger("map-channel", "location-update", {
        sessionId,
        instructorId: session.user.id,
        lat,
        lng,
        speed,
        timestamp,
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      const distanceKm = 0; // Rough estimate or 0 for now

      const { data: tripLog, error } = await supabaseAdmin.from('trip_logs').insert({
        session_id: sessionId,
        instructor_id: session.user.id,
        coordinates: routeHistory || [],
        distance_km: distanceKm,
        ended_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;

      await pusherServer.trigger("map-channel", "trip-ended", {
        sessionId,
        instructorId: session.user.id,
      });
      
      const formattedTripLog = {
        ...tripLog,
        _id: tripLog.id,
        sessionId: tripLog.session_id,
        instructorId: tripLog.instructor_id,
        distanceKm: tripLog.distance_km,
        endedAt: tripLog.ended_at
      };

      return NextResponse.json(formattedTripLog, { status: 201 });
    }
  } catch (error) {
    console.error("Telematics API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
