import { useNavigate } from 'react-router-dom'
import AppShell from '../../Components/Layout/AppShell'
import Badge from '../../Components/UI/Badge'

// ── Mock data ────────────────────────────────────────────────
const materias = [
    { id: 1, nombre: 'Desarrollo Web', clave: 'DW-301', docente: 'Dr. Martínez', grupo: 'Grupo A', tareasNuevas: 2, color: '#E43D12' },
    { id: 2, nombre: 'Física II', clave: 'FIS-202', docente: 'Ing. Ramírez', grupo: 'Grupo B', tareasNuevas: 1, color: '#D6536D' },
    { id: 3, nombre: 'Cálculo Integral', clave: 'MAT-303', docente: 'Lic. Herrera', grupo: 'Grupo A', tareasNuevas: 0, color: '#EFB11D' },
    { id: 4, nombre: 'Español', clave: 'ESP-101', docente: 'Lic. Torres', grupo: 'Grupo C', tareasNuevas: 0, color: '#FFA2B6' },
    { id: 5, nombre: 'Programación OOP', clave: 'PRG-204', docente: 'Ing. Castro', grupo: 'Grupo A', tareasNuevas: 3, color: '#E43D12' },
    { id: 6, nombre: 'Base de Datos', clave: 'BD-205', docente: 'Dr. Sandoval', grupo: 'Grupo B', tareasNuevas: 0, color: '#D6536D' },
]
// ─────────────────────────────────────────────────────────────

export default function MateriasPage() {
    const navigate = useNavigate()

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-[#3d3d3d]">Mis Materias</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Ciclo: Enero – Junio 2026 · {materias.length} materias inscritas</p>
                </div>

                {/* Grid de cards */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {materias.map(m => (
                        <MateriaCard key={m.id} materia={m} onClick={() => navigate(`/alumno/materias/${m.id}`)} />
                    ))}
                </div>
            </div>
        </AppShell>
    )
}

function MateriaCard({ materia, onClick }) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
        >
            {/* Header degradado */}
            <div
                className="h-24 flex items-end px-5 pb-4 relative"
                style={{ background: `linear-gradient(135deg, ${materia.color} 0%, ${materia.color}99 100%)` }}
            >
                <div>
                    <p className="text-white font-bold text-base leading-tight">{materia.nombre}</p>
                    <p className="text-white/70 text-xs mt-0.5">{materia.clave}</p>
                </div>

                {/* Badge de tareas nuevas */}
                {materia.tareasNuevas > 0 && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary">{materia.tareasNuevas} nueva{materia.tareasNuevas > 1 ? 's' : ''}</Badge>
                    </div>
                )}
            </div>

            {/* Cuerpo */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm">👨‍🏫</span>
                    <p className="text-xs text-gray-500">{materia.docente}</p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs bg-[#EBE9E1] text-gray-600 rounded-full px-2.5 py-0.5 font-medium">{materia.grupo}</span>
                    <span
                        className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        Ver aula →
                    </span>
                </div>
            </div>

            {/* Hover border accent */}
            <div
                className="h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: 'var(--color-accent)' }}
            />
        </div>
    )
}
