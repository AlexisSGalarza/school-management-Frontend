/**
 * Avatar – círculo con iniciales.
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * variant: 'default' (pink/secondary) | 'secondary' (deeper rose, for teachers) | 'admin' (red/dark)
 */
const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-3xl',
}

const gradients = {
    default: 'linear-gradient(135deg, #FFA2B6 0%, #D6536D 100%)',
    secondary: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)',
    admin: 'linear-gradient(135deg, #E43D12 0%, #b83200 100%)',
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
}

export default function Avatar({ name = '', size = 'md', variant = 'default', className = '' }) {
    return (
        <div
            className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${sizes[size]} ${className}`}
            style={{ background: gradients[variant] ?? gradients.default }}
            aria-label={name}
        >
            {getInitials(name)}
        </div>
    )
}
