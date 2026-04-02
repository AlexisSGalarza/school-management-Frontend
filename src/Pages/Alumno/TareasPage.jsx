import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle, XCircle, Zap, PartyPopper } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import Tabs from '../../Components/UI/Tabs'
import Badge from '../../Components/UI/Badge'

// ── Mock data ────────────────────────────────────────────────
const tareas = [
    { id: 1, titulo: 'Proyecto final React', materia: 'Desarrollo Web', fechaLimite: '2026-03-28', estado: 'pendiente', calificacion: null },
    { id: 2, titulo: 'Reporte de laboratorio', materia: 'Física II', fechaLimite: '2026-03-29', estado: 'pendiente', calificacion: null },
    { id: 3, titulo: 'Ensayo argumentativo', materia: 'Español', fechaLimite: '2026-04-02', estado: 'pendiente', calificacion: null },
    { id: 4, titulo: 'Ejercicio de rutas', materia: 'Desarrollo Web', fechaLimite: '2026-03-20', estado: 'entregada', calificacion: 92 },
    { id: 5, titulo: 'Integral de partes', materia: 'Cálculo Integral', fechaLimite: '2026-03-18', estado: 'entregada', calificacion: null },
    { id: 6, titulo: 'Diagrama ER', materia: 'Base de Datos', fechaLimite: '2026-03-15', estado: 'vencida', calificacion: null },
    { id: 7, titulo: 'Mapa conceptual OOP', materia: 'Programación OOP', fechaLimite: '2026-03-10', estado: 'vencida', calificacion: null },
]

const materias = ['Todas', 'Desarrollo Web', 'Física II', 'Cálculo Integral', 'Español', 'Programación OOP', 'Base de Datos']

const TABS = [
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'entregada', label: 'Entregadas' },
    { key: 'vencida', label: 'Vencidas' },
]
// ─────────────────────────────────────────────────────────────

function isUrgent(fecha) {
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60)
    return diff > 0 && diff <= 48
}

export default function TareasPage() {
    const [tab, setTab] = useState('pendiente')
    const [filtroMateria, setFiltroMateria] = useState('Todas')
    const navigate = useNavigate()

    const filtered = tareas.filter(t => {
        const matchesTab = t.estado === tab
        const matchesMateria = filtroMateria === 'Todas' || t.materia === filtroMateria
        return matchesTab && matchesMateria
    })

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Centro de Tareas</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Gestiona todas tus actividades</p>
                    </div>

                    {/* Filtro por materia */}
                    <select
                        value={filtroMateria}
                        onChange={e => setFiltroMateria(e.target.value)}
                        className="text-sm bg-white border-2 border-gray-100 rounded-xl px-4 py-2 outline-none focus:border-[#FFA2B6] transition-colors cursor-pointer"
                    >
                        {materias.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Card con tabs */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-4">
                        <Tabs tabs={TABS} active={tab} onChange={setTab} />
                    </div>

                    <div className="p-5 space-y-3">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-3"><PartyPopper size={40} className="mx-auto text-gray-300" /></p>
                                <p className="text-sm text-gray-400">No hay tareas en esta categoría</p>
                            </div>
                        ) : (
                            filtered.map(tarea => (
                                <TareaCard key={tarea.id} tarea={tarea} onClick={() => navigate(`/alumno/tareas/${tarea.id}`)} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    )
}

function TareaCard({ tarea, onClick }) {
    const urgent = isUrgent(tarea.fechaLimite)
    const vencida = tarea.estado === 'vencida'
    const entregada = tarea.estado === 'entregada'

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${vencida
                    ? 'border-gray-100 opacity-60 bg-gray-50'
                    : 'border-transparent bg-[#EBE9E1] hover:border-[#FFA2B6]'
                }`}
        >
            <span className="text-2xl flex-shrink-0">
                {vencida ? <XCircle size={24} /> : entregada ? <CheckCircle size={24} /> : urgent ? <Zap size={24} /> : <ClipboardList size={24} />}
            </span>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${vencida ? 'text-gray-400 line-through' : 'text-[#3d3d3d]'}`}>
                    {tarea.titulo}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{tarea.materia}</p>
            </div>

            <div className="text-right flex-shrink-0 space-y-1">
                <p className={`text-xs font-semibold ${vencida ? 'text-[#E43D12]' : urgent ? 'text-[#EFB11D]' : 'text-gray-400'
                    }`}>
                    {new Date(tarea.fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                {entregada && (
                    tarea.calificacion !== null
                        ? <Badge variant="secondary">{tarea.calificacion}/100</Badge>
                        : <Badge variant="secondary">Entregada</Badge>
                )}
                {vencida && <Badge variant="primary">Sin entrega</Badge>}
                {!entregada && !vencida && urgent && <Badge variant="warning">¡Urgente!</Badge>}
            </div>
        </div>
    )
}
