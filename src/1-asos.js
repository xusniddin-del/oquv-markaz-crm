"use strict";

/* =====================================================================
   1. SOZLAMALAR
   Dasturni yangi mijozga yoki boshqa sohaga moslash uchun shu obyektni
   o‘zgartiring. Butun interfeys shu yerdan o‘qiydi.
   ===================================================================== */
const SOZLAMALAR = {
  dasturNomi: "O‘quv Markaz CRM",
  versiya: "1.2.0",              // har yangi versiyada oshiriladi (CHANGELOG.md)
  markazNomi: "Bilim o‘quv markazi",     // dastur ichida «Sozlamalar»dan ham o‘zgartiriladi
  markazTel: "+998 90 000 00 00",
  logoMatni: "OM",
  asosiyRang: "#2563EB",
  valyuta: "so‘m",

  // Soha so‘zlari (kichik harfda). Bog‘cha uchun: oquvchi: "bola", oqituvchi: "tarbiyachi"
  atamalar: {
    oquvchi: "o‘quvchi", oquvchilar: "o‘quvchilar",
    guruh: "guruh", guruhlar: "guruhlar",
    oqituvchi: "o‘qituvchi", oqituvchilar: "o‘qituvchilar",
    otaOna: "ota-ona",
  },

  tolovKuni: 5,                  // oylik to‘lov har oyning shu kunigacha
  proporsional: true,            // oy o‘rtasida qo‘shilsa/ketsa — dars kunlariga qarab hisoblash
  kelmaganDarsYechilsin: false,  // «har dars» guruhlarda «kelmadi» ham pul yechadimi
  yaxlitlash: 1000,              // hisoblangan summalar shu songa yaxlitlanadi
  tolovUsullari: ["Naqd", "Click", "Payme", "Karta"],
  lidManbalari: ["Instagram", "Telegram", "Tanish orqali", "Banner / flayer", "Sayt", "Boshqa"],
  xarajatTurlari: ["Ijara", "Kommunal", "Reklama", "Oylik", "Jihozlar", "Kanselyariya", "Boshqa"],
  zaxiraEslatmaKun: 3,
  parolUrinish: 5,               // shuncha xato paroldan keyin 30 soniya kutish
  sinovKun: 14,                  // ro‘yxatdan o‘tgan markaz uchun bepul sinov, kun

  // Dastur egasi (sotuvchi). Kirish va faollashtirish oynasida ko‘rinadi.
  sotuvchi: { nom: "O‘quv Markaz CRM", tel: "+998 90 841 02 20", telegram: "" },
  // Markazlar serveri (Google Apps Script veb-ilova manzili). Bo‘sh bo‘lsa, ro‘yxat va tekshiruv ishlamaydi.
  server: "https://script.google.com/macros/s/AKfycbxZshxNSq_BtBGPIpcSw9VXBvwhGCeLPrf4T0P6W2O8w_sPSbLNEAPHC2O91DiuXwAE/exec",
  tekshirDaqiqa: 10,             // dastur ochiq turganda holat shuncha daqiqada bir tekshiriladi
  telegramHavola: "https://t.me/share/url?text=",

  // Rollar qaysi bo‘limlarni ko‘radi ("*" = hammasi)
  huquqlar: {
    direktor: "*",
    admin: ["bosh", "oquvchilar", "davomat", "diqqat", "xabarlar", "sorovlar", "lidlar", "kurslar", "guruhlar", "jadval", "vazifalar", "tolov", "qarzdorlar", "kassa", "chegirmalar", "menyu"],
    menejer: ["bosh", "lidlar", "sorovlar", "xabarlar", "oquvchilar", "kurslar", "jadval", "menyu"],
    kassir: ["bosh", "tolov", "qarzdorlar", "kassa", "oquvchilar", "xabarlar", "menyu"],
    oqituvchi: ["bosh", "jadval", "davomat", "vazifalar", "oquvchilar", "menyu"],
  },
  pastkiMenyu: {
    direktor: ["bosh", "oquvchilar", "davomat", "tolov", "menyu"],
    admin: ["bosh", "oquvchilar", "davomat", "tolov", "menyu"],
    menejer: ["bosh", "lidlar", "sorovlar", "oquvchilar", "menyu"],
    kassir: ["bosh", "tolov", "qarzdorlar", "kassa", "menyu"],
    oqituvchi: ["bosh", "jadval", "davomat", "vazifalar", "menyu"],
  },
  sorovTurlari: ["Savol", "Shikoyat", "Taklif", "To‘lov masalasi", "Boshqa"],
  davomatMaqsad: 80,             // shundan past davomatli guruhlar «e’tibor talab» qiladi
  sigimMaqsad: [75, 90],         // guruh to‘lishi uchun maqsad oralig‘i, %

  shablonlar: {
    qarz: "Assalomu alaykum! [markaz]dan bezovta qilyapmiz. [ism]ning to‘lovidan [summa] so‘m qarzdorlik bor ([davr]). Iltimos, to‘lovni imkon qadar tezroq amalga oshiring. Rahmat!",
    kelmadi: "Assalomu alaykum! [ism] [sana] kuni [guruh] darsiga kelmadi. Iltimos, sababini bizga xabar bering. Hurmat bilan, [markaz].",
    tolov: "Assalomu alaykum! [ism] uchun [summa] so‘m to‘lov qabul qilindi ([sana], [usul]). Joriy balans: [balans] so‘m. Rahmat! [markaz]",
    lid: "Assalomu alaykum, [ism]! [markaz]dan yozyapmiz. [kurs] bo‘yicha bepul sinov darsiga taklif qilamiz. Sizga qaysi kun qulay?",
  },

  omborKaliti: "oquv-markaz-crm-v2",
};

