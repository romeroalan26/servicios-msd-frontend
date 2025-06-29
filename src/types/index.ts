// Tipos principales del sistema

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  priority?: number; // Solo para empleados que participan en la selección
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  year: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceSchedule {
  id: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  morningShift?: Shift;
  afternoonShift?: Shift;
  nightShift?: Shift;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  position: string; // Código de posición (ej: "CA", "P1", etc.)
  positionName: string; // Nombre descriptivo de la posición
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
}

export interface ServiceSelection {
  id: string;
  serviceId: string;
  userId: string;
  selectedAt: Date;
  year: number;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailConfig {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipos para formularios
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  year: number;
}

export interface UserFormData {
  name: string;
  email: string;
  role: "admin" | "employee";
  priority?: number;
}

export interface ShiftFormData {
  position: string;
  positionName: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// Enums
export enum ShiftType {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  NIGHT = "night",
}

export enum UserRole {
  ADMIN = "admin",
  EMPLOYEE = "employee",
}
