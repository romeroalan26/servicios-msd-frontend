import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { Service, ServiceSelection, User } from "../types";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Establecer el título de la página
  useDocumentTitle("Dashboard");

  const [stats, setStats] = useState({
    totalServices: 0,
    totalUsers: 0,
    completedSelections: 0,
    pendingSelections: 0,
    currentYear: new Date().getFullYear(),
  });
  const [recentSelections, setRecentSelections] = useState<ServiceSelection[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [services, users, selections] = await Promise.all([
          apiService.getServices(),
          apiService.getUsers(),
          apiService.getServiceSelections(stats.currentYear),
        ]);

        const completedSelections = selections.filter(
          (s) => s.isConfirmed
        ).length;
        const pendingSelections = 20 - completedSelections; // 20 empleados máximo

        setStats({
          totalServices: services.length,
          totalUsers: users.length,
          completedSelections,
          pendingSelections,
          currentYear: stats.currentYear,
        });

        setRecentSelections(selections.slice(0, 5)); // Últimas 5 selecciones
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [stats.currentYear]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen del
          sistema.
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Servicios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalServices}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Usuarios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Selecciones Completadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.completedSelections}/20
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingSelections}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso de selecciones */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Progreso de Selecciones {stats.currentYear}
          </h3>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progreso general</span>
              <span className="text-gray-900 font-medium">
                {Math.round((stats.completedSelections / 20) * 100)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.completedSelections / 20) * 100}%` }}
              ></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>
                {stats.completedSelections} de 20 empleados han seleccionado
              </span>
              <span>{stats.pendingSelections} pendientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selecciones recientes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Selecciones Recientes
          </h3>
          {recentSelections.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentSelections.map((selection) => (
                  <li key={selection.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Selección #{selection.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(selection.selectedAt).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selection.isConfirmed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selection.isConfirmed ? "Confirmada" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay selecciones recientes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Las selecciones aparecerán aquí cuando los empleados comiencen a
                seleccionar servicios.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Información del usuario actual */}
      {user && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Tu Información
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">
                  {user.role}
                </dd>
              </div>
              {user.priority && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Prioridad
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.priority}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
