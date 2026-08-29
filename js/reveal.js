/* 滚动入场动画：IntersectionObserver 控制 .reveal 元素的显示 */
(function () {
  "use strict";

  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  // 读取 data-delay（单位 0.1s），设置 transition-delay
  reveals.forEach(function (el) {
    var step = parseInt(el.getAttribute("data-delay") || "0", 10);
    el.style.transitionDelay = (step * 100) + "ms";
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
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  reveals.forEach(function (el) { observer.observe(el); });
})();
