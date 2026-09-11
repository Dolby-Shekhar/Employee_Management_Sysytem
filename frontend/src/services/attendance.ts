import { api, type Paginated } from './api';

export interface AttendanceRecord {
  _id: string;
  user: string | { _id: string; name: string; email: string; role?: string };
  clockIn: string;
  clockOut?: string | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  late?: boolean;
  earlyLeave?: boolean;
  createdAt?: string;
}

export interface AttendanceStatus {
  clockedIn: boolean;
  activeSession: AttendanceRecord | null;
  todayRecords: AttendanceRecord[];
}

export const getAttendanceStatus = async (): Promise<AttendanceStatus> => {
  const response = await api.get<{ success: boolean; data: AttendanceStatus }>('/attendance/status');
  return response.data.data;
};

export const listAttendance = async (page = 1, limit = 20): Promise<Paginated<AttendanceRecord>> => {
  const response = await api.get<Paginated<AttendanceRecord>>('/attendance', { params: { page, limit } });
  return response.data;
};

export const clockIn = async (payload?: { address?: string; latitude?: number; longitude?: number }): Promise<AttendanceRecord> => {
  const response = await api.post<{ success: boolean; data: AttendanceRecord }>('/attendance/clock-in', payload ?? {});
  return response.data.data;
};

export const clockOut = async (): Promise<AttendanceRecord> => {
  const response = await api.post<{ success: boolean; data: AttendanceRecord }>('/attendance/clock-out');
  return response.data.data;
};
