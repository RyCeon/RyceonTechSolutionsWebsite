/**
 * Ryceon Tech — shared site behavior: nav, header state, scroll reveals,
 * stat counters, FAQ accordion, back-to-top. Runs on every page.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  /* ---------------- Sticky header background ---------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var applyHeaderState = function () {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    applyHeaderState();
    window.addEventListener("scroll", applyHeaderState, { passive: true });
  }

  /* ---------------- Scroll-reveal animations ---------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Stagger children in the same group via a small incremental delay
              var delay = entry.target.getAttribute("data-reveal-delay") || 0;
              setTimeout(function () {
                entry.target.classList.add("is-visible");
              }, Number(delay));
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ---------------- Animated stat counters ---------------- */
  var counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    var animateCounter = function (el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1600;
      var start = null;

      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }

      var step = function (timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        // Ease-out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      };
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------------- FAQ / generic accordion ---------------- */
  var accordions = document.querySelectorAll(".accordion");
  accordions.forEach(function (accordion) {
    var triggers = accordion.querySelectorAll(".accordion-trigger");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        // Close other open items within the same accordion
        triggers.forEach(function (other) {
          if (other !== trigger) {
            other.setAttribute("aria-expanded", "false");
            var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
            if (otherPanel) otherPanel.style.maxHeight = null;
          }
        });

        trigger.setAttribute("aria-expanded", String(!isOpen));
        if (panel) {
          panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
        }
      });
    });
  });

  /* ---------------- Back to top ---------------- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 640);
    };
    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- Active nav link on current page ---------------- */
  var currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]:not(.btn)").forEach(function (link) {
    var href = link.getAttribute("href").split("#")[0];
    if (href === currentPath || (href === "index.html" && currentPath === "")) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------- Hero particle positions ---------------- */
  var particleField = document.querySelector(".hero-particles");
  if (particleField && !reduceMotion) {
    var count = 18;
    for (var i = 0; i < count; i++) {
      var span = document.createElement("span");
      span.style.left = Math.random() * 100 + "%";
      span.style.top = Math.random() * 100 + "%";
      span.style.animationDelay = Math.random() * 10 + "s";
      span.style.animationDuration = 9 + Math.random() * 8 + "s";
      particleField.appendChild(span);
    }
  }
})();
