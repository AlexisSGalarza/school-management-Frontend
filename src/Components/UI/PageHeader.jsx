import { useNavigate } from 'react-router-dom'

/**
 * PageHeader — encabezado de página reutilizable.
 *
 * Props:
 *   title     {string}  — requerido
 *   subtitle  {string}
 *   backTo    {string}  — path para botón "Volver"
 *   backLabel {string}  — texto del botón volver (default: 'Volver')
 *   action    {{ label, icon, onClick, gradient }}
 *   children  {ReactNode} — slot extra (ej. badges a la derecha)
 */
export default function PageHeader({ title, subtitle, backTo, backLabel = 'Volver', action, children }) {
    const navigate = useNavigate()

    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                {backTo && (
                    <button
                        onClick={() => navigate(backTo)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#E43D12] transition-colors mb-2"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        {backLabel}
                    </button>
                )}
                <h1 className="text-2xl font-bold text-[#3d3d3d] leading-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                {children}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{
                            background: action.gradient ?? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        }}
                    >
                        {action.icon && <span className="text-base leading-none">{action.icon}</span>}
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    )
}
