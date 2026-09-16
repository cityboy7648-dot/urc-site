/* URC · Network — interactions
   nav (hide on scroll / mobile menu), tabs, generation strip, reveal, smooth scroll, background */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  /* ── smooth scroll (Lenis, optional) ─────────────────────── */
  let lenis = null;
  if (!reduced && typeof window.Lenis === "function") {
    try { lenis = new window.Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1 }); window.__lenis = lenis; } catch (e) { lenis = null; }
  }

  /* ── nav: hide on scroll down, show on scroll up ─────────── */
  (function nav() {
    let last = window.scrollY, ticking = false;
    const update = () => {
      const y = window.scrollY;
      body.classList.toggle("is-scrolled", y > 24);
      if (Math.abs(y - last) > 6) {
        body.classList.toggle("nav-hidden", y > 120 && y > last && !body.classList.contains("menu-open"));
        last = y;
      }
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    const burger = document.querySelector(".burger");
    const menu = document.querySelector(".menu");
    if (!burger || !menu) return;
    const setOpen = (open) => {
      body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      body.style.overflow = open ? "hidden" : "";
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener("click", () => setOpen(!body.classList.contains("menu-open")));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  })();

  /* ── reveal on scroll ────────────────────────────────────── */
  const io = ("IntersectionObserver" in window && !reduced)
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
    : null;
  const observe = (root) => {
    root.querySelectorAll("[data-reveal], .gens").forEach((el) => {
      if (io) io.observe(el); else el.classList.add("in");
    });
  };
  const rearm = (root) => {
    root.querySelectorAll("[data-reveal], .gens").forEach((el) => { el.classList.remove("in"); if (io) io.unobserve(el); });
    // next frame so the removed state paints before re-observing
    requestAnimationFrame(() => requestAnimationFrame(() => observe(root)));
  };
  observe(document);

  /* ── top-level tabs ──────────────────────────────────────── */
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".panel"));
  const ind = document.querySelector(".tab-ind");
  const tabsBar = document.querySelector(".tabs");
  const moveInd = (tab) => {
    if (!ind || !tab) return;
    ind.style.left = tab.offsetLeft + "px";
    ind.style.width = tab.offsetWidth + "px";
  };
  const showTab = (key, { scroll = false, push = true } = {}) => {
    const tab = tabs.find((t) => t.dataset.tab === key) || tabs[0];
    if (!tab) return;
    tabs.forEach((t) => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    panels.forEach((p) => {
      const on = p.dataset.panel === tab.dataset.tab;
      if (on && p.hidden) { p.hidden = false; p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter"); rearm(p); }
      else if (!on) { p.hidden = true; p.classList.remove("enter"); }
    });
    moveInd(tab);
    if (push) history.replaceState(null, "", "#" + tab.dataset.tab + (tab.dataset.tab === "members" && currentGen ? "-" + currentGen : ""));
    if (scroll && tabsBar) {
      const top = tabsBar.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(top, { offset: 0 }); else window.scrollTo({ top, behavior: "smooth" });
    }
  };
  tabs.forEach((t) => {
    t.addEventListener("click", () => showTab(t.dataset.tab, { scroll: window.scrollY > tabsBar.offsetTop }));
    t.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(t);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        n.focus(); showTab(n.dataset.tab);
      }
    });
  });
  window.addEventListener("resize", () => moveInd(tabs.find((t) => t.getAttribute("aria-selected") === "true")));

  /* ── members: generation strip ───────────────────────────── */
  const gens = Array.from(document.querySelectorAll(".gen"));
  const genPanels = Array.from(document.querySelectorAll(".gen-panel"));
  let currentGen = null;
  const showGen = (slug, { push = true } = {}) => {
    const btn = gens.find((g) => g.dataset.gen === slug) || gens[0];
    if (!btn) return;
    currentGen = btn.dataset.gen;
    gens.forEach((g) => { const on = g === btn; g.setAttribute("aria-selected", String(on)); g.tabIndex = on ? 0 : -1; });
    genPanels.forEach((p) => {
      const on = p.dataset.gen === currentGen;
      if (on && p.hidden) {
        p.hidden = false; p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter");
        p.querySelectorAll(".mcard[data-reveal]").forEach((c, i) => { c.style.setProperty("--d", Math.min(i, 11) * 55 + "ms"); });
        rearm(p);
      } else if (!on) { p.hidden = true; p.classList.remove("enter"); }
    });
    if (push) history.replaceState(null, "", "#members-" + currentGen);
  };
  gens.forEach((g) => {
    g.addEventListener("click", () => showGen(g.dataset.gen));
    g.addEventListener("keydown", (e) => {
      const i = gens.indexOf(g);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const n = gens[(i + (e.key === "ArrowRight" ? 1 : -1) + gens.length) % gens.length];
        n.focus(); showGen(n.dataset.gen);
      }
    });
  });

  /* ── initial state from hash ─────────────────────────────── */
  const applyHash = () => {
    const h = (location.hash || "").replace(/^#/, "");
    const m = h.match(/^members(?:-([a-z0-9]+))?$/i);
    if (m) { showGen(m[1] || gens[0]?.dataset.gen, { push: false }); showTab("members", { push: false }); }
    else if (h === "network" || h === "advisors") { showGen(gens[0]?.dataset.gen, { push: false }); showTab(h, { push: false }); }
    else { showGen(gens[0]?.dataset.gen, { push: false }); showTab("advisors", { push: false }); }
  };
  applyHash();
  window.addEventListener("hashchange", applyHash);
  // indicator needs fonts to settle
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveInd(tabs.find((t) => t.getAttribute("aria-selected") === "true")));
  window.addEventListener("load", () => moveInd(tabs.find((t) => t.getAttribute("aria-selected") === "true")));

  /* ── background: WebGL city-night shader ─────────────────── */
  (function background() {
    const host = document.getElementById("bg");
    if (!host) return;
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false }) || canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { host.dataset.failed = "true"; return; }
    host.appendChild(canvas);
    const fail = (e) => { if (e) e.preventDefault(); host.dataset.failed = "true"; canvas.remove(); };
    canvas.addEventListener("webglcontextlost", fail);

    const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime, uScroll;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 q){
  vec2 i = floor(q), f = fract(q);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 q){ float v = 0.0, a = 0.5; for(int i = 0; i < 4; i++){ v += a * vnoise(q); q = q * 2.03 + vec2(7.31, 3.7); a *= 0.5; } return v; }

