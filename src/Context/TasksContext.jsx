import { createContext, useContext, useState, useCallback } from 'react'

const TasksContext = createContext(null)

/**
 * Provee un store de tareas de fondo (generación de reportes).
 * Las tareas persisten mientras el componente Provider esté montado,
 * es decir, mientras el usuario navega por la app sin recargar.
 */
export function TasksProvider({ children }) {
    const [tasks, setTasks] = useState([])

    const addTask = useCallback(({ titulo, tipo, filtros = {} }) => {
        const id = Date.now()
        const newTask = {
            id,
            titulo,
            tipo,
            filtros,
            status: 'processing',
            progress: 0,
            createdAt: new Date(),
        }
        setTasks(prev => [newTask, ...prev])

        // Simula progreso gradual
        let pct = 0
        const interval = setInterval(() => {
            pct += Math.random() * 18 + 4
            if (pct >= 100) {
                pct = 100
                clearInterval(interval)
                setTasks(prev =>
                    prev.map(t => t.id === id ? { ...t, progress: 100, status: 'done' } : t)
                )
            } else {
                setTasks(prev =>
                    prev.map(t => t.id === id ? { ...t, progress: Math.round(pct) } : t)
                )
            }
        }, 500)

        return id
    }, [])

    const removeTask = useCallback((id) => {
        setTasks(prev => prev.filter(t => t.id !== id))
    }, [])

    const clearDone = useCallback(() => {
        setTasks(prev => prev.filter(t => t.status !== 'done'))
    }, [])

    return (
        <TasksContext.Provider value={{ tasks, addTask, removeTask, clearDone }}>
            {children}
        </TasksContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
    const ctx = useContext(TasksContext)
    if (!ctx) throw new Error('useTasks debe usarse dentro de <TasksProvider>')
    return ctx
}
