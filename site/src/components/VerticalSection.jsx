import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

/**
 * 纵向 VERTICAL 标签页
 * 左侧标题 + 小字；右侧「规储净供用维」图层升起视频（背景虚化融入海洋底色）。
 * 点击视频主体 → 播放倒放消失特效 → 跳转详情页 /project/vertical-1。
 */
export default function VerticalSection() {
  const data = projects.vertical
  const navigate = useNavigate()
  // intro: 正放循环中 · outro: 倒放消失特效中 · leaving: 已离开
  const [phase, setPhase] = useState('intro')
  const outroRef = useRef(null)
  const leavingRef = useRef(false)

  // 预加载倒放视频，保证点击时特效即时可播
  useEffect(() => {
    const v = document.createElement('video')
    v.src = './assets/projects/vertical-outro.mp4'
    v.preload = 'auto'
    v.muted = true
  }, [])

  const trigger = () => {
    if (phase !== 'intro' || leavingRef.current) return
    setPhase('outro')
    const v = outroRef.current
    if (v) {
      try {
        v.currentTime = 0
      } catch (_) { /* noop */ }
      const p = v.play()
      if (p) p.catch(() => go())
    } else {
      go()
    }
  }

  const go = () => {
    if (leavingRef.current) return
    leavingRef.current = true
    setPhase('leaving')
    navigate('/project/vertical-1')
  }

  return (
    <section className="panel vert-panel" id="vertical">
      <div className="panel-glow" aria-hidden="true" />

      <div className="shell vert-shell">
        <Reveal className="vert-intro">
          <p className="dim-tag">Dimension 03 · {data.en}</p>
          <h3>{data.title}</h3>
          <p>{data.desc}</p>
        </Reveal>

        <Reveal className="vert-stage" delay={120}>
          <div
            className={`vert-video ${phase !== 'intro' ? 'is-leaving' : ''}`}
            onClick={trigger}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                trigger()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="点击进入项目：上海市土地储备专项规划（2026-2030年）"
          >
            <video
              src="./assets/projects/vertical-intro.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={outroRef}
              className="vert-outro"
              src="./assets/projects/vertical-outro.mp4"
              muted
              playsInline
              preload="auto"
              onEnded={go}
            />
          </div>
          <p className="vert-hint">
            <span>点击画面 · 进入项目</span>
            <span className="vert-hint-arrow" aria-hidden="true">↗</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