/* floating light motes — drift upward, twinkle */
float motes(vec2 p, float density, float seed, float rise){
  vec2 q = p * density; q.y -= uTime * rise;
  vec2 i = floor(q), f = fract(q);
  float acc = 0.0;
  for(int dy = -1; dy <= 1; dy++){ for(int dx = -1; dx <= 1; dx++){
    vec2 o = vec2(float(dx), float(dy)); vec2 c = i + o;
    float h = hash(c + seed); if(h < 0.93) continue;
    vec2 sp = o + vec2(hash(c + 1.7), hash(c + 3.3));
    float d = length(f - sp);
    acc += exp(-d * d * 900.0) * (0.3 + hash(c + 9.1) * 0.7) * (0.65 + 0.35 * sin(uTime * 1.4 + h * 40.0));
  }}
  return acc;
}

void main(){
  float aspect = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  p += vec2(sin(uTime * 0.05) * 0.004, cos(uTime * 0.041) * 0.003);

  float t = uScroll;
  float e = t * t * (3.0 - 2.0 * t);

  vec3 CYAN = vec3(0.38, 0.83, 0.97);
  vec3 VIOL = vec3(0.55, 0.42, 0.94);
  vec3 NAVY = vec3(0.10, 0.16, 0.36);
  vec3 WARM = vec3(1.00, 0.86, 0.62);

  vec3 col = vec3(0.0);

  /* ── sky: two soft nebulae, cyan top-left → violet bottom-right as you scroll ── */
  float n1 = fbm(p * 1.6 + vec2(uTime * 0.02, -uTime * 0.013));
  float n2 = fbm(p * 2.2 + vec2(-uTime * 0.015, uTime * 0.02) + 5.1);
  vec2 c1 = vec2(-0.55 + 0.25 * e, 0.32 - 0.12 * e);
  vec2 c2 = vec2(0.62 - 0.3 * e, -0.18 + 0.28 * e);
  float g1 = exp(-dot(p - c1, p - c1) * 3.2) * (0.55 + 0.45 * n1);
  float g2 = exp(-dot(p - c2, p - c2) * 2.6) * (0.55 + 0.45 * n2);
  col += CYAN * g1 * 0.22 * (1.0 - 0.35 * e);
  col += VIOL * g2 * (0.16 + 0.16 * e);
  col += NAVY * 0.10 * (1.0 - uv.y);

  /* ── the city plane: a perspective grid that we travel across ── */
  float horizon = -0.20 + 0.06 * e;
  float below = horizon - p.y;
  if(below > 0.0){
    float z = 0.22 / (below + 0.002);            // depth
    float wx = p.x * z;                          // world x
    float wz = z + uTime * 0.9 + e * 26.0;       // world z — travel forward with time and scroll
    vec2 g = vec2(wx, wz);
    vec2 gf = abs(fract(g) - 0.5);
    float lineW = 0.012 * z;                     // thinner far away
    float lines = smoothstep(lineW, 0.0, min(gf.x, gf.y) * 0.5);
    float fog = exp(-z * 0.16);
    float fade = smoothstep(0.0, 0.06, below);   // soft near horizon
    vec3 gridCol = mix(CYAN, VIOL, clamp(0.5 + 0.5 * sin(wz * 0.25), 0.0, 1.0));
    col += gridCol * lines * fog * fade * 0.11;
    /* faint glow at the horizon line */
    col += mix(CYAN, VIOL, e) * exp(-below * below * 900.0) * 0.22;
    /* city lights on the plane: sparse blocks */
    vec2 cell = floor(g * vec2(1.0, 0.5));
    float lit = step(0.965, hash(cell + 2.3));
    vec2 cf = fract(g * vec2(1.0, 0.5));
    float blk = smoothstep(0.35, 0.3, abs(cf.x - 0.5)) * smoothstep(0.35, 0.3, abs(cf.y - 0.5));
    col += mix(WARM, CYAN, hash(cell + 7.7)) * lit * blk * fog * fade * 0.55 * (0.7 + 0.3 * sin(uTime * 2.0 + hash(cell) * 30.0));
  } else {
    /* skyline silhouette just above the horizon */
    float bx = p.x * 46.0 + e * 90.0 + uTime * 0.18;
    float bi = floor(bx);
    float bh = 0.008 + 0.075 * pow(hash(vec2(bi, 1.0)), 1.6) * (0.5 + 0.5 * hash(vec2(bi, 2.0)));
    float top = horizon + bh;
    float inB = step(p.y, top);
    float edge = smoothstep(0.0, 0.004, top - p.y);
    /* darken sky where a building stands, then place tiny windows */
    col *= 1.0 - inB * 0.6;
    vec2 wc = vec2(bx * 2.5, (p.y - horizon) * 120.0);
    vec2 wcell = floor(wc);
    float win = step(0.86, hash(wcell + bi * 0.37)) * inB;
    vec2 wf = fract(wc);
    float wdot = smoothstep(0.32, 0.22, abs(wf.x - 0.5)) * smoothstep(0.32, 0.22, abs(wf.y - 0.5));
    col += mix(WARM, CYAN, hash(wcell + 4.4)) * win * wdot * 0.42 * (0.75 + 0.25 * sin(uTime * 1.3 + hash(wcell) * 20.0));
    /* roofline glow */
    col += mix(CYAN, VIOL, e) * exp(-(p.y - top) * (p.y - top) * 30000.0) * inB * 0.25 * edge;
  }

  /* ── motes rising through the scene ── */
  col += CYAN * motes(p, 9.0, 0.0, 0.012) * 0.28;
  col += WARM * motes(p, 16.0, 11.0, 0.02) * 0.14;

  /* ── a slow diagonal light sweep ── */
  float sweep = exp(-pow(p.x * 0.55 + p.y - 0.15 + sin(uTime * 0.07) * 0.6, 2.0) * 9.0);
  col += mix(CYAN, VIOL, 0.5) * sweep * 0.035;

  /* ── finish: vignette, grain, tonemap ── */
  float dv = length(vec2(p.x / aspect, p.y));
  col *= 1.0 - smoothstep(0.42, 1.04, dv) * 0.45;
  col += (hash(gl_FragCoord.xy + mod(uTime, 7.0)) - 0.5) * 0.028;
  col = col / (1.0 + col * 0.25);
  col += vec3(0.02, 0.027, 0.05);
  gl_FragColor = vec4(col, 1.0);
}`;
    const VERT = "attribute vec2 aP; void main(){ gl_Position = vec4(aP, 0.0, 1.0); }";
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = mk(gl.VERTEX_SHADER, VERT), fs = mk(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return fail();
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail();
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, "aP"); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    const U = { res: gl.getUniformLocation(prog, "uRes"), time: gl.getUniformLocation(prog, "uTime"), scroll: gl.getUniformLocation(prog, "uScroll") };

    let scale = mobile ? 0.5 : 0.72, scrollS = 0, timeS = 0;
    const draw = (tm) => { gl.uniform2f(U.res, canvas.width, canvas.height); gl.uniform1f(U.time, reduced ? 8 : tm); gl.uniform1f(U.scroll, scrollS); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const resize = () => {
      const k = Math.min(window.devicePixelRatio || 1, 2) * scale;
      canvas.width = Math.round(window.innerWidth * k); canvas.height = Math.round(window.innerHeight * k);
      gl.viewport(0, 0, canvas.width, canvas.height); draw(timeS);
    };
    resize(); window.addEventListener("resize", resize);

    let last = performance.now(), frames = 0, acc = 0, lastAdj = 0, raf = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.1); last = now;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      scrollS += (target - scrollS) * (reduced ? 1 : 0.07);
      draw((timeS = now * 0.001));
      if (reduced) { cancelAnimationFrame(raf); return; }
      frames++; acc += dt;
      if (acc >= 1.6 && now - lastAdj > 2500) {
        const fps = frames / acc;
        if (fps < 45 && scale > 0.4) { scale = Math.max(0.4, scale - 0.1); resize(); lastAdj = now; }
        else if (fps > 58 && scale < 0.9) { scale = Math.min(0.9, scale + 0.05); resize(); lastAdj = now; }
        frames = 0; acc = 0;
      }
    };
    raf = requestAnimationFrame(loop);
  })();
})();
