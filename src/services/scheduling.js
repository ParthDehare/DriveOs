import { supabaseAdmin } from '@/lib/supabase';

function formatToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => formatToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const finalKey = camelKey === 'id' ? '_id' : camelKey;
      result[finalKey] = formatToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

export async function checkAvailability(instructorId, vehicleId, enrollmentId, scheduledAt, duration) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + duration * 60000);

  // We need to fetch potential conflicts and check in JS because Supabase REST API 
  // doesn't have an easy way to express: scheduledAt + duration > start
  const { data: potentialConflicts, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .neq('status', 'cancelled')
    .or(`instructor_id.eq.${instructorId},vehicle_id.eq.${vehicleId},enrollment_id.eq.${enrollmentId}`)
    .lt('scheduled_at', end.toISOString());

  if (error) throw error;

  const conflicts = potentialConflicts.filter(session => {
    const sessionStart = new Date(session.scheduled_at);
    const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);
    return sessionEnd > start;
  });

  if (conflicts.length > 0) {
    return { available: false, conflicts: formatToCamelCase(conflicts) };
  }

  return { available: true };
}

export async function createSession(data) {
  const { instructorId, vehicleId, enrollmentId, schoolId, scheduledAt, duration } = data;

  const availability = await checkAvailability(instructorId, vehicleId, enrollmentId, scheduledAt, duration);
  
  if (!availability.available) {
    throw new Error('Time slot is not available due to conflicts.');
  }

  const { data: enrollment, error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .select('*, packageId:packages!package_id(*)')
    .eq('id', enrollmentId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new Error('Enrollment not found');
  }

  if (enrollment.status !== 'active') {
    throw new Error('Enrollment is not active');
  }

  if (enrollment.sessions_completed >= enrollment.packageId.total_sessions) {
    throw new Error('Student has completed all sessions for this package');
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('sessions')
    .insert({
      instructor_id: instructorId,
      vehicle_id: vehicleId,
      enrollment_id: enrollmentId,
      school_id: schoolId,
      scheduled_at: scheduledAt,
      duration,
      status: 'scheduled'
    })
    .select()
    .single();

  if (sessionError) throw sessionError;
  return formatToCamelCase(session);
}

export async function rescheduleSession(sessionId, newScheduledAt) {
  const { data: session, error: getError } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (getError || !session) {
    throw new Error('Session not found');
  }

  const availability = await checkAvailability(
    session.instructor_id,
    session.vehicle_id,
    session.enrollment_id,
    newScheduledAt,
    session.duration
  );

  if (!availability.available) {
    const isSelfConflictOnly = availability.conflicts.every(c => c._id === sessionId);
    if (!isSelfConflictOnly) {
       throw new Error('New time slot is not available due to conflicts.');
    }
  }

  const { data: updatedSession, error: updateError } = await supabaseAdmin
    .from('sessions')
    .update({ scheduled_at: newScheduledAt })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateError) throw updateError;
  return formatToCamelCase(updatedSession);
}

export async function cancelSession(sessionId, reason) {
  const { data: updatedSession, error } = await supabaseAdmin
    .from('sessions')
    .update({ status: 'cancelled' })
    .eq('id', sessionId)
    .select()
    .single();
    
  if (error || !updatedSession) {
    throw new Error('Session not found');
  }

  return formatToCamelCase(updatedSession);
}
