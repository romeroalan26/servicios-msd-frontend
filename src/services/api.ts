import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  User,
  Service,
  ServiceSchedule,
  ServiceSelection,
  EmailConfig,
  ApiResponse,
} from "../types";

// Configuración base de axios
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para agregar el token de autenticación
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticación
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<
      ApiResponse<{ token: string; empleado: any }>
    > = await this.api.post("/auth/login", {
      email,
      password,
    });

    // Transformar la respuesta del backend al formato esperado por el frontend
    const empleado = response.data.data!.empleado;
    const user: User = {
      id: empleado.id.toString(),
      name: empleado.nombre,
      email: empleado.email,
      role: empleado.rol,
      priority: empleado.prioridad,
      isActive: empleado.activo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      user,
      token: response.data.data!.token,
    };
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      "/auth/me"
    );

    // Transformar la respuesta del backend al formato esperado
    const empleado = response.data.data!;
    return {
      id: empleado.id.toString(),
      name: empleado.nombre,
      email: empleado.email,
      role: empleado.rol,
      priority: empleado.prioridad,
      isActive: empleado.activo,
      createdAt: new Date(empleado.createdAt || Date.now()),
      updatedAt: new Date(empleado.updatedAt || Date.now()),
    };
  }

  // Métodos de usuarios
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/users"
    );

    // Transformar la respuesta del backend
    return response.data.data!.map((empleado) => ({
      id: empleado.id.toString(),
      name: empleado.nombre,
      email: empleado.email,
      role: empleado.rol,
      priority: empleado.prioridad,
      isActive: empleado.activo,
      createdAt: new Date(empleado.createdAt || Date.now()),
      updatedAt: new Date(empleado.updatedAt || Date.now()),
    }));
  }

  async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/users",
      {
        nombre: userData.name,
        email: userData.email,
        rol: userData.role,
        prioridad: userData.priority,
        activo: userData.isActive,
      }
    );

    const empleado = response.data.data!;
    return {
      id: empleado.id.toString(),
      name: empleado.nombre,
      email: empleado.email,
      role: empleado.rol,
      priority: empleado.prioridad,
      isActive: empleado.activo,
      createdAt: new Date(empleado.createdAt || Date.now()),
      updatedAt: new Date(empleado.updatedAt || Date.now()),
    };
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const updateData: any = {};
    if (userData.name) updateData.nombre = userData.name;
    if (userData.email) updateData.email = userData.email;
    if (userData.role) updateData.rol = userData.role;
    if (userData.priority !== undefined)
      updateData.prioridad = userData.priority;
    if (userData.isActive !== undefined) updateData.activo = userData.isActive;

    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(
      `/users/${id}`,
      updateData
    );

    const empleado = response.data.data!;
    return {
      id: empleado.id.toString(),
      name: empleado.nombre,
      email: empleado.email,
      role: empleado.rol,
      priority: empleado.prioridad,
      isActive: empleado.activo,
      createdAt: new Date(empleado.createdAt || Date.now()),
      updatedAt: new Date(empleado.updatedAt || Date.now()),
    };
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Métodos de servicios
  async getServices(): Promise<Service[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/services"
    );

    // Transformar la respuesta del backend
    return response.data.data!.map((servicio) => ({
      id: servicio.id.toString(),
      name: servicio.nombre,
      description: servicio.descripcion,
      year: servicio.anio,
      isActive: servicio.activo,
      createdAt: new Date(servicio.createdAt || Date.now()),
      updatedAt: new Date(servicio.updatedAt || Date.now()),
    }));
  }

  async getService(id: string): Promise<Service> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/services/${id}`
    );

    const servicio = response.data.data!;
    return {
      id: servicio.id.toString(),
      name: servicio.nombre,
      description: servicio.descripcion,
      year: servicio.anio,
      isActive: servicio.activo,
      createdAt: new Date(servicio.createdAt || Date.now()),
      updatedAt: new Date(servicio.updatedAt || Date.now()),
    };
  }

  async createService(
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">
  ): Promise<Service> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/services",
      {
        nombre: serviceData.name,
        descripcion: serviceData.description,
        anio: serviceData.year,
        activo: serviceData.isActive,
      }
    );

    const servicio = response.data.data!;
    return {
      id: servicio.id.toString(),
      name: servicio.nombre,
      description: servicio.descripcion,
      year: servicio.anio,
      isActive: servicio.activo,
      createdAt: new Date(servicio.createdAt || Date.now()),
      updatedAt: new Date(servicio.updatedAt || Date.now()),
    };
  }

  async updateService(
    id: string,
    serviceData: Partial<Service>
  ): Promise<Service> {
    const updateData: any = {};
    if (serviceData.name) updateData.nombre = serviceData.name;
    if (serviceData.description !== undefined)
      updateData.descripcion = serviceData.description;
    if (serviceData.year) updateData.anio = serviceData.year;
    if (serviceData.isActive !== undefined)
      updateData.activo = serviceData.isActive;

    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(
      `/services/${id}`,
      updateData
    );

    const servicio = response.data.data!;
    return {
      id: servicio.id.toString(),
      name: servicio.nombre,
      description: servicio.descripcion,
      year: servicio.anio,
      isActive: servicio.activo,
      createdAt: new Date(servicio.createdAt || Date.now()),
      updatedAt: new Date(servicio.updatedAt || Date.now()),
    };
  }

  async deleteService(id: string): Promise<void> {
    await this.api.delete(`/services/${id}`);
  }

  // Métodos de horarios de servicios
  async getServiceSchedules(serviceId: string): Promise<ServiceSchedule[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      `/services/${serviceId}/schedules`
    );

    // Transformar la respuesta del backend
    return response.data.data!.map((horario) => ({
      id: horario.id.toString(),
      serviceId: horario.servicioId.toString(),
      date: horario.fecha,
      morningShift: horario.turnoManana
        ? {
            id: horario.turnoManana.id.toString(),
            position: horario.turnoManana.posicion,
            positionName: horario.turnoManana.nombrePosicion,
            startTime: horario.turnoManana.horaInicio,
            endTime: horario.turnoManana.horaFin,
            notes: horario.turnoManana.notas,
          }
        : undefined,
      afternoonShift: horario.turnoTarde
        ? {
            id: horario.turnoTarde.id.toString(),
            position: horario.turnoTarde.posicion,
            positionName: horario.turnoTarde.nombrePosicion,
            startTime: horario.turnoTarde.horaInicio,
            endTime: horario.turnoTarde.horaFin,
            notes: horario.turnoTarde.notas,
          }
        : undefined,
      nightShift: horario.turnoNoche
        ? {
            id: horario.turnoNoche.id.toString(),
            position: horario.turnoNoche.posicion,
            positionName: horario.turnoNoche.nombrePosicion,
            startTime: horario.turnoNoche.horaInicio,
            endTime: horario.turnoNoche.horaFin,
            notes: horario.turnoNoche.notas,
          }
        : undefined,
      createdAt: new Date(horario.createdAt || Date.now()),
      updatedAt: new Date(horario.updatedAt || Date.now()),
    }));
  }

  async updateServiceSchedule(
    serviceId: string,
    scheduleId: string,
    scheduleData: Partial<ServiceSchedule>
  ): Promise<ServiceSchedule> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(
      `/services/${serviceId}/schedules/${scheduleId}`,
      scheduleData
    );

    const horario = response.data.data!;
    return {
      id: horario.id.toString(),
      serviceId: horario.servicioId.toString(),
      date: horario.fecha,
      morningShift: horario.turnoManana
        ? {
            id: horario.turnoManana.id.toString(),
            position: horario.turnoManana.posicion,
            positionName: horario.turnoManana.nombrePosicion,
            startTime: horario.turnoManana.horaInicio,
            endTime: horario.turnoManana.horaFin,
            notes: horario.turnoManana.notas,
          }
        : undefined,
      afternoonShift: horario.turnoTarde
        ? {
            id: horario.turnoTarde.id.toString(),
            position: horario.turnoTarde.posicion,
            positionName: horario.turnoTarde.nombrePosicion,
            startTime: horario.turnoTarde.horaInicio,
            endTime: horario.turnoTarde.horaFin,
            notes: horario.turnoTarde.notas,
          }
        : undefined,
      nightShift: horario.turnoNoche
        ? {
            id: horario.turnoNoche.id.toString(),
            position: horario.turnoNoche.posicion,
            positionName: horario.turnoNoche.nombrePosicion,
            startTime: horario.turnoNoche.horaInicio,
            endTime: horario.turnoNoche.horaFin,
            notes: horario.turnoNoche.notas,
          }
        : undefined,
      createdAt: new Date(horario.createdAt || Date.now()),
      updatedAt: new Date(horario.updatedAt || Date.now()),
    };
  }

  // Métodos de selección de servicios
  async getServiceSelections(year?: number): Promise<ServiceSelection[]> {
    const params = year ? { year } : {};
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/service-selections",
      { params }
    );

    // Transformar la respuesta del backend
    return response.data.data!.map((seleccion) => ({
      id: seleccion.id.toString(),
      serviceId: seleccion.servicioId.toString(),
      userId: seleccion.empleadoId.toString(),
      selectedAt: new Date(seleccion.fechaSeleccion),
      year: seleccion.anio,
      isConfirmed: seleccion.confirmado,
      createdAt: new Date(seleccion.createdAt || Date.now()),
      updatedAt: new Date(seleccion.updatedAt || Date.now()),
    }));
  }

  async selectService(serviceId: string): Promise<ServiceSelection> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/service-selections",
      {
        servicioId: serviceId,
      }
    );

    const seleccion = response.data.data!;
    return {
      id: seleccion.id.toString(),
      serviceId: seleccion.servicioId.toString(),
      userId: seleccion.empleadoId.toString(),
      selectedAt: new Date(seleccion.fechaSeleccion),
      year: seleccion.anio,
      isConfirmed: seleccion.confirmado,
      createdAt: new Date(seleccion.createdAt || Date.now()),
      updatedAt: new Date(seleccion.updatedAt || Date.now()),
    };
  }

  async getCurrentUserSelection(
    year: number
  ): Promise<ServiceSelection | null> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
        `/service-selections/current/${year}`
      );

      const seleccion = response.data.data!;
      return {
        id: seleccion.id.toString(),
        serviceId: seleccion.servicioId.toString(),
        userId: seleccion.empleadoId.toString(),
        selectedAt: new Date(seleccion.fechaSeleccion),
        year: seleccion.anio,
        isConfirmed: seleccion.confirmado,
        createdAt: new Date(seleccion.createdAt || Date.now()),
        updatedAt: new Date(seleccion.updatedAt || Date.now()),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Métodos de configuración de email
  async getEmailConfigs(): Promise<EmailConfig[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/email-configs"
    );

    // Transformar la respuesta del backend
    return response.data.data!.map((config) => ({
      id: config.id.toString(),
      email: config.email,
      name: config.nombre,
      isActive: config.activo,
      createdAt: new Date(config.createdAt || Date.now()),
      updatedAt: new Date(config.updatedAt || Date.now()),
    }));
  }

  async createEmailConfig(
    emailConfigData: Omit<EmailConfig, "id" | "createdAt" | "updatedAt">
  ): Promise<EmailConfig> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/email-configs",
      {
        email: emailConfigData.email,
        nombre: emailConfigData.name,
        activo: emailConfigData.isActive,
      }
    );

    const config = response.data.data!;
    return {
      id: config.id.toString(),
      email: config.email,
      name: config.nombre,
      isActive: config.activo,
      createdAt: new Date(config.createdAt || Date.now()),
      updatedAt: new Date(config.updatedAt || Date.now()),
    };
  }

  async updateEmailConfig(
    id: string,
    emailConfigData: Partial<EmailConfig>
  ): Promise<EmailConfig> {
    const updateData: any = {};
    if (emailConfigData.email) updateData.email = emailConfigData.email;
    if (emailConfigData.name) updateData.nombre = emailConfigData.name;
    if (emailConfigData.isActive !== undefined)
      updateData.activo = emailConfigData.isActive;

    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(
      `/email-configs/${id}`,
      updateData
    );

    const config = response.data.data!;
    return {
      id: config.id.toString(),
      email: config.email,
      name: config.nombre,
      isActive: config.activo,
      createdAt: new Date(config.createdAt || Date.now()),
      updatedAt: new Date(config.updatedAt || Date.now()),
    };
  }

  async deleteEmailConfig(id: string): Promise<void> {
    await this.api.delete(`/email-configs/${id}`);
  }

  // Métodos de utilidad
  async getSelectionStatus(year: number): Promise<{
    currentPriority: number;
    totalSelections: number;
    maxSelections: number;
    isSelectionOpen: boolean;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/service-selections/status/${year}`
    );
    return response.data.data!;
  }
}

export const apiService = new ApiService();
export default apiService;
