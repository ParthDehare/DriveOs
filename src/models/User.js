import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'instructor', 'student'], required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
