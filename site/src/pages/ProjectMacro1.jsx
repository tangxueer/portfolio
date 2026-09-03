import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import Footer from '../components/Footer.jsx'
import { projects } from '../data/content.js'

/** 详情页 1-1-1：上海2035总规实施评估与动态维护（概况 → 奖项 → 视频） */
export default function ProjectMacro1() {
  const p = projects.macro.items[0]

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main className="macro1-page">
      {/* Section 1 · 项目概况（左文右图） */}
      <section className="detail-hero shell">
        <Reveal className="detail-info">
          <Link className="back" to="/">← 返回项目 Projects</Link>
          <p className="cat">Macro · 宏观维度</p>
          <h1>{p.name}</h1>
          <dl className="detail-facts">
            <div className="fact-row"><dt>关键词</dt><dd>{p.keywords.join(' / ')}</dd></div>
            <div className="fact-row"><dt>时期</dt><dd>{p.period}</dd></div>
            <div className="fact-row"><dt>角色</dt><dd>{p.role}</dd></div>
          </dl>
        </Reveal>
        <Reveal className="detail-media" delay={150}>
          <img src={p.cover} alt={`${p.name} 封面`} />
        </Reveal>
      </section>

      {/* Section 2 · 奖项页 */}
      <section className="award-panel shell">
        <p className="award-watermark" aria-hidden="true">Award</p>
        <Reveal className="award-info">
          <h2>项目荣誉</h2>
          <p className="zh-sub">Honor</p>
          <div className="award-tags">
            <span className="award-tag-year">2025 年度</span>
            <span className="award-tag">上海市优秀国土空间规划成果</span>
            <span className="award-tag">一等奖</span>
          </div>
          <p>
            "上海2035"总规实施评估与动态维护规划方案获评<strong> 2025 年度上海市优秀国土空间规划成果一等奖</strong>。
            项目全程支撑报部、报奖相关工作并上报国办，建立了"评估—维护—实施"的常态化运行机制，
                为超大城市总体规划的动态实施提供了可复制的"上海样本"。
          </p>
        </Reveal>
        <Reveal className="award-media" delay={150}>
          <img src="./assets/projects/macro1-award.jpg" alt="2025年度上海市优秀国土空间规划成果一等奖证书" />
        </Reveal>
      </section>

      {/* Section 3 · 视频（去掉"动态维护·成片"标题，只留视频本身） */}
      <section className="video-panel shell">
        <Reveal className="video-frame">
          <video src="./assets/projects/macro1-video.mp4" controls preload="metadata" playsInline />
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}
