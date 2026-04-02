import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Link2, BookOpen, UserCheck, School, Calendar, Users, CheckCircle, AlertTriangle, X, Check } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import Badge from '../../Components/UI/Badge'
import { GRUPOS, CICLOS } from '../../data/mockAcademicStructure'

// ID del alumno simulado (el que está logueado)
const MY_ALUMNO_ID = 1

// ── Mock data ────────────────────────────────────────────────
const COLORES = ['#E43D12', '#D6536D', '#EFB11D', '#FFA2B6', '#7c3aed', '#0891b2']

function grupoToMateria(g, idx) {
    return {
        id: g.id,
        nombre: g.materia,
        clave: g.clave,
        docente: g.docente,
        grupo: g.clave,
        ciclo: CICLOS.find(c => c.id === g.cicloId)?.nombre ?? '—',
        tareasNuevas: 0,
        color: COLORES[idx % COLORES.length],
    }
}

// Simula las materias iniciales del alumno
const INITIAL_MATERIAS = GRUPOS
    .filter(g => g.alumnos.includes(MY_ALUMNO_ID))
    .map(grupoToMateria)
// ─────────────────────────────────────────────────────────────

export default function MateriasPage() {
    const navigate = useNavigate()
    const [materias, setMaterias] = useState(INITIAL_MATERIAS)
    const [codigoModal, setCodigoModal] = useState(false)
    const [codigo, setCodigo] = useState('')
    const [codigoError, setCodigoError] = useState('')
    const [confirmGrupo, setConfirmGrupo] = useState(null)   // grupo encontrado, esperando confirm
    const [toasts, setToasts] = useState([])

    function addToast(msg, type = 'success') {
        const id = Date.now()
        setToasts(prev => [...prev, { id, msg, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }

    function openModal() {
        setCodigo('')
        setCodigoError('')
        setConfirmGrupo(null)
        setCodigoModal(true)
    }

    function handleBuscar(e) {
        e.preventDefault()
        const trimmed = codigo.trim().toUpperCase()
        if (!trimmed) { setCodigoError('Ingresa el código que te compartió tu docente'); return }
        const grupo = GRUPOS.find(g => (g.codigo ?? '').toUpperCase() === trimmed)
        if (!grupo) { setCodigoError('Código no encontrado. Verifica que lo hayas escrito correctamente.'); return }
        if (grupo.alumnos.includes(MY_ALUMNO_ID) || materias.some(m => m.id === grupo.id)) {
            setCodigoError('Ya estás inscrito en este grupo.'); return
        }
        setCodigoError('')
        setConfirmGrupo(grupo)
    }

    function handleConfirmar() {
        const idx = materias.length
        setMaterias(prev => [...prev, grupoToMateria(confirmGrupo, idx)])
        const ciclo = CICLOS.find(c => c.id === confirmGrupo.cicloId)
        addToast(`¡Inscrito en ${confirmGrupo.materia} (${confirmGrupo.clave})!`)
        setCodigoModal(false)
        setConfirmGrupo(null)
        setCodigo('')
        void ciclo
    }

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">Mis Materias</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Ciclo: Enero – Junio 2026 · {materias.length} materia{materias.length !== 1 ? 's' : ''} inscrita{materias.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={openModal}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                    >
                        <Link2 size={16} className="inline" /> Unirse con código
                    </button>
                </div>

                {/* Grid de cards */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {materias.map(m => (
                        <MateriaCard key={m.id} materia={m} onClick={() => navigate(`/alumno/materias/${m.id}`)} />
                    ))}
                    {materias.length === 0 && (
                        <div className="col-span-3 bg-white rounded-2xl p-12 text-center shadow-sm">
                            <p className="text-4xl mb-3"><BookOpen size={40} className="mx-auto text-gray-300" /></p>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Aún no tienes materias inscritas</p>
                            <p className="text-xs text-gray-400">Usa el botón "Unirse con código" para inscribirte a un grupo</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Unirse con código */}
            {codigoModal && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                    onClick={e => { if (e.target === e.currentTarget) { setCodigoModal(false) } }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm anim-modal-in overflow-hidden">
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: '#E43D1215' }}><Link2 size={20} /></div>
                                <div>
                                    <p className="text-base font-black text-[#3d3d3d]">Unirse con código</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Pídele el código a tu docente o admin</p>
                                </div>
                            </div>
                            <button onClick={() => setCodigoModal(false)} className="w-8 h-8 rounded-xl bg-[#EBE9E1] flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm font-bold transition-colors"><X size={16} /></button>
                        </div>

                        <div className="px-6 pb-6 space-y-4">
                            {!confirmGrupo ? (
                                /* ── Paso 1: ingresar código ── */
                                <form onSubmit={handleBuscar} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Código del grupo</label>
                                        <input
                                            type="text"
                                            value={codigo}
                                            onChange={e => { setCodigo(e.target.value.toUpperCase()); setCodigoError('') }}
                                            placeholder="Ej. G41A-XK92"
                                            maxLength={12}
                                            className="w-full text-center text-xl font-black tracking-[0.2em] font-mono px-4 py-3.5 rounded-2xl bg-[#EBE9E1] outline-none border-2 border-transparent transition-colors placeholder:font-normal placeholder:text-sm placeholder:tracking-normal placeholder:text-gray-400"
                                            onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                            onBlur={e => e.target.style.borderColor = 'transparent'}
                                            autoFocus
                                        />
                                        {codigoError && (
                                            <p className="text-xs font-medium mt-2 px-1" style={{ color: '#dc2626' }}><AlertTriangle size={12} className="inline" /> {codigoError}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setCodigoModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Buscar</button>
                                    </div>
                                </form>
                            ) : (
                                /* ── Paso 2: confirmar inscripción ── */
                                <div className="space-y-4">
                                    <div className="rounded-2xl p-4 space-y-3" style={{ background: '#E43D1208', border: '1.5px solid #E43D1220' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg"><CheckCircle size={18} className="text-emerald-500" /></span>
                                            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>Grupo encontrado</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-base font-black text-[#3d3d3d] leading-snug">{confirmGrupo.materia}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span><UserCheck size={14} className="inline" /> {confirmGrupo.docente}</span>
                                                <span><School size={14} className="inline" /> {confirmGrupo.clave}</span>
                                                <span><Calendar size={14} className="inline" /> {CICLOS.find(c => c.id === confirmGrupo.cicloId)?.nombre ?? '—'}</span>
                                                <span><Users size={14} className="inline" /> {confirmGrupo.alumnos.length}/{confirmGrupo.capacidad} alumnos</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center">¿Confirmas que quieres unirte a este grupo?</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setConfirmGrupo(null)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">← Atrás</button>
                                        <button onClick={handleConfirmar} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Unirme <Check size={14} className="inline" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Toasts locales */}
            {toasts.length > 0 && createPortal(
                <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2 pointer-events-none">
                    {toasts.map(t => (
                        <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold pointer-events-auto anim-slide-down" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#16a34a', minWidth: '220px', maxWidth: '340px' }}>
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: '#22c55e' }}><Check size={12} /></span>
                            <span className="flex-1 leading-snug">{t.msg}</span>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </AppShell>
    )
}

function MateriaCard({ materia, onClick }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
        >
            {/* Header degradado */}
            <div
                className="h-24 flex items-end px-5 pb-4 relative"
                style={{ background: `linear-gradient(135deg, ${materia.color} 0%, ${materia.color}99 100%)` }}
            >
                <div>
                    <p className="text-white font-bold text-base leading-tight">{materia.nombre}</p>
                    <p className="text-white/70 text-xs mt-0.5">{materia.clave}</p>
                </div>

                {/* Badge de tareas nuevas */}
                {materia.tareasNuevas > 0 && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary">{materia.tareasNuevas} nueva{materia.tareasNuevas > 1 ? 's' : ''}</Badge>
                    </div>
                )}
            </div>

            {/* Cuerpo */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm"><UserCheck size={14} /></span>
                    <p className="text-xs text-gray-500">{materia.docente}</p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs bg-[#EBE9E1] text-gray-600 rounded-full px-2.5 py-0.5 font-medium">{materia.grupo}</span>
                    <span
                        className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        Ver aula →
                    </span>
                </div>
            </div>

            {/* Hover border accent */}
            <div
                className="h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: 'var(--color-accent)' }}
            />
        </div>
    )
}

