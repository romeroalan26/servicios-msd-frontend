# Sistema de Gestión de Servicios

Sistema web para la gestión de servicios anuales con sistema de prioridades para empleados.

## Características

- **Autenticación de usuarios** con roles (admin/empleado)
- **Gestión de servicios** con horarios diarios (mañana, tarde, noche)
- **Sistema de prioridades** para selección de servicios
- **Panel administrativo** para gestión completa
- **Notificaciones por email** de confirmaciones
- **Interfaz responsive** con Tailwind CSS

## Estado Actual del Proyecto

### ✅ **Implementado**

- ✅ Sistema de autenticación completo
- ✅ Dashboard con estadísticas
- ✅ Página de servicios para empleados
- ✅ Sistema de prioridades y selección
- ✅ Layout responsive con navegación
- ✅ Integración con API backend
- ✅ Manejo de estados y errores

### 🚧 **En Desarrollo**

- 🔄 Gestión de usuarios (admin)
- 🔄 Configuración de horarios
- 🔄 Configuración de emails
- 🔄 Calendario de turnos

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.tsx      # Layout principal con navegación
│   └── ProtectedRoute.tsx # Rutas protegidas
├── contexts/           # Contextos de React (Auth)
│   └── AuthContext.tsx # Contexto de autenticación
├── hooks/              # Custom hooks
├── pages/              # Páginas principales
│   ├── Login.tsx       # Página de login
│   ├── Dashboard.tsx   # Dashboard principal
│   └── Services.tsx    # Página de servicios
├── services/           # Servicios de API
│   └── api.ts         # Cliente API con axios
├── types/              # Tipos TypeScript
│   └── index.ts       # Interfaces principales
├── utils/              # Utilidades
└── assets/             # Recursos estáticos
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL de la API backend
VITE_API_URL=http://localhost:3000/api

# Configuración de la aplicación
VITE_APP_NAME=Sistema de Gestión de Servicios
VITE_APP_VERSION=1.0.0
```

#### Variables Disponibles

| Variable           | Descripción                      | Valor por Defecto                 |
| ------------------ | -------------------------------- | --------------------------------- |
| `VITE_API_URL`     | URL base de la API backend       | `http://localhost:3000/api`       |
| `VITE_APP_NAME`    | Nombre completo de la aplicación | `Sistema de Gestión de Servicios` |
| `VITE_APP_VERSION` | Versión de la aplicación         | `1.0.0`                           |

**Nota**: Todas las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles en el código del cliente.

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## Funcionalidades Principales

### Para Empleados

- ✅ Ver servicios disponibles
- ✅ Seleccionar servicio según prioridad
- ✅ Ver estado de selección en tiempo real
- ✅ Confirmación visual de selección
- ✅ Información detallada de servicios

### Para Administradores

- 🔄 Gestión completa de usuarios
- 🔄 Crear y editar servicios
- 🔄 Configurar horarios diarios
- 🔄 Gestionar prioridades
- 🔄 Configurar notificaciones por email
- ✅ Ver estadísticas del sistema

## Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Hook Form** para formularios
- **Axios** para peticiones HTTP
- **Lucide React** para iconos

## API Endpoints

El sistema está configurado para trabajar con los siguientes endpoints del backend:

### Autenticación

- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/me` - Obtener usuario actual

### Empleados

- `GET /api/empleados` - Lista de empleados
- `GET /api/empleados/activos` - Lista de empleados activos
- `GET /api/empleados/:id` - Obtener empleado específico
- `POST /api/empleados` - Crear empleado
- `PUT /api/empleados/:id` - Actualizar empleado
- `DELETE /api/empleados/:id` - Eliminar empleado
- `PUT /api/empleados/:id/rol` - Cambiar rol de empleado
- `PUT /api/empleados/:id/prioridad` - Cambiar prioridad de empleado
- `POST /api/empleados/reset-prioridades` - Resetear prioridades

### Servicios

- `GET /api/servicios` - Lista de servicios
- `GET /api/servicios/:id` - Obtener servicio específico
- `POST /api/servicios` - Crear servicio (solo admin)
- `POST /api/servicios/:id/dias` - Agregar día a servicio (solo admin)
- `PUT /api/admin/servicios/:id` - Actualizar servicio (solo admin)
- `DELETE /api/admin/servicios/:id` - Eliminar servicio (solo admin)

### Selecciones

- `GET /api/selecciones/disponibles` - Servicios disponibles para selección
- `POST /api/selecciones` - Crear selección
- `GET /api/selecciones/mi-seleccion` - Obtener mi selección actual
- `GET /api/selecciones/estado` - Estado de selecciones
- `PATCH /api/selecciones/intercambiar-dia` - Intercambiar días
- `POST /api/selecciones/liberar` - Liberar selección (solo admin)

### Turnos

- `GET /api/turnos` - Lista de turnos (con paginación)
- `GET /api/turnos/activos` - Turnos activos (sin paginación)
- `GET /api/turnos/:id` - Obtener turno específico
- `POST /api/turnos` - Crear turno (solo admin)
- `PUT /api/turnos/:id` - Actualizar turno (solo admin)
- `DELETE /api/turnos/:id` - Eliminar turno (solo admin)

### Administración

- `GET /api/admin/audit-log` - Log de auditoría
- `POST /api/admin/reset-anno` - Resetear año
- `POST /api/admin/clean-audit-logs` - Limpiar logs antiguos

### Sistema

- `GET /api/health` - Health check de la API

## Estructura de Datos

```typescript
// Usuario
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  priority?: number;
  isActive: boolean;
}

// Servicio
interface Service {
  id: string;
  name: string;
  description?: string;
  year: number;
  isActive: boolean;
}

// Horario de Servicio
interface ServiceSchedule {
  id: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  morningShift?: Shift;
  afternoonShift?: Shift;
  nightShift?: Shift;
}

// Turno
interface Shift {
  id: string;
  position: string; // Código de posición (ej: "CA", "P1")
  positionName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
}
```

## Próximos Pasos

1. **Gestión de Usuarios** - Panel administrativo para CRUD de usuarios
2. **Calendario de Horarios** - Vista y edición de turnos por día
3. **Configuración de Emails** - Gestión de notificaciones
4. **Sistema de Prioridades Avanzado** - Lógica de rotación automática
5. **Reportes y Estadísticas** - Dashboard avanzado para admins

## Desarrollo

### Comandos Útiles

```bash
# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run serve

# Verificar tipos TypeScript
npx tsc --noEmit
```

### Estructura de Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Cambios de estilo
- `refactor:` Refactorización de código
- `test:` Tests
- `chore:` Tareas de mantenimiento

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC.
