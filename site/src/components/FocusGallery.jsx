import { useLayoutEffect, useRef } from 'react'

/**
 * FocusGallery —— 按 Codrops「Page Transitions with WebGPU」的 Selected 画廊 1:1 移植
 * （源码：github.com/bnpne/page-transitions-with-webgpu-vanilla-js，src/carousel.js + global.css）
 * 原理：槽位为 DOM 元素（原图由 WebGPU 渲染，此处直接用 <img>，观感一致）：
 *   - 槽位宽度统一（23vw），高度按各图原始宽高比，垂直居中；
 *   - 水平无缝循环：relX = (i - c) * stepX - scrollX，回卷到 [-period/2, period/2)；
 *   - LERP 0.1 惯性；GAP 48px；滚动速度驱动 rotateY 倾斜（velocity*0.005rad，上限 0.05，LERP 0.09）；
 *   - 标注在卡片正下方左侧（类型一行 + 名称一行）。
 * 健壮性：挂载即用 useLayoutEffect 同步定位（无需等待图片预载）；图片 onLoad 回填宽高比并触发重排；
 *          ResizeObserver 兜底尺寸变更。任意时序下卡片都至少有可见尺寸与变换。
 * items: [{ image, type, name }]；onClickItem(logicalIndex) 在点击（拖动 < 6px）时触发。
 */
const LERP = 0.1
const GAP_PX = 48
const TILT_RAD_PER_PX = 0.005
const TILT_MAX_RAD = 0.05
const TILT_LERP = 0.09
const DEFAULT_RATIO = 1.4 // 未测得宽高比前的兜底（竖图）
// 卡片统一底部对齐：底部基线之上留出 caption 区域，避免标注被 stage 裁掉
const CAPTION_RESERVE = 96

