import { useState, useEffect } from 'react'
import { GraduationCap, UsersRound, BookOpen, School, Plus, BarChart3, User, Calendar, UserPlus } from 'lucide-react'
import AdminShell from '../../Components/Layout/AdminShell'
import { usersService } from '../../Services/usersService'
import { gruposService } from '../../Services/gruposService'
import { materiasService } from '../../Services/materiasService'
import { ciclosService } from '../../Services/ciclosService'
import { inscripcionesService } from '../../Services/inscripcionesService'
import { useNavigate } from 'react-router-dom'

const acciones = [
    { label: 'Registrar Usuario', icon: <Plus size={18} />, to: '/admin/usuarios', color: 'var(--color-primary)' },
    { label: 'Crear Grupo', icon: <School size={18} />, to: '/admin/estructura', color: 'var(--color-secondary)' },
    { label: 'Generar Reporte', icon: <BarChart3 size={18} />, to: '/admin/reportes', color: '#EFB11D' },
]

function tiempoRelativo(iso) {
    if (!iso) return ''
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'Hace un momento'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function DashboardAdminPage() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [grupos, setGrupos] = useState([])
    const [materias, setMaterias] = useState([])
    const [cicloActivo, setCicloActivo] = useState({ nombre: '—' })
    const [inscripciones, setInscripciones] = useState([])
    const [actividad, setActividad] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [u, g, m, c, ins] = await Promise.all([
                    usersService.getAll(),
                    gruposService.getAll(),
                    materiasService.getAll(),
                    ciclosService.getAll(),
                    inscripcionesService.getAll(),
                ])
                const userList = Array.isArray(u) ? u : u.results ?? []
                const grupoList = Array.isArray(g) ? g : g.results ?? []
                const materiaList = Array.isArray(m) ? m : m.results ?? []
                const cicloList = Array.isArray(c) ? c : c.results ?? []
                const insList = Array.isArray(ins) ? ins : ins.results ?? []

                setUsers(userList)
                setGrupos(grupoList)
                setMaterias(materiaList)
                setInscripciones(insList)

                const activo = cicloList.find(x => x.activo) ?? cicloList[0] ?? { nombre: '—' }
                setCicloActivo(activo)

                // Construir actividad reciente desde datos reales
                const items = []

                // Usuarios recientes
                ;[...userList]
                    .filter(u => u.created_at)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5)
                    .forEach(u => {
                        const rolLabel = u.rol === 'alumno' || u.rol === 'Alumno' ? 'alumno/a' :
                                         u.rol === 'docente' || u.rol === 'Docente' ? 'docente' : 'administrador/a'
                        items.push({
                            id: `user-${u.id}`,
                            icon: <UserPlus size={16} />,
                            texto: `Nuevo ${rolLabel} registrado: ${u.nombre || u.email}${u.matricula ? ` (${u.matricula})` : ''}`,
                            tipo: 'success',
                            tiempo: tiempoRelativo(u.created_at),
                            date: new Date(u.created_at),
                        })
                    })

                // Inscripciones recientes
                ;[...insList]
                    .filter(i => i.fecha_inscripcion)
                    .sort((a, b) => new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion))
                    .slice(0, 3)
                    .forEach(i => {
                        items.push({
                            id: `ins-${i.id}`,
                            icon: <GraduationCap size={16} />,
                            texto: `${i.alumno_nombre || 'Alumno'} inscrito en grupo — ${i.materia_nombre || 'Materia'}`,
                            tipo: 'success',
                            tiempo: tiempoRelativo(i.fecha_inscripcion),
                            date: new Date(i.fecha_inscripcion),
                        })
                    })

                // Ciclo activo marcado
                if (activo && activo.id) {
                    items.push({
                        id: `ciclo-${activo.id}`,
                        icon: <Calendar size={16} />,
                        texto: `Ciclo "${activo.nombre}" marcado como activo`,
                        tipo: 'info',
                        tiempo: '',
                        date: new Date(0),
                    })
                }

                // Ordenar por fecha descendente
                items.sort((a, b) => b.date - a.date)
                setActividad(items.slice(0, 8))
            } catch (err) {
                console.error('Error cargando dashboard:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const cicloId = cicloActivo?.id
    const materiasDelCiclo = materias.filter(m => m.ciclo === cicloId)
    const gruposDelCiclo = grupos.filter(g => g.cicloId === cicloId || g.ciclo === cicloId)
    const totalInscritos = gruposDelCiclo.reduce((a, g) => a + (g.alumnos?.length ?? 0), 0)

    const stats = [
        {
            label: 'Alumnos Activos',
            value: String(users.filter(u => (u.rol === 'Alumno' || u.rol === 'alumno') && u.activo).length),
            icon: <GraduationCap size={20} />,
            iconBg: '#FFA2B618',
            change: `${users.filter(u => (u.rol === 'Alumno' || u.rol === 'alumno')).length} totales`,
            up: true,
        },
        {
            label: 'Docentes Activos',
            value: String(users.filter(u => (u.rol === 'Docente' || u.rol === 'docente') && u.activo).length),
            icon: <UsersRound size={20} />,
            iconBg: '#D6536D18',
            change: `${users.filter(u => (u.rol === 'Docente' || u.rol === 'docente')).length} totales`,
            up: null,
        },
        {
            label: 'Materias en Curso',
            value: String(materiasDelCiclo.length),
            icon: <BookOpen size={20} />,
            iconBg: '#E43D1218',
            change: cicloActivo.nombre,
            up: null,
        },
        {
            label: 'Grupos Activos',
            value: String(gruposDelCiclo.length),
            icon: <School size={20} />,
            iconBg: '#EFB11D18',
            change: `${totalInscritos} alumnos inscritos`,
            up: true,
        },
    ]

    return (
        <AdminShell>
            <div className="space-y-6 max-w-5xl mx-auto">

                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Panel Administrativo</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{cicloActivo.nombre} · Vista general del sistema</p>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-4 shadow-sm space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-500">{s.label}</p>
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: s.iconBg }}
                                >
                                    {s.icon}
                                </div>
                            </div>
                            <p className="text-3xl font-black text-[#3d3d3d]">{s.value}</p>
                            <p className={`text-xs font-medium ${s.up === true ? 'text-emerald-500' : 'text-gray-400'}`}>
                                {s.up === true && '↑ '}{s.change}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-4">

                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <p className="text-sm font-bold text-[#3d3d3d] mb-4">Acciones Rápidas</p>
                        <div className="space-y-2">
                            {acciones.map(a => (
                                <button
                                    key={a.label}
                                    onClick={() => navigate(a.to)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    style={{ background: a.color }}
                                >
                                    <span className="text-base">{a.icon}</span>
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Distribución de usuarios */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <p className="text-sm font-bold text-[#3d3d3d] mb-4">Distribución de Usuarios</p>
                        <RolBar rol="Alumnos" count={users.filter(u => u.rol === 'Alumno' || u.rol === 'alumno').length} total={users.length} color="#FFA2B6" />
                        <RolBar rol="Docentes" count={users.filter(u => u.rol === 'Docente' || u.rol === 'docente').length} total={users.length} color="#D6536D" />
                        <RolBar rol="Admins" count={users.filter(u => u.rol === 'Admin' || u.rol === 'admin').length} total={users.length} color="#E43D12" />
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                            <span>Total usuarios</span>
                            <span className="font-bold text-[#3d3d3d]">{users.length}</span>
                        </div>
                    </div>

                    {/* Estado del servidor */}
                    <ServerStatus />
                </div>

                {/* Grupos activos */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-[#3d3d3d] mb-4">Grupos del Ciclo Activo</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-left border-b border-gray-100">
                                    <th className="pb-2 pr-4">Grupo</th>
                                    <th className="pb-2 pr-4">Materia</th>
                                    <th className="pb-2 pr-4">Docente</th>
                                    <th className="pb-2">Alumnos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {gruposDelCiclo.map(g => (
                                    <tr key={g.id}>
                                        <td className="py-2.5 pr-4">
                                            <span className="font-bold text-[#3d3d3d]">{g.clave || g.nombre}</span>
                                        </td>
                                        <td className="py-2.5 pr-4 text-gray-500 max-w-[180px] truncate">{g.materia_nombre || g.materia}</td>
                                        <td className="py-2.5 pr-4 text-gray-500 hidden sm:table-cell">{g.docente_nombre || g.docente}</td>
                                        <td className="py-2.5">
                                            <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                                                {g.alumnos?.length ?? 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Actividad reciente */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="text-sm font-bold text-[#3d3d3d] mb-4">Actividad Reciente</p>
                    <div className="space-y-1">
                        {actividad.length === 0 && !loading && (
                            <p className="text-sm text-gray-400 py-4 text-center">No hay actividad reciente</p>
                        )}
                        {actividad.map((a, idx) => (
                            <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: idx === 0 ? '#E43D1210' : '#EBE9E1' }}>
                                    {a.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#3d3d3d] leading-snug">{a.texto}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{a.tiempo}</p>
                                </div>
                                {idx === 0 && (
                                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#E43D1215', color: 'var(--color-primary)' }}>Nuevo</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AdminShell>
    )
}

function RolBar({ rol, count, total, color }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#3d3d3d]">{rol}</span>
                <span className="text-gray-400">{count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

function ServerStatus() {
    const [online, setOnline] = useState(true)
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-[#3d3d3d]">Estado del Servidor</p>
                <button
                    onClick={() => setOnline(s => !s)}
                    className="text-xs px-3 py-1 rounded-full font-semibold transition-colors"
                    style={{
                        background: online ? '#dcfce7' : '#fee2e2',
                        color: online ? '#16a34a' : '#dc2626',
                    }}
                >
                    {online ? 'Simular caída' : 'Restaurar'}
                </button>
            </div>
            <div className="space-y-3">
                <StatusRow label="API Principal" ok={online} />
                <StatusRow label="Base de Datos" ok={online} />
                <StatusRow label="Almacenamiento" ok={true} />
                <StatusRow label="Correo (SMTP)" ok={true} />
            </div>
        </div>
    )
}

function StatusRow({ label, ok }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-xs font-semibold ${ok ? 'text-emerald-600' : 'text-red-600'}`}>
                    {ok ? 'Operativo' : 'Caído'}
                </span>
            </div>
        </div>
    )
}
