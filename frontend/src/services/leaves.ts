import { api, type Paginated } from './api';

export interface Leave {
  _id: string;
  employeeId: string | { _id: string; name: string; email: string; department?: string; position?: string };
  leaveType: 'Sick' | 'Casual' | 'Annual' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  managerComment?: string;
  createdAt?: string;
}

export const listLeaves = async (page = 1, limit = 100): Promise<Paginated<Leave>> => {
  const response = await api.get<Paginated<Leave>>('/leaves', { params: { page, limit } });
  return response.data;
};

export const createLeave = async (payload: {
  leaveType: Leave['leaveType'];
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<Leave> => {
  const response = await api.post<{ success: boolean; data: Leave }>('/leaves', payload);
  return response.data.data;
};

export const approveLeave = async (id: string, status: 'approved' | 'rejected', managerComment?: string): Promise<Leave> => {
  const response = await api.put<{ success: boolean; data: Leave }>(`/leaves/${id}`, { status, managerComment });
  return response.data.data;
};
