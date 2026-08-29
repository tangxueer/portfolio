import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import Footer from '../components/Footer.jsx'
import { projects } from '../data/content.js'

const atlasCaptions = [
  '公示图集 01', '公示图集 02', '公示图集 03',
  '公示图集 04', '公示图集 05', '公示图集 06',
  '公示图集 07',
]

/** 详情页 1-1-2：上海市国土空间近期实施规划（概况 → 7 图瀑布流图集） */
export default function ProjectMacro2() {
  const p = projects.macro.items[1]

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main>
      {/* Section 1 · 项目概况（左文右图） */}
      <section className="detail-hero shell">
        <Reveal className="detail-info">
          <Link className="back" to="/">← 返回项目 Projects</Link>
          <p className="cat">Macro · 宏观维度</p>
          <h1>{p.name}</h1>
          <dl className="detail-facts">
            <div className="fact-row"><dt>关键词</dt><dd>{p.keywords.join(' / ')}</dd></div>
            <div className="fact-row"><dt>时期</dt><dd>{p.period}</dd></div>
            <div className="fact-row"><dt>角色</dt><dd>{p.role}</dd></div>
          </dl>
        </Reveal>
        <Reveal className="detail-media" delay={150}>
          <img src={p.cover} alt={`${p.name} 封面`} />
        </Reveal>
      </section>

      {/* Section 2 · 图集瀑布流 */}
      <section className="atlas-panel shell">
        <Reveal className="video-head atlas-head">
          <span className="sec-index">ATLAS</span>
          <h2 className="sec-title-zh" style={{ fontSize: 'clamp(26px, 2.4vw, 38px)' }}>近期图集 · 公示版选编</h2>
        </Reveal>
        <div className="atlas-columns">
          {atlasCaptions.map((cap, i) => (
            <Reveal as="figure" className="atlas-item" key={cap} delay={(i % 2) * 90}>
              <img src={`./assets/projects/macro2-atlas-${i + 1}.jpg`} alt={cap} loading="lazy" />
              <figcaption>{cap}</figcaption>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
