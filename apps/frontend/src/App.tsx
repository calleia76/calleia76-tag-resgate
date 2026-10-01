import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './features/landing/Landing'
import Login from './features/auth/Login'
import Cadastro from './features/auth/Cadastro'
import Painel from './features/painel/Painel'
import Ficha from './features/ficha/Ficha'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/ficha/:token" element={<Ficha />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
