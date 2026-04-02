import { useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, Upload, Zap, Hand } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import StatCard from '../../Components/UI/StatCard'
import Card from '../../Components/UI/Card'
import Badge from '../../Components/UI/Badge'

// ── Mock data ────────────────────────────────────────────────
const stats = [
    { label: 'Materias inscritas', value: 6, icon: <BookOpen size={20} />, color: '#E43D12' },
    { label: 'Tareas pendientes', value: 4, icon: <ClipboardList size={20} />, color: '#EFB11D' },
    { label: 'Entregas esta semana', value: 2, icon: <Upload size={20} />, color: '#D6536D' },
]

const urgentTasks = [
    { id: 1, title: 'Proyecto final React', materia: 'Desarrollo Web', fecha: '2026-03-28', urgente: true },
    { id: 2, title: 'Reporte de laboratorio', materia: 'Física II', fecha: '2026-03-29', urgente: true },
    { id: 3, title: 'Ensayo argumentativo', materia: 'Español', fecha: '2026-04-02', urgente: false },
    { id: 4, title: 'Ejercicios de derivadas', materia: 'Cálculo', fecha: '2026-04-05', urgente: false },
]

const avisos = [
    { id: 1, titulo: 'Cambio de horario – Desarrollo Web', autor: 'Dr. Martínez', materia: 'Desarrollo Web', tiempo: 'Hace 2h' },
    { id: 2, titulo: 'Material de apoyo parcial 2', autor: 'Ing. Ramírez', materia: 'Física II', tiempo: 'Hace 5h' },
    { id: 3, titulo: 'Recordatorio: entrega próxima', autor: 'Lic. Torres', materia: 'Español', tiempo: 'Ayer' },
]
// ─────────────────────────────────────────────────────────────

function isUrgent(fecha) {
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60)
    return diff <= 48
}

export default function DashboardPage() {
    const navigate = useNavigate()

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Saludo */}
                <div>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Buen día, Alexis <Hand size={24} className="inline" /></h1>
                    <p className="text-sm text-gray-400 mt-0.5">Esto es lo que tienes pendiente hoy.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {stats.map(s => (
                        <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accentColor={s.color} />
                    ))}
                </div>

                {/* 2 columnas */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Línea de tiempo de urgencias */}
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-sm font-bold text-[#3d3d3d] uppercase tracking-wide">Próximas entregas</h2>
                        {urgentTasks.map(task => {
                            const urgent = isUrgent(task.fecha)
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => navigate(`/alumno/tareas/${task.id}`)}
                                    className={`bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 ${urgent ? 'border-[#EFB11D]' : 'border-transparent'}`}
                                >
                                    <span className="text-xl">{urgent ? <Zap size={20} /> : <ClipboardList size={20} />}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#3d3d3d] truncate">{task.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{task.materia}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-xs font-semibold ${urgent ? 'text-[#EFB11D]' : 'text-gray-400'}`}>
                                            {new Date(task.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                        </p>
                                        {urgent && <Badge variant="warning" className="mt-1">Hoy / Mañana</Badge>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Feed de avisos */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#3d3d3d] uppercase tracking-wide">Avisos recientes</h2>
                        {avisos.map(aviso => (
                            <Card key={aviso.id} className="space-y-1.5">
                                <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>{aviso.materia}</p>
                                <p className="text-sm font-semibold text-[#3d3d3d] leading-snug">{aviso.titulo}</p>
                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-xs text-gray-400">{aviso.autor}</p>
                                    <p className="text-xs text-gray-300">{aviso.tiempo}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
