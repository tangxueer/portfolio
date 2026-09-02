import Reveal from './Reveal.jsx'

/**
 * 底部 FOOTER
 * 参考 jingjinghan.com 底部：上层蓝色（"LET'S SHARE!" 大字）+ 下层彩色城市体块
 * （所需材料/首页/首页背景图.jpg 的下半部分）背景，最底"BACK TO TOP"回到顶部。
 */
export default function Footer() {
  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <Reveal className="footer-sky">
        <div className="shell footer-sky-inner">
          <h2 className="footer-title">LET&apos;S SHARE!</h2>
        </div>
      </Reveal>

      <div className="footer-city" aria-hidden="true" />

      <a className="footer-top-link" href="#top" onClick={scrollToTop}>
        <span>BACK TO TOP</span>
        <span className="footer-top-arrow" aria-hidden="true">↑</span>
      </a>
    </footer>
  )
}
