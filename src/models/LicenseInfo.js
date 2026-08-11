import mongoose from 'mongoose';

const LicenseInfoSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    llNumber: { type: String },
    llIssueDate: { type: Date },
    llExpiryDate: { type: Date },
    dlTestDate: { type: Date },
    dlNumber: { type: String },
    dlStatus: {
      type: String,
      enum: ['not_applied', 'test_scheduled', 'passed', 'failed'],
      default: 'not_applied',
    },
    documents: [
      {
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.LicenseInfo || mongoose.model('LicenseInfo', LicenseInfoSchema);
