import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

/**
 * 横向 HORIZONTAL 标签页
 * 标题 + 小字 + 5 条行式列表：左侧副标题（大）、右侧名称（小）。
 * 鼠标悬浮某行时，对应展示图跟随光标浮现（lerp 平滑跟随）。
 */
export default function HorizontalSection() {
  const data = projects.horizontal
  const items = data.items

  const [active, setActive] = useState(-1)
  const previewRef = useRef(null)
  const listRef = useRef(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const rafRef = useRef(0)

  // 预加载展示图，避免首次悬浮闪白
  useEffect(() => {
    items.forEach((it) => {
      const img = new Image()
      img.src = it.preview
    })
  }, [items])

  // 追踪光标位置
  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      // 首次移动直接落位，避免预览图从左上角飞入
      if (!hasMoved.current) {
        current.current.x = e.clientX
        current.current.y = e.clientY
        hasMoved.current = true
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // 平滑跟随（lerp）
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ease = reduced ? 1 : 0.14

    const tick = () => {
      const c = current.current
      const t = target.current
      c.x += (t.x - c.x) * ease
      c.y += (t.y - c.y) * ease
      const el = previewRef.current
      if (el) {
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // 键盘聚焦时把预览图定位到该行右侧（无光标场景）
  const focusRow = (i, el) => {
    const rect = el.getBoundingClientRect()
    const x = rect.right - Math.min(rect.width * 0.15, 240)
    const y = rect.top + rect.height / 2
    target.current.x = x
    target.current.y = y
    if (!hasMoved.current) {
      current.current.x = x
      current.current.y = y
    }
    setActive(i)
  }

  return (
    <section className="panel horiz-panel" id="horizontal">
      <div className="panel-glow" aria-hidden="true" />

      <div className="shell horiz-shell">
        <Reveal className="horiz-intro">
          <p className="dim-tag">Dimension 04 · {data.en}</p>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
        </Reveal>

        <div
          className={`horiz-list ${active >= 0 ? 'is-hovering' : ''}`}
          ref={listRef}
          onMouseLeave={() => setActive(-1)}
        >
          {items.map((it, i) => (
            <Reveal key={it.slug} delay={80 + i * 60}>
              <div
                className={`horiz-row ${active === i ? 'is-active' : ''}`}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onFocus={(e) => focusRow(i, e.currentTarget)}
                onBlur={() => setActive(-1)}
              >
                <span className="horiz-row-dept">{it.dept}</span>
                <span className="horiz-row-name">{it.name}</span>
                <span className="horiz-row-arrow" aria-hidden="true">↗</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 跟随光标的展示图：单图、自然宽高比、尺寸减半（transform 由 JS 写入） */}
      <img
        ref={previewRef}
        className={`horiz-preview ${active >= 0 ? 'is-visible' : ''}`}
        src={active >= 0 ? items[active].preview : items[0].preview}
        alt=""
        aria-hidden="true"
      />
    </section>
  )
}
