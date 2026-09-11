import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../types/common';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
