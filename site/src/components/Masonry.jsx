import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './Masonry.css'

/**
 * React Bits · Masonry（JavaScript + CSS 变体，按项目需求适配）
 * - items: { id, img, url? }，展示高度按图片原始比例自动计算
 * - 可通过 columns 固定列数（默认按视口宽度 5/4/3/2 响应式）
 * - 无 url 时不绑定跳转
 */
const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue
    return values[queries.findIndex((q) => matchMedia(q).matches)] ?? defaultValue
  }
  const [value, setValue] = useState(get)
  useEffect(() => {
    const handler = () => setValue(get)
    queries.forEach((q) => matchMedia(q).addEventListener('change', handler))
    return () => queries.forEach((q) => matchMedia(q).removeEventListener('change', handler))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries])
  return value
}

const useMeasure = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

/** 预加载并记录每张图的宽高比 */
const preloadImages = async (items) => {
  const ratios = await Promise.all(
    items.map(
      (it) =>
        new Promise((resolve) => {
          const img = new Image()
          img.src = it.img
          img.onload = img.onerror = () =>
            resolve(img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 0.75)
        })
    )
  )
  return items.map((it, i) => ({ ...it, ratio: ratios[i] }))
}

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.97,
  blurToFocus = true,
  columns = null,
}) => {
  const responsive = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  )
  const cols = columns || responsive

  const [containerRef, { width }] = useMeasure()
  const [ready, setReady] = useState(false)
  const [withRatio, setWithRatio] = useState(items)

  useEffect(() => {
    let alive = true
    preloadImages(items).then((next) => {
      if (alive) {
        setWithRatio(next)
        setReady(true)
      }
    })
    return () => {
      alive = false
    }
  }, [items])

  const grid = useMemo(() => {
    if (!width || !ready) return { list: [], totalH: 0 }
    const colHeights = new Array(cols).fill(0)
    const columnWidth = width / cols
    const list = withRatio.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights))
      const x = columnWidth * col
      const h = columnWidth * child.ratio
      const y = colHeights[col]
      colHeights[col] += h
      return { ...child, x, y, w: columnWidth, h }
    })
    // 子项为绝对定位，需要显式容器高度（含 padding 12px）
    return { list, totalH: Math.max(...colHeights, 0) + 12 }
  }, [cols, withRatio, width, ready])

  const hasMounted = useRef(false)

  useLayoutEffect(() => {
    if (!grid.list.length) return
    grid.list.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h }
      if (!hasMounted.current) {
        const initial = { opacity: 0, x: item.x, y: item.y + 140, width: item.w, height: item.h }
        if (blurToFocus) initial.filter = 'blur(10px)'
        gsap.fromTo(selector, initial, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: 'power3.out',
          delay: index * stagger,
        })
      } else {
        gsap.to(selector, { ...animationProps, duration, ease, overwrite: 'auto' })
      }
    })
    hasMounted.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, stagger, animateFrom, blurToFocus, duration, ease])

  const handleMouseEnter = (e, item) => {
    if (!scaleOnHover) return
    gsap.to(`[data-key="${item.id}"] .item-img`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' })
  }
  const handleMouseLeave = (e, item) => {
    if (!scaleOnHover) return
    gsap.to(`[data-key="${item.id}"] .item-img`, { scale: 1, duration: 0.3, ease: 'power2.out' })
  }

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: grid.totalH }}>
      {grid.list.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="masonry-item"
          onClick={item.url ? () => window.open(item.url, '_blank', 'noopener') : undefined}
          onMouseEnter={(e) => handleMouseEnter(e, item)}
          onMouseLeave={(e) => handleMouseLeave(e, item)}
          style={{ cursor: item.url ? 'pointer' : 'default' }}
        >
          <div className="item-img" style={{ backgroundImage: `url(${item.img})` }} role="img" aria-label={item.alt || ''} />
        </div>
      ))}
    </div>
  )
}

export default Masonry
