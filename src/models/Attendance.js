import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentPresent: { type: Boolean, required: true },
    markedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
