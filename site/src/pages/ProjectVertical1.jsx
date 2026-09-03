import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import Masonry from '../components/Masonry.jsx'
import Footer from '../components/Footer.jsx'
import { projects } from '../data/content.js'

/** 详情页 1-3-1：上海市土地储备专项规划（2026-2030年）——纯白背景 · 概况 → 瀑布流图集 */
export default function ProjectVertical1() {
  const p = projects.vertical.items[0]
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // 返回首页并自动定位到纵向模块
  const backToVertical = (e) => {
    e.preventDefault()
    window.sessionStorage.setItem('pending-scroll', 'vertical')
    navigate('/')
  }

  const items = (p.gallery || []).map((img, i) => ({
    id: `vertical1-${i + 1}`,
    img,
    alt: `${p.name} 图集 ${String(i + 1).padStart(2, '0')}`,
  }))

  return (
    <main className="pv1-page">
      {/* Section 1 · 项目概况（左文右图，封面不裁剪） */}
      <section className="detail-hero shell pv1-hero">
        <div className="detail-info">
          <a className="back" href="#/" onClick={backToVertical}>← 返回纵向 Vertical</a>
          <p className="cat">Vertical · 纵向维度</p>
          <h1>{p.name}</h1>
          <dl className="detail-facts">
            <div className="fact-row"><dt>关键词</dt><dd>{p.keywords.join(' / ')}</dd></div>
            <div className="fact-row"><dt>时期</dt><dd>{p.period}</dd></div>
            <div className="fact-row"><dt>角色</dt><dd>{p.role}</dd></div>
          </dl>
        </div>
        <div className="detail-media pv1-media">
          <img src={p.cover} alt={`${p.name} 封面`} />
        </div>
      </section>

      {/* Section 2 · 规划图集（最重要一张全宽置顶 + 其余瀑布流；用户要求删掉"规划图集·Masonry"标题，只留 GALLERY 索引 + 计数） */}
      <section className="pv1-gallery shell">
        <div className="sec-head">
          <span className="sec-index">GALLERY</span>
          <span className="pv1-count">{items.length} FILES</span>
        </div>
        {items.length > 0 && (
          <figure className="pv1-featured">
            <img src={items[0].img} alt={items[0].alt} />
          </figure>
        )}
        {items.length > 1 && <Masonry items={items.slice(1)} columns={3} />}
      </section>

      <Footer />
    </main>
  )
}
