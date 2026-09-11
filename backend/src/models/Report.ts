import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReport extends Document {
  employeeId: Types.ObjectId;
  title: string;
  content: string;
  managerResponse?: string;
  createdBy: Types.ObjectId;
}

const reportSchema = new Schema<IReport>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  managerResponse: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Report = mongoose.model<IReport>('Report', reportSchema);
