
/* =====================================================================
   5. UI KOMPONENTLAR (ikonka, modal, tasdiq, toast, diagramma, mavzu, fayl)
   ===================================================================== */
const ICONS = {
  home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
  check: "M9 3h6v3H9zM8 4.5H5.5V21h13V4.5H16M9 13.5l2 2 4-4.5",
  check2: "M5 12.5l4.5 4.5L19.5 7",
  key: "M14.5 9.5a4 4 0 1 0-3.9 4.9L9 16v2H7v2H4v-3l6.1-6.1A4 4 0 0 0 14.5 9.5zM16 7.5h.01",
  wallet: "M4 7.5h15a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5A2.5 2.5 0 0 1 5.5 4H17v3.5M16.5 14h.01",
  alert: "M12 3.5 2.5 20h19zM12 10v4.5M12 17.5h.01",
  grid: "M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z",
  users: "M15.5 20v-1.5a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4V20M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21.5 20v-1.5a4 4 0 0 0-3-3.85M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21v-1a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v1",
  layers: "M12 3 2.5 8 12 13l9.5-5zM2.5 12.5 12 17.5l9.5-5",
  message: "M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5",
  chart: "M4 20V11M10 20V5M16 20v-7M2.5 20h19",
  db: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z",
  download: "M12 3.5v12M7 10.5l5 5 5-5M4 20.5h16",
  upload: "M12 20.5v-12M7 13.5l5-5 5 5M4 3.5h16",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4.5L19.5 9 15 4.5 4 15.5zM13 6.5l4.5 4.5",
  trash: "M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13M10 11v5M14 11v5",
  copy: "M9 9h11v11H9zM15 9V4H4v11h5",
  send: "M21.5 2.5 10.5 13.5M21.5 2.5l-7 19-4-8-8-4z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20.5 20.5 16 16",
  chevL: "M15 18l-6-6 6-6",
  chevR: "M9 6l6 6-6 6",
  x: "M6 6l12 12M18 6 6 18",
  file: "M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6",
  funnel: "M3 4.5h18l-7 8.5v6l-4 2v-8z",
  calendar: "M4 6h16v15H4zM4 10.5h16M8.5 3v5M15.5 3v5",
  teacher: "M3 7l9-4 9 4-9 4zM7 9v5c0 1.7 2.2 3 5 3s5-1.3 5-3V9M21 7v6",
  cash: "M3 6.5h18v11H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6.5 9.5v.01M17.5 14.5v.01",
  sliders: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4",
  lock: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  cloud: "M7 18.5a5 5 0 1 1 .9-9.9A6 6 0 0 1 19.5 10a4.3 4.3 0 0 1-.5 8.5z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3",
  arrowR: "M5 12h14M13 6l6 6-6 6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  gift: "M4 10h16v11H4zM2.5 6.5h19V10h-19zM12 6.5V21M12 6.5c-1-3-5-3-5-.5 0 .5 1 .5 5 .5zM12 6.5c1-3 5-3 5-.5 0 .5-1 .5-5 .5z",
};
const icon = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n] || ICONS.grid}"/></svg>`;

const Modal = {
  ochiq: null, _res: null, profilId: "",
  och(html, { keng = false } = {}) {
    this.yop();
    const w = document.createElement("div");
    w.className = "modal";
    w.innerHTML = `<div class="modal-fon" data-act="modal-yop"></div><div class="sheet" role="dialog" aria-modal="true" ${keng ? 'style="max-width:720px"' : ""}>${html}</div>`;
    document.body.appendChild(w);
    document.body.classList.add("modal-open");
    this.ochiq = w;
    requestAnimationFrame(() => { w.classList.add("korin"); const f = w.querySelector("[autofocus]"); if (f) f.focus(); });
    return w;
  },
  yop() {
    if (!this.ochiq) return;
    this.ochiq.remove(); this.ochiq = null; this.profilId = "";
    document.body.classList.remove("modal-open");
    if (this._res) { const r = this._res; this._res = null; r(false); }
  },
};
function tasdiq(matn, { tugma = "Ha", xavfli = false, sarlavha = "Tasdiqlang" } = {}) {
  return new Promise(res => {
    Modal.och(`<h2 class="sheet-h">${esc(sarlavha)}</h2><p class="sheet-p">${matn}</p>
      <div class="sheet-actions"><button class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button>
      <button class="btn ${xavfli ? "btn-danger" : "btn-primary"}" data-act="tasdiq-ha" autofocus>${esc(tugma)}</button></div>`);
    Modal._res = res;
  });
}
let toastVaqt;
function toast(matn, tur = "ok") {
  const el = $("#toast"); if (!el) return;
  el.innerHTML = `<div class="toast">${icon(tur === "ok" ? "check2" : "alert", 18)}<span>${esc(matn)}</span></div>`;
  clearTimeout(toastVaqt);
  toastVaqt = setTimeout(() => { el.innerHTML = ""; }, 2800);
}
function xatoKorsat(sel, matn) { const el = $(sel); if (el) { el.textContent = matn; el.hidden = false; } return false; }

