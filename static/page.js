/* AB Media v3: the page markup as plain strings. No DOM here, so the same code runs in the browser
   (app.js) and in build.js, which writes the ready HTML of every language into the pages. */
(function () {
"use strict";
const I = window.ABM_I18N, V = window.ABM_V3, D = window.ABM_DATA;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mark = s => esc(s).replace(/\*(.+?)\*/g, "<b>$1</b>");
const CASE = {}; I.CASES.forEach(c => CASE[c.client] = c);
const dir = l => l === "en" ? "" : l + "/";

/* lang: en | es | ru | ar; root: path from the page to the site root ("" or "../") */
function make(lang, root) {
  root = root || "";
  const t = Object.assign({}, I.L[lang], V[lang]), c = D.contacts;
  const arrow = `<i class="ar" aria-hidden="true">${lang === "ar" ? "←" : "→"}</i>`;
  const pic = (name, alt, w, h) => `<picture><source type="image/avif" srcset="${root}media/${name}.avif"><source type="image/webp" srcset="${root}media/${name}.webp"><img src="${root}media/${name}.jpg" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"></picture>`;
  const cta = `<a class="btn btn-acc" href="#request">${esc(t.cta)} ${arrow}</a>`;
  const list = (items, cls) => `<ul class="${cls}">${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const nn = i => String(i + 1).padStart(2, "0");
  let count = 0;
  /* the page follows the golden circle: Why (0), then How (1), then What (2); the last three sections are the action */
  const CH = { hero: 0, problems: 0, diff: 0, calc: 0, fix: 1, how: 1, why: 1, work: 2, formats: 2 };
  /* top: the first section; its small label is the page's h1 (it names the service), the big line is a paragraph */
  function sec(id, shape, side, eb, h, body, wide, top) {
    count++;
    const ch = id in CH ? `<b class="ch">${esc(t.ch[CH[id]])}</b>` : "";
    return `<section class="s s-${id}" id="${id}" data-shape="${shape}" data-side="${side}" data-eb="${esc(eb)}">
<div class="wrap"><div class="head"><div class="head-t">
<div class="eb rv"><span>${nn(count - 1)}</span><i></i>${ch}${top ? `<h1>${esc(eb)}</h1>` : `<span>${esc(eb)}</span>`}</div>
<${top ? "p" : "h2"} class="h rv">${mark(h)}</${top ? "p" : "h2"}>${body || ""}</div></div>${wide ? `<div class="wide">${wide}</div>` : ""}</div></section>`;
  }

  const f = CASE[D.featured];
  const hero = sec("hero", "logo", "right", t.eb_hero, t.h_hero, `
<p class="lead rv">${esc(t.hero_sub)}</p>
<div class="cta-row rv">${cta}<a class="btn btn-line" href="#work">${esc(t.cta2)}</a></div>
<p class="badge rv"><span class="rec"></span>${esc(t.badge)}</p>
<a class="chip rv" href="work/${f.video}/" data-play="${esc(f.client)}"><span class="chip-p" aria-hidden="true">▶</span><span><small>${esc(t.now)}</small>${esc(f.client)} · ${f.dur}</span></a>
<ol class="gc rv">${t.gc.map((x, i) => `<li><a href="${["#problems", "#fix", "#work"][i]}"><b class="mono">${esc(t.ch[i])}</b><span>${esc(x)}</span></a></li>`).join("")}</ol>`, "", true);

  const diff = sec("diff", "chart", "right", t.d_eb, t.h_diff, `<p class="lead rv">${esc(t.diff_p)}</p>`, `
<div class="cmp">
<article class="card rv"><p class="mono tag">${esc(t.ad_tag)}</p><h3>${esc(t.d_ad)}</h3>${list(t.ad_pts, "ul-x")}</article>
<article class="card card-acc rv"><p class="mono tag acc">${esc(t.film_tag)}</p><h3>${esc(t.d_film)}</h3>${list(t.film_pts, "ul-v")}</article>
</div>`);

  const calcS = sec("calc", "funnel", "left", t.calc_h, t.h_calc, `
<p class="lead rv">${esc(t.calc_p)}</p>
<div class="calc rv">
<div class="calc-top"><label class="mono" for="reach">${esc(t.c_reach)}</label><output id="reach-o" for="reach"></output></div>
<input type="range" id="reach" min="${D.cjm.reach_min}" max="${D.cjm.reach_max}" step="10000" value="${D.cjm.reach_default}">
<div class="calc-t">
<div class="calc-r calc-hd mono"><span></span><span>${esc(t.j_modes[0])}</span><span class="acc">${esc(t.j_modes[1])}</span></div>
${[1, 2, 3].map(i => `<div class="calc-r"><span class="mono">${esc(t.j_stages[i])}</span><span id="n${i}"></span><span class="acc" id="f${i}"></span></div>`).join("")}
</div>
<p class="sum" id="sum"></p>
<p class="note">${esc(t.j_note)}</p>
<a class="btn btn-acc" href="#request" id="calc-cta">${esc(t.c_cta)} ${arrow}</a>
</div>`);

  const prob = sec("problems", "cross", "left", t.pr_eb, t.h_prob, "", `
<div class="grid3">${t.fixes.map(x => `<article class="card pain rv"><span class="pain-x" aria-hidden="true">×</span><h3>${esc(x[0])}</h3></article>`).join("")}</div>`);

  const fix = sec("fix", "check", "right", t.f_eb, t.h_fix, "", `
<div class="fx-t">
<div class="fx fx-hd mono"><span></span><span>${esc(t.others)}</span><span class="acc">${esc(t.j_ours)}</span></div>
${t.fixes.map((x, i) => `<div class="fx rv"><span class="mono">${nn(i)}</span><s>${esc(x[0])}</s><b>${esc(x[1])}</b></div>`).join("")}
</div>
<div class="cta-row rv">${cta}</div>`);

  const how = sec("how", "clapper", "left", t.how_eb, t.h_how, `
<ol class="rows">${t.steps.map((x, i) => `<li class="rv"><span class="mono">${nn(i)}</span><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div></li>`).join("")}</ol>
<div class="cta-row rv">${cta}</div>`);

  /* each film is a link to its own page; with scripts on, a click opens the player instead */
  const names = D.order.map(n => `<span>${esc(n)}</span>`).join("");
  const work = sec("work", "play", "left", t.cs_eb, t.h_work, "", `
<p class="mono tr-eb rv">${esc(t.tr_eb)}</p>
<div class="marq rv" aria-hidden="true"><div>${names}${names}</div></div>
<div class="films">${D.order.map(n => { const k = CASE[n]; return `<a class="film rv" href="work/${k.video}/" data-play="${esc(n)}">${pic(k.video, t.alt_still.replace("{c}", n), 1280, 714)}<span class="film-p" aria-hidden="true">▶</span><span class="film-m"><b>${esc(n)}</b><small class="mono">${esc(t.cat[n])} · ${k.dur}</small></span></a>`; }).join("")}</div>
<div class="cta-row rv">${cta}</div>`);

  const why = sec("why", "camera", "right", t.why_eb, t.h_why, `
<figure class="person rv">${pic("portrait", t.alt_p, 1024, 1024)}<figcaption><b>${esc(t.name)}</b><small>${esc(t.role)}</small></figcaption></figure>
<ul class="rows rows-s">${t.why.map((x, i) => `<li class="rv"><span class="mono">${nn(i)}</span><div><b>${esc(x)}</b></div></li>`).join("")}</ul>`);

  const formats = sec("formats", "strip", "right", t.fmt_eb, t.h_fmt, "", `
<div class="grid3 fmts">${t.fm.map((x, i) => `<article class="card fmt rv${i === 2 ? " card-acc" : ""}">
${i === 2 ? `<p class="mono tag acc">${esc(t.fmt_tag)}</p>` : `<p class="mono tag">${nn(i)}</p>`}
<h3>${esc(x[0])}</h3><p class="fmt-d">${esc(t.fmt_d[i])}</p>
${list(D.formats[i].map(k => t.sc[k]), "ul-v")}
<p class="mono fmt-price">${esc(t.fmt_price)}</p>
<a class="btn ${i === 2 ? "btn-acc" : "btn-line"}" href="#request" data-format="${i}">${esc(t.pick)} ${arrow}</a></article>`).join("")}</div>`);

  const faq = sec("faq", "question", "left", t.faq_eb, t.h_faq, `
<div class="faq">${t.faq.map((x, i) => `<details class="rv"${i ? "" : " open"}><summary><span>${esc(x[0])}</span><i aria-hidden="true">+</i></summary><p>${esc(x[1])}</p></details>`).join("")}</div>`);

  const request = sec("request", "plane", "right", t.rq_eb, t.h_rq, `
<p class="lead rv">${esc(t.rq_p)}</p>
<p class="badge rv"><span class="rec"></span>${esc(D.bonus[lang])}</p>
<form class="form rv" id="form" novalidate>
<p class="extra" id="extra" hidden></p>
<label class="fl"><span class="mono">${esc(t.f_name)}</span><input id="f-name" name="name" autocomplete="name" required></label><p class="err" id="e-name" hidden></p>
<label class="fl"><span class="mono">${esc(t.f_phone)}</span><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required></label><p class="err" id="e-phone" hidden></p>
<label class="fl"><span class="mono">${esc(t.f_email)}</span><input id="f-email" name="email" type="email" autocomplete="email" dir="ltr" required></label><p class="err" id="e-email" hidden></p>
<label class="fl"><span class="mono">${esc(t.f_format)}</span><select id="f-format" name="format"><option value="">${esc(t.f_none)}</option>${t.fm.map((x, i) => `<option value="${i}">${esc(x[0])}</option>`).join("")}</select></label>
<input class="hp" id="f-web" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<button class="btn btn-acc btn-wide" type="submit"><span>${esc(t.f_btn)}</span> ${arrow}</button>
<p class="err" id="send-err" hidden></p>
<p class="note">${esc(t.privacy)}</p>
</form>
<div class="sent" id="done" hidden><h3 id="done-h" tabindex="-1">${esc(t.done_h)}</h3><p id="done-msg"></p><button class="btn btn-line" type="button" id="again">${esc(t.again)}</button></div>`, `
<p class="mono tr-eb rv">${esc(t.nx_h)}</p>
<ol class="grid3 next">${t.nx.map((x, i) => `<li class="card rv"><span class="mono">${nn(i)}</span><b>${esc(x)}</b></li>`).join("")}</ol>`);

  const links = [
    [t.ct[0], "tel:" + c.phone.replace(/\s/g, ""), c.phone],
    [t.ct[1], c.telegram[lang], "@" + c.telegram[lang].split("/").pop()],
    [t.ct[2], c.instagram[lang], "@" + c.instagram[lang].split("/").filter(Boolean).pop()],
    [t.ct[4], c.youtube, "@" + c.youtube.split("@").pop()]
  ];
  const contact = sec("contact", "wordmark", "center", t.ct_eb, t.h_ct, `
<ul class="links rv">${links.map(l => `<li><span class="mono">${esc(l[0])}</span><a href="${esc(l[1])}"${/^http/.test(l[1]) ? ' target="_blank" rel="noopener me"' : ""} dir="ltr">${esc(l[2])}</a></li>`).join("")}</ul>
<footer class="foot rv"><span>© 2026 AB Media</span><span>${esc(t.foot)}</span></footer>`);

  const href = ["#problems", "#fix", "#work", "#faq"];
  return {
    t,
    /* sections are numbered in the order they appear, not the order they were built */
    html: (() => { let k = 0; return (hero + prob + diff + calcS + fix + how + why + work + formats + faq + request + contact).replace(/(<div class="eb rv"><span>)\d+(<\/span>)/g, (m, x, y) => x + nn(k++) + y); })(),
    nav: t.nav4.map((x, i) => `<a href="${href[i]}">${esc(x)}</a>`).join(""),
    bar: `${esc(t.bar.replace("5", String(D.offer_minutes)))} <b>${esc(D.bonus[lang])}</b>`
  };
}

/* language switch: plain links, so every language has its own address. tail: path below the language folder */
function langs(lang, root, tail) {
  return I.LANGS.map(l => l === lang
    ? `<a href="${root + dir(l) + (tail || "") || "./"}" hreflang="${l}" data-lang="${l}" aria-current="true">${l.toUpperCase()}</a>`
    : `<a href="${root + dir(l) + (tail || "") || "./"}" hreflang="${l}" data-lang="${l}">${l.toUpperCase()}</a>`).join("");
}

window.ABM_PAGE = { make, langs, esc, mark, CASE, dir };
})();
