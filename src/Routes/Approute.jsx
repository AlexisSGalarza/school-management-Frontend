import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthPage from "../Pages/AuthPage"

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />
            </Routes>
        </BrowserRouter>
    )
}