/* Writes the ready pages:  node build.js
   - index.html, es/, ru/, ar/                 the landing page in each language, text already in the HTML
   - work/<film>/ and <lang>/work/<film>/      one page per film (28)
   - sitemap.xml (with hreflang and video entries), robots.txt, 404.html, llms.txt, site.webmanifest
   The site address is the one line below: after a move to its own domain, change it and run again. */
"use strict";
const SITE = "https://abstartuphouse.com/";

const fs = require("fs"), path = require("path");
const here = (...p) => path.join(__dirname, ...p);
globalThis.window = globalThis;
["data", "i18n", "i18n-v3", "page"].forEach(f => require(here("static", f + ".js")));
const I = window.ABM_I18N, D = window.ABM_DATA, P = window.ABM_PAGE, esc = P.esc, dir = P.dir;
const SEO = JSON.parse(fs.readFileSync(here("seo.json"), "utf8"));
const LANGS = I.LANGS, BASE = new URL(SITE).pathname, TODAY = new Date().toISOString().slice(0, 10);
const LOCALE = { en: "en_US", es: "es_ES", ru: "ru_RU", ar: "ar_AR" };
const PHONE = D.contacts.phone.replace(/\s/g, "");
const SAME = [...Object.values(D.contacts.telegram), ...Object.values(D.contacts.instagram), D.contacts.youtube];
const FILMS = D.order.map(n => P.CASE[n]);
const VER = String(Date.now()).slice(0, -3);   /* added to script and style addresses so an update is not served from cache */

