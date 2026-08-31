import Reveal from './Reveal.jsx'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-media" aria-hidden="true">
        <img src="./assets/hero/hero-skyline.jpg" alt="" />
      </div>
      <div className="hero-gridlines" aria-hidden="true">
        <span className="gl-1" />
        <span className="gl-2" />
        <span className="gl-3" />
      </div>
      <span className="hero-cross" aria-hidden="true" />

      <div className="hero-inner">
        <Reveal as="p" className="hero-kicker">Portfolio · Urban Planning &amp; Design</Reveal>
        <Reveal as="h1" className="hero-title" delay={120}>
          Tangshare
          <span className="zh">汤雪儿 · 城市规划设计师</span>
        </Reveal>
        <Reveal as="p" className="hero-sub" delay={240}>
          就职于上海市城市规划设计研究院区域与总体规划分院。
          以宏观视野洞察城市，以微观尺度雕琢空间，让每一份规划从蓝图走向实景。
        </Reveal>
        <Reveal as="div" className="hero-cta" delay={340}>
          <a className="btn-block btn-primary" href="#projects" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) }}>
            进入项目 <span className="arrow">→</span>
          </a>
          <a className="btn-block btn-ghost" href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) }}>
            关于我 About
          </a>
        </Reveal>
      </div>

      <div className="hero-foot">
        <Reveal as="p" delay={420} style={{ maxWidth: 320, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(234,242,251,0.4)', lineHeight: 2 }}>
          Urban Planning &amp; Design<br />Shanghai, China
        </Reveal>
      </div>

      <div className="scroll-hint">Scroll</div>
    </section>
  )
}
