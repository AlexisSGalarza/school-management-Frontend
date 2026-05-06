import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Inbox, Video, Play, Paperclip, FileIcon, Lightbulb, CheckCircle, AlertCircle, Filter } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'
import { inscripcionesService } from '../../Services/inscripcionesService'
import { entregasService } from '../../Services/entregasService'
import { usersService } from '../../Services/usersService'
import { tareasService } from '../../Services/tareasService'
import { gruposService } from '../../Services/gruposService'

export default function CentroCalificacionPage() {
    const { id: grupoIdParam } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // ── State: grupo selector (when no grupoId in URL) ──
    const [grupos, setGrupos] = useState([])
    const [selectedGrupoId, setSelectedGrupoId] = useState(grupoIdParam || '')
    const grupoId = grupoIdParam || selectedGrupoId

    const [alumnos, setAlumnos] = useState([])
    const [entregas, setEntregas] = useState({})
    const [loading, setLoading] = useState(true)
    const [alumnoIdx, setAlumnoIdx] = useState(0)
    const [calificacion, setCalificacion] = useState('')
    const [comentario, setComentario] = useState('')
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [showAll, setShowAll] = useState(false)

    // ── Load groups when no grupoId in URL ──
    useEffect(() => {
        if (grupoIdParam) return
        gruposService.getAll()
            .then(data => {
                const list = Array.isArray(data) ? data : data.results ?? []
                setGrupos(list)
                // Auto-select first group if none selected
                if (list.length > 0 && !selectedGrupoId) {
                    setSelectedGrupoId(String(list[0].id))
                }
                setLoading(false)
            })
            .catch(() => {
                setError('No se pudieron cargar los grupos.')
                setLoading(false)
            })
    }, [grupoIdParam, selectedGrupoId])

    // ── Load data for selected group ──
    useEffect(() => {
        if (!grupoId) return
        setLoading(true)
        setError('')

        async function load() {
            try {
                const [inscRes, entregasRes, usersRes, tareasRes] = await Promise.all([
                    inscripcionesService.getAll(),
                    entregasService.getAll(),
                    usersService.getAll(),
                    tareasService.getAll(),
                ])
                const inscList = Array.isArray(inscRes) ? inscRes : inscRes.results ?? []
                const entregasList = Array.isArray(entregasRes) ? entregasRes : entregasRes.results ?? []
                const usersList = Array.isArray(usersRes) ? usersRes : usersRes.results ?? []
                const tareasList = Array.isArray(tareasRes) ? tareasRes : tareasRes.results ?? []

                const tareaIdsDelGrupo = new Set(
                    tareasList.filter(t => String(t.grupo) === String(grupoId)).map(t => t.id)
                )

                const usersMap = Object.fromEntries(usersList.map(u => [u.id, u]))
                const alumnosGrupo = inscList
                    .filter(i => String(i.grupo) === String(grupoId))
                    .map(i => {
                        const u = usersMap[i.alumno] ?? {}
                        return { id: i.alumno, nombre: u.nombre ?? u.first_name ?? `Alumno ${i.alumno}`, matricula: u.matricula ?? u.username ?? '' }
                    })
                setAlumnos(alumnosGrupo)

                // Pre-select alumno from query param if present
                const alumnoParam = searchParams.get('alumno')
                if (alumnoParam) {
                    const idx = alumnosGrupo.findIndex(a => String(a.id) === alumnoParam)
                    if (idx >= 0) setAlumnoIdx(idx)
                } else {
                    setAlumnoIdx(0)
                }

                const entregasMap = {}
                alumnosGrupo.forEach(a => {
                    entregasMap[a.id] = entregasList
                        .filter(e => e.alumno === a.id && tareaIdsDelGrupo.has(e.tarea))
                        .sort((x, y) => new Date(y.fecha_entrega ?? 0) - new Date(x.fecha_entrega ?? 0))
                        .map((e, i, arr) => ({
                            id: e.id,
                            intento: arr.length - i,
                            fecha: e.fecha_entrega ?? '',
                            tipo: e.video_url ? 'video' : 'archivo',
                            nombre: e.nombre_archivo || (e.archivo_url?.split('/').pop() ?? 'Entrega'),
                            url: e.video_url || e.archivo_url || '',
                            tamaño: e.tamano_bytes ? `${(e.tamano_bytes / 1024 / 1024).toFixed(1)} MB` : '',
                            calificacion: e.calificacion ?? null,
                            comentario: e.comentario ?? '',
                        }))
                })
                setEntregas(entregasMap)

                if (alumnosGrupo.length === 0) {
                    setError('No hay alumnos inscritos en este grupo.')
                }
            } catch (err) {
                console.error('Error loading grading data:', err)
                setError('Error al cargar los datos. Verifica tu conexión e intenta de nuevo.')
            }
            setLoading(false)
        }
        load()
    }, [grupoId, searchParams])

    // Helper: check if a student's latest submission is ungraded
    function tienePendiente(alumnoId) {
        const hist = entregas[alumnoId] ?? []
        if (hist.length === 0) return false // no submissions = nothing to grade
        return hist[0].calificacion === null
    }

    // Filtered list: only students with ungraded latest submissions (or all)
    const alumnosFiltrados = showAll
        ? alumnos
        : alumnos.filter(a => tienePendiente(a.id))

    const alumno = alumnosFiltrados[alumnoIdx] ?? { id: 0, nombre: '', matricula: '' }
    const historial = entregas[alumno.id] ?? []
    const ultimaEntrega = historial[0] ?? null
    const yaCalificado = ultimaEntrega !== null && ultimaEntrega.calificacion !== null
    const pendientesCount = alumnos.filter(a => tienePendiente(a.id)).length

    async function guardarYSiguiente() {
        if (!calificacion || !ultimaEntrega) return
        const cal = parseFloat(calificacion)
        if (isNaN(cal) || cal < 0 || cal > 10) {
            setError('La calificación debe ser un número entre 0 y 10.')
            return
        }
        setSaving(true)
        setError('')
        try {
            await entregasService.patch(ultimaEntrega.id, {
                calificacion: cal,
                comentario: comentario || '',
            })
            setEntregas(prev => {
                const arr = (prev[alumno.id] ?? []).map(e =>
                    e.id === ultimaEntrega.id ? { ...e, calificacion: cal, comentario } : e
                )
                return { ...prev, [alumno.id]: arr }
            })
            setSaved(true)
            setTimeout(() => {
                setSaved(false)
                setCalificacion('')
                setComentario('')
                // Move to the next student in the filtered list
                if (alumnoIdx < alumnosFiltrados.length - 1) {
                    setAlumnoIdx(i => i + 1)
                }
            }, 900)
        } catch (err) {
            console.error('Error saving grade:', err)
            const detail = err?.response?.data
            let msg = 'Error al guardar la calificación.'
            if (detail) {
                if (typeof detail === 'string') msg = detail
                else if (detail.detail) msg = detail.detail
                else if (detail.calificacion) msg = `Calificación: ${detail.calificacion}`
                else if (detail.comentario) msg = `Comentario: ${detail.comentario}`
                else msg = JSON.stringify(detail)
            }
            setError(msg)
        }
        setSaving(false)
    }

    // ── Group selector screen (when no grupoId in URL) ──
    if (!grupoIdParam && !selectedGrupoId && !loading) {
        return (
            <TeacherShell>
                <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto" style={{ background: '#E43D1218' }}>
                        <Inbox size={32} className="text-gray-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Centro de Calificación</h1>
                    <p className="text-sm text-gray-400">No tienes grupos disponibles para calificar.</p>
                </div>
            </TeacherShell>
        )
    }

    if (loading) return <TeacherShell><p className="text-center text-gray-400 py-20">Cargando…</p></TeacherShell>

    return (
        <TeacherShell>
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        {grupoIdParam && (
                            <button
                                onClick={() => navigate(`/maestro/grupos/${grupoId}`)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#E43D12] transition-colors mb-2"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                                Volver al grupo
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Centro de Calificación</h1>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Group selector (when accessed from sidebar) */}
                        {!grupoIdParam && grupos.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium">Grupo:</span>
                                <select
                                    value={selectedGrupoId}
                                    onChange={e => { setSelectedGrupoId(e.target.value); setAlumnoIdx(0); setCalificacion(''); setComentario(''); setShowAll(false) }}
                                    className="text-sm font-semibold text-[#3d3d3d] bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none"
                                >
                                    {grupos.map(g => (
                                        <option key={g.id} value={g.id}>{g.nombre} — {g.materia_nombre || 'Materia'}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Filter toggle: solo pendientes / todos */}
                        {alumnos.length > 0 && (
                            <button
                                onClick={() => { setShowAll(s => !s); setAlumnoIdx(0); setCalificacion(''); setComentario('') }}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                    showAll
                                        ? 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                        : 'border-[#E43D12] text-[#E43D12]'
                                }`}
                                style={!showAll ? { background: '#E43D1208' } : {}}
                            >
                                <Filter size={12} />
                                {showAll ? 'Todos' : `Pendientes (${pendientesCount})`}
                            </button>
                        )}

                        {/* Student selector */}
                        {alumnosFiltrados.length > 0 && (
                            <>
                                <button
                                    onClick={() => { if (alumnoIdx > 0) { setAlumnoIdx(i => i - 1); setCalificacion(''); setComentario('') } }}
                                    disabled={alumnoIdx === 0}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:border-[#E43D12] hover:text-[#E43D12] transition-all disabled:opacity-30"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <select
                                    value={alumnoIdx}
                                    onChange={e => { setAlumnoIdx(Number(e.target.value)); setCalificacion(''); setComentario('') }}
                                    className="text-sm font-semibold text-[#3d3d3d] bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none"
                                >
                                    {alumnosFiltrados.map((a, i) => (
                                        <option key={a.id} value={i}>{a.nombre}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => { if (alumnoIdx < alumnosFiltrados.length - 1) { setAlumnoIdx(i => i + 1); setCalificacion(''); setComentario('') } }}
                                    disabled={alumnoIdx === alumnosFiltrados.length - 1}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:border-[#E43D12] hover:text-[#E43D12] transition-all disabled:opacity-30"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                                </button>
                                <span className="text-xs text-gray-400">{alumnoIdx + 1} / {alumnosFiltrados.length}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: '#E43D1212', border: '1px solid #E43D1230' }}>
                        <AlertCircle size={16} className="text-[#E43D12] flex-shrink-0" />
                        <p className="text-xs font-semibold text-[#E43D12]">{error}</p>
                        <button onClick={() => setError('')} className="ml-auto text-xs text-gray-400 hover:text-[#E43D12]">✕</button>
                    </div>
                )}

                {/* Empty state for no students */}
                {alumnos.length === 0 && !loading && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-[#3d3d3d]">Sin alumnos</p>
                        <p className="text-xs text-gray-400 mt-1">No hay alumnos inscritos en este grupo.</p>
                    </div>
                )}

                {/* All graded message */}
                {alumnos.length > 0 && alumnosFiltrados.length === 0 && !loading && (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-[#3d3d3d]">¡Todo calificado!</p>
                        <p className="text-xs text-gray-400 mt-1">No hay entregas pendientes de calificar en este grupo.</p>
                        <button
                            onClick={() => { setShowAll(true); setAlumnoIdx(0) }}
                            className="mt-4 text-xs font-semibold transition-colors hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            Ver todos los alumnos
                        </button>
                    </div>
                )}

                {/* Layout principal */}
                {alumnosFiltrados.length > 0 && (
                    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">

                        {/* ── Panel izquierdo: Visor (70%) ── */}
                        <div className="space-y-4">

                            {/* Info alumno */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                                <Avatar name={alumno.nombre} size="md" />
                                <div>
                                    <p className="font-bold text-[#3d3d3d]">{alumno.nombre}</p>
                                    <p className="text-xs text-gray-400">{alumno.matricula}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    {yaCalificado && <Badge variant="secondary">✓ Calificado</Badge>}
                                    {historial.length === 0
                                        ? <Badge variant="default">Sin entregas</Badge>
                                        : <Badge variant="secondary">{historial.length} {historial.length === 1 ? 'intento' : 'intentos'}</Badge>
                                    }
                                </div>
                            </div>

                            {/* Visor de la entrega */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {ultimaEntrega === null ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                        <span className="text-4xl mb-3"><Inbox size={40} className="text-gray-300" /></span>
                                        <p className="text-sm font-semibold text-[#3d3d3d]">Sin entrega</p>
                                        <p className="text-xs text-gray-400 mt-1">Este alumno aún no ha entregado nada.</p>
                                    </div>
                                ) : ultimaEntrega.tipo === 'video' ? (
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-base"><Video size={16} /></span>
                                            <p className="text-sm font-semibold text-[#3d3d3d]">Entrega en video</p>
                                            <Badge variant="secondary">Último intento</Badge>
                                        </div>
                                        <a
                                            href={ultimaEntrega.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#E43D12] transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#E43D1218' }}><Play size={20} /></div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#3d3d3d] group-hover:text-[#E43D12] transition-colors">Abrir enlace de video</p>
                                                <p className="text-xs text-gray-400 truncate max-w-xs">{ultimaEntrega.url}</p>
                                            </div>
                                        </a>
                                        <p className="text-xs text-gray-400">Enviado: {ultimaEntrega.fecha}</p>
                                    </div>
                                ) : (
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-base"><Paperclip size={16} /></span>
                                            <p className="text-sm font-semibold text-[#3d3d3d]">Archivo entregado</p>
                                            <Badge variant="secondary">Último intento</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm"><FileIcon size={24} /></div>
                                            <div>
                                                <p className="text-sm font-semibold text-[#3d3d3d]">{ultimaEntrega.nombre}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{ultimaEntrega.tamaño} · {ultimaEntrega.fecha}</p>
                                            </div>
                                            <button className="ml-auto text-xs font-semibold transition-colors hover:underline" style={{ color: 'var(--color-primary)' }}>
                                                Descargar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Historial de resubidas */}
                            {historial.length > 1 && (
                                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-[#3d3d3d]">Historial de entregas</h3>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold" style={{ background: '#EFB11D18', color: '#a07a00' }}>
                                            <Lightbulb size={14} /> Se califica el último intento
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {historial.map((h, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'border-2' : 'bg-gray-50'}`}
                                                style={i === 0 ? { borderColor: 'var(--color-primary)', background: '#E43D1208' } : {}}
                                            >
                                                <span className="text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                                                    style={{ background: i === 0 ? 'var(--color-primary)' : '#d1d5db' }}>
                                                    {h.intento}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-[#3d3d3d] truncate">
                                                        {h.tipo === 'video' ? <><Video size={12} className="inline" /> Enlace de video</> : <><FileIcon size={12} className="inline" /> {h.nombre}</>}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">{h.fecha}</p>
                                                </div>
                                                {h.calificacion !== null && (
                                                    <span className="text-sm font-black" style={{ color: 'var(--color-secondary)' }}>{h.calificacion}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Panel derecho: Evaluación (30%) ── */}
                        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4 lg:sticky lg:top-20">
                            <h3 className="text-sm font-bold text-[#3d3d3d]">Evaluación</h3>

                            {saved && (
                                <div className="rounded-xl p-3 text-center anim-modal-in" style={{ background: '#10b98118', border: '1px solid #10b98130' }}>
                                    <p className="text-xs font-semibold text-emerald-600"><CheckCircle size={14} className="inline" /> Guardado · Siguiente alumno…</p>
                                </div>
                            )}

                            {/* Already graded notice */}
                            {yaCalificado && !saved && (
                                <div className="rounded-xl p-4 text-center" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                                    <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-emerald-600">Ya calificado: {ultimaEntrega.calificacion}</p>
                                    {ultimaEntrega.comentario && (
                                        <p className="text-xs text-gray-500 mt-1">"{ultimaEntrega.comentario}"</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">Si el alumno sube un nuevo intento, aparecerá aquí para calificar.</p>
                                </div>
                            )}

                            {/* Grading form — only when NOT already graded */}
                            {!yaCalificado && (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 block mb-1">Calificación (0 – 10)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={calificacion}
                                            onChange={e => setCalificacion(e.target.value)}
                                            placeholder="Ej. 9.5"
                                            className="w-full text-2xl font-black text-center px-4 py-3 rounded-xl border-2 border-transparent outline-none transition-colors"
                                            style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}
                                            onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                            onBlur={e => e.target.style.borderColor = 'transparent'}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 block mb-1">Retroalimentación</label>
                                        <textarea
                                            rows={5}
                                            value={comentario}
                                            onChange={e => setComentario(e.target.value)}
                                            placeholder="Escribe un comentario o retroalimentación para el alumno…"
                                            className="w-full text-sm px-4 py-3 rounded-xl border-2 border-transparent outline-none transition-colors resize-none"
                                            style={{ backgroundColor: 'var(--color-background)' }}
                                            onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                            onBlur={e => e.target.style.borderColor = 'transparent'}
                                        />
                                    </div>

                                    <button
                                        onClick={guardarYSiguiente}
                                        disabled={!calificacion || ultimaEntrega === null || saving}
                                        className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                                    >
                                        {saving ? 'Guardando…' : 'Guardar y Siguiente'}
                                        {!saving && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                                        )}
                                    </button>

                                    {ultimaEntrega === null && (
                                        <p className="text-xs text-center text-gray-400">No hay entrega para calificar.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </TeacherShell>
    )
}
