import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthPage from "../Pages/AuthPage"
import DashboardPage from "../Pages/Alumno/DashboardPage"
import MateriasPage from "../Pages/Alumno/MateriasPage"
import AulaVirtualPage from "../Pages/Alumno/AulaVirtualPage"
import TareasPage from "../Pages/Alumno/TareasPage"
import DetalleTareaPage from "../Pages/Alumno/DetalleTareaPage"
import PerfilPage from "../Pages/Alumno/PerfilPage"

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
            </Routes>
        </BrowserRouter>
    )
}