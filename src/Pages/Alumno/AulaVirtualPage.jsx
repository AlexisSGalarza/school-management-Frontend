import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquare, ClipboardList, FolderOpen, UserCheck, CheckCircle, Zap, FileText, Presentation, FileIcon, FileSpreadsheet, Link2, Archive, Download, ExternalLink } from 'lucide-react'
import AppShell from '../../Components/Layout/AppShell'
import Tabs from '../../Components/UI/Tabs'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'
import Button from '../../Components/UI/Button'
import { gruposService } from '../../Services/gruposService'
import { publicacionesService } from '../../Services/publicacionesService'
import { comentariosService } from '../../Services/comentariosService'
import { tareasService } from '../../Services/tareasService'
import { materialesService } from '../../Services/materialesService'
import { useAuth } from '../../Context/AuthContext'

const TABS = [
    { key: 'canal', label: 'Canal' },
    { key: 'tareas', label: 'Tareas' },
    { key: 'materiales', label: 'Materiales' },
]

export default function AulaVirtualPage() {
    const { id } = useParams()
    const [tab, setTab] = useState('canal')
    const [grupo, setGrupo] = useState(null)
    const [publicacionesList, setPublicacionesList] = useState([])
    const [comentariosMap, setComentariosMap] = useState({})
    const [tareasList, setTareasList] = useState([])
    const [materialesList, setMaterialesList] = useState([])
    const [inputs, setInputs] = useState({})
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        async function fetchData() {
            try {
                const [grupoData, pubsData, tareasData, matsData, comsData] = await Promise.all([
                    gruposService.getById(id),
                    publicacionesService.getAll(),
                    tareasService.getAll(),
                    materialesService.getAll(),
                    comentariosService.getAll(),
                ])
                setGrupo(grupoData)

                // Las publicaciones viven a nivel de materia (RF-08): filtramos por la materia del grupo
                const materiaId = grupoData.materia
                const pubs = (Array.isArray(pubsData) ? pubsData : pubsData.results ?? []).filter(p => String(p.materia) === String(materiaId))
                setPublicacionesList(pubs)

                const coms = Array.isArray(comsData) ? comsData : comsData.results ?? []
                const comsMap = {}
                pubs.forEach(p => { comsMap[p.id] = coms.filter(c => String(c.publicacion) === String(p.id)) })
                setComentariosMap(comsMap)

                const tars = (Array.isArray(tareasData) ? tareasData : tareasData.results ?? []).filter(t => String(t.grupo) === String(id))
                setTareasList(tars)

                const mats = (Array.isArray(matsData) ? matsData : matsData.results ?? []).filter(m => String(m.grupo) === String(id))
                setMaterialesList(mats)
            } catch (err) {
                console.error('Error cargando aula virtual:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    async function handleComment(pubId) {
        const texto = (inputs[pubId] || '').trim()
        if (!texto) return
        try {
            const nuevo = await comentariosService.create({ publicacion: pubId, texto })
            setComentariosMap(prev => ({ ...prev, [pubId]: [...(prev[pubId] || []), nuevo] }))
            setInputs(prev => ({ ...prev, [pubId]: '' }))
        } catch (err) {
            console.error('Error enviando comentario:', err)
        }
    }

    const color = '#E43D12'
    const nombre = user?.nombre ?? user?.first_name ?? 'Alumno'

    if (loading) {
        return <AppShell><div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Cargando…</p></div></AppShell>
    }

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header de materia */}
                <div
                    className="rounded-2xl p-6 text-white"
                    style={{ background: `linear-gradient(135deg, ${color} 0%, #D6536D 100%)` }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-white/70 text-xs mb-1">{grupo?.clave ?? grupo?.codigo ?? '—'}</p>
                            <h1 className="text-2xl font-bold">{grupo?.materia_nombre ?? '—'}</h1>
                            <p className="text-white/80 text-sm mt-1"><UserCheck size={14} className="inline" /> {grupo?.docente_nombre ?? '—'} · {grupo?.alumnos?.length ?? 0} alumnos</p>
                        </div>
                        <button
                            onClick={() => navigate('/alumno/materias')}
                            className="text-white/70 hover:text-white transition-colors text-sm"
                        >
                            ← Volver
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-4">
                        <Tabs tabs={TABS} active={tab} onChange={setTab} />
                    </div>

                    <div className="p-5">
                        {tab === 'canal' && (
                            <CanalTab
                                publicaciones={publicacionesList}
                                comentarios={comentariosMap}
                                inputs={inputs}
                                setInputs={setInputs}
                                onComment={handleComment}
                                userName={nombre}
                            />
                        )}
                        {tab === 'tareas' && (
                            <TareasTab tareas={tareasList} navigate={navigate} />
                        )}
                        {tab === 'materiales' && (
                            <MaterialesTab materiales={materialesList} />
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    )
}

function CanalTab({ publicaciones, comentarios, inputs, setInputs, onComment, userName }) {
    return (
        <div className="space-y-6">
            {publicaciones.map(pub => (
                <div key={pub.id} className="space-y-3">
                    {/* Publicación */}
                    <div className="flex gap-3">
                        <Avatar name={pub.autor_nombre ?? pub.autor ?? '—'} size="md" />
                        <div className="flex-1">
                            <div className="bg-[#EBE9E1] rounded-2xl rounded-tl-none p-4">
                                <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>{pub.autor_nombre ?? pub.autor ?? '—'} · {pub.fecha ?? pub.created_at ?? ''}</p>
                                <p className="text-sm font-semibold text-[#3d3d3d] mt-0.5">{pub.titulo}</p>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{pub.contenido ?? pub.texto}</p>
                            </div>
                        </div>
                    </div>

                    {/* Comentarios */}
                    {(comentarios[pub.id] || []).length > 0 && (
                        <div className="ml-13 space-y-2 pl-10">
                            {(comentarios[pub.id] || []).map(c => (
                                <div key={c.id} className="flex gap-2">
                                    <Avatar name={c.autor_nombre ?? c.autor ?? '—'} size="sm" />
                                    <div className="bg-gray-50 rounded-2xl rounded-tl-none px-3 py-2 flex-1">
                                        <p className="text-xs font-semibold text-gray-500">{c.autor_nombre ?? c.autor ?? '—'} · {c.created_at ? new Date(c.created_at).toLocaleString('es-MX') : ''}</p>
                                        <p className="text-sm text-[#3d3d3d] mt-0.5">{c.contenido ?? c.texto ?? ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input de comentario */}
                    <div className="pl-10 flex gap-2">
                        <Avatar name={userName} size="sm" />
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={inputs[pub.id] || ''}
                                onChange={e => setInputs(prev => ({ ...prev, [pub.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && onComment(pub.id)}
                                placeholder="Escribe un comentario..."
                                className="flex-1 text-sm px-4 py-2 rounded-full bg-[#EBE9E1] outline-none border-2 border-transparent focus:border-[#FFA2B6] transition-colors"
                            />
                            <Button size="sm" onClick={() => onComment(pub.id)}>Enviar</Button>
                        </div>
                    </div>

                    <hr className="border-gray-100" />
                </div>
            ))}
        </div>
    )
}

function TareasTab({ tareas, navigate }) {
    return (
        <div className="space-y-3">
            {tareas.map(tarea => {
                const fechaLimite = tarea.fechaLimite ?? tarea.fecha_limite
                const urgent = fechaLimite ? (new Date(fechaLimite) - new Date()) / (1000 * 60 * 60) <= 48 : false
                return (
                    <div
                        key={tarea.id}
                        onClick={() => navigate(`/alumno/tareas/${tarea.id}`)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[#EBE9E1] cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-xl">{tarea.entregada ? <CheckCircle size={20} /> : urgent ? <Zap size={20} /> : <ClipboardList size={20} />}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#3d3d3d]">{tarea.titulo}</p>
                            <p className={`text-xs mt-0.5 font-medium ${urgent && !tarea.entregada ? 'text-[#EFB11D]' : 'text-gray-400'}`}>
                                Límite: {fechaLimite ? new Date(fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) : '—'}
                            </p>
                        </div>
                        {tarea.entregada
                            ? <Badge variant="secondary">Entregada</Badge>
                            : urgent
                                ? <Badge variant="warning">Urgente</Badge>
                                : <Badge variant="muted">Pendiente</Badge>
                        }
                    </div>
                )
            })}
        </div>
    )
}

const FILE_ICONS = { pdf: <FileText size={20} />, pptx: <Presentation size={20} />, docx: <FileIcon size={20} />, xlsx: <FileSpreadsheet size={20} />, link: <Link2 size={20} />, zip: <Archive size={20} /> }

function MaterialesTab({ materiales }) {
    return (
        <div className="space-y-2">
            {materiales.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-3xl mb-2"><FolderOpen size={32} className="mx-auto text-gray-300" /></p>
                    <p className="text-sm">El docente aún no ha subido materiales</p>
                </div>
            )}
            {materiales.map(m => {
                const titulo = m.titulo ?? m.nombre ?? 'Material'
                const url = m.archivo_url ?? m.url ?? ''
                const fecha = m.created_at ? new Date(m.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : (m.fecha ?? '')
                return (
                    <div
                        key={m.id}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#EBE9E1] transition-colors group"
                    >
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: m.tipo === 'link' ? '#E43D1212' : '#EBE9E1' }}
                        >
                            {FILE_ICONS[m.tipo] ?? <FileIcon size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#3d3d3d] truncate">{titulo}</p>
                            {m.descripcion && <p className="text-xs text-gray-400 mt-0.5 truncate">{m.descripcion}</p>}
                            <p className="text-xs text-gray-300 mt-0.5">{fecha}</p>
                        </div>
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                style={{ background: '#E43D1210', color: 'var(--color-primary)' }}
                            >
                                {m.tipo === 'link' ? <><ExternalLink size={12} className="inline" /> Abrir</> : <><Download size={12} className="inline" /> Descargar</>}
                            </a>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
