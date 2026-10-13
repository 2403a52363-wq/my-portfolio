/* Portfolio interactions: hero activation-map grid, mobile menu, nav highlight, copy email */
(function () {
  "use strict";

  /* ---------- Hero: activation-map grid ---------- */
  var canvas = document.getElementById("heat");
  var hero = document.getElementById("hero");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && hero) {
    var ctx = canvas.getContext("2d");
    var CELL = 20;
    var cols = 0, rows = 0, w = 0, h = 0, heat = new Float32Array(0);
    var pointer = { x: -9999, y: -9999, on: false };
    var running = true;

    // Heat colour ramp: cool teal -> amber -> red
    var STOPS = [
      [15, 163, 163],
      [232, 137, 43],
      [214, 69, 52]
    ];
    function ramp(t) {
      t = Math.min(1, Math.max(0, t));
      var seg = t < 0.5 ? 0 : 1;
      var k = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
      var a = STOPS[seg], b = STOPS[seg + 1];
      return [
        Math.round(a[0] + (b[0] - a[0]) * k),
        Math.round(a[1] + (b[1] - a[1]) * k),
        Math.round(a[2] + (b[2] - a[2]) * k)
      ];
    }

    function resize() {
      var r = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      heat = new Float32Array(cols * rows);
    }

    function splat(x, y, radius, amount) {
      var cx = x / CELL, cy = y / CELL, r = radius / CELL;
      var x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(cols - 1, Math.ceil(cx + r));
      var y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(rows - 1, Math.ceil(cy + r));
      for (var j = y0; j <= y1; j++) {
        for (var i = x0; i <= x1; i++) {
          var dx = i + 0.5 - cx, dy = j + 0.5 - cy;
          var d2 = (dx * dx + dy * dy) / (r * r);
          if (d2 < 1) {
            var idx = j * cols + i;
            heat[idx] = Math.min(1, heat[idx] + amount * Math.exp(-3 * d2));
          }
        }
      }
    }

    // Slow ambient "attention" blobs so the grid is alive without input (also on touch screens)
    function ambient(t) {
      var s = t / 1000;
      splat(w * (0.72 + 0.12 * Math.sin(s * 0.35)), h * (0.42 + 0.14 * Math.cos(s * 0.28)), 150, 0.05);
      splat(w * (0.58 + 0.16 * Math.cos(s * 0.22 + 1)), h * (0.66 + 0.10 * Math.sin(s * 0.31)), 110, 0.035);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var v = heat[j * cols + i];
          var x = i * CELL + CELL / 2, y = j * CELL + CELL / 2;
          ctx.beginPath();
          if (v < 0.03) {
            ctx.fillStyle = "rgba(18, 32, 47, 0.14)";
            ctx.arc(x, y, 1.3, 0, 6.2832);
          } else {
            var c = ramp(v);
            ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (0.2 + 0.55 * v).toFixed(3) + ")";
            ctx.arc(x, y, 1.5 + v * (CELL * 0.42), 0, 6.2832);
          }
          ctx.fill();
        }
      }
    }

    function frame(t) {
      if (!running) return;
      for (var n = 0; n < heat.length; n++) heat[n] *= 0.94;
      ambient(t);
      if (pointer.on) splat(pointer.x, pointer.y, 120, 0.22);
      draw();
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // Static map: seed once, never animate
      for (var s = 0; s < 40; s++) ambient(s * 1800);
      draw();
    } else {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pointer.on = true;
      });
      hero.addEventListener("pointerleave", function () { pointer.on = false; });
      // Pause when the hero is off-screen or the tab is hidden
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          var visible = entries[0].isIntersecting;
          if (visible && !running) { running = true; requestAnimationFrame(frame); }
          if (!visible) running = false;
        }).observe(hero);
      }
      requestAnimationFrame(frame);
    }
  }

  /* ---------- Header: border on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "Menu";
    }
  });

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute("href"));
      if (sec) io.observe(sec);
    });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copy");
  var status = document.getElementById("copy-status");
  var email = "manirdy1609@gmail.com";
  copyBtn.addEventListener("click", function () {
    function done(ok) {
      copyBtn.textContent = ok ? "Copied" : "Copy failed";
      status.textContent = ok ? "Email address copied to clipboard" : "Could not copy. Select the address and copy it manually.";
      setTimeout(function () { copyBtn.textContent = "Copy email"; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
