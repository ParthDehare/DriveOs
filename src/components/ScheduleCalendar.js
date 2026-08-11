'use client';

import { useState } from 'react';

export default function ScheduleCalendar({ sessions = [], currentWeekStart, onCreateSession, onEditSession }) {
  // Simple week generator based on a starting date (Sunday)
  const getDaysOfWeek = (start) => {
    const days = [];
    const date = new Date(start);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const weekDays = currentWeekStart ? getDaysOfWeek(currentWeekStart) : getDaysOfWeek(new Date());
  
  // Time slots from 6 AM to 8 PM (14 hours)
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'var(--success)';
      case 'cancelled': return 'var(--text-muted)';
      case 'no_show': return 'var(--warning)';
      case 'scheduled': default: return 'var(--info)';
    }
  };

  const getStatusBg = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'var(--success-bg)';
      case 'cancelled': return 'rgba(255,255,255,0.05)';
      case 'no_show': return 'var(--warning-bg)';
      case 'scheduled': default: return 'var(--info-bg)';
    }
  };

  return (
    <div className="card glass" style={{ display: 'flex', flexDirection: 'column', height: '800px' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div style={{ width: '60px', borderRight: '1px solid var(--border)' }}></div>
        {weekDays.map((day, i) => (
          <div key={i} style={{ 
            flex: 1, padding: 'var(--space-md)', textAlign: 'center',
            borderRight: i < 6 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Body Grid */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* Time Column */}
          <div style={{ width: '60px', borderRight: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 10 }}>
            {timeSlots.map(time => (
              <div key={time} style={{ height: '60px', padding: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                {time}:00
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {weekDays.map((day, dayIndex) => {
            const daySessions = sessions.filter(s => {
              const d = new Date(s.date);
              return d.toDateString() === day.toDateString();
            });

            return (
              <div key={dayIndex} style={{ flex: 1, borderRight: dayIndex < 6 ? '1px solid var(--border)' : 'none', position: 'relative' }}>
                {/* Time Grid Lines */}
                {timeSlots.map(time => (
                  <div 
                    key={time} 
                    style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                    onClick={() => {
                      const d = new Date(day);
                      d.setHours(time, 0, 0, 0);
                      onCreateSession && onCreateSession(d);
                    }}
                    className="calendar-slot"
                  ></div>
                ))}

                {/* Events for this day */}
                {daySessions.map((session, sIdx) => {
                  const sDate = new Date(session.date);
                  // Assuming time is in HH:mm format on session or date object has time
                  const startHour = sDate.getHours();
                  const startMin = sDate.getMinutes();
                  
                  if (startHour < 6 || startHour > 19) return null; // out of bounds

                  const top = ((startHour - 6) * 60 + startMin) * (60 / 60); // 1px per min
                  const durationMins = session.duration || 45;
                  const height = durationMins;

                  return (
                    <div 
                      key={sIdx}
                      style={{
                        position: 'absolute',
                        top: `${top}px`,
                        left: '4px',
                        right: '4px',
                        height: `${height}px`,
                        background: getStatusBg(session.status),
                        borderLeft: `3px solid ${getStatusColor(session.status)}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => onEditSession && onEditSession(session)}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.studentName}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                        {session.instructorName} • {session.vehiclePlate}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-slot:hover {
          background: rgba(255,255,255,0.02);
        }
      `}} />
    </div>
  );
}