// Ustunli diagramma: items [{kalit, yorliq, qiymat, fon?}]
function diagramma(items, { tanlangan = "", balandlik = 170, nom = "Diagramma" } = {}) {
  const max = yaxshiMax(Math.max(1, ...items.map(i => Math.max(i.qiymat, i.fon || 0))));
  const chiziqlar = [1, 0.5, 0].map(k => `<div class="d-chiziq" style="bottom:${k * 100}%"><span>${qisqaPul(max * k)}</span></div>`).join("");
  const ustunlar = items.map(i => {
    const tan = i.kalit === tanlangan;
    return `<div class="d-ustun ${tan ? "tanlangan" : ""}"><div class="d-joy">
      ${i.fon ? `<div class="d-fon" style="height:${(i.fon / max) * 100}%"></div>` : ""}
      <div class="d-bar" style="height:${(Math.max(0, i.qiymat) / max) * 100}%">${tan ? `<span class="d-teg">${qisqaPul(i.qiymat)}</span>` : ""}</div>
    </div></div>`;
  }).join("");
  const yorliqlar = items.map(i => `<div class="d-yorliq ${i.kalit === tanlangan ? "tanlangan" : ""}">${esc(i.yorliq)}</div>`).join("");
  const tavsif = items.map(i => `${i.yorliq}: ${pul(i.qiymat, " ")}`).join(", ");
  return `<div class="diagramma" style="--n:${items.length}" role="img" aria-label="${esc(nom)}. ${esc(tavsif)}">
    <div class="d-ich" style="height:${balandlik}px">${chiziqlar}<div class="d-ustunlar">${ustunlar}</div></div>
    <div class="d-yorliqlar">${yorliqlar}</div></div>`;
}
// Juft ustunli diagramma: items [{kalit, yorliq, a, b}]
function juftDiagramma(items, { tanlangan = "", balandlik = 170, nom = "" } = {}) {
  const max = yaxshiMax(Math.max(1, ...items.map(i => Math.max(i.a, i.b))));
  const chiziqlar = [1, 0.5, 0].map(k => `<div class="d-chiziq" style="bottom:${k * 100}%"><span>${qisqaPul(max * k)}</span></div>`).join("");
  const ustunlar = items.map(i => `<div class="d-ustun"><div class="d-joy"><div class="d-juft">
      <div class="a" style="height:${(i.a / max) * 100}%"></div><div class="b" style="height:${(i.b / max) * 100}%"></div></div></div></div>`).join("");
  const yorliqlar = items.map(i => `<div class="d-yorliq ${i.kalit === tanlangan ? "tanlangan" : ""}">${esc(i.yorliq)}</div>`).join("");
  const tavsif = items.map(i => `${i.yorliq}: ${pul(i.a, " ")} / ${pul(i.b, " ")}`).join(", ");
  return `<div class="diagramma" style="--n:${items.length}" role="img" aria-label="${esc(nom)}. ${esc(tavsif)}">
    <div class="d-ich" style="height:${balandlik}px;margin-top:14px">${chiziqlar}<div class="d-ustunlar">${ustunlar}</div></div>
    <div class="d-yorliqlar">${yorliqlar}</div></div>`;
}
const progress = (foiz, cls = "") => `<div class="progress ${cls}"><div style="width:${Math.max(0, Math.min(100, foiz || 0))}%"></div></div>`;

const Mavzu = {
  ol() { return Mahalliy.ol("oquv-crm-mavzu", "tizim"); },
  qolla(v) { const r = document.documentElement; if (v === "light" || v === "dark") r.setAttribute("data-theme", v); else r.removeAttribute("data-theme"); },
  qoy(v) { Mahalliy.qoy("oquv-crm-mavzu", v); this.qolla(v); },
  qoronguMi() { const a = document.documentElement.getAttribute("data-theme"); return a ? a === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; },
};

