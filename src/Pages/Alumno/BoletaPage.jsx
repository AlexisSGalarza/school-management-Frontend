import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import Badge from '../../Components/UI/Badge'

// ── Mock data ─────────────────────────────────────────────────────────────────
// Estructura derivada de las tablas Inscripcion → Grupo → Materia → Tarea → Entrega.
// En producción este array vendría de GET /api/alumno/boleta e incluiría:
//   • La última Entrega calificada por tarea (Entrega.calificacion + Entrega.comentario)
//   • Las tareas sin entrega o sin calificar (calificacion: null)
// No hay pesos ni categorías (examen/parcial) porque la DB actual no los almacena.
// ─────────────────────────────────────────────────────────────────────────────
const BOLETA = [
    {
        grupoId: 1, clave: 'INF-101', materia: 'Introducción a la Programación',
        color: '#E43D12', docente: 'Dr. Carlos Martínez',
        tareas: [
            { id: 1, titulo: 'Algoritmos básicos', fechaLimite: '2026-02-20', calificacion: 9.0, fechaEntrega: '19 Feb 2026' },
            { id: 2, titulo: 'Funciones y recursividad', fechaLimite: '2026-03-05', calificacion: 8.0, fechaEntrega: '04 Mar 2026' },
            { id: 3, titulo: 'Proyecto final – calculadora CLI', fechaLimite: '2026-04-10', calificacion: null, fechaEntrega: null },
        ],
    },
    {
        grupoId: 3, clave: 'FIS-201', materia: 'Física II',
        color: '#D6536D', docente: 'Dr. Carlos Martínez',
        tareas: [
            { id: 4, titulo: 'Reporte Lab 1 – Cinemática', fechaLimite: '2026-02-15', calificacion: 8.5, fechaEntrega: '14 Feb 2026' },
            { id: 5, titulo: 'Reporte Lab 2 – Dinámica', fechaLimite: '2026-03-01', calificacion: 7.0, fechaEntrega: '01 Mar 2026' },
            { id: 6, titulo: 'Examen práctico U3', fechaLimite: '2026-03-22', calificacion: 9.5, fechaEntrega: '22 Mar 2026' },
            { id: 7, titulo: 'Proyecto final – Movimiento Circular', fechaLimite: '2026-04-20', calificacion: null, fechaEntrega: null },
        ],
    },
    {
        grupoId: 4, clave: 'INF-305', materia: 'Desarrollo Web',
        color: '#EFB11D', docente: 'Dra. Laura Gómez Reyes',
        tareas: [
            { id: 8, titulo: 'Maquetado HTML/CSS – Landing Page', fechaLimite: '2026-02-10', calificacion: 9.5, fechaEntrega: '10 Feb 2026' },
            { id: 9, titulo: 'Integración con Tailwind CSS', fechaLimite: '2026-02-28', calificacion: 8.5, fechaEntrega: '27 Feb 2026' },
            { id: 10, titulo: 'SPA con React Router', fechaLimite: '2026-03-20', calificacion: 8.5, fechaEntrega: '19 Mar 2026' },
            { id: 11, titulo: 'Proyecto Final React', fechaLimite: '2026-04-15', calificacion: null, fechaEntrega: null },
        ],
    },
    {
        grupoId: 5, clave: 'MAT-101', materia: 'Álgebra Lineal',
        color: '#7c3aed', docente: 'Mtra. Isabel Fuentes',
        tareas: [
            { id: 12, titulo: 'Ejercicios – Matrices y determinantes', fechaLimite: '2026-02-18', calificacion: 7.0, fechaEntrega: '18 Feb 2026' },
            { id: 13, titulo: 'Tarea – Espacios vectoriales', fechaLimite: '2026-03-10', calificacion: 6.5, fechaEntrega: '10 Mar 2026' },
            { id: 14, titulo: 'Examen parcial II', fechaLimite: '2026-03-28', calificacion: null, fechaEntrega: null },
        ],
    },
]
// ─────────────────────────────────────────────────────────────────────────────

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
    const [expandedId, setExpandedId] = useState(null)

    const items = BOLETA.map(m => ({ ...m, prom: calcPromedio(m.tareas) }))
    const conNota = items.filter(m => m.prom !== null)
    const promedioGeneral = conNota.length > 0
        ? conNota.reduce((acc, m) => acc + m.prom, 0) / conNota.length
        : null

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Boleta de Calificaciones</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Ciclo: Enero – Junio 2026 · {BOLETA.length} materias</p>
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
