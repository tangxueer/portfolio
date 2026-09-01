import Reveal from './Reveal.jsx'

const goTo = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-media" aria-hidden="true">
        <img src="./assets/hero/home-cover.jpg" alt="" />
      </div>

      <div className="hero-inner">
        <Reveal as="h1" className="hero-title">
          TANG<br />SHARE
        </Reveal>

        <Reveal as="div" className="hero-byline" delay={120}>
          <p>上海市城市规划设计研究院</p>
          <p>区域与总体规划分院</p>
          <p>汤雪儿</p>
        </Reveal>

        <Reveal as="div" className="hero-cta" delay={240}>
          <a className="hero-btn" href="#about" onClick={goTo('about')}>
            <span>关于我 ABOUT</span>
            <span className="hero-btn-arrow" aria-hidden="true">↗</span>
          </a>
        </Reveal>
      </div>

      <div className="scroll-hint">Scroll</div>
    </section>
  )
}
