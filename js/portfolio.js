/**
 * Portfolio filter — vanilla JS, no framework. Used on portfolio.html only.
 */
(function () {
  "use strict";

  var filterBar = document.querySelector(".filter-bar");
  var items = document.querySelectorAll(".portfolio-item");
  if (!filterBar || !items.length) return;

  var buttons = filterBar.querySelectorAll(".filter-btn");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      items.forEach(function (item) {
        var category = item.getAttribute("data-category");
        var show = filter === "all" || filter === category;
        item.hidden = !show;
      });
    });
  });
})();
