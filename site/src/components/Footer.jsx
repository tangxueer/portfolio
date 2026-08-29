export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <span>© 2026 TANGSHARE 汤雪儿 · 城市规划设计师</span>
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          回到顶部 ↑
        </a>
      </div>
    </footer>
  )
}
