import { useState } from 'react'
import { createPortal } from 'react-dom'
import TeacherShell from '../../Components/Layout/TeacherShell'
import Avatar from '../../Components/UI/Avatar'
import Badge from '../../Components/UI/Badge'
import Card from '../../Components/UI/Card'
import Button from '../../Components/UI/Button'

const TEACHER = {
    nombre: 'Dr. Carlos Martínez',
    email: 'carlos.martinez@escuela.edu.mx',
    empleado: 'E00042',
    rol: 'Docente',
    ciclo: 'Enero – Junio 2026',
    createdAt: '2019-08-12',
    activo: true,
    grupos: 4,
}

const resumen = [
    { label: 'Grupos activos', value: 4 },
    { label: 'Alumnos totales', value: 112 },
    { label: 'Tareas publicadas', value: 18 },
]

export default function PerfilMaestroPage() {
    const [editingPw, setEditingPw] = useState(false)
    const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' })
    const [pwErrors, setPwErrors] = useState({})
    const [pwSuccess, setPwSuccess] = useState(false)

    function closePwModal() {
        setEditingPw(false)
        setPwErrors({})
        setPwForm({ actual: '', nueva: '', confirmar: '' })
    }

    function handlePwChange(e) {
        const { name, value } = e.target
        setPwForm(p => ({ ...p, [name]: value }))
        setPwErrors(p => ({ ...p, [name]: '' }))
    }

    function validatePw() {
        const errs = {}
        if (!pwForm.actual) errs.actual = 'Ingresa tu contraseña actual'
        if (pwForm.nueva.length < 6) errs.nueva = 'Mínimo 6 caracteres'
        if (pwForm.nueva !== pwForm.confirmar) errs.confirmar = 'Las contraseñas no coinciden'
        return errs
    }

    function handlePwSubmit(e) {
        e.preventDefault()
        const errs = validatePw()
        if (Object.keys(errs).length) { setPwErrors(errs); return }
        setPwSuccess(true)
        closePwModal()
    }

    return (
        <>
        <TeacherShell>
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Tarjeta de identidad */}
                <Card className="text-center">
                    <div className="flex justify-center mb-4">
                        <Avatar name={TEACHER.nombre} size="xl" variant="secondary" />
                    </div>

                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-[#3d3d3d]">{TEACHER.nombre}</h1>
                        {TEACHER.activo && <Badge variant="secondary">Cuenta Activa</Badge>}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{TEACHER.rol} · {TEACHER.ciclo}</p>

                    <hr className="border-gray-100 my-5" />

                    <div className="space-y-3 text-left">
                        {[
                            { icon: '📧', label: 'Correo electrónico', value: TEACHER.email },
                            { icon: '🪪', label: 'Número de empleado', value: TEACHER.empleado },
                            { icon: '🏫', label: 'Ciclo activo', value: TEACHER.ciclo },
                            { icon: '📅', label: 'Fecha de registro', value: new Date(TEACHER.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) },
                        ].map(row => (
                            <div key={row.label} className="flex items-center gap-3 px-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: '#D6536D18' }}>
                                    {row.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">{row.label}</p>
                                    <p className="text-sm font-semibold text-[#3d3d3d]">{row.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Cambiar contraseña */}
                <Card>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: '#E43D1218' }}>
                                🔒
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#3d3d3d]">Contraseña</p>
                                <p className="text-xs text-gray-400">Última actualización: hace 60 días</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setEditingPw(true); setPwSuccess(false) }}>
                            Cambiar
                        </Button>
                    </div>
                    {pwSuccess && (
                        <div className="mt-4 rounded-xl p-3 text-center" style={{ background: '#10b98118', border: '1px solid #10b98130' }}>
                            <p className="text-sm font-semibold text-emerald-600">✅ Contraseña actualizada correctamente</p>
                        </div>
                    )}
                </Card>

                {/* Resumen */}
                <div>
                    <h2 className="text-sm font-bold text-[#3d3d3d] uppercase tracking-wide mb-3">Resumen docente</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {resumen.map(item => (
                            <div key={item.label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
                                <p className="text-2xl font-bold text-[#3d3d3d]">{item.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </TeacherShell>

        {/* Modal cambiar contraseña */}
        {editingPw && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 anim-fade">
                <div className="absolute inset-0 bg-black/40" onClick={closePwModal} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm anim-modal-in">
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: '#E43D1218' }}>🔒</div>
                            <h2 className="text-base font-bold text-[#3d3d3d]">Cambiar contraseña</h2>
                        </div>
                        <button onClick={closePwModal} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#EBE9E1] hover:text-[#E43D12] transition-all text-sm">✕</button>
                    </div>
                    <form onSubmit={handlePwSubmit} className="px-6 pb-6 pt-5 space-y-3">
                        <PwField label="Contraseña actual" name="actual" value={pwForm.actual} onChange={handlePwChange} error={pwErrors.actual} />
                        <PwField label="Nueva contraseña" name="nueva" value={pwForm.nueva} onChange={handlePwChange} error={pwErrors.nueva} />
                        <PwField label="Confirmar nueva contraseña" name="confirmar" value={pwForm.confirmar} onChange={handlePwChange} error={pwErrors.confirmar} />
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={closePwModal} className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        )}
        </>
    )
}

function PwField({ label, name, value, onChange, error }) {
    const [show, setShow] = useState(false)
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    autoComplete="new-password"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border-2 border-transparent outline-none transition-colors"
                    style={{ backgroundColor: 'var(--color-background)' }}
                    onFocus={e => e.target.style.borderColor = '#FFA2B6'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
                    {show ? '👁️' : '👁️‍🗨️'}
                </button>
            </div>
            {error && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {error}</p>}
        </div>
    )
}
