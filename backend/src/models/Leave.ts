import mongoose, { Schema, Document, Types } from 'mongoose';
import { LeaveStatus, LeaveType } from '../types/common';

export interface ILeave extends Document {
  employeeId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  managerComment?: string;
}

const leaveSchema = new Schema<ILeave>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['Sick', 'Casual', 'Annual', 'Emergency'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  managerComment: { type: String, default: '' }
}, { timestamps: true });

export const Leave = mongoose.model<ILeave>('Leave', leaveSchema);
