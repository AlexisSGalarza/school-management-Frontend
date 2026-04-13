import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TasksProvider } from './Context/TasksContext.jsx'
import { ToastProvider } from './Context/ToastContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <TasksProvider>
          <App />
        </TasksProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
