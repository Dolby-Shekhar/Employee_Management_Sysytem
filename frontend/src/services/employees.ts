import { api, type Paginated } from './api';

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'pending' | 'approved';
  position?: string;
  salary?: number;
  department?: string;
  managerId?: { _id: string; name: string; email: string } | null;
  createdAt?: string;
}

export interface EmployeeFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: 'pending' | 'approved';
  role?: 'admin' | 'manager' | 'employee';
}

export const listEmployees = async (params: EmployeeFilterParams | number = 1, limit = 100): Promise<Paginated<Employee>> => {
  const queryParams = typeof params === 'number' ? { page: params, limit } : params;
  const response = await api.get<Paginated<Employee>>('/employees', { params: queryParams });
  return response.data;
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await api.get<{ success: boolean; data: Employee }>(`/employees/${id}`);
  return response.data.data;
};

export const createEmployee = async (payload: {
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'manager' | 'employee';
  department?: string;
  position?: string;
  salary?: number;
  managerId?: string | null;
}): Promise<Employee> => {
  const response = await api.post<{ success: boolean; data: Employee }>('/employees', payload);
  return response.data.data;
};

export const updateEmployee = async (
  id: string,
  payload: {
    name?: string;
    department?: string;
    position?: string;
    salary?: number;
    role?: 'admin' | 'manager' | 'employee';
    managerId?: string | null;
    status?: 'pending' | 'approved';
  }
): Promise<Employee> => {
  const response = await api.put<{ success: boolean; data: Employee }>(`/employees/${id}`, payload);
  return response.data.data;
};

export const approveEmployee = async (id: string): Promise<Employee> => {
  const response = await api.put<{ success: boolean; data: Employee }>(`/employees/${id}/approve`);
  return response.data.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await api.delete(`/employees/${id}`);
};
