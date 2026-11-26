/* AB Media v3: behaviour of the page. The markup comes from page.js; build.js has already written it
   into the HTML, so this file only fills it in when the page is opened without that step. */
(function () {
"use strict";
const I = window.ABM_I18N, D = window.ABM_DATA, P = window.ABM_PAGE, esc = P.esc, CASE = P.CASE;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const store = {
  get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
  set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
};
const QS = new URLSearchParams(location.search);
const PREVIEW = QS.has("preview");          /* ?preview: the form sends nothing */
const small = () => innerWidth < 900;
const html = document.documentElement;
/* every language has its own address (/, /es/, /ru/, /ar/); the page says which one it is */
const lang = I.LANGS.includes(html.lang) ? html.lang : "en", ROOT = html.dataset.root || "";
let t = null, reach = D.cjm.reach_default, calc = null, fmt = "", particles = null;
const num = n => Math.round(n).toLocaleString(lang === "ar" ? "en-US" : lang);

/* ---------- render ---------- */
function render() {
  const pg = P.make(lang, ROOT); t = pg.t;
  if (!$("#app").children.length) $("#app").innerHTML = pg.html;
  if (!$("#nav").children.length) $("#nav").innerHTML = pg.nav;
  if (!$("#langs").children.length) $("#langs").innerHTML = P.langs(lang, ROOT, "");
  $("#top-cta").textContent = t.cta; $("#float-cta").textContent = t.cta; $("#pl-cta").textContent = t.cta;
  $("#pl-more").textContent = t.open_case;
  $("#pl-x").setAttribute("aria-label", t.close);
  $("#langs").setAttribute("aria-label", t.lang_l);
  $("#bar-t").innerHTML = pg.bar;
  rail(); reveal(); bindCalc(); bindForm(); extra(); onScroll();
}

/* ---------- rail (section thumbnails on the side) ---------- */
function rail() {
  const r = $("#rail"); r.innerHTML = "";
  $$(".s").forEach((s, i) => {
    const a = document.createElement("a"); a.href = "#" + s.id; a.title = s.dataset.eb; a.setAttribute("aria-label", s.dataset.eb);
    if (particles) a.appendChild(particles.thumb(s.dataset.shape, 56));
    const n = document.createElement("span"); n.textContent = i + 1; a.appendChild(n); r.appendChild(a);
  });
}

/* ---------- reveal on scroll ---------- */
let io = null;
function reveal() {
  if (io) io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  $$(".rv").forEach(el => { const sib = $$(":scope > .rv", el.parentElement); el.style.setProperty("--d", Math.min(sib.indexOf(el), 7) * 70 + "ms"); io.observe(el); });
}

/* ---------- scroll: active section, particles target, rail, progress ---------- */
let active = -1, tick = false;
function onScroll() {
  tick = false;
  const vh = innerHeight, secs = $$(".s"), mid = vh * .5;
  let a = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) a = i; });
  const s = secs[a]; if (!s) return;
  if (a !== active) { active = a; $$("#rail a").forEach((x, i) => x.classList.toggle("on", i === a)); }
  const h = $(".head", s).getBoundingClientRect();
  const vis = Math.max(0, Math.min(1, (Math.min(h.bottom, vh) - Math.max(h.top, 0)) / Math.min(h.height, vh)));
  let x = s.dataset.side === "right" ? .73 : s.dataset.side === "left" ? .3 : .5, y = s.dataset.side === "center" ? .3 : .52, al = .12 + .88 * vis;
  if (lang === "ar") x = 1 - x;
  /* phones: the shape sits in the empty top of each section and scrolls away with it */
  if (small()) { x = .5; y = (h.top + vh * .29) / vh; al = 1; }
  if (particles) particles.setTarget(s.dataset.shape, x, y, al);
  const max = document.documentElement.scrollHeight - vh;
  $("#prog").style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  $("#top").classList.toggle("stuck", scrollY > 20);
  /* floating button (phones): only while no other request button or the form is on screen */
  const seen = $$("#app .btn-acc, #form, #contact .links").some(b => { const r = b.getBoundingClientRect(); return r.bottom > 0 && r.top < vh; });
  $("#float-cta").hidden = seen || scrollY < vh * .7;
}
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } });

