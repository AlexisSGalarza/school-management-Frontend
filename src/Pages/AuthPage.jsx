import { useState } from 'react'
import LoginForm from '../Components/Auth/LoginForm'
import SignUpForm from '../Components/Auth/SignupForm'

export default function AuthPage() {
    const [mode, setMode] = useState('login')
    const [dir, setDir] = useState('left')

    function goTo(next) {
        setDir(next === 'signup' ? 'left' : 'right')
        setMode(next)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'var(--color-background)' }}>


            <div className="lg:hidden w-full max-w-lg">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                    <div className="px-8 sm:px-10 py-12">
                        <div key={mode} className={dir === 'left' ? 'anim-slide-from-right' : 'anim-slide-from-left'}>
                            {mode === 'login'
                                ? <LoginForm onswitch={() => goTo('signup')} />
                                : <SignUpForm onswitch={() => goTo('login')} />
                            }
                        </div>
                    </div>
                </div>
            </div>


            <div className="hidden lg:flex relative w-full max-w-5xl h-[600px] rounded-3xl overflow-hidden shadow-2xl">

                {/* Left Panel - Login */}
                <div className={`w-1/2 bg-white flex flex-col items-center justify-center px-8 xl:px-12 py-10 transition-opacity duration-500 ${mode === 'signup' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <LoginForm onswitch={() => setMode('signup')} />
                </div>

                {/* Right Panel - Signup */}
                <div className={`w-1/2 bg-white flex flex-col items-center justify-center px-8 xl:px-12 py-10 transition-opacity duration-500 ${mode === 'login' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <SignUpForm onswitch={() => setMode('login')} />
                </div>


                <div
                    className="absolute top-0 w-1/2 h-full flex flex-col items-center justify-center text-white text-center px-8 transition-all duration-1000 ease-in-out rounded-3xl"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        left: mode === 'login' ? '50%' : '0%',
                        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.1)'
                    }}
                >
                    {mode === 'login' ? (
                        <div key="login" className="space-y-6 px-4 anim-modal-in">
                            <div>
                                <p className="text-5xl font-bold mb-2">¡Hola!</p>
                                <p className="text-white/80">Estudiante</p>
                            </div>
                            <p className="text-sm leading-relaxed opacity-95 max-w-xs mx-auto">
                                Ingresa tus datos personales y comienza tu camino al éxito con nosotros
                            </p>
                            <button
                                onClick={() => setMode('signup')}
                                className="border-2 border-white text-white px-10 py-3 rounded-full uppercase text-xs tracking-widest font-semibold transition-all duration-300 hover:scale-105 mt-2"
                                style={{
                                    backgroundColor: 'transparent',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'white'
                                    e.target.style.color = 'var(--color-primary)'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'white'
                                }}
                            >
                                Regístrate
                            </button>
                        </div>
                    ) : (
                        <div key="signup" className="space-y-6 px-4 anim-modal-in">
                            <div>
                                <p className="text-5xl font-bold mb-2">¡Bienvenido!</p>
                                <p className="text-white/80">de Vuelta!</p>
                            </div>
                            <p className="text-sm leading-relaxed opacity-95 max-w-xs mx-auto">
                                Para seguir con tu aprendizaje, inicia sesión con tus datos personales
                            </p>
                            <button
                                onClick={() => setMode('login')}
                                className="border-2  border-white text-white px-10 py-3 rounded-full uppercase text-xs tracking-widest font-semibold transition-all duration-300 hover:scale-105 mt-2"
                                style={{
                                    backgroundColor: 'transparent',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'white'
                                    e.target.style.color = 'var(--color-primary)'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'white'
                                }}
                            >
                                Inicia Sesión
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
