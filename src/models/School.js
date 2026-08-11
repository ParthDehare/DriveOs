import mongoose from 'mongoose';

const SchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    gstNumber: { type: String },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.School || mongoose.model('School', SchoolSchema);
