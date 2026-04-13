import { useState, useMemo, useEffect } from 'react'
import { User, Users, BookOpen, AlertTriangle, ClipboardList, BarChart3, FileText, FileSpreadsheet, FileIcon, CheckCircle, Clock, Download } from 'lucide-react'
import AdminShell from '../../Components/Layout/AdminShell'
import PageHeader from '../../Components/UI/PageHeader'
import FormField from '../../Components/UI/FormField'
import { useTasks } from '../../Context/TasksContext'
import { ciclosService } from '../../Services/ciclosService'
import { gruposService } from '../../Services/gruposService'
import { materiasService } from '../../Services/materiasService'
import { usersService } from '../../Services/usersService'

const TIPOS = [
    { value: 'promedio_alumno', label: 'Promedio por Alumno', icon: User },
    { value: 'promedio_grupo', label: 'Promedio por Grupo', icon: Users },
    { value: 'promedio_materia', label: 'Promedio por Materia', icon: BookOpen },
    { value: 'reprobacion', label: 'Índice de Reprobación (< 70)', icon: AlertTriangle },
    { value: 'inscripciones', label: 'Inscripciones por Ciclo', icon: ClipboardList },
    { value: 'calificaciones', label: 'Calificaciones por Grupo', icon: BarChart3 },
]

const FORMATOS = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
]

const INIT_FILTERS = { tipo: 'promedio_alumno', cicloId: '', grupoId: '', materiaId: '', alumnoId: '', formato: 'pdf' }

function tiempoDesde(date) {
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return 'Recién'
    if (diff < 3600) return `Hace ${Math.round(diff / 60)} min`
    return `Hace ${Math.round(diff / 3600)} h`
}

