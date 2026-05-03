import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, UsersRound, BookOpen, PenLine, User, Hand, LogOut } from 'lucide-react'
import Avatar from '../UI/Avatar'
import { useAuth } from '../../Context/AuthContext'
import { useCicloActivo } from '../../Hooks/useCicloActivo'
import { entregasService } from '../../Services/entregasService'

const navItems = [
    { to: '/maestro/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/maestro/grupos', icon: UsersRound, label: 'Mis Grupos' },
    { to: '/maestro/materias', icon: BookOpen, label: 'Materias' },
    { to: '/maestro/calificacion', icon: PenLine, label: 'Calificación' },
    { to: '/maestro/perfil', icon: User, label: 'Mi Perfil' },
]

function tiempoRelativo(iso) {
    if (!iso) return ''
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'Hace un momento'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function TeacherShell({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()
    const cicloActivo = useCicloActivo()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [bellOpen, setBellOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [logoutModal, setLogoutModal] = useState(false)
    const [avisos, setAvisos] = useState([])
    const [readIds, setReadIds] = useState(() => new Set(JSON.parse(localStorage.getItem('avisos_leidos_docente') || '[]')))

    const nombreUsuario = user?.nombre || user?.email || 'Docente'
    const cicloNombre = cicloActivo?.nombre || 'Sin ciclo activo'
    const empleado = user?.matricula ?? '—'

    const bellRef = useRef(null)
    const userRef = useRef(null)

    // Avisos del docente: nuevas entregas pendientes de calificar
    useEffect(() => {
        let cancelled = false
        entregasService.getAll()
            .then(data => {
                if (cancelled) return
                const list = Array.isArray(data) ? data : data.results ?? []
                const pendientes = list
                    .filter(e => e.calificacion === null || e.calificacion === undefined)
                    .sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega))
                    .slice(0, 8)
                setAvisos(pendientes.map(e => ({
                    id: e.id,
                    texto: `Entrega de ${e.alumno_nombre || 'alumno'} en ${e.tarea_titulo || 'tarea'}`,
                    materia: e.tarea_titulo || 'Tarea',
                    tiempo: tiempoRelativo(e.fecha_entrega),
                    leido: readIds.has(e.id),
                })))
            })
            .catch(() => { if (!cancelled) setAvisos([]) })
        return () => { cancelled = true }
    }, [readIds])

    function handleLogout() {
        logout()
        navigate('/auth')
    }

    useEffect(() => {
        function handle(e) {
            if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
            if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    const unread = avisos.filter(a => !a.leido).length

    function markAllRead() {
        const allIds = new Set([...readIds, ...avisos.map(a => a.id)])
        setReadIds(allIds)
        localStorage.setItem('avisos_leidos_docente', JSON.stringify([...allIds]))
        setAvisos(prev => prev.map(a => ({ ...a, leido: true })))
    }

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>

            {/* ── SIDEBAR DESKTOP ── */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 sticky top-0 h-screen flex-shrink-0">
                <div className="px-5 py-5">
                    <BrandLogo />
                </div>
                <SidebarContent navigate={navigate} nombre={nombreUsuario} />
            </aside>

            {/* ── DRAWER MOBILE ── */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm anim-fade" onClick={() => setMobileOpen(false)} />
                    <aside className="relative z-50 flex flex-col w-72 bg-white h-full shadow-2xl anim-slide-left">
                        <div className="flex items-center justify-between px-5 py-5">
                            <BrandLogo />
                            <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#EBE9E1] hover:text-[#E43D12] transition-all">✕</button>
                        </div>
                        <SidebarContent navigate={navigate} nombre={nombreUsuario} onNavClick={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── MODAL CERRAR SESIÓN ── */}
            {logoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setLogoutModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center space-y-4 anim-modal-in">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto" style={{ background: '#E43D1218' }}>
                            <Hand size={28} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-[#3d3d3d]">¿Cerrar sesión?</p>
                            <p className="text-sm text-gray-400 mt-1">Tendrás que volver a iniciar sesión para acceder.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setLogoutModal(false)}
                                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
                            >Cancelar</button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >Cerrar sesión</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* TOP BAR */}
                <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-0 flex items-center justify-between sticky top-0 z-30 h-16">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#EBE9E1] transition-colors text-[#3d3d3d]"
                            aria-label="Abrir menú"
                        >
                            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                                <rect width="18" height="2" rx="1" fill="currentColor" />
                                <rect y="6" width="12" height="2" rx="1" fill="currentColor" />
                                <rect y="12" width="18" height="2" rx="1" fill="currentColor" />
                            </svg>
                        </button>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                                <p className="text-sm font-semibold text-[#3d3d3d]">{cicloNombre}</p>
                            </div>
                            <p className="text-xs text-gray-400 pl-4">Ciclo activo</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">

                        {/* ── CAMPANA ── */}
                        <div ref={bellRef} className="relative">
                            <button
                                onClick={() => { setBellOpen(p => !p); setUserMenuOpen(false) }}
                                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${bellOpen ? 'bg-[#EBE9E1]' : 'hover:bg-[#EBE9E1]'}`}
                                title="Notificaciones"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? '#E43D12' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unread > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: 'var(--color-secondary)' }}>
                                        {unread}
                                    </span>
                                )}
                            </button>

                            {bellOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 anim-slide-down">
                                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[#3d3d3d]">Notificaciones</p>
                                            {unread > 0 && (
                                                <span className="text-xs font-bold text-white rounded-full px-1.5 py-0.5" style={{ backgroundColor: 'var(--color-secondary)' }}>{unread}</span>
                                            )}
                                        </div>
                                        {unread > 0 && (
                                            <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Marcar leídos</button>
                                        )}
                                    </div>
                                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                        {avisos.map(a => (
                                            <div key={a.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!a.leido ? 'bg-[#FFA2B6]/8' : ''}`}>
                                                <div className="flex items-start gap-2.5">
                                                    <div
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                                                        style={{ background: !a.leido ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : '#e5e7eb' }}
                                                    >
                                                        {a.materia[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-secondary)' }}>{a.materia}</p>
                                                        <p className="text-sm text-[#3d3d3d] mt-0.5 leading-snug">{a.texto}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{a.tiempo}</p>
                                                    </div>
                                                    {!a.leido && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--color-secondary)' }} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── USER MENU ── */}
                        <div ref={userRef} className="relative">
                            <button
                                onClick={() => { setUserMenuOpen(p => !p); setBellOpen(false) }}
                                className={`flex items-center gap-2 rounded-xl pl-1 pr-3 py-1 transition-all duration-200 ${userMenuOpen ? 'bg-[#EBE9E1]' : 'hover:bg-[#EBE9E1]'}`}
                            >
                                <Avatar name={nombreUsuario} size="sm" variant="secondary" />
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-bold text-[#3d3d3d] leading-tight truncate max-w-[120px]">{nombreUsuario}</p>
                                    <p className="text-[10px] text-gray-400 leading-tight">Docente</p>
                                </div>
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}>
                                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 anim-slide-down">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-xs font-bold text-[#3d3d3d] truncate">{nombreUsuario}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Docente · Emp. {empleado}</p>
                                    </div>
                                    <button
                                        onClick={() => { navigate('/maestro/perfil'); setUserMenuOpen(false) }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d3d3d] hover:bg-[#EBE9E1] transition-colors"
                                    >
                                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: '#D6536D18' }}><User size={14} /></span>
                                        Mi Perfil
                                    </button>
                                    <div className="border-t border-gray-100 mx-3" />
                                    <button
                                        onClick={() => { setUserMenuOpen(false); setLogoutModal(true) }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-[#E43D1208] mb-1 transition-colors"
                                        style={{ color: 'var(--color-primary)' }}
                                    >
                                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: '#E43D1218' }}><LogOut size={14} /></span>
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto pb-20 lg:pb-6">
                    <div key={location.pathname} className="anim-page-in">
                        {children}
                    </div>
                </main>

                {/* ── BOTTOM NAV MOBILE ── */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${isActive ? 'text-[#E43D12]' : 'text-gray-400'}`
                            }
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    )
}

function BrandLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' }}
            >
                SE
            </div>
            <div>
                <p className="font-black text-sm text-[#3d3d3d] leading-tight">Sistema</p>
                <p className="font-black text-sm leading-tight" style={{ color: 'var(--color-primary)' }}>Escolar</p>
            </div>
        </div>
    )
}

function SidebarContent({ navigate, onNavClick, nombre }) {
    return (
        <div className="flex flex-col h-full">
            <div className="px-3 flex-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Menú</p>
                <nav className="space-y-0.5">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={onNavClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-500 hover:bg-[#EBE9E1] hover:text-[#3d3d3d]'}`
                            }
                            style={({ isActive }) => isActive
                                ? { background: 'linear-gradient(135deg, #E43D12 0%, #D6536D 100%)' }
                                : {}
                            }
                        >
                            <span className="w-7 h-7 flex items-center justify-center flex-shrink-0"><item.icon size={18} /></span>
                            <span className="flex-1">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Teacher footer */}
            <div className="px-3 pb-4 pt-3 border-t border-gray-100">
                <div
                    className="flex items-center gap-3 bg-[#EBE9E1] rounded-xl px-3 py-2.5 cursor-pointer hover:bg-[#e0ddd5] transition-colors duration-200"
                    onClick={() => navigate('/maestro/perfil')}
                >
                    <Avatar name={nombre} size="sm" variant="secondary" />
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#3d3d3d] truncate">{nombre}</p>
                        <p className="text-[10px] text-gray-400">Docente</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
