import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import LineWaves from './components/LineWaves.jsx'
import Home from './pages/Home.jsx'
import ProjectMacro1 from './pages/ProjectMacro1.jsx'
import ProjectMacro2 from './pages/ProjectMacro2.jsx'
import ProjectMicro1 from './pages/ProjectMicro1.jsx'
import ProjectVertical1 from './pages/ProjectVertical1.jsx'

export default function App() {
  return (
    <>
      {/* 全局海洋背景（除 HERO 外所有页可见；HERO 自带不透明底自动遮住） */}
      <div className="site-bg" aria-hidden="true">
        <div className="site-bg__texture" />
        <div className="site-bg__tint" />
        <LineWaves className="site-bg__waves" />
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/macro-1" element={<ProjectMacro1 />} />
        <Route path="/project/macro-2" element={<ProjectMacro2 />} />
        <Route path="/project/micro-1" element={<ProjectMicro1 />} />
        <Route path="/project/vertical-1" element={<ProjectVertical1 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
