import mongoose, { Schema, Document, Types } from 'mongoose';
import { Decimal } from 'decimal.js';

export interface IPayroll extends Document {
  employeeId: Types.ObjectId;
  month: number;
  year: number;
  baseSalary: Decimal;
  overtime: Decimal;
  bonuses: Decimal;
  deductions: Decimal;
  netPay: Decimal;
  attachment?: string;
}

const payrollSchema = new Schema<IPayroll>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Schema.Types.Decimal128, required: true },
  overtime: { type: Schema.Types.Decimal128, required: true },
  bonuses: { type: Schema.Types.Decimal128, required: true },
  deductions: { type: Schema.Types.Decimal128, required: true },
  netPay: { type: Schema.Types.Decimal128, required: true },
  attachment: { type: String, default: '' }
}, { timestamps: true });

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);
