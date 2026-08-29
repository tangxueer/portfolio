/* 滚动入场动画：IntersectionObserver 控制 .reveal 元素的显示 */
(function () {
  "use strict";

  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  // 读取 data-delay，写入 CSS 变量供 transition-delay 使用
  reveals.forEach(function (el) {
    var delay = el.getAttribute("data-delay") || 0;
    el.style.setProperty("--reveal-delay", delay);
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach(function (el) { observer.observe(el); });
})();
