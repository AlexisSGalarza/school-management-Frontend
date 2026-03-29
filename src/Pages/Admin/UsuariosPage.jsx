import { useState, useMemo } from 'react'
import AdminShell from '../../Components/Layout/AdminShell'
import Badge from '../../Components/UI/Badge'
import PageHeader from '../../Components/UI/PageHeader'
import ModalBase from '../../Components/UI/ModalBase'
import FormField from '../../Components/UI/FormField'
import { MOCK_USERS, ROL_OPTIONS } from '../../data/mockUsers'
import { useToast } from '../../Context/ToastContext'

// Mapa de variantes de Badge por rol
const ROL_BADGE = {
    Alumno: 'accent',
    Docente: 'secondary',
    Admin: 'primary',
}

const EMPTY_FORM = { nombre: '', email: '', matricula: '', rol: 'Alumno', password: '' }
const EMPTY_EDIT_FORM = { nombre: '', email: '', matricula: '', rol: 'Alumno' }

const MATRICULA_RE = /^\d+$/

function validateEdit(form) {
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!form.email.trim()) errors.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
    if (!form.matricula.trim()) errors.matricula = 'La matrícula es requerida'
    else if (!MATRICULA_RE.test(form.matricula.trim())) errors.matricula = 'Solo se permiten números'
    return errors
}

function validate(form) {
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!form.email.trim()) errors.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
    if (!form.matricula.trim()) errors.matricula = 'La matrícula es requerida'
    else if (!MATRICULA_RE.test(form.matricula.trim())) errors.matricula = 'Solo se permiten números'
    if (!form.password) errors.password = 'La contraseña es requerida'
    else if (form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
    return errors
}

const PAGE_SIZE = 6

