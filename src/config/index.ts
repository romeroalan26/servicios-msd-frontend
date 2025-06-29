// Configuración de la aplicación desde variables de entorno
export const config = {
  // API
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  // Aplicación
  appName: import.meta.env.VITE_APP_NAME || "Sistema de Gestión de Servicios",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
} as const;

export default config;
