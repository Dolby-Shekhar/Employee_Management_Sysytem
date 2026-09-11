import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPerformanceReview extends Document {
  employeeId: Types.ObjectId;
  reviewPeriod: string;
  rating: number;
  comments: string;
  managerId: Types.ObjectId;
  status: 'draft' | 'submitted';
}

const performanceReviewSchema = new Schema<IPerformanceReview>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewPeriod: { type: String, required: true },
  rating: { type: Number, required: true },
  comments: { type: String, default: '' },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'submitted'], default: 'draft' }
}, { timestamps: true });

export const PerformanceReview = mongoose.model<IPerformanceReview>('PerformanceReview', performanceReviewSchema);
