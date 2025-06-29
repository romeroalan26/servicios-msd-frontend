import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Users } from "lucide-react";
import apiService from "../services/api";

interface ServiceDetailsModalProps {
  serviceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceDay {
  id: number;
  servicio_id: number;
  fecha: string;
  tanda: string;
  turno_id: number;
  turno_codigo: string;
  turno_nombre: string;
  excepciones: any[];
}

interface ServiceDetails {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  dias: ServiceDay[];
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  serviceId,
  isOpen,
  onClose,
}) => {
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchServiceDetails();
    }
  }, [isOpen, serviceId]);

  const fetchServiceDetails = async () => {
    if (!serviceId) return;

    setIsLoading(true);
    try {
      const details = await apiService.getServiceDetails(serviceId);
      setServiceDetails(details);
    } catch (error) {
      console.error("Error al cargar detalles del servicio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getServiceDayForDate = (date: Date) => {
    if (!serviceDetails) return null;

    const dateString = date.toISOString().split("T")[0];
    return serviceDetails.dias.filter((day) =>
      day.fecha.startsWith(dateString)
    );
  };

  const getTandaColor = (tanda: string) => {
    switch (tanda.toLowerCase()) {
      case "mañana":
        return "bg-yellow-100 text-yellow-800";
      case "tarde":
        return "bg-orange-100 text-orange-800";
      case "noche":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTurnoColor = (turno: string) => {
    const colors = [
      "bg-red-100 text-red-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800",
    ];
    const index = turno.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {serviceDetails?.nombre || "Detalles del Servicio"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : serviceDetails ? (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Información del servicio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="font-medium text-gray-900">
                    {serviceDetails.descripcion}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium text-gray-900">
                    {serviceDetails.activo ? "Activo" : "Inactivo"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total de días</p>
                  <p className="font-medium text-gray-900">
                    {serviceDetails.dias.length}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Turnos únicos</p>
                  <p className="font-medium text-gray-900">
                    {
                      new Set(serviceDetails.dias.map((d) => d.turno_codigo))
                        .size
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Navegación de meses */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                ← Anterior
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(selectedYear, selectedMonth).toLocaleDateString(
                  "es-ES",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h3>
              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Siguiente →
              </button>
            </div>

            {/* Calendario */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-gray-700"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7">
                {Array.from({
                  length: getFirstDayOfMonth(selectedYear, selectedMonth),
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="p-3 border-r border-b border-gray-200 min-h-[120px]"
                  ></div>
                ))}

                {Array.from({
                  length: getDaysInMonth(selectedYear, selectedMonth),
                }).map((_, index) => {
                  const day = index + 1;
                  const date = new Date(selectedYear, selectedMonth, day);
                  const serviceDays = getServiceDayForDate(date);

                  return (
                    <div
                      key={day}
                      className="p-2 border-r border-b border-gray-200 min-h-[120px] bg-white"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {day}
                      </div>
                      {serviceDays && serviceDays.length > 0 ? (
                        <div className="space-y-1">
                          {serviceDays.map((serviceDay) => (
                            <div key={serviceDay.id} className="text-xs">
                              <div
                                className={`px-1 py-0.5 rounded ${getTandaColor(
                                  serviceDay.tanda
                                )} mb-1`}
                              >
                                {serviceDay.tanda}
                              </div>
                              <div
                                className={`px-1 py-0.5 rounded ${getTurnoColor(
                                  serviceDay.turno_codigo
                                )}`}
                              >
                                {serviceDay.turno_codigo} -{" "}
                                {serviceDay.turno_nombre}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          Sin servicio
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Leyenda
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">
                    Tandas
                  </h5>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                      <span className="text-xs text-gray-600">Mañana</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-100 rounded"></div>
                      <span className="text-xs text-gray-600">Tarde</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-100 rounded"></div>
                      <span className="text-xs text-gray-600">Noche</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">
                    Turnos
                  </h5>
                  <div className="grid grid-cols-2 gap-1">
                    {Array.from(
                      new Set(serviceDetails.dias.map((d) => d.turno_codigo))
                    )
                      .slice(0, 6)
                      .map((turno) => (
                        <div
                          key={turno}
                          className="flex items-center space-x-1"
                        >
                          <div
                            className={`w-2 h-2 rounded ${getTurnoColor(
                              turno
                            )}`}
                          ></div>
                          <span className="text-xs text-gray-600">{turno}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No se pudieron cargar los detalles del servicio
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
