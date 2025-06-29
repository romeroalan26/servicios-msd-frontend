import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Mail,
  Bell,
} from "lucide-react";
import logo from "../assets/logoOPRETFooter.png";
import { config } from "../config";
import Version from "./Version";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Servicios", href: "/services", icon: Calendar },
    { name: "Calendario", href: "/calendar", icon: Calendar },
    { name: "Usuarios", href: "/users", icon: Users, adminOnly: true },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
      adminOnly: true,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Filtrar navegación según el rol del usuario
  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar para móviles */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className="fixed inset-y-0 left-0 flex w-72 flex-col"
          style={{ backgroundColor: "#0B602A" }}
        >
          <div className="flex h-20 items-center justify-between px-6 border-b border-green-700">
            <div className="flex items-center justify-center flex-1">
              <img
                src={logo}
                alt="Logo Institucional"
                className="h-16 w-auto mr-3"
              />
              <h1 className="text-white text-lg font-semibold">
                {config.appName}
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-green-200 hover:text-white flex-shrink-0 ml-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-600 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div
          className="flex flex-col flex-grow"
          style={{ backgroundColor: "#0B602A" }}
        >
          <div className="flex h-20 items-center justify-center px-6 border-b border-green-700">
            <img
              src={logo}
              alt="Logo Institucional"
              className="h-16 w-auto mr-3"
            />
            <h1 className="text-white text-lg font-semibold">
              {config.appName}
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-600 hover:text-white"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-72">
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo en header para móviles */}
          <div className="flex items-center lg:hidden">
            <img
              src={logo}
              alt="Logo Institucional"
              className="h-10 w-auto mr-2"
            />
            <h1 className="text-gray-900 text-sm font-semibold">
              {config.appName}
            </h1>
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notificaciones */}
              <button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* Separador */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Perfil del usuario */}
              <div className="relative">
                <div className="flex items-center gap-x-4">
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                title="Cerrar sesión"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer con versión */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                © 2024 {config.appName}
              </div>
              <Version />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
