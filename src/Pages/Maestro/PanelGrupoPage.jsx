import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Presentation, FileIcon, FileSpreadsheet, Link2, Archive, Pencil, FolderOpen, Plus, ExternalLink, Download, Upload, X } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Tabs from '../../Components/UI/Tabs'
import Badge from '../../Components/UI/Badge'
import Avatar from '../../Components/UI/Avatar'
import ModalBase from '../../Components/UI/ModalBase'
import { gruposService } from '../../Services/gruposService'
import { materialesService } from '../../Services/materialesService'
import { publicacionesService } from '../../Services/publicacionesService'
import { comentariosService } from '../../Services/comentariosService'
import { tareasService } from '../../Services/tareasService'
import { usersService } from '../../Services/usersService'
import { uploadService } from '../../Services/uploadService'
import { useAuth } from '../../Context/AuthContext'

const FILE_ICONS = { pdf: <FileText size={20} />, pptx: <Presentation size={20} />, docx: <FileIcon size={20} />, xlsx: <FileSpreadsheet size={20} />, link: <Link2 size={20} />, zip: <Archive size={20} /> }

export default function PanelGrupoPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [grupo, setGrupo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('canal')
    const [avisoTitulo, setAvisoTitulo] = useState('')
    const [avisoTexto, setAvisoTexto] = useState('')
    const [feed, setFeed] = useState([])
    const [comentariosMap, setComentariosMap] = useState({})
    const [inputs, setInputs] = useState({})
    const [materiales, setMateriales] = useState([])
    const [tareasList, setTareasList] = useState([])
    const [alumnosList, setAlumnosList] = useState([])
    const [matModalOpen, setMatModalOpen] = useState(false)
    const [matForm, setMatForm] = useState({ tipo: 'link', nombre: '', descripcion: '', url: '' })
    const [matFile, setMatFile] = useState(null)
    const [matError, setMatError] = useState('')
    const fileInputRef = useRef(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const grupoData = await gruposService.getById(id)
                setGrupo(grupoData)

                const [matsData, pubsData, tareasData] = await Promise.all([
                    materialesService.getAll(),
                    publicacionesService.getAll(),
                    tareasService.getAll(),
                ])
                const mats = Array.isArray(matsData) ? matsData : matsData.results ?? []
                setMateriales(mats.filter(m => String(m.grupo) === String(id)))

                const pubs = Array.isArray(pubsData) ? pubsData : pubsData.results ?? []
                const pubsGrupo = pubs.filter(p => String(p.grupo) === String(id))
                setFeed(pubsGrupo)

                // Load comments for each publication
                const comsData = await comentariosService.getAll()
                const coms = Array.isArray(comsData) ? comsData : comsData.results ?? []
                const comsMap = {}
                pubsGrupo.forEach(p => {
                    comsMap[p.id] = coms.filter(c => String(c.publicacion) === String(p.id))
                })
                setComentariosMap(comsMap)

                const tars = Array.isArray(tareasData) ? tareasData : tareasData.results ?? []
                setTareasList(tars.filter(t => String(t.grupo) === String(id)))

                // Load student details
                if (grupoData.alumnos?.length) {
                    const usersData = await usersService.getAll()
                    const users = Array.isArray(usersData) ? usersData : usersData.results ?? []
                    setAlumnosList(users.filter(u => grupoData.alumnos.includes(u.id)))
                }
            } catch (err) {
                console.error('Error cargando panel de grupo:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    async function postAviso() {
        if (!avisoTexto.trim()) return
        try {
            const nueva = await publicacionesService.create({
                grupo: id,
                titulo: avisoTitulo.trim() || null,
                texto: avisoTexto.trim(),
            })
            setFeed(prev => [nueva, ...prev])
            setComentariosMap(prev => ({ ...prev, [nueva.id]: [] }))
            setAvisoTitulo('')
            setAvisoTexto('')
        } catch (err) {
            console.error('Error publicando aviso:', err)
        }
    }

    async function handleComment(pubId) {
        const texto = (inputs[pubId] || '').trim()
        if (!texto) return
        try {
            const nuevo = await comentariosService.create({
                publicacion: pubId,
                texto,
            })
            setComentariosMap(prev => ({ ...prev, [pubId]: [...(prev[pubId] || []), nuevo] }))
            setInputs(prev => ({ ...prev, [pubId]: '' }))
        } catch (err) {
            console.error('Error publicando comentario:', err)
        }
    }

    function openMatModal() {
        setMatForm({ tipo: 'link', nombre: '', descripcion: '', url: '' })
        setMatFile(null)
        setMatError('')
        setMatModalOpen(true)
    }

    function handleMatFileChange(e) {
        const f = e.target.files?.[0]
        if (!f) return
        if (f.size > 30 * 1024 * 1024) { setMatError('El archivo no puede superar 30 MB'); return }
        setMatError('')
        setMatFile(f)
        if (!matForm.nombre.trim()) {
            setMatForm(p => ({ ...p, nombre: f.name }))
        }
        const ext = f.name.split('.').pop().toLowerCase()
        const tipoMap = { pdf: 'pdf', pptx: 'pptx', ppt: 'pptx', docx: 'docx', doc: 'docx', xlsx: 'xlsx', xls: 'xlsx', zip: 'zip' }
        if (tipoMap[ext]) setMatForm(p => ({ ...p, tipo: tipoMap[ext] }))
    }

    async function handleAddMaterial() {
        if (!matForm.nombre.trim()) { setMatError('El título es requerido'); return }
        if (matForm.tipo === 'link' && !matForm.url.trim()) { setMatError('La URL es requerida'); return }
        if (matForm.tipo !== 'link' && !matFile) { setMatError('Selecciona un archivo'); return }
        try {
            let archivoUrl
            if (matFile) {
                const uploadRes = await uploadService.upload(matFile)
                archivoUrl = uploadRes.url ?? uploadRes.archivo
            }
            const nuevo = await materialesService.create({
                grupo: id,
                tipo: matForm.tipo,
                nombre: matForm.nombre.trim(),
                descripcion: matForm.descripcion.trim(),
                url: matForm.tipo === 'link' ? matForm.url.trim() : archivoUrl,
            })
            setMateriales(prev => [nuevo, ...prev])
            setMatModalOpen(false)
        } catch (err) {
            setMatError('Error al subir material. Intenta de nuevo.')
            console.error(err)
        }
    }

    return (
        <TeacherShell>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 text-sm">Cargando grupo…</p>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-5">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <button
                                onClick={() => navigate('/maestro/grupos')}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#E43D12] transition-colors mb-2"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                                Mis Grupos
                            </button>
                            <h1 className="text-2xl font-bold text-[#3d3d3d]">{grupo?.materia ?? '—'}</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Grupo {grupo?.clave ?? '—'} · {grupo?.alumnos?.length ?? 0} alumnos</p>
                        </div>
                        <button
                            onClick={() => navigate(`/maestro/grupos/${id}/calificacion`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                        >
                            <Pencil size={14} className="inline" /> Calificar
                        </button>
                    </div>

                    {/* Tabs */}
                    <Tabs
                        tabs={[
                            { key: 'canal', label: 'Canal' },
                            { key: 'tareas', label: 'Tareas' },
                            { key: 'materiales', label: 'Materiales' },
                            { key: 'alumnos', label: `Alumnos (${grupo?.alumnos?.length ?? 0})` },
                        ]}
                        active={tab}
                        onChange={setTab}
                    />

                    {/* ── TAB CANAL ── */}
                    {tab === 'canal' && (
                        <div className="space-y-5">
                            {/* Publicar aviso */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar name="Dr. Martínez" size="md" variant="secondary" />
                                    <input
                                        type="text"
                                        value={avisoTitulo}
                                        onChange={e => setAvisoTitulo(e.target.value)}
                                        placeholder="Título del aviso (opcional)"
                                        className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                        style={{ backgroundColor: 'var(--color-background)' }}
                                        onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                        onBlur={e => e.target.style.borderColor = 'transparent'}
                                    />
                                </div>
                                <textarea
                                    rows={3}
                                    value={avisoTexto}
                                    onChange={e => setAvisoTexto(e.target.value)}
                                    placeholder="Escribe un aviso o anuncio para el grupo…"
                                    className="w-full text-sm px-4 py-3 rounded-xl border-2 border-transparent outline-none transition-colors resize-none"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) postAviso() }}
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-400">Ctrl + Enter para publicar</p>
                                    <button
                                        onClick={postAviso}
                                        disabled={!avisoTexto.trim()}
                                        className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                    >Publicar</button>
                                </div>
                            </div>

                            {/* Feed */}
                            {feed.map(p => (
                                <div key={p.id} className="space-y-3">
                                    {/* Burbuja principal */}
                                    <div className="flex gap-3">
                                        <Avatar name={p.autor} size="md" variant={p.esDocente ? 'secondary' : 'default'} />
                                        <div className="flex-1">
                                            <div className="bg-[#EBE9E1] rounded-2xl rounded-tl-none p-4">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>{p.autor}</p>
                                                    {p.esDocente && (
                                                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: 'var(--color-secondary)' }}>Docente</span>
                                                    )}
                                                    <p className="text-xs text-gray-400 ml-auto">{p.tiempo}</p>
                                                </div>
                                                {p.titulo && (
                                                    <p className="text-sm font-bold text-[#3d3d3d] mb-1">{p.titulo}</p>
                                                )}
                                                <p className="text-sm text-gray-600 leading-relaxed">{p.texto}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comentarios */}
                                    {(comentariosMap[p.id] || []).length > 0 && (
                                        <div className="ml-12 space-y-2">
                                            {(comentariosMap[p.id] || []).map(c => (
                                                <div key={c.id} className="flex gap-2">
                                                    <Avatar name={c.autor} size="sm" />
                                                    <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 flex-1 shadow-sm">
                                                        <p className="text-xs font-semibold text-gray-500">{c.autor} · {c.tiempo}</p>
                                                        <p className="text-sm text-[#3d3d3d] mt-0.5">{c.texto}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input comentario */}
                                    <div className="ml-12 flex gap-2">
                                        <Avatar name="Dr. Martínez" size="sm" variant="secondary" />
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={inputs[p.id] || ''}
                                                onChange={e => setInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && handleComment(p.id)}
                                                placeholder="Escribe un comentario…"
                                                className="flex-1 text-sm px-4 py-2 rounded-full bg-[#EBE9E1] outline-none border-2 border-transparent focus:border-[#FFA2B6] transition-colors"
                                            />
                                            <button
                                                onClick={() => handleComment(p.id)}
                                                className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 flex-shrink-0"
                                                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                            >Enviar</button>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── TAB TAREAS ── */}
                    {tab === 'tareas' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => navigate(`/maestro/grupos/${id}/crear-tarea`)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                >
                                    <Plus size={14} className="inline" /> Crear Nueva Tarea
                                </button>
                            </div>

                            {tareasList.map(t => {
                                const total = grupo?.alumnos?.length ?? 0
                                const pct = total > 0 ? Math.round(((t.calificadas ?? 0) / total) * 100) : 0
                                return (
                                    <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-[#3d3d3d]">{t.titulo}</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">{t.descripcion}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs text-gray-400">Entrega límite</p>
                                                <p className="text-xs font-semibold text-[#3d3d3d]">
                                                    {new Date(t.fechaLimite ?? t.fecha_limite).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : 'var(--color-primary)' }}
                                                />
                                            </div>
                                            <p className="text-xs font-semibold text-[#3d3d3d] flex-shrink-0">
                                                {t.calificadas ?? 0}/{total} calificadas
                                            </p>
                                            {(t.entregas ?? 0) > (t.calificadas ?? 0) && (
                                                <Badge variant="warning">{(t.entregas ?? 0) - (t.calificadas ?? 0)} pendientes</Badge>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* ── MODAL SUBIR MATERIAL ── */}
                    <ModalBase isOpen={matModalOpen} onClose={() => setMatModalOpen(false)} title="Subir material" icon={<FolderOpen size={18} />} maxWidth="max-w-md">
                        <div className="space-y-4 px-1">
                            {/* Tipo */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Tipo de material</label>
                                <select
                                    value={matForm.tipo}
                                    onChange={e => { setMatForm(p => ({ ...p, tipo: e.target.value })); setMatFile(null); setMatError('') }}
                                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none border-2 border-transparent transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                >
                                    <option value="link">Enlace web</option>
                                    <option value="pdf">PDF</option>
                                    <option value="pptx">Presentación (.pptx)</option>
                                    <option value="docx">Documento (.docx)</option>
                                    <option value="xlsx">Hoja de cálculo (.xlsx)</option>
                                    <option value="zip">Comprimido (.zip)</option>
                                </select>
                            </div>

                            {/* Archivo o URL */}
                            {matForm.tipo === 'link' ? (
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 block mb-1">URL *</label>
                                    <input
                                        type="url"
                                        value={matForm.url}
                                        onChange={e => { setMatForm(p => ({ ...p, url: e.target.value })); setMatError('') }}
                                        placeholder="https://"
                                        className="w-full text-sm px-3 py-2.5 rounded-xl outline-none border-2 border-transparent transition-colors"
                                        style={{ backgroundColor: 'var(--color-background)' }}
                                        onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                        onBlur={e => e.target.style.borderColor = 'transparent'}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 block mb-1">Archivo *</label>
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleMatFileChange}
                                        accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls,.zip" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-colors text-sm"
                                        style={{
                                            borderColor: matFile ? '#10b98160' : '#d1d5db',
                                            background: matFile ? '#10b98108' : 'var(--color-background)',
                                            color: matFile ? '#059669' : '#9ca3af',
                                        }}
                                    >
                                        {matFile ? (
                                            <>
                                                <span className="text-2xl">{FILE_ICONS[matForm.tipo] ?? <FileIcon size={20} />}</span>
                                                <span className="font-semibold text-[#3d3d3d] text-center break-all px-2">{matFile.name}</span>
                                                <span className="text-xs text-gray-400">
                                                    {matFile.size > 1024 * 1024
                                                        ? `${(matFile.size / (1024 * 1024)).toFixed(1)} MB`
                                                        : `${Math.round(matFile.size / 1024)} KB`}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-2xl"><Upload size={24} /></span>
                                                <span>Haz clic para seleccionar un archivo</span>
                                                <span className="text-xs">Máx. 30 MB</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Título */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Título *</label>
                                <input
                                    type="text"
                                    value={matForm.nombre}
                                    onChange={e => { setMatForm(p => ({ ...p, nombre: e.target.value })); setMatError('') }}
                                    placeholder="Nombre que verán los alumnos"
                                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none border-2 border-transparent transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Descripción (opcional)</label>
                                <input
                                    type="text"
                                    value={matForm.descripcion}
                                    onChange={e => setMatForm(p => ({ ...p, descripcion: e.target.value }))}
                                    placeholder="Breve descripción del material"
                                    className="w-full text-sm px-3 py-2.5 rounded-xl outline-none border-2 border-transparent transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            </div>

                            {matError && <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>✗ {matError}</p>}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setMatModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                                >Cancelar</button>
                                <button
                                    type="button"
                                    onClick={handleAddMaterial}
                                    className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                >Subir</button>
                            </div>
                        </div>
                    </ModalBase>

                    {/* ── TAB MATERIALES ── */}
                    {tab === 'materiales' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={openMatModal}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                >
                                    <Plus size={14} className="inline" /> Subir material
                                </button>
                            </div>

                            {/* Lista */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {materiales.length === 0 ? (
                                    <div className="text-center py-14 text-gray-400">
                                        <p className="text-3xl mb-2"><FolderOpen size={32} className="mx-auto text-gray-300" /></p>
                                        <p className="text-sm">No hay materiales aún</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {materiales.map(m => (
                                            <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                                    style={{ background: m.tipo === 'link' ? '#E43D1212' : '#EBE9E1' }}
                                                >
                                                    {FILE_ICONS[m.tipo] ?? <FileIcon size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#3d3d3d] truncate">{m.nombre}</p>
                                                    {m.descripcion && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.descripcion}</p>}
                                                    <p className="text-xs text-gray-300 mt-0.5">{m.fecha}{m.tamaño ? ` · ${m.tamaño}` : ''}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                                                        style={{ background: '#E43D1210', color: 'var(--color-primary)' }}
                                                    >{m.tipo === 'link' ? <><ExternalLink size={12} className="inline" /> Abrir</> : <><Download size={12} className="inline" /> Ver</>}</button>
                                                    <button
                                                        onClick={() => setMateriales(prev => prev.filter(x => x.id !== m.id))}
                                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    ><X size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── TAB ALUMNOS ── */}
                    {tab === 'alumnos' && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Alumno</th>
                                            <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Entregadas</th>
                                            <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Pendientes</th>
                                            <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Promedio</th>
                                            <th className="px-4 py-3.5" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {alumnosList.map(a => {
                                            const nombre = a.nombre ?? (`${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || '—')
                                            return (
                                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar name={nombre} size="sm" />
                                                            <div>
                                                                <p className="font-semibold text-[#3d3d3d]">{nombre}</p>
                                                                <p className="text-xs text-gray-400">{a.matricula ?? a.email ?? '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="font-semibold text-[#3d3d3d]">{a.entregadas ?? 0}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        {(a.pendientes ?? 0) > 0
                                                            ? <Badge variant="warning">{a.pendientes}</Badge>
                                                            : <span className="text-xs font-semibold text-emerald-500">✓ Al día</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span
                                                            className="text-base font-black"
                                                            style={{ color: (a.promedio ?? 0) >= 9 ? '#10b981' : (a.promedio ?? 0) >= 7 ? 'var(--color-warning)' : 'var(--color-primary)' }}
                                                        >
                                                            {(a.promedio ?? 0).toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button
                                                            onClick={() => navigate(`/maestro/grupos/${id}/calificacion?alumno=${a.id}`)}
                                                            className="text-xs font-semibold transition-colors hover:underline"
                                                            style={{ color: 'var(--color-primary)' }}
                                                        >
                                                            Ver entregas
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </TeacherShell>
    )
}
