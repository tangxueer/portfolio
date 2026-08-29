import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ProjectMacro1 from './pages/ProjectMacro1.jsx'
import ProjectMacro2 from './pages/ProjectMacro2.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/macro-1" element={<ProjectMacro1 />} />
        <Route path="/project/macro-2" element={<ProjectMacro2 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
