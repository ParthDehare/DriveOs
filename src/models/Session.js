import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  },
  { timestamps: true }
);

SessionSchema.index({ instructorId: 1, scheduledAt: 1 }, { unique: true });
SessionSchema.index({ vehicleId: 1, scheduledAt: 1 }, { unique: true });
SessionSchema.index({ enrollmentId: 1 });
SessionSchema.index({ schoolId: 1 });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
