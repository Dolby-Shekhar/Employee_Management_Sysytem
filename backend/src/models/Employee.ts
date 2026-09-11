import mongoose, { Schema, Document, Types } from 'mongoose';
import { EmployeeStatus, Role } from '../types/common';

export interface IEmployee extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: EmployeeStatus;
  position?: string;
  salary?: number;
  department?: string;
  managerId?: Types.ObjectId | null;
}

const employeeSchema = new Schema<IEmployee>(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    position: { type: String, default: '' },
    salary: { type: Number, default: 0 },
    department: { type: String, default: '' },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
