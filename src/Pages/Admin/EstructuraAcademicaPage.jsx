import { useState, useMemo, useEffect } from 'react'
import { Calendar, BookOpen, School, Plus, Trash2, Pencil, GraduationCap, AlertTriangle, Check, Search, Link2, X } from 'lucide-react'
import AdminShell from '../../Components/Layout/AdminShell'
import Tabs from '../../Components/UI/Tabs'
import Badge from '../../Components/UI/Badge'
import PageHeader from '../../Components/UI/PageHeader'
import ModalBase from '../../Components/UI/ModalBase'
import FormField from '../../Components/UI/FormField'
import { ciclosService } from '../../Services/ciclosService'
import { materiasService } from '../../Services/materiasService'
import { gruposService } from '../../Services/gruposService'
import { usersService } from '../../Services/usersService'
import { inscripcionesService } from '../../Services/inscripcionesService'
import { useToast } from '../../Context/ToastContext'

const TAB_LIST = [
    { key: 'ciclos', label: 'Ciclos' },
    { key: 'materias', label: 'Materias' },
    { key: 'grupos', label: 'Grupos y Asignaciones' },
]

export default function EstructuraAcademicaPage() {
    const [tab, setTab] = useState('ciclos')
    const [allUsers, setAllUsers] = useState([])
    const [ciclos, setCiclos] = useState([])
    const [materias, setMaterias] = useState([])
    const [grupos, setGrupos] = useState([])

    const DOCENTES = useMemo(() => allUsers.filter(u => u.rol === 'docente'), [allUsers])
    const ALUMNOS = useMemo(() => allUsers.filter(u => u.rol === 'alumno'), [allUsers])

    useEffect(() => {
        async function load() {
            try {
                const [u, c, m, g] = await Promise.all([
                    usersService.getAll(),
                    ciclosService.getAll(),
                    materiasService.getAll(),
                    gruposService.getAll(),
                ])
                setAllUsers(Array.isArray(u) ? u : u.results ?? [])
                setCiclos(Array.isArray(c) ? c : c.results ?? [])
                setMaterias(Array.isArray(m) ? m : m.results ?? [])
                setGrupos(Array.isArray(g) ? g : g.results ?? [])
            } catch (err) {
                console.error('Error cargando estructura:', err)
            }
        }
        load()
    }, [])

    return (
        <AdminShell>
            <div className="space-y-5 max-w-5xl mx-auto">
                <PageHeader
                    title="Estructura Académica"
                    subtitle="Gestiona ciclos, materias y asignaciones de grupos"
                />

                <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />

                {tab === 'ciclos' && <TabCiclos ciclos={ciclos} setCiclos={setCiclos} />}
                {tab === 'materias' && <TabMaterias materias={materias} setMaterias={setMaterias} ciclos={ciclos} />}
                {tab === 'grupos' && <TabGrupos grupos={grupos} setGrupos={setGrupos} materias={materias} ciclos={ciclos} DOCENTES={DOCENTES} ALUMNOS={ALUMNOS} />}
            </div>
        </AdminShell>
    )
}

