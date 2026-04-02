import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCheck, MessageSquare, Upload, Paperclip, AlertTriangle, Link2, CheckCircle, FolderOpen, X } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import Badge from '../../Components/UI/Badge'
import Button from '../../Components/UI/Button'
import Card from '../../Components/UI/Card'

// ── Mock data ────────────────────────────────────────────────
const TAREA = {
    id: 1,
    titulo: 'Proyecto final React',
    materia: 'Desarrollo Web',
    docente: 'Dr. Martínez',
    descripcion: 'Desarrolla una aplicación React completa que consuma al menos una API externa. La aplicación debe tener rutas dinámicas con React Router, manejo de estado global y diseño responsivo.',
    fechaLimite: '2026-03-28T23:59:00',
    grupo: 'Grupo A',
}

const ALLOWED_TYPES = ['PDF', 'DOCX', 'PPTX', 'XLSX', 'JPG', 'PNG', 'ZIP', 'RAR']
const BLOCKED_TYPES = ['MP4', 'AVI', 'MOV', 'MKV', 'WMV']
const MAX_MB = 30

const MI_HISTORIAL = [
    { id: 3, intento: 3, fecha: '28 Mar 2026 · 14:32', tipo: 'archivo', nombre: 'proyecto_final_v3.zip', tamaño: '4.2 MB', calificacion: null, comentario: '', estado: 'pendiente' },
    { id: 2, intento: 2, fecha: '27 Mar 2026 · 10:15', tipo: 'archivo', nombre: 'proyecto_final_v2.zip', tamaño: '3.8 MB', calificacion: 8.5, comentario: 'Buen avance, falta validación de formularios y manejo de errores en las peticiones a la API.', estado: 'calificado' },
]
// ─────────────────────────────────────────────────────────────

function isUrgent(fecha) {
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60)
    return diff > 0 && diff <= 48
}

