import { createPortal } from 'react-dom'

/**
 * ModalBase — wrapper reutilizable para todos los modales.
 * Usa createPortal para escapar transforms/z-index del árbol DOM.
 *
 * Props:
 *   isOpen   {boolean}
 *   onClose  {() => void}
 *   title    {string}
 *   icon     {ReactNode}
 *   iconBg   {string}  — color de fondo del icono (default: #E43D1218)
 *   maxWidth {string}  — clase Tailwind (default: 'max-w-sm')
 *   children {ReactNode}
 */
export default function ModalBase({
    isOpen,
    onClose,
    title,
    icon,
    iconBg = '#E43D1218',
    maxWidth = 'max-w-sm',
    children,
}) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 anim-fade">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} anim-modal-in`}>

                {(title || icon) && (
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                    style={{ background: iconBg }}
                                >
                                    {icon}
                                </div>
                            )}
                            {title && (
                                <h2 className="text-base font-bold text-[#3d3d3d]">{title}</h2>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#EBE9E1] hover:text-[#E43D12] transition-all text-sm"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="px-6 pb-6 pt-5">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
