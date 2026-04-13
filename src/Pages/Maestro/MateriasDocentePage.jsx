import { useState, useEffect } from 'react'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import PageHeader from '../../Components/UI/PageHeader'
import ModalBase from '../../Components/UI/ModalBase'
import FormField from '../../Components/UI/FormField'
import Badge from '../../Components/UI/Badge'
import { materiasService } from '../../Services/materiasService'

const EMPTY = { clave: '', nombre: '', descripcion: '' }

function validate(form) {
    const errors = {}
    if (!form.clave.trim()) errors.clave = 'La clave es requerida'
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
    return errors
}

export default function MateriasDocentePage() {
    const [materias, setMaterias] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [editId, setEditId] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [deleteId, setDeleteId] = useState(null)

    async function fetchMaterias() {
        try {
            const res = await materiasService.getAll()
            const list = Array.isArray(res) ? res : res.results ?? []
            setMaterias(list.map(m => ({ ...m, activa: m.activa ?? m.is_active ?? true })))
        } catch { /* ignore */ }
        setLoading(false)
    }

    useEffect(() => { fetchMaterias() }, [])

    function openCreate() {
        setEditId(null)
        setForm(EMPTY)
        setErrors({})
        setModal(true)
    }

    function openEdit(m) {
        setEditId(m.id)
        setForm({ clave: m.clave, nombre: m.nombre, descripcion: m.descripcion })
        setErrors({})
        setModal(true)
    }

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate(form)
        if (Object.keys(errs).length) { setErrors(errs); return }

        try {
            if (editId) {
                await materiasService.update(editId, {
                    clave: form.clave.trim().toUpperCase(),
                    nombre: form.nombre.trim(),
                    descripcion: form.descripcion.trim(),
                })
            } else {
                await materiasService.create({
                    clave: form.clave.trim().toUpperCase(),
                    nombre: form.nombre.trim(),
                    descripcion: form.descripcion.trim(),
                })
            }
            setModal(false)
            setForm(EMPTY)
            setEditId(null)
            fetchMaterias()
        } catch { /* ignore */ }
    }

    async function handleDelete() {
        try {
            await materiasService.remove(deleteId)
            setDeleteId(null)
            fetchMaterias()
        } catch { /* ignore */ }
    }

    async function toggleActiva(id) {
        const m = materias.find(m => m.id === id)
        if (!m) return
        try {
            await materiasService.update(id, { activa: !m.activa, is_active: !m.activa })
            fetchMaterias()
        } catch { /* ignore */ }
    }

    return (
        <TeacherShell>
            <div className="space-y-5 max-w-3xl mx-auto">

                <PageHeader
                    title="Mis Materias"
                    subtitle={`${materias.filter(m => m.activa).length} activas · ${materias.length} total`}
                    action={{ label: 'Nueva Materia', icon: <BookOpen size={16} />, onClick: openCreate }}
                />

                {/* Grid de materias */}
                {materias.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                        <p className="text-4xl mb-3"><BookOpen size={40} className="mx-auto text-gray-300" /></p>
                        <p className="text-sm font-semibold text-[#3d3d3d]">Sin materias registradas</p>
                        <p className="text-xs text-gray-400 mt-1 mb-4">Crea tu primera materia para comenzar</p>
                        <button
                            onClick={openCreate}
                            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                        >Crear Materia</button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {materias.map(m => (
                            <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <code
                                            className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                            style={{ background: '#E43D1210', color: 'var(--color-primary)' }}
                                        >{m.clave}</code>
                                    </div>
                                    <Badge variant={m.activa ? 'success' : 'muted'}>
                                        {m.activa ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-[#3d3d3d] leading-snug">{m.nombre}</p>
                                    {m.descripcion && (
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{m.descripcion}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                                    <button
                                        onClick={() => openEdit(m)}
                                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                                        style={{ background: '#D6536D10', color: 'var(--color-secondary)' }}
                                    ><Pencil size={12} className="inline" /> Editar</button>
                                    <button
                                        onClick={() => toggleActiva(m.id)}
                                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                                        style={m.activa
                                            ? { background: '#fee2e215', color: '#dc2626' }
                                            : { background: '#dcfce720', color: '#16a34a' }}
                                    >{m.activa ? 'Desactivar' : 'Activar'}</button>
                                    <button
                                        onClick={() => setDeleteId(m.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                                    ><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear / Editar */}
            <ModalBase
                isOpen={modal}
                onClose={() => { setModal(false); setForm(EMPTY); setErrors({}); setEditId(null) }}
                title={editId ? 'Editar Materia' : 'Nueva Materia'}
                icon={<BookOpen size={18} />}
                maxWidth="max-w-sm"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Clave institucional"
                        name="clave"
                        value={form.clave}
                        onChange={handleChange}
                        error={errors.clave}
                        placeholder="Ej. INF-305"
                    />
                    <FormField
                        label="Nombre de la materia"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        placeholder="Ej. Programación Orientada a Objetos"
                    />
                    <FormField
                        label="Descripción (opcional)"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        type="textarea"
                        rows={3}
                        placeholder="Breve descripción de los temas que cubre la materia…"
                    />
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => { setModal(false); setForm(EMPTY); setErrors({}); setEditId(null) }}
                            className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                        >Cancelar</button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                        >{editId ? 'Guardar Cambios' : 'Crear Materia'}</button>
                    </div>
                </form>
            </ModalBase>

            {/* Modal Confirmar eliminación */}
            <ModalBase
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Eliminar Materia"
                icon={<Trash2 size={18} />}
                iconBg="#fee2e2"
                maxWidth="max-w-xs"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 leading-relaxed">
                        ¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteId(null)}
                            className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                        >Cancelar</button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >Eliminar</button>
                    </div>
                </div>
            </ModalBase>
        </TeacherShell>
    )
}
