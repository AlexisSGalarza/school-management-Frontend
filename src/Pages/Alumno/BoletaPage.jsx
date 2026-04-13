import { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import Badge from '../../Components/UI/Badge'
import { useAuth } from '../../Context/AuthContext'
import { gruposService } from '../../Services/gruposService'
import { tareasService } from '../../Services/tareasService'
import { entregasService } from '../../Services/entregasService'

const COLORS = ['#E43D12', '#D6536D', '#EFB11D', '#7c3aed', '#10b981', '#3b82f6', '#f97316']

// Promedio simple: suma de calificaciones / número de tareas calificadas
function calcPromedio(tareas) {
    const calificadas = tareas.filter(t => t.calificacion !== null)
    if (calificadas.length === 0) return null
    return calificadas.reduce((acc, t) => acc + t.calificacion, 0) / calificadas.length
}

function colorProm(prom) {
    if (prom === null) return '#9ca3af'
    if (prom >= 9) return '#10b981'
    if (prom >= 7) return '#EFB11D'
    return '#E43D12'
}

function statusBadge(prom) {
    if (prom === null) return <Badge variant="muted">Sin calificar</Badge>
    if (prom >= 9) return <Badge variant="success">Excelente</Badge>
    if (prom >= 7) return <Badge variant="warning">Aprobado</Badge>
    return <Badge variant="primary">En riesgo</Badge>
}

export default function BoletaPage() {
    const { user } = useAuth()
    const [boleta, setBoleta] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        async function load() {
            try {
                const [grupos, tareas, entregas] = await Promise.all([
                    gruposService.getAll(),
                    tareasService.getAll(),
                    entregasService.getAll(),
                ])
                const gruposList = Array.isArray(grupos) ? grupos : grupos.results ?? []
                const tareasList = Array.isArray(tareas) ? tareas : tareas.results ?? []
                const entregasList = Array.isArray(entregas) ? entregas : entregas.results ?? []

                const data = gruposList.map((g, i) => {
                    const tareasGrupo = tareasList.filter(t => t.grupo === g.id)
                    return {
                        grupoId: g.id,
                        clave: g.clave ?? g.nombre?.substring(0, 7) ?? '',
                        materia: g.materia_nombre ?? g.nombre ?? '',
                        color: COLORS[i % COLORS.length],
                        docente: g.docente_nombre ?? '',
                        tareas: tareasGrupo.map(t => {
                            const entrega = entregasList
                                .filter(e => e.tarea === t.id && e.alumno === user?.id)
                                .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))[0]
                            return {
                                id: t.id,
                                titulo: t.titulo,
                                fechaLimite: t.fecha_limite,
                                calificacion: entrega?.calificacion ?? null,
                                fechaEntrega: entrega?.created_at
                                    ? new Date(entrega.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : null,
                            }
                        }),
                    }
                }).filter(g => g.tareas.length > 0)
                setBoleta(data)
            } catch { /* ignore */ }
            setLoading(false)
        }
        load()
    }, [user])

    const items = boleta.map(m => ({ ...m, prom: calcPromedio(m.tareas) }))
    const conNota = items.filter(m => m.prom !== null)
    const promedioGeneral = conNota.length > 0
        ? conNota.reduce((acc, m) => acc + m.prom, 0) / conNota.length
        : null

    if (loading) return <AppShell><p className="text-center text-gray-400 py-20">Cargando boleta…</p></AppShell>

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Boleta de Calificaciones</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{boleta.length} materias</p>
                    </div>

                    {/* Promedio general */}
                    {promedioGeneral !== null && (
                        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm text-center min-w-[120px]">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Promedio</p>
                            <p className="text-4xl font-black mt-1" style={{ color: colorProm(promedioGeneral) }}>
                                {promedioGeneral.toFixed(1)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">general</p>
                        </div>
                    )}
                </div>

                {/* Resumen de estadísticas */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Excelente (≥ 9)', value: items.filter(m => m.prom !== null && m.prom >= 9).length, color: '#10b981', bg: '#f0fdf4' },
                        { label: 'Aprobado (7-8.9)', value: items.filter(m => m.prom !== null && m.prom >= 7 && m.prom < 9).length, color: '#EFB11D', bg: '#fffbeb' },
                        { label: 'En riesgo (< 7)', value: items.filter(m => m.prom !== null && m.prom < 7).length, color: '#E43D12', bg: '#fff1f0' },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Lista de materias */}
                <div className="space-y-2.5">
                    {items.map(m => {
                        const expanded = expandedId === m.grupoId
                        const pendientes = m.tareas.filter(t => t.calificacion === null).length

                        return (
                            <div key={m.grupoId} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                                {/* Fila principal */}
                                <button
                                    className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors text-left"
                                    onClick={() => setExpandedId(expanded ? null : m.grupoId)}
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-white text-[11px]"
                                        style={{ background: m.color }}
                                    >
                                        {m.clave.split('-')[0]}
                                    </div>

                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-bold text-[#3d3d3d]">{m.materia}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {m.docente} · {m.tareas.length} tareas
                                            {pendientes > 0 && (
                                                <span className="ml-2 font-semibold" style={{ color: '#EFB11D' }}>
                                                    · {pendientes} sin calificar
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="hidden sm:block">{statusBadge(m.prom)}</div>
                                        {m.prom !== null ? (
                                            <div className="text-right w-14">
                                                <p className="text-2xl font-black leading-none" style={{ color: colorProm(m.prom) }}>
                                                    {m.prom.toFixed(1)}
                                                </p>
                                                {pendientes > 0 && <p className="text-[10px] text-gray-400 mt-0.5">parcial</p>}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-semibold w-14 text-right">—</span>
                                        )}
                                        <svg
                                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5"
                                            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
                                        >
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Detalle expandido — una fila por Tarea */}
                                {expanded && (
                                    <div className="border-t border-gray-100 overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr style={{ background: '#EBE9E1' }}>
                                                    <th className="text-left px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Tarea</th>
                                                    <th className="text-center px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Fecha entrega</th>
                                                    <th className="text-center px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Calificación</th>
                                                    <th className="text-center px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {m.tareas.map(t => (
                                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm"><ClipboardList size={14} /></span>
                                                                <span className="text-sm text-[#3d3d3d]">{t.titulo}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                            <span className="text-xs text-gray-400">
                                                                {t.fechaEntrega ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {t.calificacion !== null ? (
                                                                <span className="text-base font-black" style={{ color: colorProm(t.calificacion) }}>
                                                                    {t.calificacion.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            {t.calificacion !== null
                                                                ? <Badge variant="success">Calificada</Badge>
                                                                : t.fechaEntrega
                                                                    ? <Badge variant="warning">Sin calificar</Badge>
                                                                    : <Badge variant="muted">Pendiente</Badge>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Nota al pie */}
                <p className="text-xs text-gray-400 text-center pb-2">
                    El promedio por materia es el promedio simple de todas las tareas calificadas.
                </p>
            </div>
        </AppShell>
    )
}
