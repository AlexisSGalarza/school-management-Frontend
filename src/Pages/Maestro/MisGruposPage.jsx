import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersRound } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Badge from '../../Components/UI/Badge'
import { useAuth } from '../../Context/AuthContext'
import { gruposService } from '../../Services/gruposService'
import { inscripcionesService } from '../../Services/inscripcionesService'
import { entregasService } from '../../Services/entregasService'
import { tareasService } from '../../Services/tareasService'

const COLORS = ['#E43D12', '#EFB11D', '#D6536D', '#FFA2B6', '#7c3aed', '#10b981', '#3b82f6']

export default function MisGruposPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(true)

    async function fetchGrupos() {
        try {
            const [gRes, iRes, eRes, tRes] = await Promise.all([
                gruposService.getAll(),
                inscripcionesService.getAll(),
                entregasService.getAll(),
                tareasService.getAll(),
            ])
            const gruposList = Array.isArray(gRes) ? gRes : gRes.results ?? []
            const inscList = Array.isArray(iRes) ? iRes : iRes.results ?? []
            const entregasList = Array.isArray(eRes) ? eRes : eRes.results ?? []
            const tareasList = Array.isArray(tRes) ? tRes : tRes.results ?? []

            const tareaToGrupo = Object.fromEntries(tareasList.map(t => [t.id, t.grupo]))

            const misGrupos = gruposList
                .filter(g => String(g.docente) === String(user?.id))
                .map((g, i) => {
                    const alumnos = inscList.filter(ins => ins.grupo === g.id).length
                    const pendientes = entregasList.filter(e =>
                        tareaToGrupo[e.tarea] === g.id && e.calificacion == null
                    ).length
                    return {
                        id: g.id,
                        materia: g.materia_nombre ?? '',
                        grupo: g.nombre ?? '',
                        alumnos,
                        pendientes,
                        color: COLORS[i % COLORS.length],
                    }
                })
            setGrupos(misGrupos)
        } catch (err) {
            console.error('Error cargando grupos:', err)
        }
        setLoading(false)
    }

    useEffect(() => { if (user?.id) fetchGrupos() }, [user])

    return (
        <TeacherShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Mis Grupos</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{grupos.length} grupos activos este ciclo</p>
                    </div>
                </div>

                {/* Grid de grupos */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {grupos.map(g => (
                        <div
                            key={g.id}
                            onClick={() => navigate(`/maestro/grupos/${g.id}`)}
                            className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            style={{ borderBottom: `3px solid ${g.color}` }}
                        >
                            {/* Color header */}
                            <div
                                className="h-2 w-full"
                                style={{ background: `linear-gradient(90deg, ${g.color}60, ${g.color}20)` }}
                            />

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-sm"
                                        style={{ background: `linear-gradient(135deg, ${g.color} 0%, ${g.color}90 100%)` }}
                                    >
                                        {g.grupo}
                                    </div>
                                    {g.pendientes > 0 && (
                                        <Badge variant="secondary">{g.pendientes} por calificar</Badge>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-[#3d3d3d] leading-snug group-hover:text-[#E43D12] transition-colors">
                                    {g.materia}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Grupo {g.grupo}</p>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base"><UsersRound size={16} /></span>
                                        <span className="text-sm font-semibold text-[#3d3d3d]">{g.alumnos}</span>
                                        <span className="text-xs text-gray-400">alumnos</span>
                                    </div>
                                    <span
                                        className="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        Ver grupo
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TeacherShell>
    )
}