export default function FocusGallery({ items = [], onClickItem }) {
  const stageRef = useRef(null)
  const cursorRef = useRef(null)
  const slotRefs = useRef([])
  const ratiosRef = useRef([])
  const S = useRef({
    scrollX: 0, targetScrollX: 0, velocity: 0, tilt: 0,
    cellW: 0, stepX: 0, periodX: 0, stageW: 0, stageH: 0,
    raf: 0, drag: null, reduced: false,
  }).current

  const n = items.length
  // 关键：用 (n-1)/2 而非 floor(n/2)——偶数张卡时后者会让布局偏向一侧（左侧多一张）。
  // 奇数张时两者都得到整数索引，效果一致。
  const c = (n - 1) / 2
  const ratioOf = (i) => ratiosRef.current[i] || DEFAULT_RATIO

  const measure = () => {
    const stage = stageRef.current
    if (!stage || !n) return
    // 防御：父级布局异常（如 flex 子项未撑宽）时 clientWidth 可能为 0，
    // 一旦取 0 会让所有卡槽尺寸塌缩为 0 而完全不可见，此处逐级回退。
    S.stageW = stage.clientWidth || stage.parentElement?.clientWidth || window.innerWidth || 1200
    S.stageH = stage.clientHeight || 480
    const maxRatio = Math.max(...items.map((_, i) => ratioOf(i)))
    let cellW = S.stageW * 0.13
    // 关键：最高卡须落在基线（stageH - CAPTION_RESERVE）之上，留白避免顶部被裁
    const maxH = (S.stageH || cellW * maxRatio) - CAPTION_RESERVE
    if (cellW * maxRatio > maxH) cellW = maxH / maxRatio
    S.cellW = cellW
    S.stepX = cellW + GAP_PX
    S.periodX = n * S.stepX
    slotRefs.current.forEach((el, i) => {
      if (!el) return
      el.style.width = `${cellW}px`
      el.style.height = `${cellW * ratioOf(i)}px`
    })
    // 卡片统一底部对齐：最高卡须落在「基线（stageH - CAPTION_RESERVE）」之上
    S.baseY = Math.max(0, S.stageH - CAPTION_RESERVE)
  }

  const applyTransforms = () => {
    if (!S.periodX) return
    const half = S.periodX / 2
    for (let i = 0; i < n; i++) {
      const el = slotRefs.current[i]
      if (!el) continue
      let relX = (i - c) * S.stepX - S.scrollX
      relX = ((relX % S.periodX) + S.periodX) % S.periodX
      if (relX >= half) relX -= S.periodX
      const cellH = S.cellW * ratioOf(i)
      const x = S.stageW / 2 + relX - S.cellW / 2
      // 关键：统一底部对齐——所有卡片底边落在同一条基线 baseY，caption 紧贴基线下方
      const y = S.baseY - cellH
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotateY(${S.tilt}rad)`
    }
  }

  const relayout = () => { measure(); applyTransforms() }

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || !n) return
    S.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // 挂载即同步定位（卡片立即可见）
    ratiosRef.current = items.map(() => DEFAULT_RATIO)
    measure()
    S.scrollX = S.targetScrollX = 0 // 0 → 中间卡片（index c）居中
    applyTransforms()

    const tick = () => {
      const prev = S.scrollX
      S.scrollX += (S.targetScrollX - S.scrollX) * (S.reduced ? 1 : LERP)
      S.velocity = S.scrollX - prev
      let targetTilt = S.velocity * TILT_RAD_PER_PX
      if (targetTilt > TILT_MAX_RAD) targetTilt = TILT_MAX_RAD
      else if (targetTilt < -TILT_MAX_RAD) targetTilt = -TILT_MAX_RAD
      S.tilt += (targetTilt - S.tilt) * (S.reduced ? 0 : TILT_LERP)
      applyTransforms()
      S.raf = requestAnimationFrame(tick)
    }
    S.raf = requestAnimationFrame(tick)

    // 已缓存图片：直接回填比例（同样是 h/w）
    const imgEls = Array.from(stage.querySelectorAll('.fg-img'))
    imgEls.forEach((img, i) => {
      if (img.complete && img.naturalWidth) ratiosRef.current[i] = img.naturalHeight / img.naturalWidth
    })
    relayout()

    // ---- 滚轮（容器内接管） ----
    const onWheel = (e) => {
      if (e.cancelable) e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      S.targetScrollX += delta
    }
    const onDown = (e) => {
      S.drag = { x0: e.clientX, lastX: e.clientX, moved: 0 }
      stage.classList.add('is-dragging')
    }
    const onMove = (e) => {
      moveCursor(e)
      if (!S.drag) return
      const dx = e.clientX - S.drag.lastX
      S.drag.lastX = e.clientX
      S.drag.moved = Math.max(S.drag.moved, Math.abs(e.clientX - S.drag.x0))
      S.targetScrollX += -dx
    }
    const onUp = (e) => {
      if (!S.drag) return
      const moved = S.drag.moved
      S.drag = null
      stage.classList.remove('is-dragging')
      if (moved < 6 && onClickItem) {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.fg-slot')
        if (el) onClickItem(Number(el.dataset.idx))
      }
    }
    const moveCursor = (e) => {
      const cur = cursorRef.current
      if (!cur) return
      const rect = stage.getBoundingClientRect()
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      cur.style.opacity = inside ? '1' : '0'
      if (!inside) return
      cur.style.transform = `translate3d(${e.clientX - rect.left}px, ${e.clientY - rect.top}px, 0) translate(-50%, -50%)`
      cur.classList.toggle('is-hover', !!e.target.closest?.('.fg-slot'))
    }
    const onLeave = () => { if (cursorRef.current) cursorRef.current.style.opacity = '0' }
    const onResize = () => relayout()

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => relayout())
      ro.observe(stage)
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    stage.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(S.raf)
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="focus-gallery" ref={stageRef} role="region" aria-label="研究成果画廊：滚轮或拖动浏览">
      {items.map((it, i) => (
        <div
          className="fg-slot"
          key={i}
          data-idx={i}
          ref={(el) => { slotRefs.current[i] = el }}
        >
          <img
            className="fg-img"
            src={it.image}
            alt={`${it.type} · ${it.name}`}
            draggable={false}
            onLoad={(e) => {
              const w = e.currentTarget.naturalWidth
              const h = e.currentTarget.naturalHeight
              if (w && h) {
                // 关键：存「高宽比」h/w，让 el.style.height = cellW * ratio 正确得到原图比例
                //（之前存的是 w/h，导致竖图被 object-fit:cover 上下裁掉、横图被左右裁掉）
                ratiosRef.current[i] = h / w
                relayout()
              }
            }}
          />
          <div className="fg-cap">
            <p className="fg-type">{it.type}</p>
            <p className="fg-name">{it.name}</p>
          </div>
        </div>
      ))}
      <div className="fg-cursor" ref={cursorRef} aria-hidden="true" />
    </div>
  )
}
