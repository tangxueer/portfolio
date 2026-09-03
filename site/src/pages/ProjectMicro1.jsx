import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import ScrollGallery from '../components/ScrollGallery.jsx'
import { projects } from '../data/content.js'

/** 详情页 1-2-1：淀山湖世界级湖区空间战略规划及国际方案征集（概况 → 滚动图集） */
export default function ProjectMicro1() {
  const p = projects.micro.items[0]
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // 返回首页并自动定位到微观模块
  const backToMicro = (e) => {
    e.preventDefault()
    window.sessionStorage.setItem('pending-scroll', 'micro')
    navigate('/')
  }

  const captions = (p.gallery || []).map((_, i) => `方案图 ${String(i + 1).padStart(2, '0')}`)

  return (
    <main className="micro1-page">
      {/* Section 1 · 项目概况（左文右图，右侧保持原图比例不裁剪） */}
      <section className="detail-hero shell">
        <div className="detail-info">
          <a className="back" href="#/" onClick={backToMicro}>← 返回微观 Micro</a>
          <p className="cat">Micro · 微观维度</p>
          <h1>{p.name}</h1>
          <dl className="detail-facts">
            <div className="fact-row"><dt>关键词</dt><dd>{p.keywords.join(' / ')}</dd></div>
            <div className="fact-row"><dt>时期</dt><dd>{p.period}</dd></div>
            <div className="fact-row"><dt>角色</dt><dd>{p.role}</dd></div>
          </dl>
        </div>
        <div className="detail-media">
          <img src={p.cover} alt={`${p.name} 封面`} />
        </div>
      </section>

      {/* Section 2 · 滚动切换图集（去掉"方案图集·Scroll"标题，只留 hint + 滚动图） */}
      <section className="sg-section">
        <div className="shell sg-head">
          <div className="sec-head">
            <span className="sec-index">GALLERY</span>
            <span className="sg-hint">向下滚动，逐张浏览方案图纸</span>
          </div>
        </div>
        <ScrollGallery images={p.gallery || []} captions={captions} title={p.name} />
      </section>

      <Footer />
    </main>
  )
}
