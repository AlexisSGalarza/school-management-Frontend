# School Management — Frontend

Frontend de un sistema de gestión escolar construido con **React 19**, **Vite** y **Tailwind CSS v4**. La aplicación soporta tres roles de usuario: Alumno, Maestro y Administrador, cada uno con su propio conjunto de vistas y funcionalidades.

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| React | 19 |
| React Router DOM | 7 |
| Tailwind CSS | 4 |
| Vite | 8 |
| Lucide React | latest |

---

## Estructura del proyecto

```
src/
├── Components/
│   ├── Auth/          # LoginForm, SignupForm
│   ├── Layout/        # AppShell, AdminShell, TeacherShell
│   └── UI/            # Avatar, Badge, Button, Card, FormField, ModalBase, PageHeader, StatCard, Tabs
├── Context/           # TasksContext, ToastContext
├── data/              # Mock data (usuarios, estructura académica)
├── Hooks/             # Custom hooks
├── Pages/
│   ├── Admin/         # Dashboard, Usuarios, Estructura Académica, Reportes, Perfil
│   ├── Alumno/        # Dashboard, Materias, Aula Virtual, Tareas, Boleta, Perfil
│   └── Maestro/       # Dashboard, Grupos, Panel de Grupo, Creador de Tarea, Calificaciones, Perfil
├── Routes/            # AppRoute.jsx — definición central de rutas
├── Services/          # Capa de servicios (API calls)
└── Utilis/            # Utilidades generales
```

---

## Rutas disponibles

### Autenticación
| Ruta | Descripción |
|---|---|
| `/` / `/auth` | Página de login / registro |

### Alumno
| Ruta | Descripción |
|---|---|
| `/alumno/dashboard` | Panel principal del alumno |
| `/alumno/materias` | Lista de materias |
| `/alumno/materias/:id` | Aula virtual de una materia |
| `/alumno/tareas` | Lista de tareas pendientes |
| `/alumno/tareas/:id` | Detalle de una tarea |
| `/alumno/boleta` | Boleta de calificaciones |
| `/alumno/perfil` | Perfil del alumno |

### Maestro
| Ruta | Descripción |
|---|---|
| `/maestro/dashboard` | Panel principal del maestro |
| `/maestro/grupos` | Lista de grupos |
| `/maestro/grupos/:id` | Panel de un grupo |
| `/maestro/grupos/:id/crear-tarea` | Creador de tarea |
| `/maestro/grupos/:id/calificacion` | Centro de calificación del grupo |
| `/maestro/materias` | Materias del docente |
| `/maestro/perfil` | Perfil del maestro |

### Administrador
| Ruta | Descripción |
|---|---|
| `/admin/dashboard` | Panel principal del admin |
| `/admin/usuarios` | Gestión de usuarios |
| `/admin/estructura` | Estructura académica |
| `/admin/reportes` | Reportes |
| `/admin/perfil` | Perfil del administrador |

---

## Instalación y uso

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Lint
npm run lint
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (Vite) |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build localmente |
| `npm run lint` | Ejecuta ESLint |
