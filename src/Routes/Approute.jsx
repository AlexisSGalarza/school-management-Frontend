import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "../Pages/AuthPage"
import PerfilAdminPage from "../Pages/Admin/PerfilAdminPage"
import DashboardPage from "../Pages/Alumno/DashboardPage"
import MateriasPage from "../Pages/Alumno/MateriasPage"
import AulaVirtualPage from "../Pages/Alumno/AulaVirtualPage"
import TareasPage from "../Pages/Alumno/TareasPage"
import DetalleTareaPage from "../Pages/Alumno/DetalleTareaPage"
import PerfilPage from "../Pages/Alumno/PerfilPage"
import BoletaPage from "../Pages/Alumno/BoletaPage"
import DashboardMaestroPage from "../Pages/Maestro/DashboardMaestroPage"
import MisGruposPage from "../Pages/Maestro/MisGruposPage"
import PanelGrupoPage from "../Pages/Maestro/PanelGrupoPage"
import CreadorTareaPage from "../Pages/Maestro/CreadorTareaPage"
import CentroCalificacionPage from "../Pages/Maestro/CentroCalificacionPage"
import PerfilMaestroPage from "../Pages/Maestro/PerfilMaestroPage"
import MateriasDocentePage from "../Pages/Maestro/MateriasDocentePage"
import DashboardAdminPage from "../Pages/Admin/DashboardAdminPage"
import UsuariosPage from "../Pages/Admin/UsuariosPage"
import EstructuraAcademicaPage from "../Pages/Admin/EstructuraAcademicaPage"
import ReportesPage from "../Pages/Admin/ReportesPage"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Rutas del módulo Alumno */}
                <Route path="/alumno/dashboard" element={<DashboardPage />} />
                <Route path="/alumno/materias" element={<MateriasPage />} />
                <Route path="/alumno/materias/:id" element={<AulaVirtualPage />} />
                <Route path="/alumno/tareas" element={<TareasPage />} />
                <Route path="/alumno/tareas/:id" element={<DetalleTareaPage />} />
                <Route path="/alumno/perfil" element={<PerfilPage />} />
                <Route path="/alumno/boleta" element={<BoletaPage />} />

                {/* Rutas del módulo Maestro */}
                <Route path="/maestro/dashboard" element={<DashboardMaestroPage />} />
                <Route path="/maestro/grupos" element={<MisGruposPage />} />
                <Route path="/maestro/grupos/:id" element={<PanelGrupoPage />} />
                <Route path="/maestro/grupos/:id/crear-tarea" element={<CreadorTareaPage />} />
                <Route path="/maestro/grupos/:id/calificacion" element={<CentroCalificacionPage />} />
                <Route path="/maestro/calificacion" element={<CentroCalificacionPage />} />
                <Route path="/maestro/materias" element={<MateriasDocentePage />} />
                <Route path="/maestro/perfil" element={<PerfilMaestroPage />} />

                {/* Rutas del módulo Admin */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
                <Route path="/admin/usuarios" element={<UsuariosPage />} />
                <Route path="/admin/estructura" element={<EstructuraAcademicaPage />} />
                <Route path="/admin/reportes" element={<ReportesPage />} />
                <Route path="/admin/perfil" element={<PerfilAdminPage />} />
            </Routes>
        </BrowserRouter>
    )
}