/* =====================================================================
   2. YORDAMCHI FUNKSIYALAR
   ===================================================================== */
const T = SOZLAMALAR.atamalar;
const OYLAR = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const KUNLAR = [
  { k: "Du", n: "Dushanba" }, { k: "Se", n: "Seshanba" }, { k: "Ch", n: "Chorshanba" },
  { k: "Pa", n: "Payshanba" }, { k: "Ju", n: "Juma" }, { k: "Sh", n: "Shanba" }, { k: "Ya", n: "Yakshanba" },
];
const HOLAT_NOMI = { keldi: "Keldi", kechikdi: "Kechikdi", kelmadi: "Kelmadi", sababli: "Sababli" };
const QATNASHDI = h => h === "keldi" || h === "kechikdi";
// Lavozimlar (rol). Har bir lavozim ko‘radigan bo‘limlar SOZLAMALAR.huquqlar da
const ROL_NOMI = { direktor: "Direktor", admin: "Administrator", menejer: "Sotuv menejeri", kassir: "Kassir", oqituvchi: katta(T.oqituvchi) };
const LID_HOLAT = [
  { k: "yangi", n: "Yangi" }, { k: "boglanildi", n: "Bog‘lanildi" }, { k: "sinov", n: "Sinov darsi" },
  { k: "yozildi", n: "Yozildi" }, { k: "rad", n: "Rad etdi" },
];
const OYLIK_TURI = { fiks: "Fiks oylik", foiz: "Foiz", dars: "Har dars uchun" };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function katta(s) { return s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : ""; }
const yangiId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const boshHarf = ism => String(ism || "?").trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0).toLocaleUpperCase()).join("");
const ismBoyicha = (a, b) => (a.ism || a.nomi || "").localeCompare(b.ism || b.nomi || "");
const sum = (arr, f) => arr.reduce((s, x) => s + (+f(x) || 0), 0);
const toza = obj => JSON.parse(JSON.stringify(obj));   // chuqur nusxa

