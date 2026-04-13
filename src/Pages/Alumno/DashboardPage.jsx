import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, Upload, Zap, Hand } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import StatCard from '../../Components/UI/StatCard'
import Card from '../../Components/UI/Card'
import Badge from '../../Components/UI/Badge'
import { gruposService } from '../../Services/gruposService'
import { tareasService } from '../../Services/tareasService'
import { publicacionesService } from '../../Services/publicacionesService'
import { useAuth } from '../../Context/AuthContext'

function isUrgent(fecha) {
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60)
    return diff <= 48
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [stats, setStats] = useState([])
    const [urgentTasks, setUrgentTasks] = useState([])
    const [avisos, setAvisos] = useState([])
    const [loading, setLoading] = useState(true)
    const nombre = user?.nombre ?? user?.first_name ?? 'Alumno'

    useEffect(() => {
        async function fetchData() {
            try {
                const [gruposData, tareasData, pubsData] = await Promise.all([
                    gruposService.getAll(),
                    tareasService.getAll(),
                    publicacionesService.getAll(),
                ])
                const grupos = Array.isArray(gruposData) ? gruposData : gruposData.results ?? []
                const tareas = Array.isArray(tareasData) ? tareasData : tareasData.results ?? []
                const pubs = Array.isArray(pubsData) ? pubsData : pubsData.results ?? []

                const misGrupos = grupos.filter(g => (g.alumnos ?? []).includes(user?.id))
                const misGrupoIds = misGrupos.map(g => g.id)
                const misTareas = tareas.filter(t => misGrupoIds.includes(t.grupo))
                const pendientes = misTareas.filter(t => t.estado === 'pendiente' || !t.estado)

                setStats([
                    { label: 'Materias inscritas', value: misGrupos.length, icon: <BookOpen size={20} />, color: '#E43D12' },
                    { label: 'Tareas pendientes', value: pendientes.length, icon: <ClipboardList size={20} />, color: '#EFB11D' },
                    { label: 'Total de tareas', value: misTareas.length, icon: <Upload size={20} />, color: '#D6536D' },
                ])

                setUrgentTasks(
                    misTareas
                        .filter(t => t.fechaLimite ?? t.fecha_limite)
                        .sort((a, b) => new Date(a.fechaLimite ?? a.fecha_limite) - new Date(b.fechaLimite ?? b.fecha_limite))
                        .slice(0, 5)
                        .map(t => ({
                            id: t.id,
                            title: t.titulo,
                            materia: t.materia_nombre ?? t.materia ?? '—',
                            fecha: t.fechaLimite ?? t.fecha_limite,
                        }))
                )

                setAvisos(
                    pubs
                        .filter(p => misGrupoIds.includes(p.grupo))
                        .slice(0, 5)
                        .map(p => ({
                            id: p.id,
                            titulo: p.titulo ?? p.texto?.slice(0, 50),
                            autor: p.autor_nombre ?? p.autor ?? '—',
                            materia: p.materia_nombre ?? '—',
                            tiempo: p.fecha ?? p.created_at ?? '',
                        }))
                )
            } catch (err) {
                console.error('Error cargando dashboard alumno:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    return (
        <AppShell>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 text-sm">Cargando…</p>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Saludo */}
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Buen día, {nombre} <Hand size={24} className="inline" /></h1>
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
            )}
        </AppShell>
    )
}
