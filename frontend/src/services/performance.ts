import { api, type Paginated } from './api';

export interface PerformanceReview {
  _id: string;
  employeeId: string | { _id: string; name: string; email: string; department?: string; position?: string };
  reviewPeriod: string;
  rating: number;
  comments?: string;
  managerId: string | { _id: string; name: string; email: string };
  status: 'draft' | 'submitted';
  createdAt?: string;
}

export const listReviews = async (page = 1, limit = 100): Promise<Paginated<PerformanceReview>> => {
  const response = await api.get<Paginated<PerformanceReview>>('/performance', { params: { page, limit } });
  return response.data;
};

export const createReview = async (payload: {
  employeeId?: string;
  reviewPeriod: string;
  rating: number;
  comments?: string;
}): Promise<PerformanceReview> => {
  const response = await api.post<{ success: boolean; data: PerformanceReview }>('/performance', payload);
  return response.data.data;
};