const T = l => Object.assign({}, I.L[l], window.ABM_V3[l]);
const write = (rel, text) => { const f = here(rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const secs = d => d.split(":").reduce((a, x) => a * 60 + +x, 0);
const ORG = { "@type": "Organization", "@id": SITE + "#org", name: "AB Media", url: SITE };

/* ---------- shared pieces ---------- */
function head(o) {
  /* o: lang, root, tail (path below the language folder), title, desc, image, type, extra, ld[] */
  const url = l => SITE + dir(l) + o.tail;
  return `<!doctype html>
<html lang="${o.lang}" dir="${o.lang === "ar" ? "rtl" : "ltr"}" data-root="${o.root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${url(o.lang)}">
${LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${url("en")}">
<meta property="og:type" content="${o.type || "website"}">
<meta property="og:site_name" content="AB Media">
<meta property="og:url" content="${url(o.lang)}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:image" content="${SITE}media/${o.image}">
<meta property="og:image:width" content="${o.iw || 1200}">
<meta property="og:image:height" content="${o.ih || 630}">
<meta property="og:locale" content="${LOCALE[o.lang]}">
${LANGS.filter(l => l !== o.lang).map(l => `<meta property="og:locale:alternate" content="${LOCALE[l]}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${SITE}media/${o.image}">${o.extra || ""}
<meta name="theme-color" content="#0B0D0F">
<link rel="icon" type="image/png" href="${o.root}media/logo.png">
<link rel="apple-touch-icon" href="${o.root}media/logo.png">
<link rel="manifest" href="${o.root}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@300;400;500;700${o.lang === "ar" ? "&family=IBM+Plex+Sans+Arabic:wght@300;400;700" : ""}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${o.root}static/style.css?v=${VER}">
${o.ld.map(ld).join("\n")}
`;
}
const top = (lang, root, tail, home, nav) => `<header class="top${home ? "" : " stuck"}" id="top">
  <a class="brand" href="${home ? "#hero" : root + dir(lang) || "./"}" aria-label="AB Media"><span class="rec"></span><span>AB MEDIA</span></a>
  <nav class="nav" id="nav" aria-label="Main">${nav}</nav>
  <div class="top-r">
    <div class="langs" id="langs" role="group" aria-label="${esc(T(lang).lang_l)}">${P.langs(lang, root, tail)}</div>
    <a class="btn btn-acc btn-s" href="${home ? "" : root + dir(lang)}#request" id="top-cta">${esc(T(lang).cta)}</a>
  </div>
</header>`;

/* ---------- landing page ---------- */
function home(lang) {
  const root = lang === "en" ? "" : "../", pg = P.make(lang, root), t = pg.t, s = SEO.home[lang], url = SITE + dir(lang);
  const graph = { "@context": "https://schema.org", "@graph": [
    Object.assign({}, ORG, {
      description: SEO.home.en.desc, telephone: PHONE, sameAs: SAME, knowsLanguage: LANGS,
      logo: { "@type": "ImageObject", url: SITE + "media/logo.png", width: 512, height: 512 }, image: SITE + "media/og.jpg",
      founder: { "@type": "Person", "@id": SITE + "#founder", name: I.L.en.name, jobTitle: "Founder, director and producer", image: SITE + "media/portrait.jpg", worksFor: { "@id": SITE + "#org" }, sameAs: SAME },
      contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: PHONE, availableLanguage: ["English", "Spanish", "Russian", "Arabic"] },
      hasOfferCatalog: { "@type": "OfferCatalog", name: T("en").fmt_eb, itemListElement: I.L.en.fm.map(x => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: x[0], serviceType: "Video production", provider: { "@id": SITE + "#org" } } })) }
    }),
    { "@type": "WebSite", "@id": SITE + "#site", url: SITE, name: "AB Media", inLanguage: LANGS, publisher: { "@id": SITE + "#org" } },
    { "@type": "WebPage", "@id": url + "#page", url, name: s.title, description: s.desc, inLanguage: lang, isPartOf: { "@id": SITE + "#site" }, about: { "@id": SITE + "#org" }, primaryImageOfPage: SITE + "media/og.jpg", dateModified: TODAY },
    { "@type": "ItemList", name: t.h_work.replace(/\*/g, ""), numberOfItems: FILMS.length, itemListElement: FILMS.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.client, url: url + "work/" + k.video + "/" })) },
    { "@type": "FAQPage", "@id": url + "#faq", inLanguage: lang, mainEntity: t.faq.map(x => ({ "@type": "Question", name: x[0], acceptedAnswer: { "@type": "Answer", text: x[1] } })) }
  ] };
  /* the home page sends a visitor to their language once: ?lang=, then the saved choice, then the browser language.
     Search robots have none of these, so they always get the page they asked for. */
  const redirect = lang !== "en" ? "" : `<script>(function(){try{var q=new URLSearchParams(location.search),l=q.get("lang"),s=null;try{s=localStorage.getItem("abm-lang")}catch(e){}if(l==="en"){try{localStorage.setItem("abm-lang","en")}catch(e){}return}l=l||s||(navigator.language||"").slice(0,2).toLowerCase();if(["es","ru","ar"].indexOf(l)>-1){q.delete("lang");var r=q.toString();location.replace(l+"/"+(r?"?"+r:"")+location.hash)}}catch(e){}})();</script>\n`;
  return head({ lang, root, tail: "", title: s.title, desc: s.desc, image: "og.jpg", ld: [graph],
    extra: `\n<link rel="preload" as="font" type="font/woff2" href="${root}static/fonts/unbounded-latin.woff2" crossorigin>` }) + redirect +
`<noscript><style>.rv{opacity:1;transform:none}.loader,.stage{display:none}</style></noscript>
</head>
<body>
<div class="loader" id="loader" aria-hidden="true">
  <div class="loader-in"><span class="rec"></span><span class="loader-name">AB MEDIA</span><span class="loader-bar"><i></i></span></div>
</div>

<canvas class="stage" id="stage" aria-hidden="true"></canvas>

<div class="bar" id="bar" hidden><span id="bar-t"></span><b class="timer" id="timer" aria-hidden="true"></b></div>

${top(lang, root, "", true, pg.nav)}

<nav class="rail" id="rail" aria-label="Sections"></nav>
<div class="prog" aria-hidden="true"><i id="prog"></i></div>

<main id="app">${pg.html}</main>

<a class="float-cta btn btn-acc" href="#request" id="float-cta" hidden>${esc(t.cta)}</a>

<dialog class="player" id="player" aria-labelledby="pl-title">
  <button class="pl-x" id="pl-x" type="button" aria-label="${esc(t.close)}">×</button>
  <video id="pl-video" controls playsinline preload="none"></video>
  <div class="pl-info">
    <p class="mono" id="pl-cat"></p>
    <h3 id="pl-title"></h3>
    <dl id="pl-dl"></dl>
    <a class="btn btn-acc" href="#request" id="pl-cta">${esc(t.cta)}</a>
    <a class="btn btn-line" href="work/" id="pl-more">${esc(t.open_case)}</a>
  </div>
</dialog>

${["data", "i18n", "i18n-v3", "page", "particles", "app"].map(f => `<script src="${root}static/${f}.js?v=${VER}" defer></script>`).join("\n")}
</body>
</html>
`;
}

/* ---------- film page ---------- */
function film(lang, k) {
  const root = lang === "en" ? "../../" : "../../../", back = "../../", tail = `work/${k.video}/`;
  const t = Object.assign({}, I.L[lang], window.ABM_V3[lang]), s = SEO.work[k.video][lang], tx = k.t[lang] || k.t.en;
  const url = SITE + dir(lang) + tail, homeUrl = SITE + dir(lang), media = SITE + "media/" + k.video;
  const who = id => (I.P[id] && (I.P[id][lang] || I.P[id].en)) || id;
  const credits = k.credits.map(([r, ids]) => [r === "r_amb" && ids.length > 1 ? t.r_ambs : t[r], ids.map(who).join(", ")]);
  const arrow = `<i class="ar" aria-hidden="true">${lang === "ar" ? "←" : "→"}</i>`;
  const video = { "@context": "https://schema.org", "@type": "VideoObject", "@id": url + "#video", name: s.name, description: tx[1] + " " + tx[0],
    thumbnailUrl: [media + ".jpg", media + ".webp"], uploadDate: s.upload, duration: s.duration, contentUrl: media + ".mp4", embedUrl: url,
    creator: ORG, productionCompany: { "@type": "Organization", name: k.exec }, publisher: ORG,
    director: { "@type": "Person", name: who("AB") }, mainEntityOfPage: url };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "AB Media", item: homeUrl },
    { "@type": "ListItem", position: 2, name: t.nav3[0], item: homeUrl + "#work" },
    { "@type": "ListItem", position: 3, name: k.client, item: url }] };
  const others = FILMS.filter(x => x !== k);
  return head({ lang, root, tail, title: s.title, desc: s.desc, image: k.video + ".jpg", iw: 1280, ih: 714, type: "video.other", ld: [video, crumbs],
    extra: `\n<meta property="og:video" content="${media}.mp4">\n<meta property="og:video:type" content="video/mp4">\n<meta property="og:video:width" content="1920">\n<meta property="og:video:height" content="1080">` }) +
`</head>
<body class="ready">
${top(lang, root, tail, false, `<a href="${back}#work">${esc(t.nav3[0])}</a><a href="${back}#how">${esc(t.nav3[1])}</a><a href="${back}#formats">${esc(t.nav3[2])}</a><a href="${back}#faq">${esc(t.nav3[3])}</a>`)}
<main class="fp"><div class="wrap">
<nav class="crumbs mono" aria-label="Breadcrumb"><a href="${back}">AB Media</a><span aria-hidden="true">/</span><a href="${back}#work">${esc(t.nav3[0])}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(k.client)}</span></nav>
<p class="eb"><span>${esc(t.cat[k.client])}</span><i></i><span>${k.dur}</span></p>
<h1 class="h"><b>${esc(k.client)}</b></h1>
<p class="fp-kind">${esc(s.kind)} · ${esc(t.l_exec)}: ${esc(k.exec)}</p>
<video controls playsinline preload="metadata" poster="${root}media/${k.video}.jpg" width="1920" height="1080">
<source src="${root}media/m/${k.video}.mp4" type="video/mp4" media="(max-width: 899px)">
<source src="${root}media/${k.video}.mp4" type="video/mp4">
</video>
<div class="fp-grid">
<article class="card"><h2>${esc(t.l_concept)}</h2><p class="big">${esc(tx[1])}</p><h2>${esc(t.l_task)}</h2><p>${esc(tx[0])}</p></article>
<aside class="card"><h2>${esc(t.l_scope)}</h2><ul class="ul-v">${k.scope.map(x => `<li>${esc(t.sc[x])}</li>`).join("")}</ul><h2>${esc(t.l_team)}</h2><dl>${credits.map(c => `<div><dt>${esc(c[0])}</dt><dd>${esc(c[1])}</dd></div>`).join("")}</dl></aside>
</div>
<section class="fp-cta"><h2>${P.mark(t.h_rq)}</h2><p>${esc(t.rq_p)}</p><a class="btn btn-acc" href="${back}#request">${esc(t.cta)} ${arrow}</a></section>
<h2 class="fp-more">${P.mark(t.h_work)}</h2>
<div class="films">${others.map(o => `<a class="film" href="../${o.video}/"><picture><source type="image/avif" srcset="${root}media/${o.video}.avif"><source type="image/webp" srcset="${root}media/${o.video}.webp"><img src="${root}media/${o.video}.jpg" alt="${esc(t.alt_still.replace("{c}", o.client))}" width="1280" height="714" loading="lazy" decoding="async"></picture><span class="film-p" aria-hidden="true">▶</span><span class="film-m"><b>${esc(o.client)}</b><small class="mono">${esc(t.cat[o.client])} · ${o.dur}</small></span></a>`).join("")}</div>
<footer class="foot"><span>© 2026 AB Media · <a href="tel:${PHONE}" dir="ltr">${esc(D.contacts.phone)}</a></span><span>${esc(t.foot)}</span></footer>
</div></main>
<script>document.addEventListener("click",function(e){var l=e.target.closest("[data-lang]");if(l)try{localStorage.setItem("abm-lang",l.dataset.lang)}catch(x){}});</script>
</body>
</html>
`;
}

/* ---------- write everything ---------- */
const urls = [];
LANGS.forEach(l => { write(dir(l) + "index.html", home(l)); });
urls.push({ tail: "" });
FILMS.forEach(k => { LANGS.forEach(l => write(`${dir(l)}work/${k.video}/index.html`, film(l, k))); urls.push({ tail: `work/${k.video}/`, k }); });

const xml = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => LANGS.map(l => { const s = u.k && SEO.work[u.k.video][l], tx = u.k && (u.k.t[l] || u.k.t.en); return `  <url>
    <loc>${SITE + dir(l) + u.tail}</loc>
${LANGS.map(a => `    <xhtml:link rel="alternate" hreflang="${a}" href="${SITE + dir(a) + u.tail}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE + u.tail}"/>
    <lastmod>${TODAY}</lastmod>${u.k ? `
    <video:video>
      <video:thumbnail_loc>${SITE}media/${u.k.video}.jpg</video:thumbnail_loc>
      <video:title>${xml(s.name)}</video:title>
      <video:description>${xml(tx[1] + " " + tx[0])}</video:description>
      <video:content_loc>${SITE}media/${u.k.video}.mp4</video:content_loc>
      <video:duration>${secs(u.k.dur)}</video:duration>
      <video:publication_date>${s.upload}</video:publication_date>
    </video:video>` : `
    <image:image><image:loc>${SITE}media/og.jpg</image:loc></image:image>
    <image:image><image:loc>${SITE}media/portrait.jpg</image:loc></image:image>`}
  </url>`; }).join("\n")).join("\n")}
