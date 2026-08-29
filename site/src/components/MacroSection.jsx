import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

/** 宏观 MACRO 标签页：左侧标题小字 + 右侧两个大卡片 */
export default function MacroSection() {
  const data = projects.macro
  return (
    <section className="panel" id="macro">
      <div className="panel-glow" aria-hidden="true" />
      <div className="shell macro-grid">
        <Reveal className="macro-intro">
          <p className="dim-tag">Dimension 01 · {data.en}</p>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
          <p className="scroll-next">向下浏览项目详情 <span aria-hidden="true">↓</span></p>
        </Reveal>
        <div className="macro-cards">
          {data.items.map((p, i) => (
            <Reveal key={p.slug} delay={i * 120}>
              <Link className="pcard" to={`/project/${p.slug}`}>
                <div className="pcard-body">
                  <span className="pcard-index">{p.index} / {data.en}</span>
                  <h4 className="pcard-name">{p.name}</h4>
                  <div>
                    <div className="pcard-meta">
                      {p.keywords.map((k) => <span className="chip" key={k}>{k}</span>)}
                    </div>
                    <span className="pcard-open">查看项目 <span className="arrow">→</span></span>
                  </div>
                </div>
                <div className="pcard-media">
                  <img src={p.cover} alt={p.name} loading="lazy" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
