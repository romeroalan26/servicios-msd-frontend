import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { Service, ServiceSelection } from "../types";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  User,
  Users,
  Info,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Services: React.FC = () => {
  const { user } = useAuth();

  // Establecer el título de la página
  useDocumentTitle("Servicios");

  const [services, setServices] = useState<Service[]>([]);
  const [selections, setSelections] = useState<ServiceSelection[]>([]);
  const [currentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [selectionStatus, setSelectionStatus] = useState({
    currentPriority: 0,
    totalSelections: 0,
    maxSelections: 20,
    isSelectionOpen: false,
  });
  const [currentPriorityEmployee, setCurrentPriorityEmployee] = useState<{
    id: number;
    nombre: string;
    email: string;
    prioridad: number;
    rol: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          servicesData,
          selectionsData,
          progressData,
          currentPriorityData,
        ] = await Promise.all([
          apiService.getServices(),
          apiService.getServiceSelections(currentYear),
          apiService.getSelectionProgress(),
          apiService.getCurrentPriority(currentYear),
        ]);

        setServices(servicesData);
        setSelections(selectionsData);
        setCurrentPriorityEmployee(currentPriorityData);

        // Transformar datos del progreso al formato esperado
        setSelectionStatus({
          currentPriority: currentPriorityData?.prioridad || 0,
          totalSelections: progressData.empleadosQueSeleccionaron,
          maxSelections: progressData.totalEmpleados,
          isSelectionOpen: progressData.progreso < 100, // Asumimos que está abierto si no está completo
        });
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentYear]);

  const canSelectService = () => {
    if (!user || user.role !== "employee" || !user.priority) return false;
    return (
      user.priority === selectionStatus.currentPriority &&
      selectionStatus.isSelectionOpen
    );
  };

  const isServiceSelected = (serviceId: string) => {
    return selections.some((selection) => selection.serviceId === serviceId);
  };

  const isServiceSelectedByCurrentUser = (serviceId: string) => {
    return selections.some(
      (selection) =>
        selection.serviceId === serviceId && selection.userId === user?.id
    );
  };

  const handleSelectService = async (service: Service) => {
    if (!canSelectService()) return;

    try {
      const selection = await apiService.selectService(service.id);
      setSelections((prev) => [...prev, selection]);
      setSelectedService(service);

      // Recargar el progreso y la prioridad actual
      const [progressData, currentPriorityData] = await Promise.all([
        apiService.getSelectionProgress(),
        apiService.getCurrentPriority(currentYear),
      ]);

      setCurrentPriorityEmployee(currentPriorityData);
      setSelectionStatus({
        currentPriority: currentPriorityData?.prioridad || 0,
        totalSelections: progressData.empleadosQueSeleccionaron,
        maxSelections: progressData.totalEmpleados,
        isSelectionOpen: progressData.progreso < 100,
      });

      alert(`¡Servicio "${service.name}" seleccionado exitosamente!`);
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Error al seleccionar el servicio"
      );
    }
  };

  const getSelectionStatusText = () => {
    if (!user || user.role !== "employee") {
      return "Solo los empleados pueden seleccionar servicios";
    }

    if (!user.priority) {
      return "No tienes prioridad asignada para seleccionar servicios";
    }

    if (!selectionStatus.isSelectionOpen) {
      return "La selección de servicios no está abierta";
    }

    if (currentPriorityEmployee === null) {
      return "Todos los empleados ya han seleccionado sus servicios";
    }

    if (user.priority < selectionStatus.currentPriority) {
      return `Tu turno de selección ya pasó (prioridad ${user.priority})`;
    }

    if (user.priority > selectionStatus.currentPriority) {
      return `Tu turno de selección será en prioridad ${user.priority}`;
    }

    if (user.priority === selectionStatus.currentPriority) {
      return `Es tu turno de seleccionar (prioridad ${user.priority})`;
    }

    return `Turno de selección: ${currentPriorityEmployee?.nombre} (Prioridad ${selectionStatus.currentPriority})`;
  };

  const getSelectionStatusColor = () => {
    if (!user || user.role !== "employee" || !user.priority) {
      return "text-gray-600 bg-gray-100";
    }

    if (!selectionStatus.isSelectionOpen) {
      return "text-yellow-600 bg-yellow-100";
    }

    if (user.priority === selectionStatus.currentPriority) {
      return "text-green-600 bg-green-100";
    }

    if (user.priority < selectionStatus.currentPriority) {
      return "text-red-600 bg-red-100";
    }

    return "text-blue-600 bg-blue-100";
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
        <h1 className="text-2xl font-bold text-gray-900">
          Servicios Disponibles {currentYear}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Selecciona tu servicio según tu prioridad asignada
        </p>
      </div>

      {/* Estado de selección */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Estado de Selección
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {getSelectionStatusText()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Prioridad Actual: {selectionStatus.currentPriority}
                </p>
                <p className="text-sm text-gray-500">
                  {currentPriorityEmployee
                    ? currentPriorityEmployee.nombre
                    : "Sin empleado disponible"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectionStatus.totalSelections} de{" "}
                  {selectionStatus.maxSelections} seleccionados
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSelectionStatusColor()}`}
              >
                {user?.priority
                  ? `Prioridad ${user.priority}`
                  : "Sin prioridad"}
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progreso de selecciones</span>
              <span className="text-gray-900 font-medium">
                {Math.round(
                  (selectionStatus.totalSelections /
                    selectionStatus.maxSelections) *
                    100
                )}
                %
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (selectionStatus.totalSelections /
                      selectionStatus.maxSelections) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>
                {selectionStatus.totalSelections} de{" "}
                {selectionStatus.maxSelections} empleados han seleccionado
              </span>
              <span>
                {selectionStatus.maxSelections -
                  selectionStatus.totalSelections}{" "}
                pendientes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const isSelected = isServiceSelected(service.id);
          const isSelectedByMe = isServiceSelectedByCurrentUser(service.id);
          const canSelect = canSelectService() && !isSelected;

          return (
            <div
              key={service.id}
              className={`bg-white shadow rounded-lg overflow-hidden border-2 ${
                isSelectedByMe
                  ? "border-green-500"
                  : isSelected
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {service.name}
                  </h3>
                  {isSelectedByMe && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {service.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Año {service.year}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setShowServiceDetails(
                          showServiceDetails === service.id ? null : service.id
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {canSelect && (
                      <button
                        onClick={() => handleSelectService(service)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Seleccionar
                      </button>
                    )}

                    {isSelectedByMe && (
                      <span className="text-green-600 text-sm font-medium">
                        Seleccionado
                      </span>
                    )}

                    {isSelected && !isSelectedByMe && (
                      <span className="text-red-600 text-sm font-medium">
                        Ocupado
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalles del servicio */}
                {showServiceDetails === service.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Detalles del Servicio
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        <span>ID: {service.id}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Horarios: Mañana, Tarde, Noche</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Posiciones: CA, P1, P2, etc.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay servicios */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay servicios disponibles
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Los servicios aparecerán aquí cuando sean creados por el
            administrador.
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información Importante
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Solo puedes seleccionar un servicio por año</li>
                <li>La selección se realiza por orden de prioridad</li>
                <li>Una vez seleccionado, no puedes cambiar</li>
                <li>Recibirás confirmación por email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
