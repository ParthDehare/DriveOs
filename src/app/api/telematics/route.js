import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import TripLog from "@/models/TripLog";
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

    await connectDB();

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

      const tripLog = await TripLog.create({
        sessionId,
        instructorId: session.user.id,
        coordinates: routeHistory || [],
        distanceKm,
        endedAt: new Date(),
      });

      await pusherServer.trigger("map-channel", "trip-ended", {
        sessionId,
        instructorId: session.user.id,
      });

      return NextResponse.json(tripLog, { status: 201 });
    }
  } catch (error) {
    console.error("Telematics API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
