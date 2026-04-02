import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'

/**
 * FormField — campo de formulario reutilizable.
 *
 * Props:
 *   label       {string}
 *   name        {string}
 *   value       {string}
 *   onChange    {(e) => void}
 *   error       {string}
 *   type        {'text'|'password'|'email'|'date'|'number'|'textarea'|'select'}
 *   placeholder {string}
 *   rows        {number}   — solo para textarea
 *   options     {Array<{value, label}>}  — solo para select
 *   disabled    {boolean}
 *   className   {string}
 */
export default function FormField({
    label,
    name,
    value,
    onChange,
    error,
    type = 'text',
    placeholder = '',
    rows,
    options,
    disabled = false,
    className = '',
}) {
    const [showPass, setShowPass] = useState(false)

    const base = `w-full text-sm px-4 py-2.5 rounded-xl border-2 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`
    const bg = { backgroundColor: 'var(--color-background)' }
    const border = {
        borderColor: error ? 'var(--color-primary)' : 'transparent',
    }
    const focus = {
        onFocus: e => { e.target.style.borderColor = '#FFA2B6' },
        onBlur: e => { e.target.style.borderColor = error ? 'var(--color-primary)' : 'transparent' },
    }
    const common = { name, value, onChange, placeholder, disabled, style: { ...bg, ...border }, className: base, ...focus }

    return (
        <div>
            {label && (
                <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
            )}

            {type === 'textarea' && (
                <textarea
                    {...common}
                    rows={rows ?? 4}
                    className={`${base} resize-none`}
                />
            )}

            {type === 'select' && (
                <select {...common}>
                    {options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            )}

            {type === 'password' && (
                <div className="relative">
                    <input type={showPass ? 'text' : 'password'} autoComplete="new-password" {...common} />
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                    >
                        {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
            )}

            {!['textarea', 'select', 'password'].includes(type) && (
                <input type={type} {...common} />
            )}

            {error && (
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-primary)' }}>
                    <X size={12} className="inline" /> {error}
                </p>
            )}
        </div>
    )
}
