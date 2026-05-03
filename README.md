# Sistema de Gestión Escolar — Frontend

Frontend en **React 19 + Vite + Tailwind v4** para el sistema de gestión escolar. Soporta tres roles (Alumno, Maestro, Administrador) con shells y vistas dedicadas, e incluye un dashboard de monitoreo del sistema distribuido (PIA).

---

## Cómo correrlo

Requiere Node 18+.

```bash
git clone <url-del-repo>
cd school-management-Frontend

# 1. Instalar dependencias
npm install

# 2. Configurar la URL del backend (crea un .env en la raíz)
echo 'VITE_API_URL=http://localhost:8000/' > .env

# 3. Servidor de desarrollo
npm run dev
```

La app queda en `http://localhost:5173/`.

> Si corres el backend en modo distribuido (`docker compose up`), apunta `VITE_API_URL` a `http://localhost:8080/`.

### Build y preview de producción

```bash
npm run build
npm run preview
```

---

## Variables de entorno

| Variable | Default | Notas |
|---|---|---|
| `VITE_API_URL` | — | URL base del backend (con `/` final). Ej. `http://localhost:8000/` |

---

## Tecnologías

| Herramienta | Versión |
|---|---|
| React | 19 |
| React Router DOM | 7 |
| Tailwind CSS | 4 |
| Vite | 8 |
| Axios | 1.x |
| Lucide React | latest |

---

## Estructura del proyecto

```
src/
├── Components/
│   ├── Auth/          # LoginForm, SignupForm
│   ├── Layout/        # AppShell (alumno), AdminShell, TeacherShell
│   └── UI/            # Avatar, Badge, Button, Card, FormField, ModalBase, PageHeader, StatCard, Tabs
├── Context/           # AuthContext, TasksContext, ToastContext
├── data/              # Mock data
├── Hooks/
├── Pages/
│   ├── Admin/         # Dashboard, Usuarios, Estructura, Reportes, Monitoreo, Perfil
│   ├── Alumno/        # Dashboard, Materias, Aula virtual, Tareas, Detalle tarea, Boleta, Perfil
│   └── Maestro/       # Dashboard, Mis grupos, Panel grupo, Creador tarea, Centro calificación, Materias, Perfil
├── Routes/
│   └── Approute.jsx   # Definición central de rutas + guards por rol
├── Services/          # api.js + un service por recurso (gruposService, entregasService, systemService, etc.)
├── Utilis/
├── App.jsx
├── main.jsx
└── index.css          # Variables CSS globales (paleta de colores)
```

---

## Paleta de colores

Definida como variables CSS en `src/index.css`:

| Variable | Hex | Uso |
|---|---|---|
| `--color-primary` | `#E43D12` | Botones principales, CTA |
| `--color-secondary` | `#D6536D` | Badges, etiquetas |
| `--color-accent` | `#FFA2B6` | Hover, fondos destacados |
| `--color-warning` | `#EFB11D` | Alertas, vencimientos |
| `--color-background` | `#EBE9E1` | Fondo general |

---

## Rutas

### Públicas
| Ruta | Descripción |
|---|---|
| `/`, `/auth` | Login / registro |

### Alumno
| Ruta | Descripción |
|---|---|
| `/alumno/dashboard` | Panel principal |
| `/alumno/materias` | Lista de materias + **inscripción por código** |
| `/alumno/materias/:id` | Aula virtual (Canal, Tareas, Materiales) |
| `/alumno/tareas` | Tareas pendientes |
| `/alumno/tareas/:id` | Detalle + entrega (archivo o URL de video) |
| `/alumno/boleta` | Boleta de calificaciones |
| `/alumno/perfil` | Perfil |

### Maestro
| Ruta | Descripción |
|---|---|
| `/maestro/dashboard` | Panel principal |
| `/maestro/grupos` | Mis grupos |
| `/maestro/grupos/:id` | Panel del grupo (canal, tareas, **materiales CRUD**, alumnos) |
| `/maestro/grupos/:id/crear-tarea` | Creador de tarea |
| `/maestro/grupos/:id/calificacion` | Centro de calificación |
| `/maestro/materias` | Materias del docente |
| `/maestro/perfil` | Perfil |

### Administrador
| Ruta | Descripción |
|---|---|
| `/admin/dashboard` | Panel principal |
| `/admin/usuarios` | Gestión de usuarios |
| `/admin/estructura` | Estructura académica (ciclos, materias, grupos) |
| `/admin/reportes` | Reportes |
| `/admin/monitoreo` | **Monitoreo del sistema distribuido (PIA)** |
| `/admin/perfil` | Perfil |

---

## Dashboard de monitoreo (PIA)

`/admin/monitoreo` muestra en vivo (auto-refresh cada 5s):

- **Estado general**: salud del sistema, conexión DB, cache, instancia que respondió, uptime
- **CPU**: porcentaje global + barras por core, load average 1/5/15 min
- **RAM**: usado/total, disponible
- **Disco**: usado/total, libre
- **Proceso Django**: PID, threads, memoria, workers configurados
- **Latencias**: avg, p50, p95, p99 sobre las últimas 1000 muestras
- **Status HTTP**: conteo por código (verde 2xx, ámbar 4xx, rojo 5xx)
- **Top rutas**: más activas con peticiones, errores, latencia avg/max
- **Circuit breakers**: estado (closed/open/half_open) y fallos consecutivos por servicio externo

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |
