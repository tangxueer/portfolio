import Reveal from './Reveal.jsx'
import { timeline, keywords } from '../data/content.js'

export default function About() {
  return (
    <section className="panel" id="about">
      <div className="panel-glow" aria-hidden="true" />
      <div className="shell about-grid">
        <Reveal className="about-left">
          <h2 className="about-name">汤雪儿</h2>
          <p className="about-role">
            <span className="en">Tang</span>
            <span className="divider">|</span>
            <span>城市规划设计师</span>
          </p>
          <p className="about-dept">区域与总体规划分院 · Shanghai Urban Planning &amp; Design Institute</p>
          <figure className="about-photo">
            <img src="./assets/about/portrait.jpg" alt="汤雪儿" />
            <figcaption>Tang Xue'er · 1999</figcaption>
          </figure>
        </Reveal>

        <div className="about-right">
          <Reveal className="about-block">
            <p className="about-block-label"><span className="dot" />工作经历 <span className="en">Experience</span></p>
            <ol className="tl">
              {timeline.slice(0, 1).map((t) => (
                <li className="tl-item" key={t.years}>
                  <span className="tl-years">{t.years}</span>
                  <span className="tl-line" />
                  <span className="tl-body"><span className="org">{t.org}</span><span className="major">{t.major}</span></span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="about-block" delay={100}>
            <p className="about-block-label"><span className="dot" />教育背景 <span className="en">Education</span></p>
            <ol className="tl">
              {timeline.slice(1).map((t) => (
                <li className="tl-item" key={t.years}>
                  <span className="tl-years">{t.years}</span>
                  <span className="tl-line" />
                  <span className="tl-body"><span className="org">{t.org}</span><span className="major">{t.major}</span></span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="about-block" delay={180}>
            <p className="about-block-label"><span className="dot" />能力关键词 <span className="en">Keywords</span></p>
            <div className="keywords">
              {keywords.map((k, i) => (
                <div className="kw" key={k.en}>
                  <span className="kw-index">{String(i + 1).padStart(2, '0')}</span>
                  <p className="kw-zh">{k.zh}</p>
                  <p className="kw-en">{k.en}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
