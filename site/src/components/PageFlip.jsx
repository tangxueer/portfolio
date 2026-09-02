import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * 翻书效果（自研，替代 React Bits Pro PageFlip——Pro 版需付费许可证，离线环境不可装）
 * 单页书：leaf（front=第k页 / back=第k+1页）绕左侧书脊 rotateY 翻转；
 * 支持点击左右半区、左右拖拽、方向键、ESC 关闭。
 */
export default function PageFlip({ pages = [], title = '', onClose }) {
  const [current, setCurrent] = useState(0)
  const [flip, setFlip] = useState(null) // { k, dir: 'next'|'prev' }
  const leafRef = useRef(null)
  const busy = useRef(false)
  const drag = useRef(null)

  const total = pages.length

  const go = (dir) => {
    if (busy.current || total < 2) return
    if (dir === 'next' && current >= total - 1) return
    if (dir === 'prev' && current <= 0) return
    const k = dir === 'next' ? current : current - 1
    busy.current = true
    setFlip({ k, dir })
  }

  // leaf 挂载后执行翻转动画
  useEffect(() => {
    if (!flip || !leafRef.current) return
    const { dir, k } = flip
    const leaf = leafRef.current
    if (dir === 'next') {
      gsap.fromTo(
        leaf,
        { rotationY: 0 },
        {
          rotationY: -180,
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            setCurrent(k + 1)
            setFlip(null)
            busy.current = false
          },
        }
      )
    } else {
      // prev：先无动画置于 -180，再翻回 0
      gsap.set(leaf, { rotationY: -180 })
      gsap.to(leaf, {
        rotationY: 0,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          setCurrent(k)
          setFlip(null)
          busy.current = false
        },
      })
    }
  }, [flip])

  // ESC 关闭 + 方向键翻页 + 锁定背景滚动
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight') go('next')
      if (e.key === 'ArrowLeft') go('prev')
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const onPointerDown = (e) => {
    drag.current = e.clientX
  }
  const onPointerUp = (e) => {
    if (drag.current == null) return
    const delta = e.clientX - drag.current
    drag.current = null
    if (delta < -60) go('next')
    else if (delta > 60) go('prev')
  }

  return (
    <div className="pf-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="pf-head">
        <span className="pf-title">{title}</span>
        <button className="pf-close" onClick={onClose}>关闭 CLOSE ✕</button>
      </div>

      <div
        className="pf-book"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* 底页：翻页时露出的下一页 / 当前页 */}
        <div
          className="pf-under"
          style={{ backgroundImage: `url(${pages[flip ? flip.k + 1 : current]})` }}
        />
        {/* 翻动中的书页 */}
        {flip && (
          <div className="pf-leaf" ref={leafRef}>
            <div className="pf-face pf-front" style={{ backgroundImage: `url(${pages[flip.k]})` }} />
            <div className="pf-face pf-back" style={{ backgroundImage: `url(${pages[flip.k + 1]})` }} />
          </div>
        )}
      </div>

      <div className="pf-foot">
        <span
          className={`pf-btn ${current <= 0 ? 'is-disabled' : ''}`}
          onClick={() => go('prev')}
          role="button"
          aria-label="上一页"
        >
          ←
        </span>
        <span className="pf-index">
          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span
          className={`pf-btn ${current >= total - 1 ? 'is-disabled' : ''}`}
          onClick={() => go('next')}
          role="button"
          aria-label="下一页"
        >
          →
        </span>
      </div>
    </div>
  )
}
