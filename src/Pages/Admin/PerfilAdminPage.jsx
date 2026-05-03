import { useState } from 'react'
import { Pencil, Lock, User, Mail, IdCard, Calendar, ShieldCheck } from 'lucide-react'
import AdminShell from '../../Components/Layout/AdminShell'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'
import ModalBase from '../../Components/UI/ModalBase'
import FormField from '../../Components/UI/FormField'
import { useAuth } from '../../Context/AuthContext'
import { useToast } from '../../Context/ToastContext'
import { usersService } from '../../Services/usersService'

function validateEdit(form) {
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!form.email.trim()) errors.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email invalido'
    return errors
}

function validatePass(form) {
    const errors = {}
    if (!form.nueva) errors.nueva = 'La nueva contrasena es requerida'
    else if (form.nueva.length < 6) errors.nueva = 'Minimo 6 caracteres'
    if (form.nueva !== form.confirm) errors.confirm = 'Las contrasenas no coinciden'
    return errors
}

export default function PerfilAdminPage() {
    const { user, refreshUser } = useAuth()
    const { addToast } = useToast()
    const [editModal, setEditModal] = useState(false)
    const [passModal, setPassModal] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [passForm, setPassForm] = useState({ nueva: '', confirm: '' })
    const [editErrors, setEditErrors] = useState({})
    const [passErrors, setPassErrors] = useState({})

    if (!user) {
        return <AdminShell><div className="p-10 text-center text-gray-400">Cargando perfil...</div></AdminShell>
    }

    const fechaIngreso = user.created_at
        ? new Date(user.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—'

    function openEdit() {
        setEditForm({ nombre: user.nombre ?? '', email: user.email ?? '' })
        setEditErrors({})
        setEditModal(true)
    }

    async function handleEditSubmit(e) {
        e.preventDefault()
        const errs = validateEdit(editForm)
        if (Object.keys(errs).length) { setEditErrors(errs); return }
        try {
            await usersService.update(user.id, {
                nombre: editForm.nombre.trim(),
                email: editForm.email.trim(),
                matricula: user.matricula,
                rol: user.rol,
            })
            await refreshUser()
            setEditModal(false)
            addToast('Perfil actualizado correctamente')
        } catch (err) {
            const data = err?.response?.data
            const msg = data?.email?.[0] || data?.detail || 'Error al actualizar'
            addToast(msg, 'error')
        }
    }

    async function handlePassSubmit(e) {
        e.preventDefault()
        const errs = validatePass(passForm)
        if (Object.keys(errs).length) { setPassErrors(errs); return }
        try {
            await usersService.update(user.id, { password: passForm.nueva })
            setPassModal(false)
            setPassForm({ nueva: '', confirm: '' })
            addToast('Contrasena actualizada correctamente')
        } catch (err) {
            addToast('Error al cambiar la contrasena', 'error')
        }
    }

    return (
        <AdminShell>
            <div className="space-y-5 max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <Avatar name={user.nombre} size="xl" variant="admin" />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-black text-[#3d3d3d]">{user.nombre || user.email}</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Administrador del sistema</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <Badge variant="primary">Admin</Badge>
                                <span className="text-xs text-gray-400">ID #{user.matricula ?? user.id}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <button
                                    onClick={openEdit}
                                    className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                >
                                    <Pencil size={14} className="inline mr-1" /> Editar perfil
                                </button>
                                <button
                                    onClick={() => { setPassForm({ nueva: '', confirm: '' }); setPassErrors({}); setPassModal(true) }}
                                    className="px-5 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
                                >
                                    <Lock size={14} className="inline mr-1" /> Cambiar contrasena
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informacion */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informacion de la cuenta</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <InfoRow icon={<User size={16} />} label="Nombre" value={user.nombre || '—'} />
                        <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
                        <InfoRow icon={<IdCard size={16} />} label="Matricula / Empleado" value={user.matricula ?? '—'} />
                        <InfoRow icon={<ShieldCheck size={16} />} label="Estado" value={user.activo ? 'Activo' : 'Inactivo'} />
                        <InfoRow icon={<Calendar size={16} />} label="Fecha de ingreso" value={fechaIngreso} />
                    </div>
                </div>
            </div>

            {/* Modal Editar */}
            <ModalBase
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                title="Editar Perfil"
                icon={<Pencil size={18} />}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <FormField label="Nombre completo" name="nombre" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} error={editErrors.nombre} />
                    <FormField label="Email" name="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} error={editErrors.email} type="email" />
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setEditModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Guardar</button>
                    </div>
                </form>
            </ModalBase>

            {/* Modal Cambiar contrasena */}
            <ModalBase
                isOpen={passModal}
                onClose={() => setPassModal(false)}
                title="Cambiar Contrasena"
                icon={<Lock size={18} />}
                maxWidth="max-w-sm"
            >
                <form onSubmit={handlePassSubmit} className="space-y-4">
                    <FormField label="Nueva contrasena" name="nueva" value={passForm.nueva} onChange={e => setPassForm(p => ({ ...p, nueva: e.target.value }))} error={passErrors.nueva} type="password" placeholder="Min. 6 caracteres" />
                    <FormField label="Confirmar" name="confirm" value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} error={passErrors.confirm} type="password" />
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setPassModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Actualizar</button>
                    </div>
                </form>
            </ModalBase>
        </AdminShell>
    )
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#E43D1208' }}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-[#3d3d3d] truncate">{value}</p>
            </div>
        </div>
    )
}
