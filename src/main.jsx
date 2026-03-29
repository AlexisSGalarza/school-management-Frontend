import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TasksProvider } from './Context/TasksContext.jsx'
import { ToastProvider } from './Context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <TasksProvider>
        <App />
      </TasksProvider>
    </ToastProvider>
  </StrictMode>,
)