const pad2 = n => String(n).padStart(2, "0");
const sanaStr = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const bugun = () => sanaStr(new Date());
const joriyOy = () => bugun().slice(0, 7);
const sanaObj = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const sanaQosh = (s, n) => { const d = sanaObj(s); d.setDate(d.getDate() + n); return sanaStr(d); };
const kunFarqi = (a, b) => Math.round((sanaObj(b) - sanaObj(a)) / 864e5);
const oyQosh = (ym, n) => { const [y, m] = ym.split("-").map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; };
const oylarOraligi = (a, b) => { const r = []; let x = a; while (x <= b && r.length < 240) { r.push(x); x = oyQosh(x, 1); } return r; };
const oyOxiri = ym => { const [y, m] = ym.split("-").map(Number); return sanaStr(new Date(y, m, 0)); };
const oyNomi = ym => `${OYLAR[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
const oyFaqat = ym => OYLAR[+ym.slice(5, 7) - 1];
const oyQisqa = ym => OYLAR[+ym.slice(5, 7) - 1].slice(0, 3);
const hafta = s => (sanaObj(s).getDay() + 6) % 7;
const sanaMatn = s => {
  if (!s) return "—";
  const [y, m, d] = s.split("-").map(Number);
  const t = `${d}-${OYLAR[m - 1].toLowerCase()}`;
  return y === new Date().getFullYear() ? t : `${t} ${y}`;
};
const pul = (n, sep = " ") => (n < 0 ? "−" : "") + Math.round(Math.abs(+n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
const pulS = n => `${pul(n)} ${SOZLAMALAR.valyuta}`;
const raqam = s => +String(s ?? "").replace(/\D/g, "") || 0;
const yaxlit = n => { const y = SOZLAMALAR.yaxlitlash || 1; return Math.round(n / y) * y; };
const qisqaPul = n => {
  const a = Math.abs(n), s = n < 0 ? "−" : "";
  if (a >= 1e6) return s + String(Math.round(a / 1e4) / 100).replace(".", ",") + " mln";
  if (a >= 1e3) return s + Math.round(a / 1e3) + " ming";
  return s + String(Math.round(a));
};
const yaxshiMax = v => { const p = 10 ** Math.floor(Math.log10(v)); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; };
const vaqtMin = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };

// PIN xeshi (SHA-256; eski brauzerlarda oddiy xesh)
async function pinXesh(pin) {
  const matn = "oquv-crm:" + pin;
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(matn));
    return "sha:" + [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let h = 2166136261; for (const c of matn) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return "fnv:" + (h >>> 0).toString(16);
  }
}

/* ---------- Login, parol, litsenziya ---------- */
const lotin = s => String(s || "").toLowerCase().replace(/[‘’'`ʻʼ]/g, "").replace(/[^a-z0-9]/g, "");
// Login avtomatik tuziladi: markaz nomining birinchi so‘zi + xodim ismi (bilim.dilnoza, bilim.dilnoza2 ...)
function loginYasa(ism, id = "", db = DB) {
  const markaz = (db.sozlamalar && db.sozlamalar.markazNomi) || SOZLAMALAR.markazNomi;
  const bosh = lotin(markaz.split(/\s+/)[0]).slice(0, 10) || "markaz", nom = lotin(String(ism || "").split(/\s+/)[0]).slice(0, 12) || "xodim";
  let l = `${bosh}.${nom}`, n = 2;
  while (db.xodimlar.some(x => x.login === l && x.id !== id)) l = `${bosh}.${nom}${n++}`;
  return l;
}
const parolYasa = () => { const a = new Uint32Array(8); try { crypto.getRandomValues(a); } catch (e) { a.forEach((_, i) => { a[i] = Math.random() * 1e9; }); } return [...a].map(x => x % 10).join("").replace(/^0/, "7"); };
const parolTogri = p => /^\d{8}$/.test(p);               // xodim paroli: 8 xonali raqam
const loginTogri = l => /^[a-z0-9][a-z0-9._-]{2,29}$/.test(l);  // kichik lotin harf, raqam, . _ -
// Markaz obunasi: ma’lumotni server beradi (holat, sinov va obuna muddati, server sanasi)
function litsenziyaHolati() {
  const L = DB.litsenziya || {}, tugash = [L.sinovTugash, L.tugash].filter(Boolean).sort().pop() || "";
  if (!L.royxat) return { tur: "yoq", tugagan: false, qoldi: null, tugash: "" };
  const qoldi = tugash ? kunFarqi(serverBugun(), tugash) : -1;
  const tur = L.holat === "bloklangan" ? "bloklangan" : L.tugash && L.tugash >= (L.sinovTugash || "") ? "faol" : "sinov";
  return { tur, tugash, qoldi, tugagan: qoldi < 0, bloklangan: L.holat === "bloklangan" };
}

/* =====================================================================
   3. MA’LUMOTLAR OMBORI
   Serversiz, oflayn: hamma narsa shu brauzerning xotirasida (localStorage).
   Boshqa qurilmaga zaxira fayli orqali ko‘chiriladi.
   Dastur faqat Ombor.yoz / ochir / davomatYoz / sozYoz orqali yozadi.
   ===================================================================== */
const KOLLEKSIYALAR = ["xodimlar", "oqituvchilar", "xonalar", "guruhlar", "oquvchilar", "tolovlar", "lidlar", "xarajatlar",
  "filiallar", "kurslar", "mavsumlar", "chegirmalar", "vazifalar", "sorovlar"];

