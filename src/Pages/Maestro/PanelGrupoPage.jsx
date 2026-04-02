import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Presentation, FileIcon, FileSpreadsheet, Link2, Archive, Pencil, FolderOpen, Plus, ExternalLink, Download, Upload, X } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Tabs from '../../Components/UI/Tabs'
import Badge from '../../Components/UI/Badge'
import Avatar from '../../Components/UI/Avatar'
import ModalBase from '../../Components/UI/ModalBase'

const GRUPO = { id: 1, materia: 'Desarrollo Web', grupo: '101', alumnos: 28 }

const MOCK_MATERIALES = [
    { id: 1, tipo: 'pdf', nombre: 'Guía de estudio – Parcial 2.pdf', descripcion: 'Temas: hooks, context API, React Router v7', fecha: '26 Mar 2026', tamaño: '2.4 MB' },
    { id: 2, tipo: 'link', nombre: 'Documentación oficial React 19', url: 'https://react.dev', descripcion: 'Referencia para el proyecto final', fecha: '20 Mar 2026' },
    { id: 3, tipo: 'pdf', nombre: 'Rúbrica Proyecto Final.pdf', descripcion: 'Criterios de evaluación y puntaje detallado', fecha: '15 Mar 2026', tamaño: '890 KB' },
    { id: 4, tipo: 'pptx', nombre: 'Presentación Clase 8 – React Router.pptx', descripcion: '', fecha: '12 Mar 2026', tamaño: '5.1 MB' },
]

const FILE_ICONS = { pdf: <FileText size={20} />, pptx: <Presentation size={20} />, docx: <FileIcon size={20} />, xlsx: <FileSpreadsheet size={20} />, link: <Link2 size={20} />, zip: <Archive size={20} /> }

const canal = [
    {
        id: 1, autor: 'Dr. Martínez', esDocente: true,
        titulo: 'Recuerden estudiar para el parcial 2',
        texto: 'Recuerden que el parcial 2 cubre los temas de React y APIs REST. Cualquier duda la resolvemos en clase.',
        tiempo: 'Hace 2h',
        comentarios: [
            { id: 1, autor: 'María López', texto: '¿El examen es en línea o presencial?', tiempo: '11:10' },
            { id: 2, autor: 'Juan Pérez', texto: 'Gracias por el aviso profe, nos preparamos.', tiempo: '11:15' },
        ]
    },
    {
        id: 2, autor: 'Dr. Martínez', esDocente: true,
        titulo: 'Material de apoyo subido',
        texto: 'Ya está disponible el PDF con los temas del segundo parcial. Recuerden repasar los hooks de React y el manejo de rutas.',
        tiempo: 'Ayer',
        comentarios: [
            { id: 3, autor: 'Ana García', texto: '¡Muchas gracias! Muy claro el material.', tiempo: 'Ayer' },
        ]
    },
]

const tareas = [
    { id: 1, titulo: 'Proyecto Final React', descripcion: 'Desarrollar una SPA completa con React y consumo de API.', fechaLimite: '2026-04-10', entregas: 18, total: 28, calificadas: 5 },
    { id: 2, titulo: 'Maquetado responsive', descripcion: 'Landing page con Tailwind CSS.', fechaLimite: '2026-03-30', entregas: 25, total: 28, calificadas: 25 },
    { id: 3, titulo: 'Integración con Firebase', descripcion: 'CRUD con autenticación.', fechaLimite: '2026-04-20', entregas: 8, total: 28, calificadas: 0 },
]

const alumnos = [
    { id: 1, nombre: 'María López', matricula: '20230001', entregadas: 5, pendientes: 1, promedio: 9.2 },
    { id: 2, nombre: 'Juan Pérez', matricula: '20230002', entregadas: 4, pendientes: 2, promedio: 7.8 },
    { id: 3, nombre: 'Ana García', matricula: '20230003', entregadas: 6, pendientes: 0, promedio: 9.8 },
    { id: 4, nombre: 'Carlos Ruiz', matricula: '20230004', entregadas: 3, pendientes: 3, promedio: 6.5 },
    { id: 5, nombre: 'Sofía Mendoza', matricula: '20230005', entregadas: 5, pendientes: 1, promedio: 8.4 },
]

