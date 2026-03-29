import { useState } from 'react'
import AdminShell from '../../Components/Layout/AdminShell'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'
import ModalBase from '../../Components/UI/ModalBase'
import FormField from '../../Components/UI/FormField'
import { useToast } from '../../Context/ToastContext'

const INIT_ADMIN = {
    nombre:   'Lic. Patricia Montes',
    email:    'patricia.montes@escuela.edu.mx',
    empleado: 'ADM001',
    cargo:    'Administradora General',
    telefono: '+52 (55) 1234-5678',
    ingreso:  '2021-03-15',
}

function validateEdit(form) {
    const errors = {}
    if (!form.nombre.trim())  errors.nombre  = 'El nombre es requerido'
    if (!form.email.trim())   errors.email   = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
    if (!form.telefono.trim()) errors.telefono = 'El teléfono es requerido'
    return errors
}

function validatePass(form) {
    const errors = {}
    if (!form.actual)              errors.actual   = 'Ingresa tu contraseña actual'
    if (!form.nueva)               errors.nueva    = 'La nueva contraseña es requerida'
    else if (form.nueva.length < 6) errors.nueva   = 'Mínimo 6 caracteres'
    if (form.nueva !== form.confirm) errors.confirm = 'Las contraseñas no coinciden'
    return errors
}

export default function PerfilAdminPage() {
    const { addToast } = useToast()
    const [admin,      setAdmin]      = useState(INIT_ADMIN)
    const [editModal,  setEditModal]  = useState(false)
    const [passModal,  setPassModal]  = useState(false)
    const [editForm,   setEditForm]   = useState({})
    const [passForm,   setPassForm]   = useState({ actual: '', nueva: '', confirm: '' })
    const [editErrors, setEditErrors] = useState({})
    const [passErrors, setPassErrors] = useState({})

    function openEdit() {
        setEditForm({ nombre: admin.nombre, email: admin.email, telefono: admin.telefono, cargo: admin.cargo })
        setEditErrors({})
        setEditModal(true)
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
        setAdmin(prev => ({ ...prev, ...editForm }))
        setEditModal(false)
        addToast('Perfil actualizado correctamente')
    }

    function handlePassChange(e) {
        const { name, value } = e.target
        setPassForm(prev => ({ ...prev, [name]: value }))
        setPassErrors(prev => ({ ...prev, [name]: undefined }))
    }

    function handlePassSubmit(e) {
        e.preventDefault()
        const errs = validatePass(passForm)
        if (Object.keys(errs).length) { setPassErrors(errs); return }
        setPassModal(false)
        setPassForm({ actual: '', nueva: '', confirm: '' })
        addToast('Contraseña actualizada correctamente')
    }

    return (
        <AdminShell>
            <div className="space-y-5 max-w-2xl mx-auto">

                {/* Header de perfil */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <Avatar name={admin.nombre} size="xl" variant="admin" />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-black text-[#3d3d3d]">{admin.nombre}</h1>
                            <p className="text-sm text-gray-400 mt-0.5">{admin.cargo}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <Badge variant="primary">Admin</Badge>
                                <span className="text-xs text-gray-400">{admin.empleado}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <button
                                    onClick={openEdit}
                                    className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                                >
                                    ✏️ Editar perfil
                                </button>
                                <button
                                    onClick={() => { setPassForm({ actual: '', nueva: '', confirm: '' }); setPassErrors({}); setPassModal(true) }}
                                    className="px-5 py-2 rounded-full text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
                                >
                                    🔒 Cambiar contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Información de la cuenta</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <InfoRow icon="👤" label="Nombre completo"   value={admin.nombre}   />
                        <InfoRow icon="📧" label="Email institucional" value={admin.email}   />
                        <InfoRow icon="📞" label="Teléfono"           value={admin.telefono} />
                        <InfoRow icon="🏷️"  label="Cargo"             value={admin.cargo}    />
                        <InfoRow icon="🪪"  label="ID Empleado"        value={admin.empleado} />
                        <InfoRow
                            icon="📅"
                            label="Fecha de ingreso"
                            value={new Date(admin.ingreso + 'T12:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        />
                    </div>
                </div>

                {/* Seguridad */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seguridad</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#E43D1210' }}>🔒</div>
                            <div>
                                <p className="text-sm font-semibold text-[#3d3d3d]">Contraseña</p>
                                <p className="text-xs text-gray-400">Última actualización: hace 30 días</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setPassForm({ actual: '', nueva: '', confirm: '' }); setPassErrors({}); setPassModal(true) }}
                            className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            style={{ background: '#E43D1210', color: 'var(--color-primary)' }}
                        >Cambiar</button>
                    </div>
                </div>

            </div>

            {/* Modal Editar perfil */}
            <ModalBase
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                title="Editar Perfil"
                icon="✏️"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <FormField label="Nombre completo"     name="nombre"   value={editForm.nombre}   onChange={handleEditChange} error={editErrors.nombre}  />
                    <FormField label="Email institucional" name="email"    value={editForm.email}    onChange={handleEditChange} error={editErrors.email}   type="email" />
                    <FormField label="Teléfono"            name="telefono" value={editForm.telefono} onChange={handleEditChange} error={editErrors.telefono} />
                    <FormField label="Cargo"               name="cargo"    value={editForm.cargo}    onChange={handleEditChange} />
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setEditModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Guardar</button>
                    </div>
                </form>
            </ModalBase>

            {/* Modal Cambiar contraseña */}
            <ModalBase
                isOpen={passModal}
                onClose={() => setPassModal(false)}
                title="Cambiar Contraseña"
                icon="🔒"
                iconBg="#E43D1218"
                maxWidth="max-w-sm"
            >
                <form onSubmit={handlePassSubmit} className="space-y-4">
                    <FormField label="Contraseña actual"   name="actual"  value={passForm.actual}  onChange={handlePassChange} error={passErrors.actual}  type="password" />
                    <FormField label="Nueva contraseña"    name="nueva"   value={passForm.nueva}   onChange={handlePassChange} error={passErrors.nueva}   type="password" placeholder="Mín. 6 caracteres" />
                    <FormField label="Confirmar contraseña" name="confirm" value={passForm.confirm} onChange={handlePassChange} error={passErrors.confirm} type="password" />
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setPassModal(false)} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>Actualizar</button>
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
