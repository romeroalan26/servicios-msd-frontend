import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { User, PaginationInfo } from "../types";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Shield,
  Key,
  Users as UsersIcon,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  priority?: number;
  isActive: boolean;
}

const Users: React.FC = () => {
  const { user } = useAuth();

  // Establecer el título de la página
  useDocumentTitle("Administración de Usuarios");

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Formulario para crear/editar usuario
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
    priority: undefined,
    isActive: true,
  });

  // Verificar si el usuario actual es admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-gray-500">
            Solo los administradores pueden acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers(1, pageSize);
  }, []);

  // Auto-ocultar notificación después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUsers = async (
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers(page, limit);
      setUsers(response.users);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showNotification("error", "Error al cargar la lista de usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    fetchUsers(1, newPageSize);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "employee",
      priority: undefined,
      isActive: true,
    });
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      showNotification("error", "Todos los campos son requeridos");
      return;
    }

    if (formData.name.length > 100) {
      showNotification("error", "El nombre no puede exceder 100 caracteres");
      return;
    }

    if (formData.email.length > 150) {
      showNotification("error", "El email no puede exceder 150 caracteres");
      return;
    }

    if (formData.password.length > 50) {
      showNotification("error", "La contraseña no puede exceder 50 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification("error", "Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      showNotification(
        "error",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    if (
      formData.priority &&
      (formData.priority < 1 || formData.priority > 20)
    ) {
      showNotification("error", "La prioridad debe estar entre 1 y 20");
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await apiService.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role as "admin" | "employee",
        priority: formData.priority,
        isActive: formData.isActive,
        password: formData.password,
      });

      setShowCreateModal(false);
      resetForm();
      showNotification(
        "success",
        `Usuario "${newUser.name}" creado exitosamente`
      );
      // Recargar la página actual
      fetchUsers(currentPage, pageSize);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al crear el usuario";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.name || !formData.email) {
      showNotification("error", "Nombre y email son requeridos");
      return;
    }

    if (formData.name.length > 100) {
      showNotification("error", "El nombre no puede exceder 100 caracteres");
      return;
    }

    if (formData.email.length > 150) {
      showNotification("error", "El email no puede exceder 150 caracteres");
      return;
    }

    if (
      formData.priority &&
      (formData.priority < 1 || formData.priority > 20)
    ) {
      showNotification("error", "La prioridad debe estar entre 1 y 20");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await apiService.updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role as "admin" | "employee",
        priority: formData.priority,
        isActive: formData.isActive,
      });

      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      showNotification(
        "success",
        `Usuario "${updatedUser.name}" actualizado exitosamente`
      );
      // Recargar la página actual
      fetchUsers(currentPage, pageSize);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar el usuario";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres desactivar este usuario?")) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      showNotification("success", "Usuario desactivado exitosamente");
      // Recargar la página actual
      fetchUsers(currentPage, pageSize);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al desactivar el usuario";
      showNotification("error", errorMessage);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !formData.password) {
      showNotification("error", "La nueva contraseña es requerida");
      return;
    }

    if (formData.password.length > 50) {
      showNotification("error", "La contraseña no puede exceder 50 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification("error", "Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      showNotification(
        "error",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.resetUserPassword(selectedUser.id, formData.password);
      setShowPasswordModal(false);
      setSelectedUser(null);
      resetForm();
      showNotification(
        "success",
        `Contraseña de "${selectedUser.name}" reseteada exitosamente`
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error al resetear la contraseña";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      priority: user.priority,
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      priority: user.priority,
      isActive: user.isActive,
    });
    setShowPasswordModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm.length <= 100 &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Mostrar mensaje cuando no hay resultados en la página actual
  const hasFilteredResults = filteredUsers.length > 0;
  const hasActiveFilters =
    searchTerm || roleFilter !== "all" || statusFilter !== "all";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Administración de Usuarios
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona los empleados del sistema
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxLength={100}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="employee">Empleados</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>

          <button
            onClick={() => fetchUsers(currentPage, pageSize)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "admin" ? "Administrador" : "Empleado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.priority || "Sin prioridad"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      {user.isActive && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Desactivar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {hasActiveFilters
                ? "No se encontraron usuarios con los filtros aplicados"
                : "No hay usuarios en esta página"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters
                ? "Intenta ajustar los filtros de búsqueda o navegar a otra página."
                : "No hay usuarios registrados en el sistema."}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, pagination.totalElements)}
                </span>{" "}
                de{" "}
                <span className="font-medium">{pagination.totalElements}</span>{" "}
                resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevious}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Páginas */}
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear usuario */}
      {showCreateModal && (
        <UserModal
          title="Crear Nuevo Usuario"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateUser}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isSubmitting={isSubmitting}
          isCreate={true}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      )}

      {/* Modal de editar usuario */}
      {showEditModal && selectedUser && (
        <UserModal
          title="Editar Usuario"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
          }}
          isSubmitting={isSubmitting}
          isCreate={false}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      )}

      {/* Modal de cambiar contraseña */}
      {showPasswordModal && selectedUser && (
        <PasswordModal
          user={selectedUser}
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          setPassword={(password) => setFormData({ ...formData, password })}
          setConfirmPassword={(confirmPassword) =>
            setFormData({ ...formData, confirmPassword })
          }
          onSubmit={handleResetPassword}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
            resetForm();
          }}
          isSubmitting={isSubmitting}
          showNewPassword={showNewPassword}
          setShowNewPassword={(show) => setShowNewPassword(show)}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={(show) => setShowConfirmPassword(show)}
        />
      )}

      {/* Notificación */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-md shadow-lg ${
              notification.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Modal para crear/editar usuario
interface UserModalProps {
  title: string;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  isCreate: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  title,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  isCreate,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Primera fila: Nombre y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan Pérez"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="juan@empresa.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.email.length}/150 caracteres
              </p>
            </div>
          </div>

          {/* Segunda fila: Contraseñas (solo para crear) */}
          {isCreate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    maxLength={50}
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.password.length}/50 caracteres (mínimo 6)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    maxLength={50}
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.confirmPassword.length}/50 caracteres (mínimo 6)
                </p>
              </div>
            </div>
          )}

          {/* Tercera fila: Rol y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <input
                type="number"
                value={formData.priority || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="1-20"
                min="1"
                max="20"
                step="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Valor entre 1 y 20 (solo para empleados)
              </p>
            </div>
          </div>

          {/* Cuarta fila: Estado activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900"
            >
              Usuario activo
            </label>
          </div>

          {/* Mensajes de validación */}
          {isCreate && (
            <div className="space-y-1">
              {formData.password &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600">
                    ⚠️ Las contraseñas no coinciden
                  </p>
                )}
              {formData.password && formData.password.length < 6 && (
                <p className="text-sm text-orange-600">
                  ⚠️ La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={
              isSubmitting ||
              !formData.name ||
              !formData.email ||
              formData.name.length > 100 ||
              formData.email.length > 150 ||
              (formData.priority &&
                (formData.priority < 1 || formData.priority > 20)) ||
              (isCreate &&
                (!formData.password ||
                  !formData.confirmPassword ||
                  formData.password !== formData.confirmPassword ||
                  formData.password.length < 6 ||
                  formData.password.length > 50))
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Guardando..."
              : isCreate
              ? "Crear Usuario"
              : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modal para cambiar contraseña
interface PasswordModalProps {
  user: User;
  password: string;
  confirmPassword: string;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  showNewPassword: boolean;
  setShowNewPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  user,
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  onSubmit,
  onClose,
  isSubmitting,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Cambiar Contraseña
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Usuario:</strong> {user.name} ({user.email})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={50}
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {password.length}/50 caracteres (mínimo 6)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={50}
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {confirmPassword.length}/50 caracteres (mínimo 6)
              </p>
            </div>
          </div>

          {/* Mensajes de validación */}
          <div className="space-y-1">
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600">
                ⚠️ Las contraseñas no coinciden
              </p>
            )}
            {password && password.length < 6 && (
              <p className="text-sm text-orange-600">
                ⚠️ La contraseña debe tener al menos 6 caracteres
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={
              isSubmitting ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              password.length < 6 ||
              password.length > 50
            }
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;
