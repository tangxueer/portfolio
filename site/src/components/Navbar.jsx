import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/#about', zh: '关于我', en: 'ABOUT' },
  { to: '/#projects', zh: '项目', en: 'PROJECTS' },
  { to: '/#research', zh: '研究', en: 'RESEARCH' },
  { to: '/#skills', zh: '技能', en: 'SKILLS' },
]

export default function Navbar() {
  const [solid, setSolid] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 详情页返回主页锚点：'/' + hash 需要特殊处理
  const handleClick = (e, to) => {
    if (to.includes('#')) {
      e.preventDefault()
      const hash = to.split('#')[1]
      if (location.pathname !== '/') {
        navigateHomeThen(hash)
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const navigateHomeThen = (hash) => {
    // 先回主页再滚动
    window.sessionStorage.setItem('pending-scroll', hash)
    window.location.hash = '#/'
  }

  return (
    <header className={`nav ${solid ? 'solid' : ''}`}>
      <Link className="nav-logo" to="/">
        <span className="nav-logo-mark">TX</span>
        <span>TANGSHARE</span>
      </Link>
      <nav className="nav-menu" aria-label="主导航">
        {links.map((l) => (
          <a key={l.en} href={l.to} onClick={(e) => handleClick(e, l.to)}>
            {l.en} <span className="zh">{l.zh}</span>
          </a>
        ))}
      </nav>
    </header>
  )
}
