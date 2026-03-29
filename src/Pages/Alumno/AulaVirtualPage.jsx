import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../Components/Layout/AppShell'
import Tabs from '../../Components/UI/Tabs'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'
import Button from '../../Components/UI/Button'

// ── Mock data ────────────────────────────────────────────────
const MATERIA = {
    id: 1,
    nombre: 'Desarrollo Web',
    clave: 'DW-301',
    docente: 'Dr. Martínez',
    grupo: 'Grupo A',
    color: '#E43D12',
    alumnos: 28,
}

const publicaciones = [
    {
        id: 1,
        titulo: 'Cambio de horario – próxima clase',
        contenido: 'Les aviso que la clase del miércoles se movió a las 11:00 AM en el aula 204. Favor de tomar nota y confirmar asistencia.',
        autor: 'Dr. Martínez',
        fecha: '28 Mar 2026 · 10:45',
        comentarios: [
            { id: 1, autor: 'Alexis Galarza', texto: 'Anotado, gracias profe.', fecha: '11:02' },
            { id: 2, autor: 'María García', texto: '¡Recibido!', fecha: '11:10' },
        ]
    },
    {
        id: 2,
        titulo: 'Material de apoyo – Parcial 2',
        contenido: 'Subo el PDF con los temas del segundo parcial. Recuerden repasar los hooks de React y el manejo de rutas con React Router.',
        autor: 'Dr. Martínez',
        fecha: '26 Mar 2026 · 09:00',
        comentarios: []
    },
]

const tareas = [
    { id: 1, titulo: 'Proyecto final React', fechaLimite: '2026-03-28', entregada: false },
    { id: 2, titulo: 'Ejercicio de rutas dinámicas', fechaLimite: '2026-04-05', entregada: true },
]

const TABS = [
    { key: 'canal', label: '💬 Canal' },
    { key: 'tareas', label: '📋 Tareas' },
]
// ─────────────────────────────────────────────────────────────

export default function AulaVirtualPage() {
    const [tab, setTab] = useState('canal')
    const [comentarios, setComentarios] = useState(
        Object.fromEntries(publicaciones.map(p => [p.id, p.comentarios]))
    )
    const [inputs, setInputs] = useState({})
    const navigate = useNavigate()

    function handleComment(pubId) {
        const texto = (inputs[pubId] || '').trim()
        if (!texto) return
        const nuevo = { id: Date.now(), autor: 'Alexis Galarza', texto, fecha: 'Ahora mismo' }
        setComentarios(prev => ({ ...prev, [pubId]: [...(prev[pubId] || []), nuevo] }))
        setInputs(prev => ({ ...prev, [pubId]: '' }))
    }

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header de materia */}
                <div
                    className="rounded-2xl p-6 text-white"
                    style={{ background: `linear-gradient(135deg, ${MATERIA.color} 0%, #D6536D 100%)` }}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-white/70 text-xs mb-1">{MATERIA.clave} · {MATERIA.grupo}</p>
                            <h1 className="text-2xl font-bold">{MATERIA.nombre}</h1>
                            <p className="text-white/80 text-sm mt-1">👨‍🏫 {MATERIA.docente} · {MATERIA.alumnos} alumnos</p>
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
                                publicaciones={publicaciones}
                                comentarios={comentarios}
                                inputs={inputs}
                                setInputs={setInputs}
                                onComment={handleComment}
                            />
                        )}
                        {tab === 'tareas' && (
                            <TareasTab tareas={tareas} navigate={navigate} />
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    )
}

function CanalTab({ publicaciones, comentarios, inputs, setInputs, onComment }) {
    return (
        <div className="space-y-6">
            {publicaciones.map(pub => (
                <div key={pub.id} className="space-y-3">
                    {/* Publicación */}
                    <div className="flex gap-3">
                        <Avatar name="Dr. Martínez" size="md" />
                        <div className="flex-1">
                            <div className="bg-[#EBE9E1] rounded-2xl rounded-tl-none p-4">
                                <p className="text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>Dr. Martínez · {pub.fecha}</p>
                                <p className="text-sm font-semibold text-[#3d3d3d] mt-0.5">{pub.titulo}</p>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{pub.contenido}</p>
                            </div>
                        </div>
                    </div>

                    {/* Comentarios */}
                    {(comentarios[pub.id] || []).length > 0 && (
                        <div className="ml-13 space-y-2 pl-10">
                            {(comentarios[pub.id] || []).map(c => (
                                <div key={c.id} className="flex gap-2">
                                    <Avatar name={c.autor} size="sm" />
                                    <div className="bg-gray-50 rounded-2xl rounded-tl-none px-3 py-2 flex-1">
                                        <p className="text-xs font-semibold text-gray-500">{c.autor} · {c.fecha}</p>
                                        <p className="text-sm text-[#3d3d3d] mt-0.5">{c.texto}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input de comentario */}
                    <div className="pl-10 flex gap-2">
                        <Avatar name="Alexis Galarza" size="sm" />
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
                const urgent = (new Date(tarea.fechaLimite) - new Date()) / (1000 * 60 * 60) <= 48
                return (
                    <div
                        key={tarea.id}
                        onClick={() => navigate(`/alumno/tareas/${tarea.id}`)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[#EBE9E1] cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-xl">{tarea.entregada ? '✅' : urgent ? '⚡' : '📋'}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#3d3d3d]">{tarea.titulo}</p>
                            <p className={`text-xs mt-0.5 font-medium ${urgent && !tarea.entregada ? 'text-[#EFB11D]' : 'text-gray-400'}`}>
                                Límite: {new Date(tarea.fechaLimite).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
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
