import React from "react";
import { User, Service } from "../types";
import { Clock, Users, Calendar } from "lucide-react";

interface DayViewProps {
  date: Date;
  employees: User[];
  services: Service[];
  selections: any[];
  assignments: any[];
}

const DayView: React.FC<DayViewProps> = ({
  date,
  employees,
  services,
  selections,
  assignments,
}) => {
  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const getShiftsForDay = () => {
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayAssignments = assignments.filter(
      (assignment) => assignment.fecha === dateString
    );

    // Agrupar por tanda
    const shifts = {
      mañana: dayAssignments.filter((a) => a.tanda === "mañana"),
      tarde: dayAssignments.filter((a) => a.tanda === "tarde"),
      noche: dayAssignments.filter((a) => a.tanda === "noche"),
    };

    return [
      {
        time: "06:00-14:00",
        shift: "morning",
        assignments: shifts.mañana,
        label: "Mañana",
      },
      {
        time: "14:00-22:00",
        shift: "afternoon",
        assignments: shifts.tarde,
        label: "Tarde",
      },
      {
        time: "22:00-06:00",
        shift: "night",
        assignments: shifts.noche,
        label: "Noche",
      },
    ];
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "morning":
        return "bg-yellow-100 text-yellow-800";
      case "afternoon":
        return "bg-orange-100 text-orange-800";
      case "night":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftTime = (shift: string) => {
    switch (shift) {
      case "morning":
        return "06:00-14:00";
      case "afternoon":
        return "14:00-22:00";
      case "night":
        return "22:00-06:00";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del día */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {date.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <p className="text-gray-500 mt-1">
              Día{" "}
              {Math.floor(
                (date.getTime() -
                  new Date(date.getFullYear(), 0, 0).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              del año
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">
              {
                assignments.filter(
                  (a) => a.fecha === date.toISOString().split("T")[0]
                ).length
              }{" "}
              asignaciones
            </span>
          </div>
        </div>
      </div>

      {/* Turnos del día */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {getShiftsForDay().map((shift, index) => (
          <div key={index} className="bg-white rounded-lg shadow">
            <div className={`p-4 border-b ${getShiftColor(shift.shift)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-medium">Turno {shift.label}</h3>
                </div>
                <span className="text-sm font-medium">
                  {getShiftTime(shift.shift)}
                </span>
              </div>
            </div>

            <div className="p-4">
              {shift.assignments.length > 0 ? (
                <div className="space-y-3">
                  {shift.assignments.map((assignment, empIndex) => (
                    <div
                      key={empIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {assignment.empleado.nombre}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Prioridad: {assignment.empleado.prioridad}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.servicio.nombre}
                        </div>
                        <p className="text-xs text-gray-500">
                          Turno: {assignment.turno}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Sin asignaciones</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resumen del Día
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {
                assignments.filter(
                  (a) => a.fecha === date.toISOString().split("T")[0]
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Asignaciones</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {
                new Set(
                  assignments
                    .filter((a) => a.fecha === date.toISOString().split("T")[0])
                    .map((a) => a.empleado.id)
                ).size
              }
            </div>
            <div className="text-sm text-gray-600">Empleados Asignados</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {
                new Set(
                  assignments
                    .filter((a) => a.fecha === date.toISOString().split("T")[0])
                    .map((a) => a.servicio.id)
                ).size
              }
            </div>
            <div className="text-sm text-gray-600">Servicios Activos</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">Turnos Programados</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
