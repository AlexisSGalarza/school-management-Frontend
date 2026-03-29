/**
 * Datos de usuarios del sistema (mock).
 * En producción estos vendrían del API.
 */
export const MOCK_USERS = [
    // ── Alumnos ──────────────────────────────────────────────────────────────
    { id: 1, nombre: 'María López Hernández', matricula: '20230001', email: 'maria.lopez@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 2, nombre: 'Juan Pérez García', matricula: '20230002', email: 'juan.perez@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 3, nombre: 'Ana Sofía Torres', matricula: '20230003', email: 'ana.torres@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 4, nombre: 'Luis Alberto Ramírez', matricula: '20230004', email: 'luis.ramirez@escuela.edu.mx', rol: 'Alumno', activo: false },
    { id: 5, nombre: 'Daniela Morales Cruz', matricula: '20230005', email: 'daniela.morales@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 6, nombre: 'Carlos Eduardo Vega', matricula: '20230006', email: 'carlos.vega@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 7, nombre: 'Fernanda Ruiz Soto', matricula: '20230007', email: 'fernanda.ruiz@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 8, nombre: 'Roberto Silva Medina', matricula: '20230008', email: 'roberto.silva@escuela.edu.mx', rol: 'Alumno', activo: false },
    { id: 9, nombre: 'Valeria Castillo Nuñez', matricula: '20230009', email: 'valeria.castillo@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 10, nombre: 'Diego Hernández Flores', matricula: '20230010', email: 'diego.hernandez@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 11, nombre: 'Paola Mendoza Ríos', matricula: '20230011', email: 'paola.mendoza@escuela.edu.mx', rol: 'Alumno', activo: true },
    { id: 12, nombre: 'Andrés Jiménez Vargas', matricula: '20230012', email: 'andres.jimenez@escuela.edu.mx', rol: 'Alumno', activo: true },
    // ── Docentes ─────────────────────────────────────────────────────────────
    { id: 13, nombre: 'Dr. Carlos Martínez', matricula: '100042', email: 'carlos.martinez@escuela.edu.mx', rol: 'Docente', activo: true },
    { id: 14, nombre: 'Dra. Laura Gómez Reyes', matricula: '100058', email: 'laura.gomez@escuela.edu.mx', rol: 'Docente', activo: true },
    { id: 15, nombre: 'Mtro. Héctor Sandoval', matricula: '100071', email: 'hector.sandoval@escuela.edu.mx', rol: 'Docente', activo: false },
    { id: 16, nombre: 'Mtra. Isabel Fuentes', matricula: '100083', email: 'isabel.fuentes@escuela.edu.mx', rol: 'Docente', activo: true },
    // ── Administradores ──────────────────────────────────────────────────────
    { id: 17, nombre: 'Lic. Patricia Montes', matricula: '900001', email: 'patricia.montes@escuela.edu.mx', rol: 'Admin', activo: true },
]

export const ROL_OPTIONS = [
    { value: '', label: 'Todos los roles' },
    { value: 'Alumno', label: 'Alumno' },
    { value: 'Docente', label: 'Docente' },
    { value: 'Admin', label: 'Admin' },
]
