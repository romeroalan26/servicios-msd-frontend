import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import { Service, User } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  Eye,
  Grid,
  List,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import DayView from "../components/DayView";

type ViewMode = "day" | "month" | "year";
type CalendarView = "grid" | "list";

interface CalendarEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  shift?: "morning" | "afternoon" | "night";
  position?: string;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();

  // Establecer el título de la página
  useDocumentTitle("Calendario");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [calendarView, setCalendarView] = useState<CalendarView>("grid");
  const [employees, setEmployees] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selections, setSelections] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const currentMonth =
          viewMode === "month" ? currentDate.getMonth() + 1 : undefined;
        const calendarData = await apiService.getCalendarData(
          selectedYear,
          currentMonth
        );

        setEmployees(calendarData.employees);
        setServices(calendarData.services);
        setSelections(calendarData.selections);
        setAssignments(calendarData.assignments);
      } catch (error) {
        console.error("Error al cargar datos del calendario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [selectedYear, currentDate, viewMode]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Agregar días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const today = new Date();
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString(),
      });
    }

    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const getEmployeeForDate = (date: Date) => {
    // Buscar en las asignaciones del backend
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayAssignments = assignments.filter(
      (assignment) => assignment.fecha === dateString
    );

    if (dayAssignments.length > 0) {
      // Tomar el primer empleado del día (puedes ajustar la lógica según necesites)
      const assignment = dayAssignments[0];
      return (
        employees.find((emp) => emp.id === assignment.empleado.id.toString()) ||
        null
      );
    }

    // Fallback: lógica anterior si no hay asignaciones
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const employeeIndex = dayOfYear % employees.length;
    return employees[employeeIndex] || null;
  };

  const getServiceForEmployee = (employeeId: string) => {
    // Buscar en las asignaciones del backend
    const employeeAssignments = assignments.filter(
      (assignment) => assignment.empleado.id.toString() === employeeId
    );

    if (employeeAssignments.length > 0) {
      const assignment = employeeAssignments[0];
      return (
        services.find(
          (service) => service.id === assignment.servicio.id.toString()
        ) || null
      );
    }

    // Fallback: buscar en selecciones
    const selection = selections.find((sel) => sel.userId === employeeId);
    if (selection) {
      return (
        services.find((service) => service.id === selection.serviceId) || null
      );
    }

    return null;
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
    return assignments.filter((assignment) => assignment.fecha === dateString);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: "prev" | "next") => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendario de Servicios
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualiza la distribución de servicios por empleado
          </p>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center space-x-4">
          {/* Selector de vista */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "day"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "month"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode("year")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "year"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Año
            </button>
          </div>

          {/* Selector de vista de calendario */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setCalendarView("grid")}
              className={`p-2 rounded-md ${
                calendarView === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCalendarView("list")}
              className={`p-2 rounded-md ${
                calendarView === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación de fecha */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <button
            onClick={() =>
              viewMode === "year" ? navigateYear("prev") : navigateMonth("prev")
            }
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <h2 className="text-xl font-semibold">
            {viewMode === "year"
              ? `Año ${selectedYear}`
              : getMonthName(currentDate)}
          </h2>

          <button
            onClick={() =>
              viewMode === "year" ? navigateYear("next") : navigateMonth("next")
            }
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={() => {
            setCurrentDate(new Date());
            setSelectedYear(new Date().getFullYear());
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Hoy
        </button>
      </div>

      {/* Vista del calendario */}
      {viewMode === "month" && calendarView === "grid" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Encabezados de días */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayAssignments = getAssignmentsForDate(day.date);
              const employee = getEmployeeForDate(day.date);
              const service = employee
                ? getServiceForEmployee(employee.id)
                : null;

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                    !day.isCurrentMonth ? "bg-gray-50" : "bg-white"
                  } ${day.isToday ? "bg-blue-50" : ""}`}
                >
                  <div
                    className={`text-sm font-medium ${
                      !day.isCurrentMonth
                        ? "text-gray-400"
                        : day.isToday
                        ? "text-blue-600"
                        : "text-gray-900"
                    }`}
                  >
                    {day.date.getDate()}
                  </div>

                  {dayAssignments.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {dayAssignments.slice(0, 2).map((assignment, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="font-medium text-gray-700 truncate">
                            {assignment.empleado.nombre}
                          </div>
                          <div className="text-gray-500 truncate">
                            {assignment.servicio.nombre}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {assignment.tanda} - {assignment.turno}
                          </div>
                        </div>
                      ))}
                      {dayAssignments.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{dayAssignments.length - 2} más
                        </div>
                      )}
                    </div>
                  ) : employee && service ? (
                    <div className="mt-1 space-y-1">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {employee.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {service.name}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista diaria */}
      {viewMode === "day" && (
        <DayView
          date={currentDate}
          employees={employees}
          services={services}
          selections={selections}
          assignments={assignments}
        />
      )}

      {/* Vista de lista */}
      {calendarView === "list" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Lista de Asignaciones</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => {
              const service = getServiceForEmployee(employee.id);
              return (
                <div key={employee.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {employee.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Prioridad: {employee.priority || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {service ? service.name : "Sin servicio asignado"}
                      </div>
                      <p className="text-sm text-gray-500">
                        {service ? `${service.year}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Placeholder para vista anual */}
      {viewMode === "year" && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Vista Anual
          </h3>
          <p className="text-gray-500">
            Esta vista estará disponible próximamente.
          </p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
