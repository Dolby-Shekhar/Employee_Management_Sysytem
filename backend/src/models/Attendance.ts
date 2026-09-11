import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  user: Types.ObjectId;
  clockIn: Date;
  clockOut?: Date | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  late?: boolean;
  earlyLeave?: boolean;
}

const attendanceSchema = new Schema<IAttendance>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date, default: null },
  address: { type: String, default: '' },
  latitude: Number,
  longitude: Number,
  late: { type: Boolean, default: false },
  earlyLeave: { type: Boolean, default: false }
}, { timestamps: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
