import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../Context/AuthContext"
import AuthPage from "../Pages/AuthPage"
import { DashboardPage, MateriasPage, AulaVirtualPage, TareasPage, DetalleTareaPage, PerfilPage, BoletaPage } from "../Pages/Alumno"
import { DashboardMaestroPage, MisGruposPage, PanelGrupoPage, CreadorTareaPage, CentroCalificacionPage, PerfilMaestroPage, MateriasDocentePage } from "../Pages/Maestro"
import { DashboardAdminPage, UsuariosPage, EstructuraAcademicaPage, ReportesPage, PerfilAdminPage, MonitoreoPage } from "../Pages/Admin"

function PrivateRoute({ children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/auth" replace />
    return children
}

// ── Route definitions ─────────────────────────────────────────
const routes = [
    { path: "/", element: <AuthPage />, private: false },
    { path: "/auth", element: <AuthPage />, private: false },

    // Alumno
    { path: "/alumno/dashboard", element: <DashboardPage />, private: true, role: "alumno" },
    { path: "/alumno/materias", element: <MateriasPage />, private: true, role: "alumno" },
    { path: "/alumno/materias/:id", element: <AulaVirtualPage />, private: true, role: "alumno" },
    { path: "/alumno/tareas", element: <TareasPage />, private: true, role: "alumno" },
    { path: "/alumno/tareas/:id", element: <DetalleTareaPage />, private: true, role: "alumno" },
    { path: "/alumno/perfil", element: <PerfilPage />, private: true, role: "alumno" },
    { path: "/alumno/boleta", element: <BoletaPage />, private: true, role: "alumno" },

    // Maestro
    { path: "/maestro/dashboard", element: <DashboardMaestroPage />, private: true, role: "docente" },
    { path: "/maestro/grupos", element: <MisGruposPage />, private: true, role: "docente" },
    { path: "/maestro/grupos/:id", element: <PanelGrupoPage />, private: true, role: "docente" },
    { path: "/maestro/grupos/:id/crear-tarea", element: <CreadorTareaPage />, private: true, role: "docente" },
    { path: "/maestro/grupos/:id/calificacion", element: <CentroCalificacionPage />, private: true, role: "docente" },
    { path: "/maestro/calificacion", element: <CentroCalificacionPage />, private: true, role: "docente" },
    { path: "/maestro/materias", element: <MateriasDocentePage />, private: true, role: "docente" },
    { path: "/maestro/perfil", element: <PerfilMaestroPage />, private: true, role: "docente" },

    // Admin
    { path: "/admin", element: <Navigate to="/admin/dashboard" replace />, private: true, role: "admin" },
    { path: "/admin/dashboard", element: <DashboardAdminPage />, private: true, role: "admin" },
    { path: "/admin/usuarios", element: <UsuariosPage />, private: true, role: "admin" },
    { path: "/admin/estructura", element: <EstructuraAcademicaPage />, private: true, role: "admin" },
    { path: "/admin/reportes", element: <ReportesPage />, private: true, role: "admin" },
    { path: "/admin/monitoreo", element: <MonitoreoPage />, private: true, role: "admin" },
    { path: "/admin/perfil", element: <PerfilAdminPage />, private: true, role: "admin" },
]

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {routes.map(({ path, element, private: isPrivate, role }) => (
                    <Route
                        key={path}
                        path={path}
                        element={isPrivate ? <PrivateRoute role={role}>{element}</PrivateRoute> : element}
                    />
                ))}
            </Routes>
        </BrowserRouter>
    )
}