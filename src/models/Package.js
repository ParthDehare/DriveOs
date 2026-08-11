import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    description: { type: String },
    totalSessions: { type: Number, required: true },
    durationPerSession: { type: Number, required: true },
    price: { type: Number, required: true },
    transmissionType: { type: String, enum: ['manual', 'automatic', 'both'], default: 'both' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PackageSchema.index({ schoolId: 1 });

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