</urlset>
`);

/* read by robots only when the site is at the root of its own host (its own domain); harmless before that */
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

write("site.webmanifest", JSON.stringify({ name: "AB Media", short_name: "AB Media", start_url: BASE, display: "browser", background_color: "#0B0D0F", theme_color: "#0B0D0F", icons: [{ src: BASE + "media/logo.png", sizes: "512x512", type: "image/png" }] }, null, 1));

write("llms.txt", `# AB Media

> ${SEO.home.en.desc}

AB Media is a video production studio led by director and producer ${I.L.en.name}. Phone: ${D.contacts.phone}. Languages: English, Spanish, Russian, Arabic.

## Pages
${LANGS.map(l => `- [${SEO.home[l].title}](${SITE + dir(l)})`).join("\n")}

## Films
${FILMS.map(k => `- [${SEO.work[k.video].en.name}](${SITE}work/${k.video}/): ${k.t.en[1]}`).join("\n")}

## Questions
${I.L.en.faq.map(x => `- ${x[0]} ${x[1]}`).join("\n")}
`);

write("404.html", `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — AB Media</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="${BASE}media/logo.png">
<link rel="stylesheet" href="${BASE}static/style.css?v=${VER}">
</head>
<body class="ready">
<main class="fp"><div class="wrap">
<p class="eb"><span>404</span><i></i><span>AB Media</span></p>
<h1 class="h">This page <b>is not here.</b></h1>
<p class="fp-kind">The address may have changed. The films and the request form are on the home page.</p>
<p><a class="btn btn-acc" href="${BASE}">Home</a></p>
<p class="crumbs mono" style="margin-top:34px">${LANGS.map(l => `<a href="${BASE + dir(l)}" hreflang="${l}">${l.toUpperCase()}</a>`).join("")}</p>
</div></main>
</body>
</html>
`);

console.log(`built ${LANGS.length} landing pages, ${FILMS.length * LANGS.length} film pages, sitemap with ${urls.length * LANGS.length} addresses → ${SITE}`);
