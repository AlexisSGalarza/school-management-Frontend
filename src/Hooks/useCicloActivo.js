import { useEffect, useState } from 'react'
import { ciclosService } from '../Services/ciclosService'

/**
 * Trae el ciclo escolar activo del backend. Cachea el resultado en memoria
 * por la sesion para no rehacer la peticion en cada render del shell.
 */
let cached = null
let inflight = null

export function useCicloActivo() {
    const [ciclo, setCiclo] = useState(cached)

    useEffect(() => {
        if (cached) { setCiclo(cached); return }
        if (!inflight) {
            inflight = ciclosService.getAll()
                .then(data => {
                    const list = Array.isArray(data) ? data : data.results ?? []
                    return list.find(c => c.activo) ?? list[0] ?? null
                })
                .catch(() => null)
        }
        inflight.then(c => {
            cached = c
            setCiclo(c)
        })
    }, [])

    return ciclo
}