export default function PanelGrupoPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [tab, setTab] = useState('canal')
    const [avisoTitulo, setAvisoTitulo] = useState('')
    const [avisoTexto, setAvisoTexto] = useState('')
    const [feed, setFeed] = useState(canal)
    const [comentarios, setComentarios] = useState(
        Object.fromEntries(canal.map(p => [p.id, p.comentarios]))
    )
    const [inputs, setInputs] = useState({})
    const [materiales, setMateriales] = useState(MOCK_MATERIALES)
    const [matModalOpen, setMatModalOpen] = useState(false)
    const [matForm, setMatForm] = useState({ tipo: 'link', nombre: '', descripcion: '', url: '' })
    const [matFile, setMatFile] = useState(null)
    const [matError, setMatError] = useState('')
    const fileInputRef = useRef(null)

    function postAviso() {
        if (!avisoTexto.trim()) return
        const id = Date.now()
        setFeed(prev => [{
            id,
            autor: 'Dr. Martínez',
            esDocente: true,
            titulo: avisoTitulo.trim() || null,
            texto: avisoTexto.trim(),
            tiempo: 'Ahora mismo',
            comentarios: []
        }, ...prev])
        setComentarios(prev => ({ ...prev, [id]: [] }))
        setAvisoTitulo('')
        setAvisoTexto('')
    }

    function handleComment(pubId) {
        const texto = (inputs[pubId] || '').trim()
        if (!texto) return
        const nuevo = { id: crypto.randomUUID(), autor: 'Dr. Martínez', texto, tiempo: 'Ahora mismo' }
        setComentarios(prev => ({ ...prev, [pubId]: [...(prev[pubId] || []), nuevo] }))
        setInputs(prev => ({ ...prev, [pubId]: '' }))
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

    function handleAddMaterial() {
        if (!matForm.nombre.trim()) { setMatError('El título es requerido'); return }
        if (matForm.tipo === 'link' && !matForm.url.trim()) { setMatError('La URL es requerida'); return }
        if (matForm.tipo !== 'link' && !matFile) { setMatError('Selecciona un archivo'); return }
        const tamaño = matFile ? (matFile.size > 1024 * 1024
            ? `${(matFile.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(matFile.size / 1024)} KB`) : undefined
        setMateriales(prev => [{
            id: Date.now(),
            tipo: matForm.tipo,
            nombre: matForm.nombre.trim(),
            descripcion: matForm.descripcion.trim(),
            url: matForm.tipo === 'link' ? matForm.url.trim() : undefined,
            fecha: '29 Mar 2026',
            tamaño,
        }, ...prev])
        setMatModalOpen(false)
    }

    return (
        <TeacherShell>
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
                        <h1 className="text-2xl font-bold text-[#3d3d3d]">{GRUPO.materia}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Grupo {GRUPO.grupo} · {GRUPO.alumnos} alumnos</p>
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
                        { key: 'alumnos', label: `Alumnos (${GRUPO.alumnos})` },
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
                                {(comentarios[p.id] || []).length > 0 && (
                                    <div className="ml-12 space-y-2">
                                        {(comentarios[p.id] || []).map(c => (
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

                        {tareas.map(t => {
                            const pct = Math.round((t.calificadas / t.total) * 100)
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
                                                {new Date(t.fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                            {t.calificadas}/{t.total} calificadas
                                        </p>
                                        {t.entregas > t.calificadas && (
                                            <Badge variant="warning">{t.entregas - t.calificadas} pendientes</Badge>
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
                                    {alumnos.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={a.nombre} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-[#3d3d3d]">{a.nombre}</p>
                                                        <p className="text-xs text-gray-400">{a.matricula}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="font-semibold text-[#3d3d3d]">{a.entregadas}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                {a.pendientes > 0
                                                    ? <Badge variant="warning">{a.pendientes}</Badge>
                                                    : <span className="text-xs font-semibold text-emerald-500">✓ Al día</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span
                                                    className="text-base font-black"
                                                    style={{ color: a.promedio >= 9 ? '#10b981' : a.promedio >= 7 ? 'var(--color-warning)' : 'var(--color-primary)' }}
                                                >
                                                    {a.promedio.toFixed(1)}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </TeacherShell>
    )
}
