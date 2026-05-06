import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import TeacherShell from '../../Components/Layout/TeacherShell'
import PageHeader from '../../Components/UI/PageHeader'
import Badge from '../../Components/UI/Badge'
import { useAuth } from '../../Context/AuthContext'
import { gruposService } from '../../Services/gruposService'
import { materiasService } from '../../Services/materiasService'

export default function MateriasDocentePage() {
    const { user } = useAuth()
    const [materias, setMaterias] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [gruposRes, materiasRes] = await Promise.all([
                    gruposService.getAll(),
                    materiasService.getAll(),
                ])
                const gruposList = Array.isArray(gruposRes) ? gruposRes : gruposRes.results ?? []
                const materiasList = Array.isArray(materiasRes) ? materiasRes : materiasRes.results ?? []

                const misMateriaIds = new Set(
                    gruposList.filter(g => g.docente === user?.id).map(g => g.materia)
                )
                setMaterias(materiasList.filter(m => misMateriaIds.has(m.id)))
            } catch { /* ignore */ }
            setLoading(false)
        }
        if (user?.id) fetchData()
    }, [user])

    return (
        <TeacherShell>
            <div className="space-y-5 max-w-3xl mx-auto">

                <PageHeader
                    title="Mis Materias"
                    subtitle={`${materias.length} materia${materias.length !== 1 ? 's' : ''} que impartes`}
                />

                {loading ? (
                    <p className="text-center text-gray-400 py-12 text-sm">Cargando…</p>
                ) : materias.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                        <p className="text-4xl mb-3"><BookOpen size={40} className="mx-auto text-gray-300" /></p>
                        <p className="text-sm font-semibold text-[#3d3d3d]">Sin materias asignadas</p>
                        <p className="text-xs text-gray-400 mt-1">El administrador aún no te asigna grupos.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {materias.map(m => (
                            <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <code
                                        className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                        style={{ background: '#E43D1210', color: 'var(--color-primary)' }}
                                    >{m.clave}</code>
                                    <Badge variant="success">Asignada</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#3d3d3d] leading-snug">{m.nombre}</p>
                                    <p className="text-xs text-gray-400 mt-1">{m.ciclo_nombre ?? '—'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TeacherShell>
    )
}
