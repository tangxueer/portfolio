import { useRef, useEffect, useState } from 'react'
import './ScrollGallery.css'

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

/**
 * 滚动驱动的叠图切换（参考 Hiro-kiii/Scroll-Transition）
 *
 * 外层提供 n 屏滚动行程，内部 sticky 舞台吸附一屏；
 * 每张图按滚动进度用 clip-path 从下往上推入覆盖前一张，
 * 配合轻微缩放产生景深推进感。
 */
export default function ScrollGallery({ images = [], captions = [], title = '' }) {
  const wrapRef = useRef(null)
  const [prog, setProg] = useState(0) // 0 → images.length - 1 的浮点进度
  const n = images.length

  useEffect(() => {
    if (n <= 1) return undefined

    let raf = 0
    const measure = () => {
      raf = 0
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return
      const scrolled = clamp(-rect.top, 0, travel)
      setProg((scrolled / travel) * (n - 1))
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [n])

  if (!n) return null

  const active = clamp(Math.round(prog), 0, n - 1)

  return (
    <div className="sg-wrap" ref={wrapRef} style={{ height: `${n * 100}vh` }}>
      <div className="sg-stage">
        <div className="sg-stack">
          {images.map((src, i) => {
            // 第 i 张（i>0）在其所属区间内从 0 → 1 逐步推入
            const reveal = i === 0 ? 1 : clamp(prog - (i - 1), 0, 1)
            const scale = 1 + (1 - reveal) * 0.09
            return (
              <figure
                className={`sg-item${i === active ? ' is-active' : ''}`}
                key={src}
                style={{
                  zIndex: i + 1,
                  clipPath: `inset(${((1 - reveal) * 100).toFixed(3)}% 0 0 0)`,
                  transform: `scale(${scale.toFixed(4)})`,
                }}
              >
                <img src={src} alt={captions[i] || `${title} 图 ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
              </figure>
            )
          })}
        </div>

        <div className="sg-hud" aria-hidden="true">
          <span className="sg-cur">{String(active + 1).padStart(2, '0')}</span>
          <span className="sg-sep" />
          <span className="sg-total">{String(n).padStart(2, '0')}</span>
          <span className="sg-cap">{captions[active] || ''}</span>
        </div>

        <div className="sg-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${n > 1 ? prog / (n - 1) : 1})` }} />
        </div>
      </div>
    </div>
  )
}
