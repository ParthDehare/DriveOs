import Session from "@/models/Session";
import Enrollment from "@/models/Enrollment";
import Package from "@/models/Package";

export async function checkAvailability(instructorId, vehicleId, enrollmentId, scheduledAt, duration) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + duration * 60000);

  const conflicts = await Session.find({
    status: { $nin: ['cancelled'] },
    $or: [
      { instructorId },
      { vehicleId },
      { enrollmentId }
    ],
    $and: [
      { scheduledAt: { $lt: end } },
      { $expr: { $gt: [{ $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] }, start] } }
    ]
  });

  if (conflicts.length > 0) {
    return { available: false, conflicts };
  }

  return { available: true };
}

export async function createSession(data) {
  const { instructorId, vehicleId, enrollmentId, schoolId, scheduledAt, duration } = data;

  const availability = await checkAvailability(instructorId, vehicleId, enrollmentId, scheduledAt, duration);
  
  if (!availability.available) {
    throw new Error('Time slot is not available due to conflicts.');
  }

  const enrollment = await Enrollment.findById(enrollmentId).populate('packageId');
  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  if (enrollment.status !== 'active') {
    throw new Error('Enrollment is not active');
  }

  if (enrollment.sessionsCompleted >= enrollment.packageId.totalSessions) {
    throw new Error('Student has completed all sessions for this package');
  }

  const session = new Session({
    instructorId,
    vehicleId,
    enrollmentId,
    schoolId,
    scheduledAt,
    duration,
    status: 'scheduled'
  });

  await session.save();
  return session;
}

export async function rescheduleSession(sessionId, newScheduledAt) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const availability = await checkAvailability(
    session.instructorId,
    session.vehicleId,
    session.enrollmentId,
    newScheduledAt,
    session.duration
  );

  if (!availability.available) {
    // If the only conflict is the session itself, that's fine
    const isSelfConflictOnly = availability.conflicts.every(c => c._id.toString() === sessionId);
    if (!isSelfConflictOnly) {
       throw new Error('New time slot is not available due to conflicts.');
    }
  }

  session.scheduledAt = newScheduledAt;
  await session.save();
  return session;
}

export async function cancelSession(sessionId, reason) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.status = 'cancelled';
  await session.save();
  return session;
}