export default function UsuariosPage() {
    const { addToast } = useToast()
    const [users, setUsers] = useState(MOCK_USERS)
    const [search, setSearch] = useState('')
    const [rolFiltro, setRolFiltro] = useState('')
    const [page, setPage] = useState(1)
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [editUser, setEditUser] = useState(null)   // user object being edited
    const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
    const [editErrors, setEditErrors] = useState({})

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return users.filter(u => {
            const matchSearch = !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.matricula.toLowerCase().includes(q)
            const matchRol = !rolFiltro || u.rol === rolFiltro
            return matchSearch && matchRol
        })
    }, [users, search, rolFiltro])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        const errs = validate(form)
        if (Object.keys(errs).length) { setErrors(errs); return }
        const newUser = {
            id: users.length + 1,
            nombre: form.nombre.trim(),
            matricula: form.matricula.trim(),
            email: form.email.trim(),
            rol: form.rol,
            activo: true,
        }
        setUsers(prev => [newUser, ...prev])
        setModal(false)
        setForm(EMPTY_FORM)
        setErrors({})
        setPage(1)
        setSearch('')
        setRolFiltro('')
        addToast(`Usuario "${newUser.nombre}" registrado`)
    }

    function openEdit(user) {
        setEditUser(user)
        setEditForm({ nombre: user.nombre, email: user.email, matricula: user.matricula, rol: user.rol })
        setEditErrors({})
    }

    function handleEditChange(e) {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
        setEditErrors(prev => ({ ...prev, [name]: undefined }))
    }

    function handleEditSubmit(e) {
        e.preventDefault()
        const errs = validateEdit(editForm)
        if (Object.keys(errs).length) { setEditErrors(errs); return }
        setUsers(prev => prev.map(u => u.id === editUser.id
            ? { ...u, nombre: editForm.nombre.trim(), email: editForm.email.trim(), matricula: editForm.matricula.trim(), rol: editForm.rol }
            : u
        ))
        addToast(`Usuario "${editForm.nombre.trim()}" actualizado`)
        setEditUser(null)
    }

    function toggleActivo(id) {
        const u = users.find(x => x.id === id)
        setUsers(prev => prev.map(x => x.id === id ? { ...x, activo: !x.activo } : x))
        addToast(`${u?.nombre}: ${u?.activo ? 'desactivado' : 'activado'}`, u?.activo ? 'warning' : 'success')
    }

    return (
        <AdminShell>
            <div className="space-y-5 max-w-5xl mx-auto">

                <PageHeader
                    title="Usuarios"
                    subtitle={`${users.filter(u => u.activo).length} activos · ${users.length} total`}
                    action={{ label: 'Nuevo Usuario', icon: '➕', onClick: () => setModal(true) }}
                />

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Buscar por nombre, email o matrícula…"
                            className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                            style={{ backgroundColor: 'white' }}
                            onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                    </div>
                    <select
                        value={rolFiltro}
                        onChange={e => { setRolFiltro(e.target.value); setPage(1) }}
                        className="text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors bg-white"
                        onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                        onBlur={e => e.target.style.borderColor = 'transparent'}
                    >
                        {ROL_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                                    <th className="text-left py-3.5 px-5">Nombre</th>
                                    <th className="text-left py-3.5 px-3 hidden md:table-cell">Matrícula</th>
                                    <th className="text-left py-3.5 px-3 hidden sm:table-cell">Email</th>
                                    <th className="text-left py-3.5 px-3">Rol</th>
                                    <th className="text-left py-3.5 px-3">Estado</th>
                                    <th className="py-3.5 px-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">
                                            <p className="text-2xl mb-2">🔍</p>
                                            <p className="text-sm font-medium">Sin resultados</p>
                                        </td>
                                    </tr>
                                ) : paginated.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <span className="font-semibold text-[#3d3d3d]">{u.nombre}</span>
                                        </td>
                                        <td className="py-3.5 px-3 hidden md:table-cell">
                                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg font-mono">{u.matricula}</code>
                                        </td>
                                        <td className="py-3.5 px-3 hidden sm:table-cell text-gray-500 truncate max-w-[160px]">{u.email}</td>
                                        <td className="py-3.5 px-3">
                                            <Badge variant={ROL_BADGE[u.rol] ?? 'muted'}>{u.rol}</Badge>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <Badge variant={u.activo ? 'success' : 'muted'}>
                                                {u.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    style={{ background: '#EBE9E1', color: '#3d3d3d' }}
                                                    title="Editar"
                                                >✏️</button>
                                                <button
                                                    onClick={() => toggleActivo(u.id)}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                    style={{
                                                        background: u.activo ? '#fee2e210' : '#dcfce720',
                                                        color: u.activo ? '#dc2626' : '#16a34a',
                                                    }}
                                                >
                                                    {u.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                            </p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-8 h-8 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-[#EBE9E1] transition-colors"
                                >←</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                                        style={n === page
                                            ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white' }
                                            : {}}
                                    >{n}</button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-8 h-8 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-[#EBE9E1] transition-colors"
                                >→</button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal Nuevo Usuario */}
            <ModalBase
                isOpen={modal}
                onClose={() => { setModal(false); setForm(EMPTY_FORM); setErrors({}) }}
                title="Registrar Nuevo Usuario"
                icon="➕"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Nombre completo" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} placeholder="Ej. María López Hernández" />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Matrícula / Nómina" name="matricula" value={form.matricula} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) handleChange(e) }} error={errors.matricula} placeholder="20230001" />
                        <FormField
                            label="Rol"
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                            type="select"
                            options={[
                                { value: 'Alumno', label: 'Alumno' },
                                { value: 'Docente', label: 'Docente' },
                                { value: 'Admin', label: 'Admin' },
                            ]}
                        />
                    </div>
                    <FormField label="Email institucional" name="email" value={form.email} onChange={handleChange} error={errors.email} type="email" placeholder="usuario@escuela.edu.mx" />
                    <FormField label="Contraseña temporal" name="password" value={form.password} onChange={handleChange} error={errors.password} type="password" placeholder="Mín. 6 caracteres" />

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setModal(false); setForm(EMPTY_FORM); setErrors({}) }}
                            className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                        >Cancelar</button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                        >Registrar</button>
                    </div>
                </form>
            </ModalBase>

            {/* Modal Editar Usuario */}
            <ModalBase
                isOpen={!!editUser}
                onClose={() => setEditUser(null)}
                title="Editar Usuario"
                icon="✏️"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <FormField label="Nombre completo" name="nombre" value={editForm.nombre} onChange={handleEditChange} error={editErrors.nombre} placeholder="Ej. María López Hernández" />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Matrícula / Nómina" name="matricula" value={editForm.matricula} onChange={e => { const v = e.target.value; if (v === '' || /^\d+$/.test(v)) handleEditChange(e) }} error={editErrors.matricula} placeholder="20230001" />
                        <FormField
                            label="Rol"
                            name="rol"
                            value={editForm.rol}
                            onChange={handleEditChange}
                            type="select"
                            options={[
                                { value: 'Alumno', label: 'Alumno' },
                                { value: 'Docente', label: 'Docente' },
                                { value: 'Admin', label: 'Admin' },
                            ]}
                        />
                    </div>
                    <FormField label="Email institucional" name="email" value={editForm.email} onChange={handleEditChange} error={editErrors.email} type="email" placeholder="usuario@escuela.edu.mx" />
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setEditUser(null)}
                            className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                        >Cancelar</button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
                        >Guardar cambios</button>
                    </div>
                </form>
            </ModalBase>

        </AdminShell>
    )
}
