/**
 * StatCard – tarjeta de resumen con número e ícono para el Dashboard.
 */
export default function StatCard({ label, value, icon, accentColor = '#E43D12' }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${accentColor}18` }}
            >
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-[#3d3d3d]">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
        </div>
    )
}
