import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: [
      {
        skill: {
          type: String,
          enum: [
            'clutch_control',
            'steering',
            'parallel_parking',
            'lane_discipline',
            'traffic_awareness',
            'reverse',
            'hill_start',
            'general_confidence',
          ],
        },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

EvaluationSchema.index({ sessionId: 1 });

export default mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema);