export default function DetalleTareaPage() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileError, setFileError] = useState('')
    const [videoLink, setVideoLink] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [historialOpen, setHistorialOpen] = useState(false)

    const urgent = isUrgent(TAREA.fechaLimite)

    function validateFile(file) {
        if (!file) return ''
        const ext = file.name.split('.').pop().toUpperCase()
        if (BLOCKED_TYPES.includes(ext)) return `Los archivos de video (${ext}) no están permitidos. Usa el campo de enlace.`
        if (!ALLOWED_TYPES.includes(ext)) return `Formato .${ext} no permitido.`
        if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera los ${MAX_MB} MB.`
        return ''
    }

    function handleFileChange(e) {
        const file = e.target.files[0]
        if (!file) return
        const err = validateFile(file)
        setFileError(err)
        setSelectedFile(err ? null : file)
        setUploadSuccess(false)
        // Reset input so same file can be re-selected after removal
        e.target.value = ''
    }

    function removeFile() {
        setSelectedFile(null)
        setFileError('')
    }

    function handleUpload() {
        if (!selectedFile && !videoLink.trim()) return
        setUploading(true)
        setTimeout(() => {
            setUploading(false)
            setUploadSuccess(true)
            setSelectedFile(null)
            setVideoLink('')
        }, 1500)
    }

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/alumno/tareas')}
                        className="text-gray-400 hover:text-[#E43D12] transition-colors text-sm font-medium"
                    >
                        ← Volver
                    </button>
                    <span className="text-gray-200">|</span>
                    <span className="text-xs text-gray-400">{TAREA.materia}</span>
                </div>

                {/* Info de la tarea */}
                <Card>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-[#3d3d3d]">{TAREA.titulo}</h1>
                            <p className="text-xs text-gray-400 mt-1"><UserCheck size={14} className="inline" /> {TAREA.docente} · {TAREA.grupo}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className={`text-sm font-bold ${urgent ? 'text-[#EFB11D]' : 'text-gray-400'}`}>
                                {new Date(TAREA.fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                            </p>
                            <p className={`text-xs mt-0.5 ${urgent ? 'text-[#EFB11D]' : 'text-gray-300'}`}>
                                {new Date(TAREA.fechaLimite).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {urgent && <Badge variant="warning" className="mt-1">¡Vence pronto!</Badge>}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 leading-relaxed">{TAREA.descripcion}</p>
                </Card>

                {/* Retroalimentación del docente */}
                {MI_HISTORIAL.some(e => e.estado === 'calificado') && (() => {
                    const ultima = MI_HISTORIAL.find(e => e.estado === 'calificado')
                    const gradeColor = ultima.calificacion >= 9 ? '#10b981' : ultima.calificacion >= 7 ? '#EFB11D' : '#E43D12'
                    return (
                        <Card>
                            <h2 className="text-sm font-bold text-[#3d3d3d] mb-4"><MessageSquare size={16} className="inline" /> Retroalimentación del docente</h2>
                            <div className="flex gap-4">
                                <div
                                    className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: gradeColor + '18' }}
                                >
                                    <span className="text-2xl font-black" style={{ color: gradeColor }}>
                                        {ultima.calificacion.toFixed(1)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 mb-2">Intento #{ultima.intento} · {ultima.fecha}</p>
                                    <div className="bg-[#EBE9E1] rounded-2xl rounded-tl-none p-3">
                                        <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>Dr. Martínez</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{ultima.comentario}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })()}

                {/* Zona de entrega */}
                <Card>
                    <h2 className="text-sm font-bold text-[#3d3d3d] mb-5"><Upload size={16} className="inline" /> Subir entrega</h2>

                    {/* Selector de archivo */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.pptx,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
                        onChange={handleFileChange}
                    />

                    {!selectedFile ? (
                        /* Botón para abrir el selector */
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-[#E43D12]/40 bg-[#EBE9E1] hover:border-[#E43D12] hover:bg-[#E43D12]/5 transition-all duration-200 group"
                        >
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors"
                                style={{ background: '#E43D1218' }}
                            >
                                <Paperclip size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-[#3d3d3d] group-hover:text-[#E43D12] transition-colors">
                                    Seleccionar archivo
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Máx. {MAX_MB} MB · {ALLOWED_TYPES.join(', ')}
                                </p>
                            </div>
                        </button>
                    ) : (
                        /* Archivo seleccionado – mostrar con opción de eliminar */
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#D6536D]/8 border-2 border-[#D6536D]/30">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                style={{ background: '#D6536D18' }}
                            >
                                <Paperclip size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#3d3d3d] truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[#E43D12] hover:underline font-medium"
                                    >
                                        Cambiar
                                    </button>
                                </p>
                            </div>
                            {/* Botón eliminar */}
                            <button
                                onClick={removeFile}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#E43D12]/10 hover:text-[#E43D12] transition-all flex-shrink-0"
                                title="Quitar archivo"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Error de archivo */}
                    {fileError && (
                        <div className="mt-3 rounded-xl p-3" style={{ background: '#E43D1218' }}>
                            <p className="text-xs font-semibold text-[#E43D12]">{fileError}</p>
                        </div>
                    )}

                    {/* Alerta de video */}
                    <div className="mt-4 rounded-xl p-3 flex gap-2" style={{ background: '#EFB11D18', border: '1px solid #EFB11D44' }}>
                        <span className="text-sm flex-shrink-0"><AlertTriangle size={16} /></span>
                        <div>
                            <p className="text-xs font-bold text-[#EFB11D]">No se permiten videos</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {BLOCKED_TYPES.join(', ')} están bloqueados. Si tu evidencia es en video, pega el enlace abajo.
                            </p>
                        </div>
                    </div>

                    {/* Input enlace de video */}
                    <div className="mt-4">
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5"><Link2 size={12} className="inline" /> Enlace de video (YouTube / Google Drive)</label>
                        <input
                            type="url"
                            value={videoLink}
                            onChange={e => setVideoLink(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                            style={{ backgroundColor: 'var(--color-background)', focusBorderColor: 'var(--color-accent)' }}
                            onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                    </div>

                    {/* Botón de subida */}
                    <div className="mt-5">
                        <Button
                            size="block"
                            onClick={handleUpload}
                            disabled={uploading || (!selectedFile && !videoLink.trim())}
                        >
                            {uploading ? 'Subiendo...' : 'Subir Entrega'}
                        </Button>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Puedes resubir ilimitadas veces antes de la fecha límite
                        </p>
                    </div>

                    {/* Éxito */}
                    {uploadSuccess && (
                        <div className="mt-3 rounded-xl p-3 text-center" style={{ background: '#10b98120', border: '1px solid #10b98140' }}>
                            <p className="text-sm font-semibold text-emerald-600"><CheckCircle size={16} className="inline" /> ¡Entrega registrada exitosamente!</p>
                        </div>
                    )}
                </Card>

                {/* Historial de entregas */}
                {MI_HISTORIAL.length > 0 && (
                    <Card>
                        <button
                            onClick={() => setHistorialOpen(h => !h)}
                            className="w-full flex items-center justify-between"
                        >
                            <h2 className="text-sm font-bold text-[#3d3d3d]">
                                <FolderOpen size={16} className="inline" /> Historial de entregas
                                <span className="ml-2 text-xs font-normal text-gray-400">
                                    ({MI_HISTORIAL.length} intento{MI_HISTORIAL.length > 1 ? 's' : ''})
                                </span>
                            </h2>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                className={`text-gray-400 transition-transform ${historialOpen ? 'rotate-180' : ''}`}>
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        {historialOpen && (
                            <div className="mt-4 space-y-2">
                                {MI_HISTORIAL.map(e => (
                                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#EBE9E180' }}>
                                        <span className="text-xl flex-shrink-0">{e.tipo === 'link' ? <Link2 size={20} /> : <Paperclip size={20} />}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-[#3d3d3d] truncate">{e.nombre}</p>
                                            <p className="text-xs text-gray-400">{e.fecha}{e.tamaño ? ` · ${e.tamaño}` : ''}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {e.calificacion !== null ? (
                                                <span className="text-base font-black" style={{ color: e.calificacion >= 9 ? '#10b981' : e.calificacion >= 7 ? '#EFB11D' : '#E43D12' }}>
                                                    {e.calificacion.toFixed(1)}
                                                </span>
                                            ) : (
                                                <Badge variant="muted">Pendiente</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </AppShell>
    )
}
