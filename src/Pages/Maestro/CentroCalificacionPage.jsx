import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'

const alumnos = [
    { id: 1, nombre: 'Ana García', matricula: '20230003' },
    { id: 2, nombre: 'María López', matricula: '20230001' },
    { id: 3, nombre: 'Juan Pérez', matricula: '20230002' },
    { id: 4, nombre: 'Carlos Ruiz', matricula: '20230004' },
    { id: 5, nombre: 'Sofía Mendoza', matricula: '20230005' },
]

const entregas = {
    1: [
        { intento: 3, fecha: '2026-03-28 14:32', tipo: 'archivo', nombre: 'proyecto_final_v3.zip', tamaño: '4.2 MB', calificacion: null, comentario: '' },
        { intento: 2, fecha: '2026-03-27 10:15', tipo: 'archivo', nombre: 'proyecto_final_v2.zip', tamaño: '3.8 MB', calificacion: 8.5, comentario: 'Buen avance, falta validación de formularios.' },
        { intento: 1, fecha: '2026-03-25 18:00', tipo: 'video', url: 'https://youtube.com/watch?v=demo', calificacion: null, comentario: '' },
    ],
    2: [
        { intento: 1, fecha: '2026-03-28 09:10', tipo: 'archivo', nombre: 'entrega_1.pdf', tamaño: '1.1 MB', calificacion: null, comentario: '' },
    ],
    3: [],
    4: [
        { intento: 2, fecha: '2026-03-27 20:55', tipo: 'archivo', nombre: 'reporte.docx', tamaño: '890 KB', calificacion: 7.0, comentario: 'Falta agregar conclusiones.' },
    ],
    5: [
        { intento: 1, fecha: '2026-03-28 11:25', tipo: 'video', url: 'https://drive.google.com/file/demo', calificacion: null, comentario: '' },
    ],
}

export default function CentroCalificacionPage() {
    const { id: grupoId } = useParams()
    const navigate = useNavigate()

    const [alumnoIdx, setAlumnoIdx] = useState(0)
    const [calificacion, setCalificacion] = useState('')
    const [comentario, setComentario] = useState('')
    const [saved, setSaved] = useState(false)

    const alumno = alumnos[alumnoIdx]
    const historial = entregas[alumno.id] ?? []
    const ultimaEntrega = historial[0] ?? null

    function guardarYSiguiente() {
        if (!calificacion) return
        setSaved(true)
        setTimeout(() => {
            setSaved(false)
            setCalificacion('')
            setComentario('')
            if (alumnoIdx < alumnos.length - 1) {
                setAlumnoIdx(i => i + 1)
            }
        }, 900)
    }

    return (
        <TeacherShell>
            <div className="max-w-6xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate(`/maestro/grupos/${grupoId}`)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#E43D12] transition-colors mb-2"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                            Volver al grupo
                        </button>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Centro de Calificación</h1>
                    </div>

                    {/* Selector de alumno */}
                    <div className="flex items-center gap-3">
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
                            {alumnos.map((a, i) => (
                                <option key={a.id} value={i}>{a.nombre}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => { if (alumnoIdx < alumnos.length - 1) { setAlumnoIdx(i => i + 1); setCalificacion(''); setComentario('') } }}
                            disabled={alumnoIdx === alumnos.length - 1}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:border-[#E43D12] hover:text-[#E43D12] transition-all disabled:opacity-30"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                        <span className="text-xs text-gray-400">{alumnoIdx + 1} / {alumnos.length}</span>
                    </div>
                </div>

                {/* Layout principal */}
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
                            <div className="ml-auto">
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
                                    <span className="text-4xl mb-3">📭</span>
                                    <p className="text-sm font-semibold text-[#3d3d3d]">Sin entrega</p>
                                    <p className="text-xs text-gray-400 mt-1">Este alumno aún no ha entregado nada.</p>
                                </div>
                            ) : ultimaEntrega.tipo === 'video' ? (
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-base">🎬</span>
                                        <p className="text-sm font-semibold text-[#3d3d3d]">Entrega en video</p>
                                        <Badge variant="secondary">Último intento</Badge>
                                    </div>
                                    <a
                                        href={ultimaEntrega.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#E43D12] transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#E43D1218' }}>▶️</div>
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
                                        <span className="text-base">📎</span>
                                        <p className="text-sm font-semibold text-[#3d3d3d]">Archivo entregado</p>
                                        <Badge variant="secondary">Último intento</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">📄</div>
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
                                        💡 Se califica el último intento
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
                                                    {h.tipo === 'video' ? '🎬 Enlace de video' : `📄 ${h.nombre}`}
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
                                <p className="text-xs font-semibold text-emerald-600">✅ Guardado · Siguiente alumno…</p>
                            </div>
                        )}

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
                            disabled={!calificacion || ultimaEntrega === null}
                            className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                        >
                            Guardar y Siguiente
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>

                        {ultimaEntrega === null && (
                            <p className="text-xs text-center text-gray-400">No hay entrega para calificar.</p>
                        )}
                    </div>
                </div>
            </div>
        </TeacherShell>
    )
}