function boshDB() {
  return {
    versiya: 3,
    sozlamalar: { markazNomi: "", markazTel: "", manzil: "" },
    xodimlar: [],      // {id, ism, rol (lavozim), login, pinXesh (parol xeshi), oqituvchiId, filialId, faol}
    litsenziya: { royxat: "", sinovTugash: "", tugash: "", malumot: {}, markazId: "", token: "", holat: "faol", xabar: "" },   // server bilan bog‘lanish
    oqituvchilar: [],  // {id, ism, tel, fan, oylikTuri, stavka, foizAsosi, izoh, faol}
    xonalar: [],       // {id, nomi, sigim}
    guruhlar: [],      // {id, nomi, fan, oqituvchiId, xonaId, kunlar, boshlanish, tugash, narxTuri, narx, holat, ochilgan}
    oquvchilar: [],    // {id, ism, tel, otaTel, tugilgan, manba, izoh, yaratildi, azolik:[{guruhId, qoshilgan, chiqqan, chegirma}]}
    tolovlar: [],      // {id, oquvchiId, guruhId, summa, sana, usul, izoh, xodimId, yaratildi}
    lidlar: [],        // {id, ism, tel, qiziqish, manba, holat, sinovSana, keyingiAloqa, izoh, yaratildi, oquvchiId}
    xarajatlar: [],    // {id, sana, kategoriya, summa, usul, izoh, oqituvchiId, oy, xodimId, yaratildi}
    filiallar: [],     // {id, nomi, manzil, tel}
    kurslar: [],       // {id, nomi, davomiylik (oy), narx, tavsif, holat}
    mavsumlar: [],     // {id, nomi, boshlanish, tugash}
    chegirmalar: [],   // {id, nomi, turi: "foiz"|"summa", qiymat, izoh, faol}
    vazifalar: [],     // {id, guruhId, sana, muddat, matn, xodimId, bajardi: {oquvchiId: true}}
    sorovlar: [],      // {id, ism, tel, oquvchiId, turi, matn, holat, javob, yaratildi, xodimId}
    davomat: {},       // {"guruhId|YYYY-MM-DD": {oquvchiId: "keldi"|"kechikdi"|"kelmadi"|"sababli"}}
    bekorlar: {},      // {"guruhId|YYYY-MM-DD": "sabab"} — bekor qilingan darslar
    shablonlar: { ...SOZLAMALAR.shablonlar },
    meta: { oxirgiZaxira: null, demo: false },
  };
}

// Har qanday zaxirani (v1 ham) v2 ko‘rinishiga keltiradi
function tartibla(x) {
  const b = boshDB();
  if (!x || typeof x !== "object") return b;
  const arr = k => (Array.isArray(x[k]) ? x[k] : []);
  const db = {
    ...b,
    sozlamalar: { ...b.sozlamalar, ...(x.sozlamalar || {}) },
    davomat: x.davomat && typeof x.davomat === "object" ? x.davomat : {},
    bekorlar: x.bekorlar && typeof x.bekorlar === "object" ? x.bekorlar : {},
    litsenziya: { ...b.litsenziya, ...(x.litsenziya || {}) },
    shablonlar: { ...b.shablonlar, ...(x.shablonlar || {}) },
    meta: { ...b.meta, ...(x.meta || {}) },
    versiya: 3,
  };
  KOLLEKSIYALAR.forEach(k => { db[k] = arr(k); });
  if (!x.versiya || x.versiya < 2) {
    // v1 → v2: guruh narxi oylik, o‘quvchi bitta guruhda, to‘lov «oy» maydoni izohga
    db.guruhlar = db.guruhlar.map(g => ({ fan: "", oqituvchiId: "", xonaId: "", boshlanish: g.vaqt || "", tugash: "", narxTuri: "oylik", holat: "faol", ochilgan: "", ...g, oqituvchiNomi: g.oqituvchi || "" }));
    db.oquvchilar = db.oquvchilar.map(o => ({
      id: o.id, ism: o.ism, tel: o.tel || "", otaTel: o.otaTel || "", tugilgan: "", manba: "", izoh: "", yaratildi: Date.now(),
      azolik: o.guruhId ? [{ guruhId: o.guruhId, qoshilgan: o.qoshilgan || bugun(), chiqqan: o.holat === "toxtagan" ? (o.toxtaganSana || bugun()) : "", chegirma: 0 }] : [],
    }));
    db.tolovlar = db.tolovlar.map(t => ({ guruhId: "", xodimId: "", ...t, izoh: [t.oy ? oyNomi(t.oy) + " uchun" : "", t.izoh || ""].filter(Boolean).join(". ") }));
  }
  db.oquvchilar.forEach(o => { if (!Array.isArray(o.azolik)) o.azolik = []; });
  // Eski versiyadan: loginsiz xodimlarga login, kodsiz markazga kod va 14 kunlik sinov
  db.xodimlar.forEach(x => { if (!x.login) x.login = loginYasa(x.ism, x.id, db); });
  if (db.xodimlar.length && !db.litsenziya.royxat) {
    db.litsenziya.royxat = bugun();
    db.litsenziya.sinovTugash = sanaQosh(bugun(), SOZLAMALAR.sinovKun);
  }
  return db;
}