// ─── TAB CICLOS ───────────────────────────────────────────────────────────────
function TabCiclos({ ciclos, setCiclos }) {
    const { addToast } = useToast()
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' })
    const [errors, setErrors] = useState({})

    async function toggleActivo(id) {
        const c = ciclos.find(x => x.id === id)
        try {
            await ciclosService.patch(id, { activo: true })
            setCiclos(prev => prev.map(x => ({ ...x, activo: x.id === id })))
            addToast(`Ciclo "${c?.nombre}" activado`)
        } catch (err) {
            addToast('Error al activar ciclo', 'error')
        }
    }

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = {}
        if (!form.nombre.trim()) errs.nombre = 'El nombre del ciclo es requerido'
        if (!form.fecha_inicio) errs.fecha_inicio = 'Fecha de inicio requerida'
        if (!form.fecha_fin) errs.fecha_fin = 'Fecha de fin requerida'
        if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio >= form.fecha_fin) errs.fecha_fin = 'La fecha fin debe ser posterior al inicio'
        if (Object.keys(errs).length) { setErrors(errs); return }
        try {
            const nuevo = await ciclosService.create({ ...form, activo: false })
            setCiclos(prev => [...prev, nuevo])
            setModal(false)
            setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' })
            addToast('Ciclo creado correctamente')
        } catch (err) {
            addToast('Error al crear ciclo', 'error')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                ><Plus size={14} className="inline" /> Nuevo Ciclo</button>
            </div>

            <div className="space-y-3">
                {ciclos.map(c => (
                    <div
                        key={c.id}
                        className={`bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all ${c.activo ? 'ring-2' : ''}`}
                        style={c.activo ? { ringColor: 'var(--color-primary)' } : {}}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                style={{ background: c.activo ? '#E43D1218' : '#f3f4f6' }}
                            >
                                <Calendar size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-[#3d3d3d]">{c.nombre}</p>
                                    {c.activo && <Badge variant="primary">Activo</Badge>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(c.fecha_inicio + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {' → '}
                                    {new Date(c.fecha_fin + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleActivo(c.id)}
                            disabled={c.activo}
                            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-40"
                            style={c.activo
                                ? { background: '#dcfce7', color: '#16a34a' }
                                : { background: '#E43D1210', color: 'var(--color-primary)' }
                            }
                        >
                            {c.activo ? <><Check size={14} className="inline" /> Activo</> : 'Activar'}
                        </button>
                    </div>
                ))}
            </div>

            <ModalBase isOpen={modal} onClose={() => setModal(false)} title="Nuevo Ciclo" icon={<Calendar size={18} />} maxWidth="max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Nombre del ciclo" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej. Agosto – Diciembre 2026" />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Fecha de inicio" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} error={errors.fecha_inicio} type="date" />
                        <FormField label="Fecha de fin" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} error={errors.fecha_fin} type="date" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Crear</button>
                    </div>
                </form>
            </ModalBase>
        </div>
    )
}

// ─── TAB MATERIAS ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set(['la', 'el', 'los', 'las', 'de', 'del', 'a', 'en', 'e', 'y', 'o', 'al', 'un', 'una', 'por', 'para', 'con'])

function buildClave(nombre, materias) {
    if (!nombre.trim()) return ''
    const words = nombre.trim().toLowerCase().split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w))
    let prefix
    if (words.length === 0) {
        prefix = nombre.trim().slice(0, 3).toUpperCase()
    } else if (words.length === 1) {
        prefix = words[0].slice(0, 3).toUpperCase()
    } else if (words.length === 2) {
        prefix = (words[0].slice(0, 2) + words[1][0]).toUpperCase()
    } else {
        prefix = words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
    }
    const used = materias.filter(m => m.clave.startsWith(prefix + '-')).length
    const num = String(100 + (used + 1) * 5).padStart(3, '0')
    return `${prefix}-${num}`
}

