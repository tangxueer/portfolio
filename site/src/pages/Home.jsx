import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import About from '../components/About.jsx'
import Diamond from '../components/Diamond.jsx'
import MacroSection from '../components/MacroSection.jsx'
import MicroSection from '../components/MicroSection.jsx'
import { VerticalSection, HorizontalSection, ResearchSection, SkillsSection } from '../components/Sections.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  const location = useLocation()

  // 处理来自详情页的锚点跳转（sessionStorage 中转）
  useEffect(() => {
    const pending = window.sessionStorage.getItem('pending-scroll')
    if (pending) {
      window.sessionStorage.removeItem('pending-scroll')
      setTimeout(() => {
        document.getElementById(pending)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [location.pathname])

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <Hero />
      <About />
      {/* 模块页1：3D 钻石项目导航 */}
      <section className="diamond" id="projects">
        <div className="shell" style={{ paddingTop: 'clamp(84px, 12vh, 130px)' }}>
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <span className="sec-index">02</span>
            <h2 className="sec-title-zh">项目</h2>
            <span className="sec-title-en">PROJECTS</span>
          </div>
        </div>
        <Diamond onNavigate={scrollToSection} />
      </section>
      <MacroSection />
      <MicroSection />
      <VerticalSection />
      <HorizontalSection />
      <ResearchSection />
      <SkillsSection />
      <Footer />
    </main>
  )
}
