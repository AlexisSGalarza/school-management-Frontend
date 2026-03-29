import { useState } from 'react'

export default function LoginForm({ onswitch }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        const errs = {}
        if (!email.includes('@')) errs.email = 'Email inválido'
        if (password.length < 6) errs.password = 'Mínimo 6 caracteres'
        setError(errs)
        if (Object.keys(errs).length) { setError(errs); return }
        console.log("Login:", { email, password })
    }

    return (
        <div className="w-full max-w-xs">
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold mb-0.5" style={{ color: 'var(--color-primary)' }}>Inicia Sesión</h1>
                <p className="text-xs opacity-70">Accede a tu cuenta</p>
            </div>

            <div className="flex gap-2 justify-center mb-4">
                <button type="button" className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:scale-110" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>f</button>
                <button type="button" className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:scale-110" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>G</button>
                <button type="button" className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:scale-110" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>in</button>
            </div>

            <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-2" style={{ borderColor: 'var(--color-background)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white" style={{ color: 'var(--color-accent)' }}>o usa tu email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none transition-all focus:scale-105"
                        style={{ borderColor: 'var(--color-background)', backgroundColor: 'var(--color-background)' }}
                    />
                    {error.email && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {error.email}</p>}
                </div>

                <div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            className="w-full px-3 py-2 rounded-lg border-2 text-xs outline-none transition-all focus:scale-105"
                            style={{ borderColor: 'var(--color-background)', backgroundColor: 'var(--color-background)' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    {error.password && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-primary)' }}>✗ {error.password}</p>}
                </div>

                <div className="text-right pt-1">
                    <button type="button" className="text-xs font-semibold transition-colors hover:opacity-60" style={{ color: 'var(--color-accent)' }}>
                        ¿Olvidaste?
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full text-white py-2 rounded-lg uppercase text-xs tracking-widest font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95 mt-2 my-2"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Inicia Sesión
                </button>
            </form>

            <p className="text-center text-xs mt-3 opacity-70">
                ¿No tienes cuenta?{" "}
                <button onClick={onswitch} className="font-semibold transition-colors hover:opacity-60" style={{ color: 'var(--color-primary)' }}>
                    Regístrate
                </button>
            </p>
        </div>
    )
}