function TabMaterias({ materias, setMaterias, ciclos }) {
    const { addToast } = useToast()
    const [cicloFiltro, setCicloFiltro] = useState(String(ciclos.find(c => c.activo)?.id ?? ''))
    const [modal, setModal] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [form, setForm] = useState({ clave: '', nombre: '', ciclo: '' })
    const [claveManual, setClaveManual] = useState(false)
    const [errors, setErrors] = useState({})

    const activoId = ciclos.find(c => c.activo)?.id ?? null

    const displayed = cicloFiltro
        ? materias.filter(m => String(m.ciclo) === cicloFiltro)
        : materias

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => {
            const next = { ...prev, [name]: value }
            if (name === 'nombre' && !claveManual) {
                next.clave = buildClave(value, materias)
            }
            return next
        })
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    function handleClaveChange(e) {
        setClaveManual(e.target.value !== '')
        handleChange(e)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = {}
        if (!form.clave.trim()) errs.clave = 'La clave es requerida'
        if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
        if (!form.ciclo) errs.ciclo = 'Selecciona un ciclo'
        if (Object.keys(errs).length) { setErrors(errs); return }
        try {
            const nueva = await materiasService.create({
                clave: form.clave.trim().toUpperCase(),
                nombre: form.nombre.trim(),
                ciclo: parseInt(form.ciclo, 10),
            })
            setMaterias(prev => [...prev, nueva])
            setModal(false)
            setForm({ clave: '', nombre: '', ciclo: '' })
            setClaveManual(false)
            addToast('Materia creada correctamente')
        } catch (err) {
            addToast('Error al crear materia', 'error')
        }
    }

    async function handleDelete() {
        const m = materias.find(x => x.id === deleteId)
        try {
            await materiasService.remove(deleteId)
            setMaterias(prev => prev.filter(x => x.id !== deleteId))
            setDeleteId(null)
            addToast(`Materia "${m?.nombre}" eliminada`, 'warning')
        } catch (err) {
            addToast('Error al eliminar materia', 'error')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <select
                    value={cicloFiltro}
                    onChange={e => setCicloFiltro(e.target.value)}
                    className="text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors bg-white"
                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                >
                    <option value="">Todos los ciclos</option>
                    {ciclos.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.nombre}{c.activo ? ' (Activo)' : ''}</option>
                    ))}
                </select>
                <button
                    onClick={() => { setForm(f => ({ ...f, ciclo: String(activoId ?? '') })); setModal(true) }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                ><BookOpen size={14} className="inline" /> Nueva Materia</button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayed.map(m => {
                    const ciclo = ciclos.find(c => c.id === m.ciclo)
                    return (
                        <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <code className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#E43D1210', color: 'var(--color-primary)' }}>{m.clave}</code>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setDeleteId(m.id)}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors text-xs"
                                        title="Eliminar"
                                    ><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-[#3d3d3d] leading-snug">{m.nombre}</p>
                            <p className="text-xs text-gray-400 truncate">{ciclo?.nombre ?? '—'}</p>
                        </div>
                    )
                })}
                {displayed.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                        <p className="text-2xl mb-2"><BookOpen size={28} className="mx-auto text-gray-300" /></p>
                        <p className="text-sm">No hay materias para este ciclo</p>
                    </div>
                )}
            </div>

            <ModalBase isOpen={modal} onClose={() => setModal(false)} title="Nueva Materia" icon={<BookOpen size={18} />} maxWidth="max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-gray-500">Clave institucional</label>
                            {!claveManual && form.clave && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: '#10b98118', color: '#059669' }}>Auto ✦</span>
                            )}
                        </div>
                        <input
                            name="clave"
                            value={form.clave}
                            onChange={handleClaveChange}
                            placeholder="Se genera automáticamente"
                            maxLength={10}
                            className="w-full text-sm px-3 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors font-mono"
                            style={{ backgroundColor: 'var(--color-background)', borderColor: errors.clave ? 'var(--color-primary)' : undefined }}
                            onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                            onBlur={e => e.target.style.borderColor = errors.clave ? 'var(--color-primary)' : 'transparent'}
                        />
                        {errors.clave && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}><X size={12} className="inline" /> {errors.clave}</p>}
                    </div>
                    <FormField label="Nombre de la materia" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej. Programación Orientada a Objetos" />
                    <FormField
                        label="Ciclo"
                        name="ciclo"
                        value={form.ciclo}
                        onChange={handleChange}
                        error={errors.ciclo}
                        type="select"
                        options={[{ value: '', label: '— Seleccionar ciclo —' }, ...ciclos.map(c => ({ value: String(c.id), label: c.nombre + (c.activo ? ' (Activo)' : '') }))]}
                    />
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Guardar</button>
                    </div>
                </form>
            </ModalBase>

            {/* Confirmar eliminar materia */}
            <ModalBase isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar Materia" icon={<Trash2 size={18} />} iconBg="#fee2e2" maxWidth="max-w-xs">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 leading-relaxed">
                        ¿Eliminar esta materia? Los grupos que la usen perderán la referencia.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button onClick={handleDelete} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Eliminar</button>
                    </div>
                </div>
            </ModalBase>
        </div>
    )
}

