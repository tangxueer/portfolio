import { useEffect, useId, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * 鼠标特效 — 单个 SVG 圆圈 + hover <a> 时 SVG filter distortion 涟漪
 * 移植自 codrops Sketch 013 (https://tympanus.net/Sketches/013-custom-cursor-filter/)
 * 2026-09-03 改为单圈：删掉原版第二个（慢跟随、无滤镜）的 cursor-2
 * - 圈 1：带 feTurbulence + feDisplacementMap 滤镜，hover 时 baseFrequency 0.35→0 做 1s 涟漪
 * - rAF 循环 lerp 平滑插值（amt=0.15）
 * - hover <a> 半径 20→50
 * - pointer-events: none 不拦截系统事件，系统 cursor 仍可见
 * - @media (any-pointer: fine) 触屏自动隐藏
 */
const lerp = (a, b, n) => (1 - n) * a + n * b

export default function MouseCursor() {
  // useId 包含 ":"，CSS selector 不合法，转成短 hex
  const filterId = 'mc-' + useId().replace(/[^a-z0-9]/gi, '').slice(0, 8) + '-filter'
  const cursorsRef = useRef([])
  const stylesRef = useRef([])
  const timelineRef = useRef(null)
  const cursorPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // 触屏 / 粗指针设备：直接不渲染
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(any-pointer: fine)').matches) return

    // 初始位置：屏幕中心，避免首次出现时 cursor 飞一下
    cursorPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const onMouseMove = (ev) => {
      cursorPosRef.current = { x: ev.clientX, y: ev.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    // 初始化单 cursor 的 renderedStyles
    stylesRef.current = [{
      tx: { previous: cursorPosRef.current.x, current: cursorPosRef.current.x, amt: 0.15 },
      ty: { previous: cursorPosRef.current.y, current: cursorPosRef.current.y, amt: 0.15 },
      radius: { previous: 20, current: 20, amt: 0.15 },
      opacity: { previous: 1, current: 1, amt: 0.15 },
    }]

    // rAF 循环
    let raf = 0
    const render = () => {
      const pos = cursorPosRef.current
      cursorsRef.current.forEach((el, i) => {
        if (!el) return
        const styles = stylesRef.current[i]
        const inner = el.querySelector('.cursor__inner')
        if (!inner) return
        // 整 SVG 平移跟随：减去 SVG 自身一半（SVG 120x120，中心在 (60,60)）
        // 【bug 修复】el.offsetWidth 在 SVG 元素上返回 undefined（只有 HTMLElement 才有 offsetWidth）
        // 用 getBoundingClientRect().width 替代；cursor SVG 固定 120×120，所以 half 始终是 60
        const half = el.getBoundingClientRect().width / 2 || 60
        styles.tx.current = pos.x - half
        styles.ty.current = pos.y - half
        for (const k in styles) {
          styles[k].previous = lerp(styles[k].previous, styles[k].current, styles[k].amt)
        }
        el.style.transform = `translateX(${styles.tx.previous.toFixed(2)}px) translateY(${styles.ty.previous.toFixed(2)}px)`
        el.style.opacity = styles.opacity.previous.toFixed(3)
        // 【必须写回 DOM】radius 只 lerp 不 setAttribute 的话，r 永远停在初始值 20
        inner.setAttribute('r', styles.radius.previous.toFixed(2))
      })
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    // SVG filter distortion 时间线
    const feTurb = document.querySelector(`#${filterId} > feTurbulence`)
    if (feTurb) {
      const primitiveValues = { turbulence: 0 }
      timelineRef.current = gsap.timeline({
        paused: true,
        onStart: () => {
          // 给两个 cursor 的内圈都挂上 filter
          cursorsRef.current.forEach((el) => {
            const inner = el?.querySelector?.('.cursor__inner')
            if (inner) inner.style.filter = `url(#${filterId})`
          })
        },
        onUpdate: () => {
          feTurb.setAttribute('baseFrequency', primitiveValues.turbulence)
        },
        onComplete: () => {
          cursorsRef.current.forEach((el) => {
            const inner = el?.querySelector?.('.cursor__inner')
            if (inner) inner.style.filter = 'none'
          })
        },
      }).to(primitiveValues, {
        duration: 1,
        ease: 'expo.out',
        startAt: { turbulence: 0.35 },
        turbulence: 0,
      })
    }

    // hover <a> 触发 distortion
    const onEnterLink = () => {
      stylesRef.current.forEach((s) => {
        s.radius.current = 50
        s.opacity.current = 1
      })
      timelineRef.current?.restart()
    }
    const onLeaveLink = () => {
      stylesRef.current.forEach((s) => {
        s.radius.current = 20
        s.opacity.current = 1
      })
      timelineRef.current?.progress(1).kill()
    }
    const links = Array.from(document.querySelectorAll('a'))
    links.forEach((l) => {
      l.addEventListener('mouseenter', onEnterLink)
      l.addEventListener('mouseleave', onLeaveLink)
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      links.forEach((l) => {
        l.removeEventListener('mouseenter', onEnterLink)
        l.removeEventListener('mouseleave', onLeaveLink)
      })
      timelineRef.current?.kill()
      timelineRef.current = null
    }
  }, [filterId])

  return (
    <>
      {/* 圈 1：带 SVG filter distortion，hover <a> 时变形涟漪 */}
      <svg
        ref={(el) => (cursorsRef.current[0] = el)}
        className="cursor cursor-1"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0" numOctaves="1" result="warp" />
            <feDisplacementMap
              xChannelSelector="R"
              yChannelSelector="G"
              scale="30"
              in="SourceGraphic"
            />
          </filter>
        </defs>
        <circle className="cursor__inner" cx="60" cy="60" r="20" />
      </svg>
    </>
  )
}
