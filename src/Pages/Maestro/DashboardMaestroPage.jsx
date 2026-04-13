import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCheck, FileEdit, UsersRound, Plus, Pencil, Hand } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import StatCard from '../../Components/UI/StatCard'
import Card from '../../Components/UI/Card'
import Badge from '../../Components/UI/Badge'
import { useAuth } from '../../Context/AuthContext'
import { gruposService } from '../../Services/gruposService'
import { entregasService } from '../../Services/entregasService'
import { inscripcionesService } from '../../Services/inscripcionesService'

export default function DashboardMaestroPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [stats, setStats] = useState([])
    const [pendientesPorGrupo, setPendientesPorGrupo] = useState([])
    const [actividad, setActividad] = useState([])
    const [loading, setLoading] = useState(true)

    const nombre = user?.nombre ?? user?.first_name ?? 'Docente'

    useEffect(() => {
        async function load() {
            try {
                const [grupos, entregas, inscripciones] = await Promise.all([
                    gruposService.getAll(),
                    entregasService.getAll(),
                    inscripcionesService.getAll(),
                ])
                const gruposList = Array.isArray(grupos) ? grupos : grupos.results ?? []
                const entregasList = Array.isArray(entregas) ? entregas : entregas.results ?? []
                const inscList = Array.isArray(inscripciones) ? inscripciones : inscripciones.results ?? []

                const misGrupos = gruposList.filter(g => g.docente === user?.id)
                const misGrupoIds = new Set(misGrupos.map(g => g.id))
                const sinCalificar = entregasList.filter(e => e.calificacion == null && misGrupoIds.has(e.grupo))
                const alumnosUnicos = new Set(inscList.filter(i => misGrupoIds.has(i.grupo)).map(i => i.alumno))

                setStats([
                    { label: 'Grupos activos', value: misGrupos.length, icon: <UserCheck size={20} />, color: '#E43D12' },
                    { label: 'Entregas sin calificar', value: sinCalificar.length, icon: <FileEdit size={20} />, color: '#EFB11D' },
                    { label: 'Alumnos totales', value: alumnosUnicos.size, icon: <UsersRound size={20} />, color: '#D6536D' },
                ])

                const pendientes = misGrupos.map(g => {
                    const p = entregasList.filter(e => e.grupo === g.id && e.calificacion == null)
                    return {
                        id: g.id,
                        grupo: g.clave ?? g.nombre ?? '',
                        materia: g.materia_nombre ?? g.nombre ?? '',
                        pendientes: p.length,
                        vencidas: 0,
                    }
                }).filter(g => g.pendientes > 0)
                setPendientesPorGrupo(pendientes)

                const recientes = entregasList
                    .filter(e => misGrupoIds.has(e.grupo))
                    .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
                    .slice(0, 5)
                    .map(e => ({
                        id: e.id,
                        alumno: e.alumno_nombre ?? `Alumno ${e.alumno}`,
                        accion: 'entregó una tarea',
                        materia: e.materia_nombre ?? '',
                        tiempo: e.created_at ? new Date(e.created_at).toLocaleString('es-MX') : '',
                    }))
                setActividad(recientes)
            } catch { /* ignore */ }
            setLoading(false)
        }
        load()
    }, [user])

    return (
        <TeacherShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Saludo */}
                <div>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Buen día, {nombre} <Hand size={24} className="inline" /></h1>
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
                        { label: 'Crear Nuevo Grupo', icon: <Plus size={20} />, to: '/maestro/grupos' },
                        { label: 'Ir a Calificación', icon: <Pencil size={20} />, to: '/maestro/calificacion' },
                        { label: 'Mis Grupos', icon: <UserCheck size={20} />, to: '/maestro/grupos' },
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