export default function ReportesPage() {
    const { tasks, addTask, removeTask, clearDone } = useTasks()
    const [filters, setFilters] = useState(INIT_FILTERS)
    const [allUsers, setAllUsers] = useState([])
    const [ciclos, setCiclos] = useState([])
    const [grupos, setGrupos] = useState([])
    const [materias, setMaterias] = useState([])

    useEffect(() => {
        async function load() {
            try {
                const [u, c, g, m] = await Promise.all([
                    usersService.getAll(),
                    ciclosService.getAll(),
                    gruposService.getAll(),
                    materiasService.getAll(),
                ])
                setAllUsers(Array.isArray(u) ? u : u.results ?? [])
                setCiclos(Array.isArray(c) ? c : c.results ?? [])
                setGrupos(Array.isArray(g) ? g : g.results ?? [])
                setMaterias(Array.isArray(m) ? m : m.results ?? [])
            } catch (err) {
                console.error('Error cargando datos de reportes:', err)
            }
        }
        load()
    }, [])

    const alumnosOptions = useMemo(() => [
        { value: '', label: 'Todos los alumnos' },
        ...allUsers.filter(u => u.rol === 'Alumno').map(u => ({ value: String(u.id), label: `${u.nombre} (${u.matricula})` }))
    ], [allUsers])

    const materiasOptions = useMemo(() => [
        { value: '', label: 'Todas las materias' },
        ...materias.map(m => ({ value: String(m.id), label: `${m.clave} – ${m.nombre}` }))
    ], [materias])

    const showAlumno = filters.tipo === 'promedio_alumno'
    const showMateria = filters.tipo === 'promedio_materia'
    const showGrupo = ['promedio_grupo', 'calificaciones', 'reprobacion'].includes(filters.tipo)

    function handleChange(e) {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    function handleGenerar() {
        const tipoLabel = TIPOS.find(t => t.value === filters.tipo)?.label ?? filters.tipo
        const cicloLabel = ciclos.find(c => String(c.id) === filters.cicloId)?.nombre ?? 'Todos los ciclos'
        const fmtLabel = FORMATOS.find(f => f.value === filters.formato)?.label ?? filters.formato
        const alumnoLabel = allUsers.find(u => String(u.id) === filters.alumnoId)?.nombre ?? 'Todos'
        const materiaLabel = materias.find(m => String(m.id) === filters.materiaId)?.nombre ?? 'Todas'
        const grupoLabel = grupos.find(g => String(g.id) === filters.grupoId)?.clave ?? 'Todos'

        addTask({
            titulo: tipoLabel,
            tipo: tipoLabel,
            filtros: {
                ciclo: cicloLabel,
                detalle: showAlumno ? alumnoLabel : showMateria ? materiaLabel : showGrupo ? grupoLabel : '—',
                formato: fmtLabel,
            },
        })
    }

    const pendientes = tasks.filter(t => t.status === 'processing').length
    const terminados = tasks.filter(t => t.status === 'done').length

    return (
        <AdminShell>
            <div className="space-y-5 max-w-5xl mx-auto">
                <PageHeader
                    title="Reportes"
                    subtitle="Genera reportes que se procesan en segundo plano"
                />

                <div className="grid lg:grid-cols-3 gap-5">

                    {/* ── Panel de configuración ──────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
                            <p className="text-sm font-bold text-[#3d3d3d]">Configurar Reporte</p>

                            <FormField
                                label="Tipo de reporte"
                                name="tipo"
                                value={filters.tipo}
                                onChange={handleChange}
                                type="select"
                                options={TIPOS.map(t => ({ value: t.value, label: t.label }))}
                            />
                            <FormField
                                label="Ciclo escolar"
                                name="cicloId"
                                value={filters.cicloId}
                                onChange={handleChange}
                                type="select"
                                options={[{ value: '', label: 'Todos los ciclos' }, ...ciclos.map(c => ({ value: String(c.id), label: c.nombre + (c.activo ? ' ✓' : '') }))]}
                            />
                            {showAlumno && (
                                <FormField
                                    label="Alumno (opcional)"
                                    name="alumnoId"
                                    value={filters.alumnoId}
                                    onChange={handleChange}
                                    type="select"
                                    options={alumnosOptions}
                                />
                            )}
                            {showMateria && (
                                <FormField
                                    label="Materia"
                                    name="materiaId"
                                    value={filters.materiaId}
                                    onChange={handleChange}
                                    type="select"
                                    options={materiasOptions}
                                />
                            )}
                            {showGrupo && (
                                <FormField
                                    label="Filtrar por grupo (opcional)"
                                    name="grupoId"
                                    value={filters.grupoId}
                                    onChange={handleChange}
                                    type="select"
                                    options={[{ value: '', label: 'Todos los grupos' }, ...grupos.map(g => ({ value: String(g.id), label: `${g.clave} – ${g.materia}` }))]}
                                />
                            )}
                            <FormField
                                label="Formato de salida"
                                name="formato"
                                value={filters.formato}
                                onChange={handleChange}
                                type="select"
                                options={FORMATOS.map(f => ({ value: f.value, label: f.label }))}
                            />

                            <button
                                onClick={handleGenerar}
                                className="w-full py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                            >
                                <BarChart3 size={16} className="inline mr-1" /> Generar Reporte
                            </button>

                            <p className="text-xs text-gray-400 text-center leading-relaxed">
                                El reporte se procesará en segundo plano.<br />
                                Puedes navegar libremente mientras se genera.
                            </p>
                        </div>
                    </div>

                    {/* ── Cola de tareas ──────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-bold text-[#3d3d3d]">Cola de Reportes</p>
                                {pendientes > 0 && (
                                    <span className="text-xs font-bold text-white rounded-full px-2 py-0.5 animate-pulse" style={{ background: 'var(--color-primary)' }}>
                                        {pendientes} procesando
                                    </span>
                                )}
                            </div>
                            {terminados > 0 && (
                                <button onClick={clearDone} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                                    Limpiar completados
                                </button>
                            )}
                        </div>

                        {tasks.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                                <p className="text-4xl mb-3"><BarChart3 size={40} className="mx-auto text-gray-300" /></p>
                                <p className="text-sm font-semibold text-[#3d3d3d]">Sin reportes generados</p>
                                <p className="text-xs text-gray-400 mt-1">Configura y genera tu primer reporte</p>
                            </div>
                        ) : (
                            tasks.map(t => <TaskCard key={t.id} task={t} onRemove={removeTask} />)
                        )}
                    </div>
                </div>
            </div>
        </AdminShell>
    )
}

function TaskCard({ task, onRemove }) {
    const isDone = task.status === 'done'

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm transition-all anim-fade ${isDone ? 'ring-1 ring-emerald-200' : ''}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: isDone ? '#dcfce740' : '#E43D1210' }}
                    >
                        {isDone ? <CheckCircle size={20} className="text-emerald-500" /> : <Clock size={20} className="text-[#E43D12]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#3d3d3d] truncate">{task.titulo}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {task.filtros.ciclo}{task.filtros.detalle && task.filtros.detalle !== '—' ? ` · ${task.filtros.detalle}` : ''} · {task.filtros.formato}
                        </p>
                        <p className="text-xs text-gray-400">{tiempoDesde(task.createdAt)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {isDone && (
                        <button
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: '#dcfce740', color: '#16a34a' }}
                            onClick={() => {/* Simula descarga */ }}
                        >
                            <Download size={14} /> Descargar
                        </button>
                    )}
                    <button
                        onClick={() => onRemove(task.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-xs"
                        title="Eliminar tarea"
                    >✕</button>
                </div>
            </div>

            {/* Barra de progreso */}
            {!isDone && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Procesando…</span>
                        <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{task.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${task.progress}%`,
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                            }}
                        />
                    </div>
                </div>
            )}

            {isDone && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Completado — listo para descargar
                </div>
            )}
        </div>
    )
}
