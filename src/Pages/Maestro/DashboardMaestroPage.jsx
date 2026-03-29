import { useNavigate } from 'react-router-dom'
import TeacherShell from '../../Components/Layout/TeacherShell'
import StatCard from '../../Components/UI/StatCard'
import Card from '../../Components/UI/Card'
import Badge from '../../Components/UI/Badge'

const stats = [
    { label: 'Grupos activos', value: 4, icon: '👨‍🏫', color: '#E43D12' },
    { label: 'Entregas sin calificar', value: 45, icon: '📝', color: '#EFB11D' },
    { label: 'Alumnos totales', value: 112, icon: '👥', color: '#D6536D' },
]

const pendientesPorGrupo = [
    { id: 1, grupo: '101', materia: 'Desarrollo Web', pendientes: 18, vencidas: 3 },
    { id: 2, grupo: '202', materia: 'Física II', pendientes: 12, vencidas: 0 },
    { id: 3, grupo: '301', materia: 'Cálculo', pendientes: 15, vencidas: 5 },
]

const actividad = [
    { id: 1, alumno: 'María López', accion: 'comentó en el canal', materia: 'Desarrollo Web', tiempo: 'Hace 10 min' },
    { id: 2, alumno: 'Juan Pérez', accion: 'entregó una tarea', materia: 'Física II', tiempo: 'Hace 34 min' },
    { id: 3, alumno: 'Ana García', accion: 'comentó en el canal', materia: 'Cálculo', tiempo: 'Hace 1h' },
    { id: 4, alumno: 'Carlos Ruiz', accion: 'resubió una tarea', materia: 'Desarrollo Web', tiempo: 'Hace 2h' },
]

export default function DashboardMaestroPage() {
    const navigate = useNavigate()

    return (
        <TeacherShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Saludo */}
                <div>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Buen día, Dr. Martínez 👋</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Tienes entregas pendientes de calificar.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {stats.map(s => (
                        <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accentColor={s.color} />
                    ))}
                </div>

                {/* Accesos rápidos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Crear Nuevo Grupo', icon: '➕', to: '/maestro/grupos' },
                        { label: 'Ir a Calificación', icon: '✏️', to: '/maestro/calificacion' },
                        { label: 'Mis Grupos', icon: '👨‍🏫', to: '/maestro/grupos' },
                    ].map(a => (
                        <button
                            key={a.label}
                            onClick={() => navigate(a.to)}
                            className="flex items-center gap-3 bg-white rounded-2xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-left w-full"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                            >
                                {a.icon}
                            </div>
                            <span className="text-sm font-semibold text-[#3d3d3d]">{a.label}</span>
                        </button>
                    ))}
                </div>

                {/* 2 columnas */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Entregas pendientes por grupo */}
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-sm font-bold text-[#3d3d3d] uppercase tracking-wide">Entregas pendientes por grupo</h2>
                        {pendientesPorGrupo.map(g => (
                            <div
                                key={g.id}
                                onClick={() => navigate(`/maestro/grupos/${g.id}/calificacion`)}
                                className={`bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 border-l-4 ${g.vencidas > 0 ? 'border-[#EFB11D]' : 'border-transparent'}`}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                >
                                    {g.grupo}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#3d3d3d] truncate">{g.materia}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Grupo {g.grupo}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-sm font-bold text-[#3d3d3d]">{g.pendientes}</span>
                                    <span className="text-xs text-gray-400">sin calificar</span>
                                    {g.vencidas > 0 && (
                                        <Badge variant="warning">{g.vencidas} vencidas</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actividad reciente */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-[#3d3d3d] uppercase tracking-wide">Actividad reciente</h2>
                        <Card className="p-0 overflow-hidden">
                            <div className="divide-y divide-gray-50">
                                {actividad.map(a => (
                                    <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                        >
                                            {a.alumno[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-[#3d3d3d]">
                                                <span className="font-semibold">{a.alumno}</span>{' '}
                                                <span className="text-gray-500">{a.accion}</span>
                                            </p>
                                            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-secondary)' }}>{a.materia}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{a.tiempo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </TeacherShell>
    )
}
