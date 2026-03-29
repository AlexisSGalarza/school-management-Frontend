
const variants = {
    primary: 'bg-[#E43D12] text-white',
    secondary: 'bg-[#D6536D] text-white',
    warning: 'bg-[#EFB11D] text-white',
    accent: 'bg-[#FFA2B6] text-white',
    success: 'bg-emerald-500 text-white',
    muted: 'bg-gray-200 text-gray-500',
}

export default function Badge({ children, variant = 'secondary', className = '' }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}
