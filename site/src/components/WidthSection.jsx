import { useEffect, useRef, useState, useCallback } from 'react'
import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

/**
 * 广度 WIDTH 标签页
 * 上方 dim-tag / h3 / 小字（与 ResearchSection 同排版语言）；
 * 下方 Canvas 2D 星系：6 个发光球（球1 中心最大带轨道环），
 * 球间 bezier 连线 + 流动粒子 + 微弱星空 + 悬停发光增强；
 * HTML 标签（英文 + 中文）覆盖在球旁。
 * 点击球1 弹出视频模态：3 个视频可左右切换（◀▶ / 键盘 / ESC 关闭）。
 */
export default function WidthSection() {
  const data = projects.width
  const [hovered, setHovered] = useState(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoIdx, setVideoIdx] = useState(0)

  const onClickSphere = useCallback((id) => {
    if (id === 1) {
      setVideoIdx(0)
      setVideoOpen(true)
    }
  }, [])

  return (
    <section className="panel width-panel" id="skills">
      <div className="panel-glow" aria-hidden="true" />

      <div className="shell width-head">
        <Reveal className="width-intro">
          <p className="dim-tag">Dimension 06 · {data.en}</p>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
        </Reveal>
        <Reveal className="width-hint" delay={150}>
          <span>悬停发光 · 点击中心球体查看视频</span>
        </Reveal>
      </div>

      <Reveal className="width-stage-wrap" delay={100}>
        <Galaxy
          data={data}
          hovered={hovered}
          setHovered={setHovered}
          onClickSphere={onClickSphere}
        />
      </Reveal>

      {videoOpen && (
        <VideoModal
          videos={data.videos}
          idx={videoIdx}
          setIdx={setVideoIdx}
          onClose={() => setVideoOpen(false)}
        />
      )}
    </section>
  )
}

/* ===================== Galaxy ===================== */

