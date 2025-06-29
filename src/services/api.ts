import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  User,
  Service,
  ServiceSchedule,
  ServiceSelection,
  EmailConfig,
  ApiResponse,
  PaginatedResponse,
  PaginationInfo,
} from "../types";
import { config } from "../config";

// Configuración base de axios
const API_BASE_URL = config.apiUrl;

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

  // Métodos de usuarios (empleados)
  async getUsers(
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      `/empleados?${params.toString()}`
    );

    // Transformar la respuesta del backend
    const users = response.data.data!.map((empleado) => ({
      id: empleado.id.toString(),
      name: empleado.nombre,
      email: empleado.email,
      role: empleado.rol,
      priority: empleado.prioridad,
      isActive: empleado.activo,
      createdAt: new Date(empleado.createdAt || Date.now()),
      updatedAt: new Date(empleado.updatedAt || Date.now()),
    }));

    return {
      users,
      pagination: response.data.pagination || {
        page: 1,
        limit: 10,
        totalElements: users.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }

  // Método para obtener todos los usuarios sin paginación (para compatibilidad)
  async getAllUsers(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/empleados"
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
    userData: Omit<User, "id" | "createdAt" | "updatedAt"> & {
      password: string;
    }
  ): Promise<User> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/empleados",
      {
        nombre: userData.name,
        email: userData.email,
        password: userData.password,
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
      `/empleados/${id}`,
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
    await this.api.delete(`/empleados/${id}`);
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await this.api.post(`/empleados/${id}/reset-password`, {
      password: newPassword,
    });
  }

  async updateUserPriority(id: string, priority: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(
      `/empleados/${id}/prioridad`,
      { prioridad: priority }
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

  // Métodos de servicios
  async getServices(): Promise<Service[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/servicios?limit=100"
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
      `/servicios/${id}`
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

  async getServiceDetails(id: string): Promise<{
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
    dias: Array<{
      id: number;
      servicio_id: number;
      fecha: string;
      tanda: string;
      turno_id: number;
      turno_codigo: string;
      turno_nombre: string;
      excepciones: any[];
    }>;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/servicios/${id}`
    );
    return response.data.data!;
  }

  async createService(
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt">
  ): Promise<Service> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/servicios",
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
      `/admin/servicios/${id}`,
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
    await this.api.delete(`/admin/servicios/${id}`);
  }

  // Métodos de selección de servicios
  async getServiceSelections(year?: number): Promise<ServiceSelection[]> {
    // El backend no tiene un endpoint específico para esto, usamos el estado
    const status = await this.getSelectionStatus(
      year || new Date().getFullYear()
    );
    return []; // TODO: Implementar cuando el backend lo soporte
  }

  async selectService(
    serviceId: string,
    year?: number
  ): Promise<ServiceSelection> {
    const currentYear = year || new Date().getFullYear();

    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/selecciones",
      {
        servicio_id: parseInt(serviceId),
        anno: currentYear,
      }
    );

    const seleccion = response.data.data!;
    return {
      id: seleccion.id.toString(),
      serviceId: seleccion.servicio_id.toString(),
      userId: seleccion.empleado_id.toString(),
      selectedAt: new Date(seleccion.created_at),
      year: seleccion.anno,
      isConfirmed: true, // Asumimos que está confirmado al crearse
      createdAt: new Date(seleccion.created_at),
      updatedAt: new Date(seleccion.updated_at),
    };
  }

  async getCurrentUserSelection(
    year: number
  ): Promise<ServiceSelection | null> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
        `/selecciones/mi-seleccion`
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
  async getDashboardKpis(year: number): Promise<{
    totalServicios: number;
    totalUsuarios: number;
    seleccionesCompletadas: number;
    seleccionesPendientes: number;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/selecciones/kpis?anno=${year}`
    );
    return response.data.data!;
  }

  async getSelectionStatus(year: number): Promise<{
    currentPriority: number;
    totalSelections: number;
    maxSelections: number;
    isSelectionOpen: boolean;
    estadisticas: {
      total_selecciones: number;
      empleados_con_seleccion: number;
      servicios_seleccionados: number;
    };
    currentPriorityEmployee: {
      id: number;
      nombre: string;
      email: string;
      prioridad: number;
      rol: string;
    } | null;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/selecciones/estado?anno=${year}`
    );

    // Extraer las estadísticas del endpoint
    const data = response.data.data!;
    return {
      currentPriority: data.proximo_empleado?.prioridad || 0,
      totalSelections: data.estadisticas?.empleados_con_seleccion || 0,
      maxSelections: 20, // Total de empleados
      isSelectionOpen: data.proximo_empleado !== null,
      estadisticas: data.estadisticas || {
        total_selecciones: 0,
        empleados_con_seleccion: 0,
        servicios_seleccionados: 0,
      },
      currentPriorityEmployee: data.proximo_empleado || null,
    };
  }

  // Métodos de turnos
  async getShifts(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/turnos/activos"
    );
    return response.data.data!;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.get(
      "/health"
    );
    return response.data;
  }

  // Métodos del calendario
  async getCalendarData(
    year: number,
    month?: number
  ): Promise<{
    employees: User[];
    services: Service[];
    selections: ServiceSelection[];
    assignments: any[];
  }> {
    try {
      const [employees, services, selections] = await Promise.all([
        this.getAllUsers(),
        this.getServices(),
        this.getServiceSelections(year),
      ]);

      // Obtener datos del calendario según si se especifica mes o no
      let calendarEndpoint = `/selecciones/calendario/${year}`;
      if (month !== undefined) {
        calendarEndpoint += `/${month}`;
      }

      const calendarResponse: AxiosResponse<ApiResponse<any[]>> =
        await this.api.get(calendarEndpoint);
      const assignments = calendarResponse.data.data || [];

      return {
        employees,
        services,
        selections,
        assignments,
      };
    } catch (error) {
      console.error("Error al obtener datos del calendario:", error);
      throw error;
    }
  }

  async getSelectionProgress(): Promise<{
    totalEmpleados: number;
    empleadosQueSeleccionaron: number;
    progreso: number;
  }> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
        "/selecciones/progreso"
      );
      return response.data.data!;
    } catch (error) {
      console.error("Error al obtener progreso de selecciones:", error);
      throw error;
    }
  }

  async getCurrentPriority(year: number): Promise<{
    id: number;
    nombre: string;
    email: string;
    prioridad: number;
    rol: string;
  } | null> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
        `/selecciones/prioridad-actual?anno=${year}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener prioridad actual:", error);
      throw error;
    }
  }

  async getEmployeeAssignments(
    employeeId: string,
    year: number
  ): Promise<any[]> {
    try {
      // TODO: Implementar cuando el backend lo soporte
      // const response = await this.api.get(`/empleados/${employeeId}/asignaciones/${year}`);
      // return response.data.data;
      return [];
    } catch (error) {
      console.error("Error al obtener asignaciones del empleado:", error);
      return [];
    }
  }

  async getServiceSchedule(serviceId: string, year: number): Promise<any[]> {
    try {
      // TODO: Implementar cuando el backend lo soporte
      // const response = await this.api.get(`/servicios/${serviceId}/horarios/${year}`);
      // return response.data.data;
      return [];
    } catch (error) {
      console.error("Error al obtener horarios del servicio:", error);
      return [];
    }
  }
}

export const apiService = new ApiService();
export default apiService;
