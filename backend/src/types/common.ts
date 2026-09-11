export type Role = 'admin' | 'manager' | 'employee';
export type EmployeeStatus = 'pending' | 'approved';
export type LeaveType = 'Sick' | 'Casual' | 'Annual' | 'Emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthUser extends JwtPayload {
  iat?: number;
  exp?: number;
}
