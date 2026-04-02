import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "../Pages/AuthPage"
import { DashboardPage, MateriasPage, AulaVirtualPage, TareasPage, DetalleTareaPage, PerfilPage, BoletaPage } from "../Pages/Alumno"
import { DashboardMaestroPage, MisGruposPage, PanelGrupoPage, CreadorTareaPage, CentroCalificacionPage, PerfilMaestroPage, MateriasDocentePage } from "../Pages/Maestro"
import { DashboardAdminPage, UsuariosPage, EstructuraAcademicaPage, ReportesPage, PerfilAdminPage } from "../Pages/Admin"

// ── Route definitions ─────────────────────────────────────────
const routes = [
    { path: "/",    element: <AuthPage /> },
    { path: "/auth", element: <AuthPage /> },

    // Alumno
    { path: "/alumno/dashboard",    element: <DashboardPage /> },
    { path: "/alumno/materias",     element: <MateriasPage /> },
    { path: "/alumno/materias/:id", element: <AulaVirtualPage /> },
    { path: "/alumno/tareas",       element: <TareasPage /> },
    { path: "/alumno/tareas/:id",   element: <DetalleTareaPage /> },
    { path: "/alumno/perfil",       element: <PerfilPage /> },
    { path: "/alumno/boleta",       element: <BoletaPage /> },

    // Maestro
    { path: "/maestro/dashboard",                element: <DashboardMaestroPage /> },
    { path: "/maestro/grupos",                   element: <MisGruposPage /> },
    { path: "/maestro/grupos/:id",               element: <PanelGrupoPage /> },
    { path: "/maestro/grupos/:id/crear-tarea",   element: <CreadorTareaPage /> },
    { path: "/maestro/grupos/:id/calificacion",  element: <CentroCalificacionPage /> },
    { path: "/maestro/calificacion",             element: <CentroCalificacionPage /> },
    { path: "/maestro/materias",                 element: <MateriasDocentePage /> },
    { path: "/maestro/perfil",                   element: <PerfilMaestroPage /> },

    // Admin
    { path: "/admin",              element: <Navigate to="/admin/dashboard" replace /> },
    { path: "/admin/dashboard",    element: <DashboardAdminPage /> },
    { path: "/admin/usuarios",     element: <UsuariosPage /> },
    { path: "/admin/estructura",   element: <EstructuraAcademicaPage /> },
    { path: "/admin/reportes",     element: <ReportesPage /> },
    { path: "/admin/perfil",       element: <PerfilAdminPage /> },
]

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {routes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                ))}
            </Routes>
        </BrowserRouter>
    )
}