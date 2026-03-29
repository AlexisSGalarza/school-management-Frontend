/**
 * Avatar – círculo con iniciales.
 * size: 'sm' | 'md' | 'lg' | 'xl'
 */
const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-3xl',
}

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('')
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
    return (
        <div
            className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${sizes[size]} ${className}`}
            style={{ background: 'linear-gradient(135deg, #FFA2B6 0%, #D6536D 100%)' }}
            aria-label={name}
        >
            {getInitials(name)}
        </div>
    )
}
