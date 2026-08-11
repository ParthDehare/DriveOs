import mongoose from 'mongoose';

const TripLogSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coordinates: [
      {
        lat: { type: Number },
        lng: { type: Number },
        timestamp: { type: Date },
        speed: { type: Number },
      },
    ],
    distanceKm: { type: Number },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.TripLog || mongoose.model('TripLog', TripLogSchema);
