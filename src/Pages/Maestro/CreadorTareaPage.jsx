import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TeacherShell from '../../Components/Layout/TeacherShell'

export default function CreadorTareaPage() {
    const { id: grupoId } = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        fechaLimite: '',
        horaLimite: '23:59',
        tipoEntrega: 'archivo',
        puntos: '100',
        permitirReentregas: true,
    })
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        setErrors(p => ({ ...p, [name]: '' }))
    }

    function validate() {
        const errs = {}
        if (!form.titulo.trim()) errs.titulo = 'El título es requerido'
        if (!form.descripcion.trim()) errs.descripcion = 'La descripción es requerida'
        if (!form.fechaLimite) errs.fechaLimite = 'La fecha límite es requerida'
        return errs
    }

    function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setSuccess(true)
        setTimeout(() => navigate(`/maestro/grupos/${grupoId}`), 1800)
    }

    return (
        <TeacherShell>
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate(`/maestro/grupos/${grupoId}`)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#E43D12] transition-colors mb-2"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                        Volver al grupo
                    </button>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Crear Nueva Tarea</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Esta tarea será publicada a todos los alumnos del grupo.</p>
                </div>

                {success && (
                    <div className="rounded-2xl p-4 text-center anim-modal-in" style={{ background: '#10b98118', border: '1px solid #10b98130' }}>
                        <p className="text-sm font-semibold text-emerald-600">✅ ¡Tarea publicada exitosamente! Redirigiendo…</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Título */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold text-[#3d3d3d]">Información de la tarea</h2>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Título *</label>
                            <input
                                type="text"
                                name="titulo"
                                value={form.titulo}
                                onChange={handleChange}
                                placeholder="Ej. Proyecto Final – API REST con Node.js"
                                className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                style={{ backgroundColor: 'var(--color-background)' }}
                                onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                onBlur={e => e.target.style.borderColor = errors.titulo ? 'var(--color-primary)' : 'transparent'}
                            />
                            {errors.titulo && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.titulo}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Descripción *</label>
                            <textarea
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Describe los requisitos, criterios de evaluación y entregables esperados…"
                                className="w-full text-sm px-4 py-3 rounded-xl border-2 border-transparent outline-none transition-colors resize-none"
                                style={{ backgroundColor: 'var(--color-background)' }}
                                onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                onBlur={e => e.target.style.borderColor = errors.descripcion ? 'var(--color-primary)' : 'transparent'}
                            />
                            {errors.descripcion && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.descripcion}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">Fecha límite de entrega *</label>
                            <input
                                type="date"
                                name="fechaLimite"
                                value={form.fechaLimite}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                style={{ backgroundColor: 'var(--color-background)' }}
                                onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                onBlur={e => e.target.style.borderColor = errors.fechaLimite ? 'var(--color-primary)' : 'transparent'}
                            />
                            {errors.fechaLimite && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.fechaLimite}</p>}
                        </div>
                    </div>

                    {/* Configuración de entrega */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold text-[#3d3d3d]">Configuración de entrega</h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Tipo de entrega</label>
                                <select
                                    name="tipoEntrega"
                                    value={form.tipoEntrega}
                                    onChange={handleChange}
                                    className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                >
                                    <option value="archivo">📎 Archivo</option>
                                    <option value="link">🔗 Enlace</option>
                                    <option value="cualquiera">📂 Cualquiera</option>
                                    <option value="sin_entrega">📖 Sin entrega (solo lectura)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Puntos</label>
                                <input
                                    type="number"
                                    name="puntos"
                                    value={form.puntos}
                                    onChange={handleChange}
                                    min="0" max="1000"
                                    className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Hora límite</label>
                                <input
                                    type="time"
                                    name="horaLimite"
                                    value={form.horaLimite}
                                    onChange={handleChange}
                                    className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="text-xs font-semibold text-gray-500 block mb-1">Reentregas</label>
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, permitirReentregas: !p.permitirReentregas }))}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        backgroundColor: form.permitirReentregas ? '#10b98118' : 'var(--color-background)',
                                        color: form.permitirReentregas ? '#059669' : '#9ca3af',
                                        border: `2px solid ${form.permitirReentregas ? '#10b98140' : 'transparent'}`,
                                    }}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${form.permitirReentregas ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`} />
                                    {form.permitirReentregas ? 'Permitidas' : 'No permitidas'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recordatorio de reglas */}
                    <div
                        className="rounded-2xl p-4 flex gap-3"
                        style={{ background: '#EFB11D15', border: '1px solid #EFB11D40' }}
                    >
                        <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold" style={{ color: '#a07a00' }}>Recuerda indicar en la descripción:</p>
                            <ul className="text-xs text-[#7a5e00] space-y-1 list-none">
                                <li>• Los alumnos solo pueden subir archivos de <strong>hasta 30 MB</strong>.</li>
                                <li>• Si el entregable es un video, deben compartir un enlace de <strong>YouTube o Google Drive</strong>.</li>
                                <li>• Los alumnos pueden resubir sus entregas ilimitadas veces antes de la fecha límite. Se calificará el <strong>último intento</strong>.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/maestro/grupos/${grupoId}`)}
                            className="flex-1 py-3 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                        >
                            Publicar Tarea
                        </button>
                    </div>
                </form>
            </div>
        </TeacherShell>
    )
}
