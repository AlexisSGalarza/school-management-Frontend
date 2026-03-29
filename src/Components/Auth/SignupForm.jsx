import { useState } from "react";

export default function SignUpForm({ onswitch }) {
    const [form, setForm] = useState({
        nombre: "", email: "", password: "", confirm: ""
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    function set(campo) {
        return (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        const errs = {}
        if (!form.nombre.trim()) errs.nombre = "Requerido"
        if (!form.email.includes("@")) errs.email = "Email inválido"
        if (form.password.length < 6) errs.password = "Mínimo 6 caracteres"
        if (form.password !== form.confirm) errs.confirm = "No coinciden"
        if (Object.keys(errs).length) { setErrors(errs); return }
        console.log("Registro:", form)
    }

    return (
        <div className="w-full max-w-xs">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold mb-0.5" style={{ color: 'var(--color-primary)' }}>Crea tu Cuenta</h1>
                <p className="text-xs opacity-70">Únete a nuestra comunidad</p>
            </div>

            <div className="flex gap-2 justify-center mb-4">
                <button type="button" className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:scale-110" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>f</button>
                <button type="button" className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:scale-110" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>G</button>
                <button type="button" className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:scale-110" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>in</button>
            </div>

            <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2" style={{ borderColor: 'var(--color-background)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white" style={{ color: 'var(--color-accent)' }}>o usa tu email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                    <input
                        type="text"
                        value={form.nombre}
                        onChange={set("nombre")}
                        placeholder="Tu nombre"
                        className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none transition-all focus:scale-105"
                        style={{ borderColor: 'var(--color-background)', backgroundColor: 'var(--color-background)' }}
                    />
                    {errors.nombre && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.nombre}</p>}
                </div>

                <div>
                    <input
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="tu@email.com"
                        className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none transition-all focus:scale-105"
                        style={{ borderColor: 'var(--color-background)', backgroundColor: 'var(--color-background)' }}
                    />
                    {errors.email && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.email}</p>}
                </div>

                <div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={set("password")}
                            placeholder="Contraseña"
                            className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none transition-all focus:scale-105"
                            style={{ borderColor: 'var(--color-background)', backgroundColor: 'var(--color-background)' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base"
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.password}</p>}
                </div>

                <div>
                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            value={form.confirm}
                            onChange={set("confirm")}
                            placeholder="Confirmar contraseña"
                            className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none transition-all focus:scale-105"
                            style={{ borderColor: 'var(--color-background)', backgroundColor: 'var(--color-background)' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base"
                        >
                            {showConfirm ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {errors.confirm && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {errors.confirm}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full text-white py-2.5 rounded-xl uppercase text-xs tracking-widest font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95 mt-2 my-2"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Regístrate
                </button>
            </form>

            <p className="text-center text-xs mt-4 opacity-70">
                ¿Ya tienes cuenta?{" "}
                <button onClick={onswitch} className="font-semibold transition-colors hover:opacity-60" style={{ color: 'var(--color-primary)' }}>
                    Inicia sesión
                </button>
            </p>
        </div>
    )
}