// ─── TAB GRUPOS Y ASIGNACIONES ────────────────────────────────────────────────
function TabGrupos({ grupos, setGrupos, materias, ciclos, DOCENTES, ALUMNOS }) {
    const { addToast } = useToast()
    const [modal, setModal] = useState(false)
    const [deleteGrupoId, setDeleteGrupoId] = useState(null)
    const [enrollModal, setEnrollModal] = useState(null)
    const [enrollSearch, setEnrollSearch] = useState('')
    const [enrollSelected, setEnrollSelected] = useState(new Set())
    const [enrollTab, setEnrollTab] = useState('buscar')
    const [copied, setCopied] = useState('')
    const [form, setForm] = useState({ nombre: '', materia: '', docente: '', ciclo: '' })
    const [errors, setErrors] = useState({})

    const activoCiclo = ciclos.find(c => c.activo)

    // ── alumnos elegibles para el grupo en enroll modal ──────────────────────
    const enrollGrupo = grupos.find(g => g.id === enrollModal) ?? null

    const eligibleAlumnos = useMemo(() => {
        if (!enrollGrupo) return []
        return ALUMNOS.filter(a => {
            if ((enrollGrupo.alumnos ?? []).includes(a.id)) return false
            const conflicto = grupos.some(g =>
                g.id !== enrollGrupo.id &&
                g.materia === enrollGrupo.materia &&
                g.cicloId === enrollGrupo.cicloId &&
                (g.alumnos ?? []).includes(a.id)
            )
            return !conflicto
        })
    }, [enrollGrupo, grupos, ALUMNOS])

    const filteredEligible = eligibleAlumnos.filter(a =>
        a.nombre.toLowerCase().includes(enrollSearch.toLowerCase()) ||
        (a.matricula ?? '').toLowerCase().includes(enrollSearch.toLowerCase())
    )

    function openEnrollModal(grupoId) {
        setEnrollModal(grupoId)
        setEnrollSearch('')
        setEnrollSelected(new Set())
        setEnrollTab('buscar')
        setCopied('')
    }

    function toggleSelect(id) {
        setEnrollSelected(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    async function handleInscribir() {
        const ids = [...enrollSelected]
        try {
            await Promise.all(ids.map(alumno =>
                inscripcionesService.create({
                    alumno,
                    grupo: enrollModal,
                    materia: enrollGrupo?.materia,
                    ciclo: enrollGrupo?.cicloId,
                })
            ))
            setGrupos(prev => prev.map(g =>
                g.id === enrollModal ? { ...g, alumnos: [...(g.alumnos ?? []), ...ids] } : g
            ))
            const n = ids.length
            addToast(`${n} alumno${n !== 1 ? 's' : ''} inscrito${n !== 1 ? 's' : ''} en ${enrollGrupo?.nombre}`)
            setEnrollModal(null)
        } catch (err) {
            addToast('Error al inscribir alumnos', 'error')
        }
    }

    async function handleCopy(text, key) {
        await navigator.clipboard.writeText(text)
        setCopied(key)
        setTimeout(() => setCopied(k => k === key ? '' : k), 2000)
    }

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = {}
        if (!form.nombre.trim()) errs.nombre = 'Nombre requerido'
        if (!form.materia) errs.materia = 'Selecciona una materia'
        if (!form.docente) errs.docente = 'Selecciona un docente'
        if (!form.ciclo) errs.ciclo = 'Selecciona un ciclo'
        if (Object.keys(errs).length) { setErrors(errs); return }
        const nombre = form.nombre.trim()
        try {
            const nuevo = await gruposService.create({
                nombre,
                materia: parseInt(form.materia, 10),
                docente: parseInt(form.docente, 10),
                ciclo: parseInt(form.ciclo, 10),
            })
            setGrupos(prev => [...prev, nuevo])
            setModal(false)
            setForm({ nombre: '', materia: '', docente: '', ciclo: '' })
            addToast(`Grupo ${nombre} creado`)
        } catch (err) {
            addToast('Error al crear grupo', 'error')
        }
    }

    async function handleDeleteGrupo() {
        const g = grupos.find(x => x.id === deleteGrupoId)
        try {
            await gruposService.remove(deleteGrupoId)
            setGrupos(prev => prev.filter(x => x.id !== deleteGrupoId))
            setDeleteGrupoId(null)
            addToast(`Grupo "${g?.nombre}" eliminado`, 'warning')
        } catch (err) {
            addToast('Error al eliminar grupo', 'error')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => { setForm(f => ({ ...f, ciclo: String(activoCiclo?.id ?? '') })); setModal(true) }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                ><School size={14} className="inline" /> Nuevo Grupo</button>
            </div>

            <div className="space-y-3">
                {grupos.map(g => (
                    <div key={g.id} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-black text-base text-[#3d3d3d]">{g.nombre}</span>
                                    <span className="text-xs text-gray-400">·</span>
                                    <span className="text-sm text-gray-600">{g.materia_nombre}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{g.docente_nombre}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => openEnrollModal(g.id)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                    style={{ background: '#FFA2B615', color: 'var(--color-secondary)' }}
                                ><GraduationCap size={14} className="inline" /> Inscribir</button>
                                <button
                                    onClick={() => setDeleteGrupoId(g.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors text-xs"
                                    title="Eliminar grupo"
                                ><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                            {g.alumnos?.length ?? 0} alumno{(g.alumnos?.length ?? 0) !== 1 ? 's' : ''} inscrito{(g.alumnos?.length ?? 0) !== 1 ? 's' : ''}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Nuevo Grupo */}
            <ModalBase isOpen={modal} onClose={() => setModal(false)} title="Nuevo Grupo" icon={<School size={18} />} maxWidth="max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Nombre del grupo" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej. G41A" />
                    <FormField
                        label="Ciclo"
                        name="ciclo"
                        value={form.ciclo}
                        onChange={handleChange}
                        error={errors.ciclo}
                        type="select"
                        options={[{ value: '', label: '— Seleccionar —' }, ...ciclos.map(c => ({ value: String(c.id), label: c.nombre + (c.activo ? ' (Activo)' : '') }))]}
                    />
                    <FormField
                        label="Materia"
                        name="materia"
                        value={form.materia}
                        onChange={handleChange}
                        error={errors.materia}
                        type="select"
                        options={[{ value: '', label: '— Seleccionar —' }, ...materias.map(m => ({ value: String(m.id), label: `${m.clave} – ${m.nombre}` }))]}
                    />
                    <FormField
                        label="Docente responsable"
                        name="docente"
                        value={form.docente}
                        onChange={handleChange}
                        error={errors.docente}
                        type="select"
                        options={[{ value: '', label: '— Seleccionar —' }, ...DOCENTES.map(d => ({ value: String(d.id), label: d.nombre || d.email }))]}
                    />
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Crear Grupo</button>
                    </div>
                </form>
            </ModalBase>

            {/* Confirmar eliminar grupo */}
            <ModalBase isOpen={!!deleteGrupoId} onClose={() => setDeleteGrupoId(null)} title="Eliminar Grupo" icon={<Trash2 size={18} />} iconBg="#fee2e2" maxWidth="max-w-xs">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 leading-relaxed">
                        ¿Eliminar el grupo <strong>{grupos.find(g => g.id === deleteGrupoId)?.nombre}</strong>? Se perderán todas las inscripciones.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteGrupoId(null)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button onClick={handleDeleteGrupo} className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Eliminar</button>
                    </div>
                </div>
            </ModalBase>

            {/* Modal Smart Enrollment */}
            <ModalBase
                isOpen={!!enrollModal}
                onClose={() => setEnrollModal(null)}
                title={`Inscribir en ${enrollGrupo?.nombre ?? ''}`}
                icon={<GraduationCap size={18} />}
                maxWidth="max-w-md"
            >
                {enrollGrupo && (
                    <div className="space-y-4">
                        {/* Tab switcher */}
                        <div className="flex bg-[#EBE9E1] rounded-xl p-1">
                            <button
                                onClick={() => setEnrollTab('buscar')}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${enrollTab === 'buscar' ? 'bg-white shadow-sm text-[#3d3d3d]' : 'text-gray-500 hover:text-gray-700'}`}
                            ><Search size={14} className="inline" /> Buscar alumno</button>
                            <button
                                onClick={() => setEnrollTab('codigo')}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${enrollTab === 'codigo' ? 'bg-white shadow-sm text-[#3d3d3d]' : 'text-gray-500 hover:text-gray-700'}`}
                            ><Link2 size={14} className="inline" /> Código de acceso</button>
                        </div>

                        {enrollTab === 'buscar' && (
                            <div className="space-y-3">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></span>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o matrícula…"
                                        value={enrollSearch}
                                        onChange={e => setEnrollSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-[#EBE9E1] outline-none border-2 border-transparent focus:border-[#FFA2B6] transition-colors"
                                    />
                                </div>

                                <p className="text-xs text-gray-400">
                                    <span className="font-semibold text-[#3d3d3d]">{filteredEligible.length}</span> disponibles ·{' '}
                                    <span className="font-semibold text-[#3d3d3d]">{ALUMNOS.length - eligibleAlumnos.length}</span> ya inscritos o con conflicto
                                </p>

                                <div className="max-h-52 overflow-y-auto space-y-0.5 rounded-xl border border-gray-100 p-1.5">
                                    {filteredEligible.map(a => (
                                        <label
                                            key={a.id}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#EBE9E1] cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={enrollSelected.has(a.id)}
                                                onChange={() => toggleSelect(a.id)}
                                                className="rounded accent-[#E43D12] w-4 h-4 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#3d3d3d] leading-none">{a.nombre}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{a.matricula ?? `ID ${a.id}`}</p>
                                            </div>
                                        </label>
                                    ))}
                                    {filteredEligible.length === 0 && (
                                        <p className="text-center text-xs text-gray-400 py-6">Sin alumnos disponibles</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => setEnrollModal(null)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                                    <button
                                        onClick={handleInscribir}
                                        disabled={enrollSelected.size === 0}
                                        className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                    >Inscribir ({enrollSelected.size})</button>
                                </div>
                            </div>
                        )}

                        {enrollTab === 'codigo' && (
                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Comparte este código con los alumnos. Pueden usarlo para unirse al grupo sin que tengas que buscarlos uno a uno.
                                </p>

                                {/* Código grande */}
                                <div className="bg-[#EBE9E1] rounded-2xl p-5 text-center space-y-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Código de grupo</p>
                                    <p className="text-4xl font-black tracking-[0.25em] text-[#3d3d3d] font-mono select-all">
                                        {enrollGrupo.codigo ?? ''}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(enrollGrupo.codigo ?? '', 'code')}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                                        style={{ background: copied === 'code' ? '#16a34a15' : '#E43D1215', color: copied === 'code' ? '#16a34a' : 'var(--color-primary)' }}
                                    >
                                        {copied === 'code' ? '✓ Copiado' : '📋 Copiar código'}
                                    </button>
                                </div>

                                {/* Enlace de invitación */}
                                <div className="rounded-xl border-2 border-gray-100 p-4 space-y-2">
                                    <p className="text-xs font-semibold text-gray-400">Enlace de invitación</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs text-gray-500 flex-1 truncate bg-[#EBE9E1] px-2 py-1.5 rounded-lg">
                                            {`https://escolar.edu.mx/unirse/${enrollGrupo.codigo ?? ''}`}
                                        </code>
                                        <button
                                            onClick={() => handleCopy(`https://escolar.edu.mx/unirse/${enrollGrupo.codigo ?? ''}`, 'link')}
                                            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                            style={{ background: copied === 'link' ? '#16a34a15' : '#E43D1215', color: copied === 'link' ? '#16a34a' : 'var(--color-primary)' }}
                                        >
                                            {copied === 'link' ? '✓' : '📋'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalBase>
        </div>
    )
}
