import { api } from './api';

export interface UserProfile {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
  };
  employee: {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
    status: 'pending' | 'approved';
    position?: string;
    salary?: number;
    department?: string;
    managerId?: string | null;
  } | null;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<{ success: boolean; data: UserProfile }>('/profile');
  return response.data.data;
};

export const updateProfile = async (payload: {
  name?: string;
  position?: string;
  department?: string;
  salary?: number;
}): Promise<UserProfile> => {
  const response = await api.put<{ success: boolean; data: UserProfile }>('/profile', payload);
  return response.data.data;
};