/* ---------- calculator (estimated journey model) ---------- */
function bindCalc() {
  const r = $("#reach");
  const upd = () => {
    reach = +r.value; const k = reach / D.cjm.base_reach, n = D.cjm.now, f = D.cjm.film;
    $("#reach-o").textContent = num(reach);
    [1, 2, 3].forEach(i => { $("#n" + i).textContent = num(n[i] * k); $("#f" + i).textContent = num(f[i] * k); });
    $("#sum").innerHTML = t.j_sum.replace("{n}", num((f[3] - n[3]) * k)).replace("{x}", String(+(f[3] / n[3]).toFixed(1)));
    r.style.setProperty("--p", ((reach - r.min) / (r.max - r.min) * 100) + "%");
  };
  r.addEventListener("input", upd); upd();
  $("#calc-cta").addEventListener("click", () => {
    const k = reach / D.cjm.base_reach;
    calc = { reach, buyers_now: Math.round(D.cjm.now[3] * k), buyers_film: Math.round(D.cjm.film[3] * k), extra: Math.round((D.cjm.film[3] - D.cjm.now[3]) * k) };
    extra();
  });
}
/* the estimate attached to the request */
function extra() {
  const e = $("#extra"); if (!e) return;
  if (!calc) { e.hidden = true; return; }
  e.hidden = false;
  e.innerHTML = `<span class="mono">${esc(t.calc_l)}</span><b>${esc(t.calc_s.replace("{r}", num(calc.reach)).replace("{n}", num(calc.extra)))}</b><button type="button" aria-label="${esc(t.remove)}">×</button>`;
  $("button", e).addEventListener("click", () => { calc = null; extra(); });
}

/* ---------- form ---------- */
function bindForm() {
  const form = $("#form"), F = { name: ["#f-name", "e-name", "e_name"], phone: ["#f-phone", "e-phone", "e_phone"], email: ["#f-email", "e-email", "e_email"] };
  const setErr = (input, id, key) => {
    const e = $("#" + id);
    if (key) { e.textContent = t[key]; e.hidden = false; input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", id); }
    else { e.hidden = true; input.removeAttribute("aria-invalid"); input.removeAttribute("aria-describedby"); }
  };
  const utm = () => { const o = {}; ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(k => { const v = QS.get(k); if (v) o[k] = v.slice(0, 100); }); return o; };
  $("#f-format").addEventListener("change", e => { fmt = e.target.value; });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const n = $("#f-name"), p = $("#f-phone"), m = $("#f-email"), btn = $('button[type="submit"]', form), label = $("span", btn), se = $("#send-err");
    const digits = p.value.replace(/\D/g, "");
    const okN = n.value.trim().length >= 2;
    const okP = /^\+?[\d\s().-]+$/.test(p.value.trim()) && digits.length >= 7 && digits.length <= 15;
    const okM = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim());
    setErr(n, "e-name", okN ? null : "e_name"); setErr(p, "e-phone", okP ? null : "e_phone"); setErr(m, "e-email", okM ? null : "e_email");
    if (!okN) return n.focus(); if (!okP) return p.focus(); if (!okM) return m.focus();
    se.hidden = true;
    const brief = fmt === "" ? null : { fmt: I.L.en.fm[+fmt][0] };
    const lead = { name: n.value.trim(), phone: p.value.trim(), email: m.value.trim(), lang, brief, calc, website: $("#f-web").value, utm: utm(), page: location.pathname, referrer: document.referrer.slice(0, 300) };
    btn.disabled = true; label.textContent = t.sending;
    if (!PREVIEW && D.leads_sheet) try {
      /* no-cors + text/plain: Apps Script takes it without a CORS preflight; the reply is opaque, so only a network error counts as failure */
      await fetch(D.leads_sheet, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(lead) });
    } catch (err) { btn.disabled = false; label.textContent = t.f_btn; se.textContent = t.e_send; se.hidden = false; return; }
    btn.disabled = false; label.textContent = t.f_btn;
    form.hidden = true; $("#done").hidden = false; $("#done-msg").textContent = t.ok.replace("{n}", lead.name); $("#done-h").focus({ preventScroll: true });
  });
  Object.values(F).forEach(([s, id]) => $(s).addEventListener("input", e => { if (e.target.getAttribute("aria-invalid")) setErr(e.target, id, null); }));
  $("#again").addEventListener("click", () => { form.reset(); calc = null; fmt = ""; extra(); $("#done").hidden = true; form.hidden = false; $("#f-name").focus(); });
}

