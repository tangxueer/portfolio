/* 导航交互：滚动阴影、锚点高亮、移动端菜单 */
(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  var sections = document.querySelectorAll("section[id], header[id]");

  // 滚动时导航加阴影
  function onScroll() {
    if (window.scrollY > 8) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
    highlightNav();
  }

  // 当前区块高亮
  function highlightNav() {
    var pos = window.scrollY + 100;
    var currentId = "";
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) {
        currentId = sec.id;
      }
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === "#" + currentId) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });
  }

  // 移动端菜单开关
  function toggleMenu() {
    var open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  navToggle.addEventListener("click", toggleMenu);

  // 点击链接后收起移动端菜单
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
