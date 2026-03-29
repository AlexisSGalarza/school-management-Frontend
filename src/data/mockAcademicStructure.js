/**
 * Estructura académica del sistema (mock).
 * Ciclos → Materias → Grupos → Inscripciones
 */

export const CICLOS = [
    { id: 1, nombre: 'Agosto – Diciembre 2025', inicio: '2025-08-01', fin: '2025-12-15', activo: false },
    { id: 2, nombre: 'Enero – Junio 2026', inicio: '2026-01-05', fin: '2026-06-30', activo: true },
    { id: 3, nombre: 'Agosto – Diciembre 2026', inicio: '2026-08-01', fin: '2026-12-15', activo: false },
]

export const MATERIAS = [
    { id: 1, clave: 'INF-101', nombre: 'Introducción a la Programación', cicloId: 2, creditos: 6 },
    { id: 2, clave: 'MAT-203', nombre: 'Cálculo Diferencial e Integral', cicloId: 2, creditos: 8 },
    { id: 3, clave: 'FIS-201', nombre: 'Física II', cicloId: 2, creditos: 6 },
    { id: 4, clave: 'INF-305', nombre: 'Desarrollo Web', cicloId: 2, creditos: 8 },
    { id: 5, clave: 'MAT-101', nombre: 'Álgebra Lineal', cicloId: 2, creditos: 6 },
    { id: 6, clave: 'INF-210', nombre: 'Estructura de Datos', cicloId: 2, creditos: 6 },
    { id: 7, clave: 'INF-150', nombre: 'Fundamentos de Bases de Datos', cicloId: 1, creditos: 6 },
    { id: 8, clave: 'MAT-180', nombre: 'Cálculo I', cicloId: 1, creditos: 8 },
]

export const GRUPOS = [
    { id: 1, clave: 'G41A', codigo: 'G41A-XK92', materiaId: 1, materia: 'Introducción a la Programación', docenteId: 13, docente: 'Dr. Carlos Martínez',    cicloId: 2, alumnos: [1, 2, 3, 5, 9],       capacidad: 30 },
    { id: 2, clave: 'G42A', codigo: 'G42A-MN58', materiaId: 2, materia: 'Cálculo Diferencial e Integral',  docenteId: 14, docente: 'Dra. Laura Gómez Reyes', cicloId: 2, alumnos: [4, 6, 7, 10, 11],    capacidad: 25 },
    { id: 3, clave: 'G43B', codigo: 'G43B-PQ31', materiaId: 3, materia: 'Física II',                        docenteId: 13, docente: 'Dr. Carlos Martínez',    cicloId: 2, alumnos: [1, 8, 12],           capacidad: 20 },
    { id: 4, clave: 'G44A', codigo: 'G44A-WR74', materiaId: 4, materia: 'Desarrollo Web',                   docenteId: 14, docente: 'Dra. Laura Gómez Reyes', cicloId: 2, alumnos: [2, 5, 9, 11],      capacidad: 20 },
    { id: 5, clave: 'G45A', codigo: 'G45A-TZ19', materiaId: 5, materia: 'Álgebra Lineal',                   docenteId: 16, docente: 'Mtra. Isabel Fuentes',   cicloId: 2, alumnos: [3, 6, 7, 10, 12],  capacidad: 25 },
]

// Inscripciones: un alumno no puede estar en dos grupos de la misma materia en el mismo ciclo.
export const INSCRIPCIONES = GRUPOS.flatMap(g =>
    g.alumnos.map(alumnoId => ({
        alumnoId,
        grupoId: g.id,
        materiaId: g.materiaId,
        cicloId: g.cicloId,
    }))
)

/** Calcula el ciclo activo */
export function getCicloActivo() {
    return CICLOS.find(c => c.activo) ?? CICLOS[0]
}

/** Materias del ciclo activo */
export function getMateriasCicloActivo() {
    const activo = getCicloActivo()
    return MATERIAS.filter(m => m.cicloId === activo.id)
}

/**
 * Verifica si un alumno ya está inscrito en una materia para un ciclo.
 * Usado en EstructuraAcademicaPage para validar conflictos.
 */
export function tieneConflicto(alumnoId, materiaId, cicloId) {
    return INSCRIPCIONES.some(
        i => i.alumnoId === alumnoId && i.materiaId === materiaId && i.cicloId === cicloId
    )
}
