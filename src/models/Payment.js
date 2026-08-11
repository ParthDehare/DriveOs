import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    method: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer', 'online'], default: 'cash' },
    transactionId: { type: String },
    trancheNumber: { type: Number },
  },
  { timestamps: true }
);

PaymentSchema.index({ enrollmentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ schoolId: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
