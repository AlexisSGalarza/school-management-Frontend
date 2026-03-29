/**
 * Tabs – barra de pestañas con subrayado activo en --color-primary.
 * tabs: [{ key, label }]
 */
export default function Tabs({ tabs, active, onChange }) {
    return (
        <div className="flex gap-1 border-b border-gray-200">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px ${active === tab.key
                            ? 'border-[#E43D12] text-[#E43D12]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
