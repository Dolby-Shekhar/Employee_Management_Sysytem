import { api, type Paginated } from './api';

export interface Payroll {
  _id: string;
  employeeId: string | { _id: string; name: string; email: string; department?: string; position?: string };
  month: number;
  year: number;
  baseSalary: string;
  overtime: string;
  bonuses: string;
  deductions: string;
  netPay: string;
  attachment?: string;
  createdAt?: string;
}

export const listPayrolls = async (page = 1, limit = 100): Promise<Paginated<Payroll>> => {
  const response = await api.get<Paginated<Payroll>>('/payroll', { params: { page, limit } });
  return response.data;
};

export const createPayroll = async (payload: {
  employeeId?: string;
  month: number;
  year: number;
  baseSalary: number;
  overtime?: number;
  bonuses?: number;
  deductions?: number;
}): Promise<Payroll> => {
  const response = await api.post<{ success: boolean; data: Payroll }>('/payroll', payload);
  return response.data.data;
};
