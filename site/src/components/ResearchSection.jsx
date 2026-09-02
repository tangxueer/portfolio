import { useState } from 'react'
import Reveal from './Reveal.jsx'
import FocusGallery from './FocusGallery.jsx'
import PageFlip from './PageFlip.jsx'
import { projects } from '../data/content.js'

/**
 * 深度 DEPTH 标签页
 * 页面上方标题 + 小字；下方左右滑动的研究卡片（参考 Codrops「Selected」画廊：
 * 中心卡片最大、两侧递减；标注两行在卡片左下方）。点击卡片2（内刊）翻阅 PDF。
 */
export default function ResearchSection() {
  const data = projects.research
  const [flipOpen, setFlipOpen] = useState(false)

  const items = data.items.map((it) => ({ image: it.image, type: it.type, name: it.name }))

  const handleClickItem = (i) => {
    if (data.items[i]?.flip) setFlipOpen(true)
  }

  return (
    <section className="panel research-panel" id="research">
      <div className="panel-glow" aria-hidden="true" />

      <div className="shell research-head">
        <Reveal className="research-intro">
          <p className="dim-tag">Dimension 05 · {data.en}</p>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
        </Reveal>
        <Reveal className="research-hint" delay={150}>
          <span>拖动浏览 · 点击卡片翻阅</span>
        </Reveal>
      </div>

      <Reveal className="research-stage" delay={100}>
        <FocusGallery items={items} onClickItem={handleClickItem} />
      </Reveal>

      {flipOpen && (
        <PageFlip
          pages={data.flipPages}
          title={data.items.find((it) => it.flip)?.name || ''}
          onClose={() => setFlipOpen(false)}
        />
      )}
    </section>
  )
}
