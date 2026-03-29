/**
 * Button – botón reutilizable.
 * variant: 'primary' | 'outline' | 'ghost'
 * size:    'sm' | 'md' | 'lg' | 'block'
 */
const variants = {
    primary: 'bg-[#E43D12] text-white hover:opacity-90 active:scale-95',
    outline: 'border-2 border-[#E43D12] text-[#E43D12] bg-transparent hover:bg-[#E43D12] hover:text-white',
    ghost: 'text-[#3d3d3d] bg-transparent hover:bg-[#EBE9E1]',
}

const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    block: 'w-full py-3 text-sm',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
    return (
        <button
            disabled={disabled}
            className={`rounded-full font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
