import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, UsersRound, X } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Badge from '../../Components/UI/Badge'
import { useAuth } from '../../Context/AuthContext'
import { gruposService } from '../../Services/gruposService'
import { inscripcionesService } from '../../Services/inscripcionesService'
import { entregasService } from '../../Services/entregasService'

const COLORS = ['#E43D12', '#EFB11D', '#D6536D', '#FFA2B6', '#7c3aed', '#10b981', '#3b82f6']

export default function MisGruposPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ materia: '', grupo: '' })

    async function fetchGrupos() {
        try {
            const [gRes, iRes, eRes] = await Promise.all([
                gruposService.getAll(),
                inscripcionesService.getAll(),
                entregasService.getAll(),
            ])
            const gruposList = Array.isArray(gRes) ? gRes : gRes.results ?? []
            const inscList = Array.isArray(iRes) ? iRes : iRes.results ?? []
            const entregasList = Array.isArray(eRes) ? eRes : eRes.results ?? []

            const misGrupos = gruposList
                .filter(g => g.docente === user?.id)
                .map((g, i) => {
                    const alumnos = inscList.filter(ins => ins.grupo === g.id).length
                    const pendientes = entregasList.filter(e => e.grupo === g.id && e.calificacion == null).length
                    return {
                        id: g.id,
                        materia: g.materia_nombre ?? g.nombre ?? '',
                        grupo: g.clave ?? g.nombre ?? '',
                        alumnos,
                        pendientes,
                        color: COLORS[i % COLORS.length],
                    }
                })
            setGrupos(misGrupos)
        } catch { /* ignore */ }
        setLoading(false)
    }

    useEffect(() => { fetchGrupos() }, [user])

    async function handleCreateGrupo() {
        if (!form.materia || !form.grupo) return
        try {
            await gruposService.create({ nombre: form.materia, clave: form.grupo })
            setShowModal(false)
            setForm({ materia: '', grupo: '' })
            fetchGrupos()
        } catch { /* ignore */ }
    }

    return (
        <TeacherShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Mis Grupos</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{grupos.length} grupos activos este ciclo</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                    >
                        <span className="text-base leading-none"><Plus size={16} /></span>
                        Nuevo Grupo
                    </button>
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

            {/* Modal Nuevo Grupo */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 anim-fade">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm anim-modal-in">
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: '#E43D1218' }}><Plus size={16} /></div>
                                <h2 className="text-base font-bold text-[#3d3d3d]">Nuevo Grupo</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#EBE9E1] hover:text-[#E43D12] transition-all text-sm"
                            ><X size={16} /></button>
                        </div>
                        <div className="px-6 pb-6 pt-5 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Nombre de la materia</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Programación Orientada a Objetos"
                                    value={form.materia}
                                    onChange={e => setForm(p => ({ ...p, materia: e.target.value }))}
                                    className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Clave del grupo</label>
                                <input
                                    type="text"
                                    placeholder="Ej. 401"
                                    value={form.grupo}
                                    onChange={e => setForm(p => ({ ...p, grupo: e.target.value }))}
                                    className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                                >Cancelar</button>
                                <button
                                    onClick={handleCreateGrupo}
                                    className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                >Crear Grupo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TeacherShell>
    )
}
