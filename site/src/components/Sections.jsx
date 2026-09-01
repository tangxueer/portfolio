import Reveal from './Reveal.jsx'
import { projects } from '../data/content.js'

/** 未完成的维度标签页 / 模块占位 */
export default function PlaceholderSection({ id, title, en, desc, note }) {
  return (
    <section className="panel" id={id}>
      <div className="panel-glow" aria-hidden="true" />
      <div className="shell" style={{ width: '100%' }}>
        <Reveal className="sec-head">
          <span className="sec-index">{en}</span>
          <h2 className="sec-title-zh">{title}</h2>
          <span className="sec-title-en" style={{ marginLeft: 'auto' }}>{en}</span>
        </Reveal>
        <Reveal delay={100}>
          <div className="placeholder-box">
            <p className="t">{desc}</p>
            <p className="s">{note || '内容规划中 · 敬请期待'}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function VerticalSection() {
  const d = projects.vertical
  return <PlaceholderSection id="vertical" title={d.title} en={d.en} desc={d.desc} note="纵向维度项目整理中" />
}
export function ResearchSection() {
  return <PlaceholderSection id="research" title="研究沉淀" en="RESEARCH" desc="著作 · 论文 · 课题 · 学术交流" note="研究模块规划中" />
}
export function SkillsSection() {
  return <PlaceholderSection id="skills" title="技能图谱" en="SKILLS" desc="规划编制 · 空间分析 · 数智赋能 · 表达综合" note="技能模块规划中" />
}