/* ---------- clicks: language, format choice, film player ---------- */
const player = $("#player"), video = $("#pl-video");
function play(client) {
  const c = CASE[client]; if (!c) return;
  video.poster = `${ROOT}media/${c.video}.jpg`; video.src = `${ROOT}media/${small() ? "m/" : ""}${c.video}.mp4`;
  $("#pl-more").href = `work/${c.video}/`;
  $("#pl-cat").textContent = `${t.cat[client]} · ${c.dur}`; $("#pl-title").textContent = client;
  const tx = c.t[lang] || c.t.en;
  $("#pl-dl").innerHTML = `<dt class="mono">${esc(t.l_task)}</dt><dd>${esc(tx[0])}</dd><dt class="mono">${esc(t.l_concept)}</dt><dd>${esc(tx[1])}</dd>`;
  player.showModal(); video.play().catch(() => {});
}
function stop() { video.pause(); video.removeAttribute("src"); video.load(); }
player.addEventListener("close", stop);
player.addEventListener("click", e => { if (e.target === player) player.close(); });
$("#pl-x").addEventListener("click", () => player.close());
$("#pl-cta").addEventListener("click", () => player.close());
document.addEventListener("click", e => {
  /* the language links are real links; the choice is kept so the home page does not send the visitor back */
  const l = e.target.closest("[data-lang]"); if (l) { store.set("abm-lang", l.dataset.lang); return; }
  /* a film link opens the player here; with a modifier key or without scripts it opens the film's page */
  const p = e.target.closest("[data-play]"); if (p && !(e.ctrlKey || e.metaKey || e.shiftKey)) { e.preventDefault(); return play(p.dataset.play); }
  const f = e.target.closest("[data-format]"); if (f) { fmt = f.dataset.format; $("#f-format").value = fmt; }
});

/* ---------- offer bar: always on show; the countdown starts over when it runs out ---------- */
(function () {
  const bar = $("#bar"), tm = $("#timer"), total = D.offer_minutes * 60;
  let start = +store.get("abm-offer", true); if (!start) { start = Date.now(); store.set("abm-offer", String(start), true); }
  bar.hidden = false; document.body.classList.add("has-bar");
  const step = () => {
    let left = total - Math.floor((Date.now() - start) / 1000);
    if (left <= 0) { start = Date.now(); store.set("abm-offer", String(start), true); left = total; }
    tm.textContent = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");
    setTimeout(step, 1000);
  };
  step();
})();

/* ---------- start ---------- */
render();
/* the logo shapes are drawn with Unbounded, so the particles wait for that font (2 s at most) */
const face = window.FontFace ? new FontFace("Unbounded", 'url("' + ROOT + 'static/fonts/unbounded-latin.woff2")', { weight: "200 900" }).load().then(f => document.fonts.add(f)) : Promise.resolve();
Promise.race([face, new Promise(r => setTimeout(r, 2000))]).catch(() => {}).then(() => {
  try { particles = window.ABM_Particles($("#stage")); } catch (e) { particles = null; }
  window.ABM_P = particles;
  rail(); active = -1; onScroll();
  setTimeout(() => { $("#loader").classList.add("done"); document.body.classList.add("ready"); }, 500);
});
})();
