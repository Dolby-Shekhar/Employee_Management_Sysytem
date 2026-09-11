import { api, type Paginated } from './api';

export interface Report {
  _id: string;
  employeeId: string | { _id: string; name: string; email: string; department?: string; position?: string };
  title: string;
  content: string;
  managerResponse?: string;
  createdBy: string | { _id: string; name: string; email: string };
  createdAt?: string;
}

export const listReports = async (page = 1, limit = 100): Promise<Paginated<Report>> => {
  const response = await api.get<Paginated<Report>>('/reports', { params: { page, limit } });
  return response.data;
};

export const createReport = async (payload: {
  employeeId?: string;
  title: string;
  content: string;
}): Promise<Report> => {
  const response = await api.post<{ success: boolean; data: Report }>('/reports', payload);
  return response.data.data;
};

export const respondToReport = async (id: string, managerResponse: string): Promise<Report> => {
  const response = await api.put<{ success: boolean; data: Report }>(`/reports/${id}/respond`, { managerResponse });
  return response.data.data;
};
