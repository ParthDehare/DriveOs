import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    licensePlate: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    transmissionType: { type: String, enum: ['manual', 'automatic'], required: true },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'cng', 'electric'], default: 'petrol' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VehicleSchema.index({ schoolId: 1 });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
