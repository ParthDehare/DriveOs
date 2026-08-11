import mongoose from 'mongoose';

const InstallmentPlanSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    trancheNumber: { type: Number, required: true },
    percentageOfTotal: { type: Number, required: true },
    dueDaysAfterEnrollment: { type: Number, required: true },
  },
  { timestamps: true }
);

InstallmentPlanSchema.index({ packageId: 1 });

export default mongoose.models.InstallmentPlan || mongoose.model('InstallmentPlan', InstallmentPlanSchema);
