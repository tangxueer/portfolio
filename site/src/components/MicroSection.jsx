import { useNavigate } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import AccordionGallery from './AccordionGallery.jsx'
import { projects } from '../data/content.js'

/** 微观 MICRO 标签页：左侧标题小字 + 右侧 4 个小卡片（手风琴切换） */
export default function MicroSection() {
  const data = projects.micro
  const navigate = useNavigate()

  const items = data.items.map((p) => ({
    key: p.slug,
    image: p.cover,
    label: p.name,
    index: p.index,
    keywords: p.keywords,
    alt: `${p.name} 封面`,
    // 目前仅卡片 01 开放详情页跳转，其余待开发
    to: p.to || null,
  }))

  return (
    <section className="panel" id="micro">
      <div className="panel-glow" aria-hidden="true" />
      <div className="shell micro-grid">
        <Reveal className="micro-intro">
          <p className="dim-tag">Dimension 02 · {data.en}</p>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
          <p className="scroll-next">
            悬停切换 · 点击卡片查看详情 <span aria-hidden="true">→</span>
          </p>
        </Reveal>

        <Reveal className="micro-gallery" delay={150}>
          <AccordionGallery
            items={items}
            defaultIndex={0}
            height={540}
            gap={12}
            radius={14}
            expandRatio={0.46}
            trigger="hover"
            onNavigate={(item) => item.to && navigate(item.to)}
          />
        </Reveal>
      </div>
    </section>
  )
}
