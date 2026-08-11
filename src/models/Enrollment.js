import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    startDate: { type: Date, required: true, default: Date.now },
    sessionsCompleted: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'suspended', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ studentId: 1 });
EnrollmentSchema.index({ schoolId: 1 });
EnrollmentSchema.index({ status: 1 });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
