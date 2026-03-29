export default function Card({ children, className = '', hover = false, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm p-5 ${hover ? 'transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    )
}