function Galaxy({ data, hovered, setHovered, onClickSphere }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const animRef = useRef(0)
  const S = useRef({}).current

  // 一次性初始化：球状态 + 连线 + 粒子 + 星空
  useEffect(() => {
    S.spheres = data.spheres.map((s) => ({ ...s, x: 0, y: 0, r: 0 }))
    const byId = Object.fromEntries(S.spheres.map((s) => [s.id, s]))
    S.links = []
    // 每颗小球 -> 中心
    S.spheres.slice(1).forEach((sp) => {
      S.links.push({ from: byId[data.spheres[0].id], to: sp })
    })
    // 跨球连线（增强网络感）
    const inter = [[2, 3], [4, 5], [5, 6]]
    inter.forEach(([a, b]) => {
      if (byId[a] && byId[b]) S.links.push({ from: byId[a], to: byId[b] })
    })
    S.particles = S.links.map(() => ({
      t: Math.random(),
      speed: 0.10 + Math.random() * 0.10,
    }))
    S.stars = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      a: 0.12 + Math.random() * 0.32,
      tw: Math.random() * Math.PI * 2,
    }))
    S.hoveredId = null
    S._lastHover = null
    S.hoverGlow = 0
    S.lastT = 0
  }, [data])

  // 测量 + 动画
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const measure = () => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width))
      const h = Math.max(1, Math.round(rect.height))
      S.W = w
      S.H = h
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // 球1 基准半径：取 stage 短边的较大比例，让中心球更"压得住"
      S.baseR = Math.min(w, h) * 0.17
      S.spheres.forEach((sp) => {
        sp.x = sp.pos[0] * w
        sp.y = sp.pos[1] * h
        sp.r = S.baseR * sp.size
      })
    }
    measure()

    // 二次贝塞尔取点
    const bezier = (p0, p1, p2, t) => {
      const it = 1 - t
      return [
        it * it * p0[0] + 2 * it * t * p1[0] + t * t * p2[0],
        it * it * p0[1] + 2 * it * t * p1[1] + t * t * p2[1],
      ]
    }
    // 弧线控制点：中点 + 垂直方向偏移
    const controlFor = (ax, ay, bx, by) => {
      const mx = (ax + bx) / 2
      const my = (ay + by) / 2
      const dx = bx - ax
      const dy = by - ay
      const len = Math.hypot(dx, dy) || 1
      const m = len * 0.32
      return [mx - (dy / len) * m, my + (dx / len) * m]
    }

    const drawStar = (st, time) => {
      const tw = 0.7 + 0.3 * Math.sin(time * 0.0011 + st.tw)
      ctx.fillStyle = `rgba(180,210,240,${(st.a * tw).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(st.x * S.W, st.y * S.H, st.r, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawLink = (l) => {
      const sa = l.from
      const sb = l.to
      if (!sa || !sb) return
      const cp = controlFor(sa.x, sa.y, sb.x, sb.y)
      const grad = ctx.createLinearGradient(sa.x, sa.y, sb.x, sb.y)
      grad.addColorStop(0, sa.color + '55')
      grad.addColorStop(1, sb.color + '55')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(sa.x, sa.y)
      ctx.quadraticCurveTo(cp[0], cp[1], sb.x, sb.y)
      ctx.stroke()
    }

    const drawParticle = (p, dt, idx) => {
      p.t += p.speed * dt
      if (p.t > 1) p.t -= 1
      const link = S.links[idx]
      const sa = link.from
      const sb = link.to
      const cp = controlFor(sa.x, sa.y, sb.x, sb.y)
      const [px, py] = bezier([sa.x, sa.y], cp, [sb.x, sb.y], p.t)
      const r = 2.4
      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 4.5)
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.3, sa.color + 'cc')
      g.addColorStop(1, sa.color + '00')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(px, py, r * 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawCenterRings = (sp, time) => {
      const rings = [
        { rx: sp.r * 1.55, ry: sp.r * 0.40, rot: -0.35, a: 0.32 },
        { rx: sp.r * 1.95, ry: sp.r * 0.55, rot: 0.55, a: 0.22 },
        { rx: sp.r * 2.40, ry: sp.r * 0.72, rot: -0.10, a: 0.14 },
      ]
      rings.forEach((r, i) => {
        ctx.save()
        ctx.translate(sp.x, sp.y)
        ctx.rotate(r.rot + time * 0.00012 * (i % 2 === 0 ? 1 : -1))
        ctx.strokeStyle = `rgba(125,220,255,${r.a})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      })
    }

    const drawSphere = (sp, time) => {
      const isCenter = sp.id === 1
      const pulse = isCenter ? 1 + Math.sin(time * 0.0014) * 0.025 : 1
      const isHover = S.hoveredId === sp.id
      const glowBoost = isHover ? 1.55 : 1
      const r = sp.r * pulse

      // 外层柔光
      const gr = r * 3.4 * glowBoost
      const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, gr)
      g.addColorStop(0, sp.glow + 'aa')
      g.addColorStop(0.25, sp.color + '55')
      g.addColorStop(0.6, sp.color + '12')
      g.addColorStop(1, sp.color + '00')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, gr, 0, Math.PI * 2)
      ctx.fill()

      // 中层光
      const gr2 = r * 1.7
      const g2 = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, gr2)
      g2.addColorStop(0, sp.color)
      g2.addColorStop(0.4, sp.color + 'cc')
      g2.addColorStop(1, sp.color + '00')
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, gr2, 0, Math.PI * 2)
      ctx.fill()

      // 实心核心
      const core = ctx.createRadialGradient(sp.x - r * 0.28, sp.y - r * 0.28, 0, sp.x, sp.y, r * 0.95)
      core.addColorStop(0, '#ffffff')
      core.addColorStop(0.22, sp.color)
      core.addColorStop(1, sp.color + 'aa')
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, r * 0.95, 0, Math.PI * 2)
      ctx.fill()
    }

    const draw = (time) => {
      const dt = Math.min(0.05, (time - (S.lastT || time)) / 1000)
      S.lastT = time

      ctx.clearRect(0, 0, S.W, S.H)

      // 星空
      S.stars.forEach((st) => drawStar(st, time))

      // 连线（球下方）
      S.links.forEach(drawLink)

      // 中心轨道环
      drawCenterRings(S.spheres[0], time)

      // 流动粒子
      S.particles.forEach((p, i) => drawParticle(p, dt, i))

      // 球
      S.spheres.forEach((sp) => drawSphere(sp, time))

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    // hover & click
    const findSphere = (mx, my) => {
      for (const sp of S.spheres) {
        if (Math.hypot(mx - sp.x, my - sp.y) <= sp.r * 1.1) return sp
      }
      return null
    }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const sp = findSphere(x, y)
      const id = sp?.id ?? null
      S.hoveredId = id
      canvas.style.cursor = sp ? 'pointer' : 'default'
      if (id !== S._lastHover) {
        S._lastHover = id
        setHovered(id)
      }
    }
    const onLeave = () => {
      S.hoveredId = null
      canvas.style.cursor = 'default'
      if (S._lastHover !== null) {
        S._lastHover = null
        setHovered(null)
      }
    }
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const sp = findSphere(e.clientX - rect.left, e.clientY - rect.top)
      if (sp) onClickSphere(sp.id)
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)

    const ro = new ResizeObserver(() => measure())
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
      ro.disconnect()
    }
  }, [setHovered, onClickSphere])

  return (
    <div className="width-stage" ref={wrapRef}>
      <canvas ref={canvasRef} className="width-canvas" aria-label="技能星系网络" />
      {data.spheres.map((sp) => (
        <div
          key={sp.id}
          className={`wlabel wlabel-${sp.id}${hovered === sp.id ? ' is-hover' : ''}`}
          style={{ left: sp.pos[0] * 100 + '%', top: sp.pos[1] * 100 + '%' }}
        >
          <span className="wlabel-en">{sp.en}</span>
          <span className="wlabel-zh">{sp.name}</span>
        </div>
      ))}
    </div>
  )
}

/* ===================== VideoModal ===================== */

function VideoModal({ videos, idx, setIdx, onClose }) {
  const v = videos[idx]
  const total = videos.length

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setIdx((idx - 1 + total) % total)
      else if (e.key === 'ArrowRight') setIdx((idx + 1) % total)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, onClose, total])

  const prev = () => setIdx((idx - 1 + total) % total)
  const next = () => setIdx((idx + 1) % total)

  return (
    <div className="width-modal" role="dialog" aria-modal="true" aria-label="技能视频">
      <div className="width-modal-backdrop" onClick={onClose} />
      <button className="width-modal-close" onClick={onClose} aria-label="关闭">×</button>
      <button className="width-modal-arrow width-modal-arrow--prev" onClick={prev} aria-label="上一个">‹</button>
      <button className="width-modal-arrow width-modal-arrow--next" onClick={next} aria-label="下一个">›</button>
      <div className="width-modal-card">
        <video
          key={v.src}
          className="width-modal-video"
          src={v.src}
          controls
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="width-modal-meta">
          <span className="width-modal-name">{v.name}</span>
          <span className="width-modal-count">{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}