// Fayl berish: Claude sahifasida "downloads" ruxsati, boshqa joyda oddiy yuklab olish
let YUKLASH = null;
try { if (window.claude && window.claude.use) window.claude.use("downloads").then(d => { YUKLASH = d; }, () => {}); } catch (e) {}
async function faylBer(nom, matn, mime) {
  if (YUKLASH) {
    try { await YUKLASH.save({ filename: nom, data: matn }); toast("Fayl saqlandi"); return true; }
    catch (e) {
      if (e && e.code === "declined") { toast("Saqlash bekor qilindi", "warn"); return false; }
      if (e && e.code === "rate_limited") { toast("Biroz kutib, qayta bosing", "warn"); return false; }
      matnOynasi(nom, matn, "Bu yerda faylni yuklab bo‘lmadi."); return true;
    }
  }
  try {
    const url = URL.createObjectURL(new Blob([matn], { type: mime }));
    const a = document.createElement("a");
    a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (e) {}
  matnOynasi(nom, matn);
  return true;
}
function matnOynasi(nom, matn, sabab = "") {
  Modal.och(`<h2 class="sheet-h">Fayl tayyor</h2>
    <p class="sheet-p">${sabab ? esc(sabab) + " " : ""}<b>${esc(nom)}</b> yuklab olinmoqda. Odatda u «Yuklanmalar» (Downloads) papkasiga tushadi.</p>
    <details class="yordam" ${sabab ? "open" : ""}><summary>Fayl yuklanmadimi?</summary>
      <p class="muted sm" style="margin:0">Matnni nusxalab, bloknotga qo‘ying va <b>${esc(nom)}</b> nomi bilan saqlang.</p>
      <label class="vh" for="fayl-matn">Fayl matni</label>
      <textarea id="fayl-matn" class="kod" rows="6" readonly>${esc(matn.replace(/^﻿/, ""))}</textarea>
      <button class="btn btn-soft" data-act="nusxa" data-target="fayl-matn">${icon("copy", 18)} Matnni nusxalash</button>
    </details>
    <div class="sheet-actions"><button class="btn btn-primary" data-act="modal-yop">Tayyor</button></div>`);
}
function nusxala(matn, el) {
  const zaxira = () => {
    if (el && el.select) { el.focus(); el.select(); try { if (document.execCommand("copy")) { toast("Nusxalandi"); return; } } catch (e) {} }
    toast("Matnni belgilab, qo‘lda nusxalang", "warn");
  };
  try { navigator.clipboard.writeText(matn).then(() => toast("Nusxalandi"), zaxira); } catch (e) { zaxira(); }
}
const tgHavola = matn => SOZLAMALAR.telegramHavola + encodeURIComponent(matn);
const shablonTold = (tur, q) => (DB.shablonlar[tur] || "").replace(/\[(\w+)\]/g, (m, k) => (k in q ? q[k] : m));

/* Kichik HTML yordamchilari */
function boshHolat({ ic = "users", sarlavha, matn, tugma = "" }) {
  return `<section class="card bosh-holat"><div class="bh-ic">${icon(ic, 30)}</div><h3>${sarlavha}</h3><p>${matn}</p>${tugma}</section>`;
}
const bolimBosh = (matn, amal = "") => `<div class="b-bosh"><p>${matn}</p><div class="amal-qator">${amal}</div></div>`;
const oyNav = (act, oy) => `<div class="oy-nav card" style="padding:8px">
  <button class="icon-btn tekis" data-act="${act}" data-n="-1" aria-label="Oldingi oy">${icon("chevL")}</button>
  <b>${oyNomi(oy)}</b>
  <button class="icon-btn tekis" data-act="${act}" data-n="1" aria-label="Keyingi oy">${icon("chevR")}</button></div>`;
const tile = (l, v, s = "", ic = "", cls = "", href = "") => {
  const ich = `${ic ? `<span class="tile-ic ${cls}">${icon(ic)}</span>` : ""}<span class="tile-l">${l}</span><span class="tile-v ${cls === "bad" ? "qizil" : ""}">${v}</span>${s ? `<span class="tile-s">${s}</span>` : ""}`;
  return href ? `<a class="tile" href="#${href}">${ich}</a>` : `<div class="tile">${ich}</div>`;
};
const pulV = n => `${pul(n)}<small>${SOZLAMALAR.valyuta}</small>`;
const balansPill = h => h.qarz ? `<span class="pill bad">Qarz ${pul(h.qarz)}</span>` : h.ortiqcha ? `<span class="pill ok">+${pul(h.ortiqcha)}</span>` : `<span class="pill">0</span>`;
function kechikishPill(h) {
  if (!h.qarz) return "";
  if (h.kechikish <= 0) return `<span class="pill">Muddati: ${sanaMatn(h.ochiq[0] ? h.ochiq[0].muddat : bugun())}</span>`;
  return `<span class="pill ${h.kechikish > 14 ? "bad" : "warn"}">${h.kechikish} kun kechikdi</span>`;
}
const davrMatni = h => {
  const oylar = [...new Set(h.ochiq.map(x => x.oy))];
  return oylar.length > 3 ? `${oylar.length} oy` : oylar.map(oyFaqat).join(", ");
};
const guruhOptions = (tanlangan, { bosh = "", faqatFaol = true } = {}) => (bosh ? `<option value="">${bosh}</option>` : "") +
  DB.guruhlar.filter(g => !faqatFaol || g.holat !== "yopilgan" || g.id === tanlangan).slice().sort(ismBoyicha)
    .map(g => `<option value="${g.id}" ${g.id === tanlangan ? "selected" : ""}>${esc(g.nomi)}</option>`).join("");
const oqituvchiOptions = tanlangan => `<option value="">Tanlanmagan</option>` + DB.oqituvchilar.filter(t => t.faol !== false || t.id === tanlangan).slice().sort(ismBoyicha)
  .map(t => `<option value="${t.id}" ${t.id === tanlangan ? "selected" : ""}>${esc(t.ism)}</option>`).join("");
const tanlov = (arr, tanlangan) => arr.map(v => `<option ${v === tanlangan ? "selected" : ""}>${esc(v)}</option>`).join("");
const segTugmalar = (act, arr, joriy, extra = "") => `<div class="seg" role="group">${arr.map(([v, n]) => `<button type="button" data-act="${act}" data-v="${esc(v)}" ${extra} aria-pressed="${v === joriy}">${n}</button>`).join("")}</div>`;
