import { api } from './api';

export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'employee';
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
    return response.data.data ?? null;
  } catch {
    return null;
  }
};