let DB = boshDB();
// Logotip: markaz nomining bosh harflari (masalan «Yuksak Ta’lim» → «YT»)
const markazLogo = () => { const n = (DB.sozlamalar.markazNomi || "").replace(/o‘quv|markazi?|o'quv/gi, " ").trim().split(/\s+/).filter(Boolean);
  return n.length ? n.slice(0, 2).map(w => w[0]).join("").toUpperCase() : SOZLAMALAR.logoMatni; };
// Bu qurilmada haqiqiy (demo emas) ro‘yxatdan o‘tgan markaz bormi
const markazBor = () => DB.xodimlar.length > 0 && !DB.meta.demo && !DB.xodimlar.some(x => x.login === "bilim.akmal");
let DBver = 0;                 // har o‘zgarishda oshadi (hisob-kitob keshi uchun)
const ozgardi = () => { DBver++; };

const Mahalliy = {
  ishlaydi: (() => { try { localStorage.setItem("__s", "1"); localStorage.removeItem("__s"); return true; } catch (e) { return false; } })(),
  ol(k, z = null) { try { const v = localStorage.getItem(k); return v === null ? z : v; } catch (e) { return z; } },
  qoy(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  ochir(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

const Ombor = {
  yukla() {
    try { DB = tartibla(JSON.parse(Mahalliy.ol(SOZLAMALAR.omborKaliti))); } catch (e) { DB = boshDB(); }
    ozgardi();
  },
  saqla() { Mahalliy.qoy(SOZLAMALAR.omborKaliti, JSON.stringify(DB)); },
  // Hujjat qo‘shish yoki yangilash (id bo‘yicha)
  yoz(kol, obj) {
    if (!obj.id) obj.id = yangiId();
    const arr = DB[kol], i = arr.findIndex(x => x.id === obj.id);
    if (i >= 0) arr[i] = obj; else arr.push(obj);
    ozgardi(); this.saqla();
    return obj;
  },
  ochir(kol, id) { DB[kol] = DB[kol].filter(x => x.id !== id); ozgardi(); this.saqla(); },
  davomatYoz(kalit, belgilar) {
    if (belgilar && Object.keys(belgilar).length) DB.davomat[kalit] = belgilar; else delete DB.davomat[kalit];
    ozgardi(); this.saqla();
  },
  sozYoz() { ozgardi(); this.saqla(); },
  // Zaxiradan tiklash, demo, tozalash — butun bazani almashtirish
  async almashtir(yangi) { DB = tartibla(yangi); ozgardi(); this.saqla(); },
};

/* =====================================================================
   4. HISOB-KITOB (balans, qarz, oylik, statistika)
   Hamma natijalar DBver bo‘yicha keshlanadi — ma’lumot o‘zgarsa qayta hisoblanadi.
   ===================================================================== */
const Kesh = {
  ver: -1, kun: "", fil: "", m: new Map(),
  ol(k, fn) {
    const b = bugun(), f = (typeof UI === "object" ? UI.filial : "") + "|" + (typeof Sessiya === "object" ? Sessiya.xodimId : "");
    if (this.ver !== DBver || this.kun !== b || this.fil !== f) { this.m.clear(); this.ver = DBver; this.kun = b; this.fil = f; }
    if (!this.m.has(k)) this.m.set(k, fn());
    return this.m.get(k);
  },
};
const byId = kol => Kesh.ol("id:" + kol, () => new Map(DB[kol].map(x => [x.id, x])));
const guruh = id => byId("guruhlar").get(id);
const oquvchi = id => byId("oquvchilar").get(id);
const oqituvchi = id => byId("oqituvchilar").get(id);
const xona = id => byId("xonalar").get(id);
const xodim = id => byId("xodimlar").get(id);
const markazNomi = () => DB.sozlamalar.markazNomi || SOZLAMALAR.markazNomi;
const markazTel = () => DB.sozlamalar.markazTel || SOZLAMALAR.markazTel;

const azolikFaol = (a, s) => a.qoshilgan && a.qoshilgan <= s && (!a.chiqqan || a.chiqqan > s);
const faolAzoliklar = (o, s = bugun()) => (o.azolik || []).filter(a => azolikFaol(a, s));
const oquvchiFaol = o => faolAzoliklar(o).length > 0 || (o.azolik || []).some(a => a.qoshilgan > bugun() && !a.chiqqan);
const guruhOquvchilari = (gid, s = bugun()) => DB.oquvchilar.filter(o => (o.azolik || []).some(a => a.guruhId === gid && azolikFaol(a, s))).sort(ismBoyicha);
const oqituvchiNomi = g => (g && (oqituvchi(g.oqituvchiId) || {}).ism) || (g && g.oqituvchiNomi) || "";
const guruhNarxMatn = g => `${pulS(g.narx)} / ${g.narxTuri === "dars" ? "dars" : "oy"}`;

// Guruhning oydagi dars kunlari
function darsKunlari(g, ym) {
  const kunlar = new Set(g.kunlar || []), r = [];
  const oxir = +oyOxiri(ym).slice(8);
  for (let d = 1; d <= oxir; d++) { const s = `${ym}-${pad2(d)}`; if (kunlar.has(KUNLAR[hafta(s)].k)) r.push(s); }
  return r;
}
// Davomat guruh bo‘yicha indekslangan
const davomatIndeks = () => Kesh.ol("davIdx", () => {
  const m = new Map();
  for (const [k, v] of Object.entries(DB.davomat)) {
    const [gid, s] = k.split("|");
    if (!m.has(gid)) m.set(gid, []);
    m.get(gid).push({ sana: s, belgilar: v });
  }
  m.forEach(l => l.sort((a, b) => a.sana.localeCompare(b.sana)));
  return m;
});

// O‘quvchiga hisoblangan to‘lovlar ro‘yxati (sanasi bo‘yicha)
function hisoblar(o) {
  const r = [], b = bugun(), hozir = joriyOy();
  for (const a of o.azolik || []) {
    const g = guruh(a.guruhId);
    if (!g || !a.qoshilgan) continue;
    const narx = narxChegirma(a, +g.narx || 0);   // chegirma qo‘llangan narx
    if (g.narxTuri === "dars") {
      for (const d of davomatIndeks().get(g.id) || []) {
        if (d.sana < a.qoshilgan || (a.chiqqan && d.sana >= a.chiqqan) || d.sana > b) continue;
        const h = d.belgilar[o.id];
        if (QATNASHDI(h) || (h === "kelmadi" && SOZLAMALAR.kelmaganDarsYechilsin))
          r.push({ guruhId: g.id, davr: d.sana, davrSana: d.sana, oy: d.sana.slice(0, 7), muddat: d.sana, summa: yaxlit(narx), chegirma: yaxlit((+g.narx || 0) - narx), tavsif: `${sanaMatn(d.sana)} darsi` });
      }
    } else {
      const ox = a.chiqqan ? sanaQosh(a.chiqqan, -1) : null;
      const oxOy = ox ? (ox.slice(0, 7) < hozir ? ox.slice(0, 7) : hozir) : hozir;
      for (const ym of oylarOraligi(a.qoshilgan.slice(0, 7), oxOy)) {
        let ulush = 1;
        if (SOZLAMALAR.proporsional && (g.kunlar || []).length) {
          const kunlar = darsKunlari(g, ym);
          if (kunlar.length) {
            const faol = kunlar.filter(s => s >= a.qoshilgan && (!a.chiqqan || s < a.chiqqan)).length;
            ulush = faol / kunlar.length;
          }
        }
        if (ulush <= 0) continue;
        const muddat = `${ym}-${pad2(SOZLAMALAR.tolovKuni)}`;
        r.push({ guruhId: g.id, davr: ym, davrSana: `${ym}-01`, oy: ym, muddat: a.qoshilgan > muddat ? a.qoshilgan : muddat, summa: yaxlit(narx * ulush), chegirma: yaxlit(((+g.narx || 0) - narx) * ulush), tavsif: `${oyNomi(ym)}${ulush < 1 ? " (qisman)" : ""}` });
      }
    }
  }
  return r.filter(x => x.summa > 0).sort((x, y) => x.muddat.localeCompare(y.muddat));
}
// Chegirma: ro‘yxatdagi chegirma (foiz yoki summa) yoki qo‘lda kiritilgan foiz
function narxChegirma(a, narx) {
  const c = a.chegirmaId && byId("chegirmalar").get(a.chegirmaId);
  if (c) return c.turi === "summa" ? Math.max(0, narx - (+c.qiymat || 0)) : narx * (1 - Math.min(100, +c.qiymat || 0) / 100);
  return narx * (1 - Math.min(100, Math.max(0, +a.chegirma || 0)) / 100);
}
const chegirmaMatn = a => { const c = a.chegirmaId && byId("chegirmalar").get(a.chegirmaId); return c ? `${c.nomi} (${c.turi === "summa" ? pul(c.qiymat) : c.qiymat + "%"})` : (+a.chegirma ? `chegirma ${a.chegirma}%` : ""); };
const tolovSumma = t => (t.qaytarish ? -1 : 1) * (+t.summa || 0);   // qaytarilgan pul manfiy hisoblanadi
const oquvchiTolovlari = oid => Kesh.ol("tol:" + oid, () => DB.tolovlar.filter(t => t.oquvchiId === oid));
const tolovIndeks = () => Kesh.ol("tolIdx", () => { const m = new Map(); DB.tolovlar.forEach(t => { if (!m.has(t.oquvchiId)) m.set(t.oquvchiId, []); m.get(t.oquvchiId).push(t); }); return m; });

// Balans: to‘lovlar eski hisoblardan boshlab yopiladi (FIFO)
function hisobHolati(o) {
  return Kesh.ol("hh:" + o.id, () => {
    const hs = hisoblar(o).map(h => ({ ...h }));
    const tolangan = sum(tolovIndeks().get(o.id) || [], tolovSumma);
    let qoldi = tolangan;
    for (const h of hs) { h.tolangan = Math.min(h.summa, qoldi); qoldi -= h.tolangan; h.qarz = h.summa - h.tolangan; }
    const jami = sum(hs, h => h.summa), balans = tolangan - jami;
    const ochiq = hs.filter(h => h.qarz > 0);
    const kechikish = ochiq.length ? Math.max(0, kunFarqi(ochiq[0].muddat, bugun())) : 0;
    return { hisoblar: hs, tolangan, jami, balans, qarz: Math.max(0, -balans), ortiqcha: Math.max(0, balans), ochiq, kechikish };
  });
}
function qarzdorlar(gid = "") {
  return Kesh.ol("qd:" + gid, () => OQ()
    .filter(o => !gid || (o.azolik || []).some(a => a.guruhId === gid))
    .map(o => ({ o, h: hisobHolati(o) }))
    .filter(x => x.h.qarz > 0)
    .sort((a, b) => b.h.qarz - a.h.qarz || b.h.kechikish - a.h.kechikish));
}
const oquvchiGuruhlari = o => (o.azolik || []).filter(a => !a.chiqqan || a.chiqqan > bugun()).map(a => guruh(a.guruhId)).filter(Boolean);

// To‘lovni guruhga bog‘lash (o‘qituvchi foizi uchun): belgilangan guruh yoki o‘quvchining birinchi guruhi
function tolovGuruhi(t) {
  if (t.guruhId) return t.guruhId;
  const o = oquvchi(t.oquvchiId); if (!o) return "";
  const a = faolAzoliklar(o, t.sana || bugun())[0] || (o.azolik || [])[0];
  return a ? a.guruhId : "";
}

// Oy statistikasi
function oyStat(ym) {
  return Kesh.ol("oy:" + ym, () => {
    let hisoblangan = 0, yigilgan = 0;
    OQ().forEach(o => hisobHolati(o).hisoblar.forEach(h => { if (h.oy === ym) { hisoblangan += h.summa; yigilgan += h.tolangan; } }));
    const tushum = sum(TL().filter(t => (t.sana || "").startsWith(ym)), tolovSumma);
    const xarajat = sum(XR().filter(x => (x.sana || "").startsWith(ym)), x => x.summa);
    return { hisoblangan, yigilgan, foiz: hisoblangan ? Math.round(yigilgan * 100 / hisoblangan) : null, tushum, xarajat, foyda: tushum - xarajat };
  });
}
function guruhOyStat(g, ym) {
  let hisoblangan = 0, yigilgan = 0;
  DB.oquvchilar.forEach(o => hisobHolati(o).hisoblar.forEach(h => { if (h.guruhId === g.id && h.oy === ym) { hisoblangan += h.summa; yigilgan += h.tolangan; } }));
  const tushum = sum(DB.tolovlar.filter(t => (t.sana || "").startsWith(ym) && tolovGuruhi(t) === g.id), tolovSumma);
  const darslar = (davomatIndeks().get(g.id) || []).filter(d => d.sana.startsWith(ym)).length;
  return { hisoblangan, yigilgan, tushum, darslar, dav: davStat((gid, s) => gid === g.id && s.startsWith(ym)), oquvchi: guruhOquvchilari(g.id, ym === joriyOy() ? bugun() : oyOxiri(ym)).length };
}
function davStat(filtr) {
  let keldi = 0, kechikdi = 0, kelmadi = 0, sababli = 0;
  for (const [k, v] of Object.entries(DB.davomat)) {
    const [gid, s] = k.split("|");
    if (!filtr(gid, s)) continue;
    for (const h of Object.values(v)) { if (h === "keldi") keldi++; else if (h === "kechikdi") kechikdi++; else if (h === "kelmadi") kelmadi++; else if (h === "sababli") sababli++; }
  }
  const jami = keldi + kechikdi + kelmadi + sababli;
  return { keldi, kechikdi, kelmadi, sababli, jami, foiz: jami ? Math.round((keldi + kechikdi) * 100 / jami) : null };
}

// O‘qituvchi oyligi
function oqituvchiOylik(t, ym) {
  const gs = DB.guruhlar.filter(g => g.oqituvchiId === t.id);
  let hisob = 0, asos = 0, izoh = "";
  if (t.oylikTuri === "foiz") {
    if (t.foizAsosi === "tushgan") asos = sum(gs, g => guruhOyStat(g, ym).tushum);
    else asos = sum(gs, g => guruhOyStat(g, ym).hisoblangan);
    hisob = yaxlit(asos * (+t.stavka || 0) / 100);
    izoh = `${t.stavka || 0}% × ${pulS(asos)} (${t.foizAsosi === "tushgan" ? "tushgan pul" : "hisoblangan"})`;
  } else if (t.oylikTuri === "dars") {
    asos = sum(gs, g => guruhOyStat(g, ym).darslar);
    hisob = asos * (+t.stavka || 0);
    izoh = `${asos} ta dars × ${pulS(t.stavka || 0)}`;
  } else {
    hisob = +t.stavka || 0; izoh = "Fiks oylik";
  }
  const tolangan = sum(DB.xarajatlar.filter(x => x.kategoriya === "Oylik" && x.oqituvchiId === t.id && x.oy === ym), x => x.summa);
  return { hisob, tolangan, qoldiq: Math.max(0, hisob - tolangan), izoh, guruhlar: gs };
}

// Jadvaldagi to‘qnashuvlar (bir xona yoki bir o‘qituvchi bir vaqtda)
function toqnashuvlar() {
  return Kesh.ol("toq", () => {
    const m = new Map();
    const gs = DB.guruhlar.filter(g => g.holat !== "yopilgan" && g.boshlanish);
    for (let i = 0; i < gs.length; i++) for (let j = i + 1; j < gs.length; j++) {
      const a = gs[i], b = gs[j];
      const kun = (a.kunlar || []).some(k => (b.kunlar || []).includes(k));
      if (!kun) continue;
      const a1 = vaqtMin(a.boshlanish), a2 = vaqtMin(a.tugash) ?? a1 + 90, b1 = vaqtMin(b.boshlanish), b2 = vaqtMin(b.tugash) ?? b1 + 90;
      if (!(a1 < b2 && b1 < a2)) continue;
      const sabab = [];
      if (a.xonaId && a.xonaId === b.xonaId) sabab.push("xona");
      if (a.oqituvchiId && a.oqituvchiId === b.oqituvchiId) sabab.push(T.oqituvchi);
      if (!sabab.length) continue;
      [a, b].forEach((g, n) => { if (!m.has(g.id)) m.set(g.id, []); m.get(g.id).push({ bilan: n ? a : b, sabab }); });
    }
    return m;
  });
}
