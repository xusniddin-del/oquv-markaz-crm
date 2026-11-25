/* =====================================================================
   15. AVTO-SMS — markaz telefonidagi SIM kartadan avtomatik SMS
   CRM SMS'ni serverdagi navbatga qo‘yadi; markaz telefonidagi «O‘quv Markaz SMS»
   ilovasi navbatni olib, o‘z SIM kartasidan yuboradi. Pullik SMS-shlyuz yo‘q.
   Avtomatik eslatmalar uchun CRM qarzdorlar ro‘yxatini serverga yuborib turadi.
   ===================================================================== */
const SMS_ILOVA = "https://xusniddin-del.github.io/oquv-markaz-crm/OquvMarkaz-SMS.apk";
const SMS_VERSIYA = "https://xusniddin-del.github.io/oquv-markaz-crm/sms-version.json";
const SMS_QR = { n: 37, d: "M0 0h7v1h-7zM8 0h1v1h-1zM13 0h2v1h-2zM18 0h2v1h-2zM24 0h1v1h-1zM26 0h2v1h-2zM30 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM12 1h1v1h-1zM14 1h2v1h-2zM18 1h1v1h-1zM20 1h1v1h-1zM22 1h1v1h-1zM24 1h3v1h-3zM30 1h1v1h-1zM36 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM11 2h1v1h-1zM16 2h8v1h-8zM26 2h1v1h-1zM28 2h1v1h-1zM30 2h1v1h-1zM32 2h3v1h-3zM36 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h3v1h-3zM12 3h3v1h-3zM18 3h3v1h-3zM23 3h4v1h-4zM28 3h1v1h-1zM30 3h1v1h-1zM32 3h3v1h-3zM36 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h1v1h-1zM10 4h3v1h-3zM14 4h1v1h-1zM16 4h1v1h-1zM21 4h1v1h-1zM23 4h1v1h-1zM26 4h3v1h-3zM30 4h1v1h-1zM32 4h3v1h-3zM36 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h2v1h-2zM14 5h2v1h-2zM18 5h2v1h-2zM21 5h2v1h-2zM25 5h1v1h-1zM30 5h1v1h-1zM36 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h1v1h-1zM24 6h1v1h-1zM26 6h1v1h-1zM28 6h1v1h-1zM30 6h7v1h-7zM8 7h1v1h-1zM11 7h3v1h-3zM16 7h5v1h-5zM22 7h2v1h-2zM26 7h2v1h-2zM0 8h1v1h-1zM4 8h1v1h-1zM6 8h3v1h-3zM10 8h1v1h-1zM18 8h1v1h-1zM22 8h4v1h-4zM28 8h6v1h-6zM36 8h1v1h-1zM2 9h1v1h-1zM4 9h1v1h-1zM8 9h2v1h-2zM12 9h2v1h-2zM16 9h1v1h-1zM19 9h3v1h-3zM24 9h1v1h-1zM27 9h3v1h-3zM32 9h1v1h-1zM35 9h1v1h-1zM0 10h1v1h-1zM2 10h8v1h-8zM11 10h4v1h-4zM16 10h3v1h-3zM20 10h8v1h-8zM29 10h3v1h-3zM1 11h4v1h-4zM7 11h2v1h-2zM13 11h2v1h-2zM17 11h2v1h-2zM21 11h2v1h-2zM27 11h3v1h-3zM31 11h1v1h-1zM34 11h2v1h-2zM4 12h1v1h-1zM6 12h5v1h-5zM13 12h3v1h-3zM17 12h1v1h-1zM19 12h6v1h-6zM26 12h1v1h-1zM29 12h2v1h-2zM33 12h4v1h-4zM2 13h1v1h-1zM4 13h1v1h-1zM7 13h2v1h-2zM11 13h2v1h-2zM15 13h3v1h-3zM22 13h2v1h-2zM25 13h5v1h-5zM32 13h2v1h-2zM1 14h3v1h-3zM5 14h2v1h-2zM10 14h1v1h-1zM12 14h1v1h-1zM14 14h2v1h-2zM18 14h1v1h-1zM20 14h6v1h-6zM27 14h2v1h-2zM31 14h4v1h-4zM0 15h3v1h-3zM4 15h2v1h-2zM9 15h2v1h-2zM14 15h1v1h-1zM16 15h1v1h-1zM19 15h3v1h-3zM24 15h1v1h-1zM26 15h2v1h-2zM29 15h4v1h-4zM34 15h1v1h-1zM0 16h2v1h-2zM3 16h1v1h-1zM5 16h2v1h-2zM8 16h4v1h-4zM14 16h3v1h-3zM20 16h1v1h-1zM24 16h2v1h-2zM29 16h2v1h-2zM33 16h3v1h-3zM0 17h1v1h-1zM2 17h1v1h-1zM8 17h1v1h-1zM11 17h3v1h-3zM18 17h2v1h-2zM22 17h2v1h-2zM26 17h3v1h-3zM30 17h1v1h-1zM32 17h1v1h-1zM35 17h1v1h-1zM0 18h1v1h-1zM2 18h2v1h-2zM5 18h3v1h-3zM9 18h1v1h-1zM11 18h5v1h-5zM18 18h2v1h-2zM21 18h1v1h-1zM23 18h1v1h-1zM26 18h2v1h-2zM31 18h1v1h-1zM33 18h1v1h-1zM1 19h1v1h-1zM5 19h1v1h-1zM15 19h3v1h-3zM19 19h3v1h-3zM23 19h1v1h-1zM26 19h1v1h-1zM28 19h1v1h-1zM34 19h2v1h-2zM0 20h4v1h-4zM5 20h2v1h-2zM9 20h2v1h-2zM17 20h2v1h-2zM20 20h3v1h-3zM24 20h1v1h-1zM27 20h1v1h-1zM29 20h3v1h-3zM34 20h1v1h-1zM0 21h1v1h-1zM8 21h1v1h-1zM10 21h1v1h-1zM15 21h2v1h-2zM18 21h1v1h-1zM20 21h2v1h-2zM23 21h1v1h-1zM26 21h4v1h-4zM31 21h2v1h-2zM0 22h1v1h-1zM4 22h4v1h-4zM9 22h1v1h-1zM12 22h1v1h-1zM14 22h4v1h-4zM20 22h1v1h-1zM23 22h1v1h-1zM26 22h2v1h-2zM30 22h6v1h-6zM1 23h2v1h-2zM4 23h2v1h-2zM7 23h8v1h-8zM16 23h5v1h-5zM22 23h1v1h-1zM24 23h1v1h-1zM26 23h3v1h-3zM31 23h2v1h-2zM34 23h3v1h-3zM4 24h4v1h-4zM12 24h1v1h-1zM14 24h1v1h-1zM18 24h1v1h-1zM22 24h2v1h-2zM25 24h1v1h-1zM27 24h1v1h-1zM29 24h2v1h-2zM33 24h2v1h-2zM0 25h1v1h-1zM3 25h1v1h-1zM9 25h4v1h-4zM14 25h1v1h-1zM16 25h2v1h-2zM19 25h2v1h-2zM23 25h1v1h-1zM25 25h1v1h-1zM27 25h2v1h-2zM32 25h3v1h-3zM3 26h2v1h-2zM6 26h2v1h-2zM12 26h1v1h-1zM16 26h3v1h-3zM20 26h1v1h-1zM22 26h3v1h-3zM26 26h4v1h-4zM31 26h2v1h-2zM34 26h1v1h-1zM2 27h2v1h-2zM5 27h1v1h-1zM8 27h2v1h-2zM12 27h1v1h-1zM14 27h1v1h-1zM17 27h2v1h-2zM21 27h3v1h-3zM28 27h1v1h-1zM30 27h7v1h-7zM0 28h2v1h-2zM3 28h2v1h-2zM6 28h1v1h-1zM8 28h2v1h-2zM12 28h1v1h-1zM14 28h4v1h-4zM19 28h3v1h-3zM24 28h1v1h-1zM28 28h5v1h-5zM34 28h1v1h-1zM36 28h1v1h-1zM8 29h1v1h-1zM10 29h1v1h-1zM14 29h5v1h-5zM23 29h4v1h-4zM28 29h1v1h-1zM32 29h1v1h-1zM35 29h1v1h-1zM0 30h7v1h-7zM8 30h1v1h-1zM10 30h1v1h-1zM13 30h3v1h-3zM18 30h1v1h-1zM20 30h4v1h-4zM25 30h1v1h-1zM28 30h1v1h-1zM30 30h1v1h-1zM32 30h1v1h-1zM0 31h1v1h-1zM6 31h1v1h-1zM10 31h7v1h-7zM21 31h1v1h-1zM23 31h2v1h-2zM26 31h1v1h-1zM28 31h1v1h-1zM32 31h3v1h-3zM0 32h1v1h-1zM2 32h3v1h-3zM6 32h1v1h-1zM8 32h1v1h-1zM14 32h1v1h-1zM16 32h1v1h-1zM20 32h1v1h-1zM23 32h2v1h-2zM26 32h1v1h-1zM28 32h7v1h-7zM36 32h1v1h-1zM0 33h1v1h-1zM2 33h3v1h-3zM6 33h1v1h-1zM9 33h2v1h-2zM12 33h3v1h-3zM17 33h3v1h-3zM21 33h3v1h-3zM25 33h2v1h-2zM28 33h4v1h-4zM33 33h2v1h-2zM36 33h1v1h-1zM0 34h1v1h-1zM2 34h3v1h-3zM6 34h1v1h-1zM9 34h1v1h-1zM11 34h1v1h-1zM14 34h2v1h-2zM17 34h3v1h-3zM23 34h1v1h-1zM26 34h1v1h-1zM29 34h2v1h-2zM0 35h1v1h-1zM6 35h1v1h-1zM9 35h3v1h-3zM14 35h9v1h-9zM24 35h1v1h-1zM26 35h1v1h-1zM29 35h1v1h-1zM32 35h1v1h-1zM34 35h2v1h-2zM0 36h7v1h-7zM8 36h1v1h-1zM11 36h2v1h-2zM14 36h1v1h-1zM17 36h1v1h-1zM20 36h5v1h-5zM27 36h1v1h-1zM29 36h3v1h-3zM35 36h2v1h-2z" };   // SMS_ILOVA manzilining QR kodi (o‘zgarmas)
const SMS_HOLAT = { queued: ["Navbatda", ""], sending: ["Yuborilmoqda", "warn"], sent: ["Yuborildi", "primary"], delivered: ["Yetkazildi", "ok"], failed: ["Xato", "bad"], cancelled: ["Bekor qilindi", ""] };
const SMS = {
  j: null, yuklanmoqda: false, xato: "", rozi: false, oxirgi: 0,
  kod: "", kodMuddat: 0, kodTaymer: null, taymer: null, ilova: null, snapImzo: "", snapVaqt: 0,
  kalit: "oquv-crm-sms",
  saqla() { try { const j = this.j ? { ...this.j, tarix: [] } : null; Mahalliy.qoy(this.kalit, JSON.stringify(j)); } catch (e) {} },
  yukla() { try { this.j = JSON.parse(Mahalliy.ol(this.kalit) || "null"); } catch (e) { this.j = null; } },
};
const smsTayyor = () => !!(SMS.j && SMS.j.qurilma && SMS.j.ruxsat && Sinx.faol());
const iPhoneMi = () => /iPhone|iPad|iPod/.test(navigator.userAgent || "");
const androidMi = () => /Android/i.test(navigator.userAgent || "");
const smsKeng = () => { try { return matchMedia("(pointer: fine)").matches; } catch (e) { return false; } };

// SMS matni qancha qismga bo‘linadi: lotin (160/153) yoki kirill va maxsus belgilar (70/67)
function smsNormal(s) {
  return String(s || "").replace(/[‘’ʻʼ`´]/g, "'").replace(/[“”«»]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[ \t]/g, " ").replace(/ {2,}/g, " ").trim();
}
function smsQismlar(s) {
  const t = smsNormal(s);
  if (!t) return { belgi: 0, qism: 0 };
  const gsm = /^[A-Za-z0-9 \n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\\[~\]|€]*$/.test(t);
  const n = t.length, bir = gsm ? 160 : 70, kop = gsm ? 153 : 67;
  return { belgi: n, qism: n <= bir ? 1 : Math.ceil(n / kop), gsm };
}

async function smsSorov(amal, d = {}) {
  const L = DB.litsenziya;
  const j = await Server.sorov(amal, { id: L.markazId, token: L.token, ...d });
  if (!j.ok) throw new Error(j.xato || "Server rad etdi");
  return j;
}
// Holatni serverdan oladi (bo‘lim ochiq bo‘lsa har 20 soniyada)
async function smsYangila(jim = false) {
  if (!Sinx.faol() || SMS.yuklanmoqda) return;
  SMS.yuklanmoqda = true;
  try { SMS.j = await smsSorov("smsList"); SMS.xato = ""; SMS.saqla(); }
  catch (e) { SMS.xato = e.name === "TypeError" || e.name === "AbortError" ? "Internet yo‘q yoki server javob bermadi." : e.message; }
  SMS.yuklanmoqda = false; SMS.oxirgi = Date.now();
  if (!jim || UI.bolim === "avtosms") rejaRender();
  smsSnap();
}
async function smsIlovaVersiya() {
  if (SMS.ilova && Date.now() - SMS.ilova.t < 30 * 60000) return;
  try { const r = await fetch(SMS_VERSIYA + "?t=" + Date.now(), { cache: "no-store" }); if (r.ok) { SMS.ilova = { ...(await r.json()), t: Date.now() }; rejaRender(); } } catch (e) {}
}
function smsTaymer() {
  clearInterval(SMS.taymer);
  SMS.taymer = setInterval(() => { if (UI.bolim === "avtosms" && document.visibilityState === "visible" && Ilova.holat === "ichida") smsYangila(true); else { clearInterval(SMS.taymer); SMS.taymer = null; } }, 20000);
}

// Avtomatik eslatmalar uchun qarzdorlar ro‘yxati (server har kuni 10:00 dan keyin shundan foydalanadi)
async function smsSnap(majburiy = false) {
  if (!smsTayyor() || !SMS.j.cfg.auto) return;
  const l = DB.oquvchilar.filter(o => !o.noAutoSms && oquvchiFaol(o)).map(o => ({ o, h: hisobHolati(o) })).filter(x => x.h.qarz > 0 && x.h.kechikish > 0)
    .map(x => ({ pid: x.o.id, ism: x.o.ism, tel: x.o.otaTel || x.o.tel || "", qarz: Math.round(x.h.qarz), kechikish: x.h.kechikish, davr: davrMatni(x.h) }))
    .filter(x => x.tel);
  const imzo = bugun() + JSON.stringify(l);
  if (!majburiy && imzo === SMS.snapImzo && Date.now() - SMS.snapVaqt < 6 * 3600000) return;
  try { await smsSorov("smsSnap", { qarzdorlar: l }); SMS.snapImzo = imzo; SMS.snapVaqt = Date.now(); } catch (e) {}
}

// Server holati tekshirilganda Avto-SMS holati ham yangilanadi (xabarlar oynasidagi tugma uchun)
(function () {
  const asl = Server.tekshir.bind(Server);
  Server.tekshir = async function () {
    await asl();
    if (Server.holat === "ok" && SMS.j && SMS.j.cfg && SMS.j.cfg.agreed) smsYangila(true);
  };
  SMS.yukla();
})();

/* ---------- Bo‘lim ---------- */
const smsQrSvg = (o = 168) => `<svg class="sms-qr" width="${o}" height="${o}" viewBox="-2 -2 ${SMS_QR.n + 4} ${SMS_QR.n + 4}" role="img" aria-label="Ilovani yuklab olish uchun QR kod" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${SMS_QR.n + 4}" height="${SMS_QR.n + 4}" fill="#fff"/><path d="${SMS_QR.d}" fill="#0F172A"/></svg>`;
const smsVaqt = ms => (ms ? vaqtMatn(ms) : "—");
function smsXavfsizBlok(ochiq = true) {
  const l = ["SMS’laringizni o‘qimaydi", "Qo‘ng‘iroq, kontakt, rasm va fayllarga kirmaydi", "Bank kartasi, hisob va pulga hech qanday aloqasi yo‘q",
    "Faqat siz yozgan odamlarga yuboradi", "Har bir SMS shu ro‘yxatda ko‘rinadi", `Rasmiy ilova, ${esc("Vector Studio")} imzosi bilan`];
  return `<details class="card sms-xavfsiz" ${ochiq ? "open" : ""}><summary><b>🔒 Xavfsiz va shaffof</b></summary>
    <ul class="sms-belgilar">${l.map(x => `<li>${icon("check2", 16)}<span>${x}</span></li>`).join("")}</ul>
    <p class="muted sm" style="margin:0">Telefon «Play Protect: xavfli bo‘lishi mumkin» desa: <b>Batafsil</b> → <b>Baribir o‘rnatish</b>. Ilova Play Market’da emas, shuning uchun telefon shunday ogohlantiradi.</p></details>`;
}
function smsTarifQulf() {
  const g = (SMS.j && SMS.j.global) || {}, L = DB.litsenziya, lh = litsenziyaHolati();
  return lh.tur === "faol" && Array.isArray(g.tariflar) && !g.tariflar.includes(L.tarif);
}

function renderAvtoSms() {
  if (DB.meta.demo) return boshHolat({ ic: "message", sarlavha: "Demo rejimida ishlamaydi", matn: "Avto-SMS markaz ro‘yxatdan o‘tgandan keyin ishlaydi." });
  if (!Sinx.faol()) return boshHolat({ ic: "message", sarlavha: "Server ulanmagan", matn: "Avto-SMS uchun markaz tizimga ulangan bo‘lishi kerak." });
  if (!SMS.taymer) smsTaymer();
  if (!SMS.yuklanmoqda && Date.now() - SMS.oxirgi > 15000) smsYangila(true);   // bo‘lim ochilganda yangi holat
  smsIlovaVersiya();
  if (!SMS.j) return SMS.xato ? boshHolat({ ic: "alert", sarlavha: "Ochilmadi", matn: esc(SMS.xato), tugma: `<button class="btn btn-primary" data-act="sms-yangila">${icon("refresh", 18)} Qayta urinish</button>` })
    : `<p class="yuklanmoqda" style="text-align:center"><span class="aylana" aria-hidden="true"></span> Yuklanmoqda…</p>`;
  const j = SMS.j, c = j.cfg, q = j.qurilma;
  let h = SMS.xato ? `<div class="info-quti"><span class="matn qizil">${esc(SMS.xato)}</span></div>` : "";

  // Tarif mos emas yoki markaz cheklangan — bo‘lim qulflangan
  if (!j.ruxsat) {
    const tarif = smsTarifQulf();
    return h + `<section class="card forma sms-qulf" style="max-width:640px"><div class="card-h" style="margin:0"><h2>🔒 Avto-SMS</h2><span class="pill">${tarif ? "Tarifda yo‘q" : "To‘xtatilgan"}</span></div>
      <p style="margin:0">${esc(j.sabab || "Avto-SMS hozir mavjud emas.")}</p>
      <p class="muted sm" style="margin:0">Avto-SMS: qarzdorlarga va ${T.otaOna}larga eslatmalar markazingiz telefonidagi SIM kartadan avtomatik ketadi.</p>
      ${tarif && direktorMi() ? `<div class="amal-qator"><button class="btn btn-primary" data-act="litsenziya-och">Tarifni oshirish</button></div>` : ""}</section>`;
  }

  // 1. Rozilik
  if (!c.agreed) return h + `<section class="card forma" style="max-width:680px"><div class="card-h" style="margin:0"><h2>Avto-SMS</h2><span class="pill primary">Yangi</span></div>
      <p style="margin:0">Eslatmalar markazingiz telefonidagi <b>o‘z SIM kartangizdan</b> avtomatik ketadi: qarz eslatmalari, kelmaganlik haqida xabar va boshqalar. Pullik SMS xizmati kerak emas.</p>
      <ol class="qadamlar"><li>Telefonga «O‘quv Markaz SMS» ilovasini o‘rnatasiz (faqat Android).</li><li>Ilovani CRM’ga 6 xonali kod bilan ulaysiz.</li><li>Telefon zaryadda va internetda tursa, SMS’lar o‘zi ketadi. Har biri shu yerda ko‘rinadi.</li></ol>
      <label class="toggle sms-rozi"><input type="checkbox" id="sms-rozi" ${SMS.rozi ? "checked" : ""}><span>SMS’lar sizning SIM kartangizdan ketadi va operator tarifingiz bo‘yicha hisoblanadi.</span></label>
      <div class="amal-qator"><button class="btn btn-primary" id="sms-rozi-btn" data-act="sms-rozi" ${SMS.rozi ? "" : "disabled"}>Davom etish</button></div></section>`
    + smsXavfsizBlok();

  // 2. Telefon ulanmagan — 3 qadam
  if (!q) {
    const yuklash = iPhoneMi()
      ? `<div class="info-quti"><span class="matn"><b>Avto-SMS faqat Android telefon orqali ishlaydi.</b> Bu QR kodni markazning Android telefonida skanerlang.</span></div><div class="sms-qr-joy">${smsQrSvg()}</div>`
      : androidMi() && !smsKeng() ? `<a class="btn btn-primary" href="${SMS_ILOVA}" rel="noopener">${icon("download", 18)} Ilovani yuklab olish</a>`
      : `<div class="sms-qr-qator"><div class="sms-qr-joy">${smsQrSvg()}</div><p class="muted sm" style="margin:0">Markazning Android telefonida kamera bilan QR kodni skanerlang yoki shu havolani telefonda oching:<br><a href="${SMS_ILOVA}" rel="noopener" class="link">${esc(SMS_ILOVA.replace("https://", ""))}</a></p></div>`;
    const kodQoldi = SMS.kod ? Math.max(0, Math.ceil((SMS.kodMuddat - Date.now()) / 60000)) : 0;
    return h + `<section class="card forma" style="max-width:760px"><div class="card-h" style="margin:0"><h2>Telefonni ulash</h2><span class="pill warn">Ulanmagan</span></div>
      <div class="sms-qadam"><span class="sms-raqam">1</span><div class="forma" style="gap:10px"><b>Ilovani yuklab olish</b>${yuklash}</div></div>
      <div class="sms-qadam"><span class="sms-raqam">2</span><div><b>Ilovani ochib ruxsat berish</b>
        <p class="muted sm" style="margin:4px 0 0">O‘rnating va oching. «SMS yuborish» va «Bildirishnomalar»ga ruxsat bering. Ilova batareya sozlamasini ko‘rsatadi — bir marta sozlang, aks holda telefon ilovani to‘xtatib qo‘yadi.</p></div></div>
      <div class="sms-qadam"><span class="sms-raqam">3</span><div class="forma" style="gap:10px"><b>Ulash kodini olish</b>
        ${SMS.kod ? `<div class="sms-kod" aria-live="polite">${esc(SMS.kod.slice(0, 3))} ${esc(SMS.kod.slice(3))}</div>
          <p class="muted sm" style="margin:0">Kodni telefondagi ilovaga yozing. Telefon ulanishi bilan bu oyna o‘zi yopiladi. Kod ${kodQoldi} daqiqa amal qiladi.</p>`
          : `<button class="btn btn-primary" data-act="sms-kod">${icon("key", 18)} Ulash kodini olish</button>`}</div></div>
      <p class="xato" id="sms-xato" hidden></p></section>` + smsXavfsizBlok(false);
  }

  // 3. Ulangan: holat, sozlamalar, tarix
  const s = j.stat, eskiIlova = SMS.ilova && q.appCode && SMS.ilova.code > q.appCode;
  h += eskiIlova ? `<div class="info-quti sms-yangi"><span class="matn"><b>Yangi versiya chiqdi (${esc(SMS.ilova.name || "")}).</b> Telefondagi ilovada «Yangilash» tugmasini bosing. Ulanish va sozlamalar saqlanadi.</span>
      ${SMS.ilova.notes && SMS.ilova.notes.uz ? `<span class="muted sm">${esc(SMS.ilova.notes.uz)}</span>` : ""}</div>` : "";
  if (j.global && j.global.off) h += `<div class="info-quti"><span class="matn qizil">Avto-SMS sotuvchi tomonidan vaqtincha to‘xtatilgan.</span></div>`;
  h += `<div class="ikki-ustun">
    <section class="card forma"><div class="card-h" style="margin:0"><h2>Telefon</h2>${q.online ? `<span class="pill ok">Onlayn</span>` : `<span class="pill bad">Onlayn emas</span>`}</div>
      <div class="kredit"><div><span>Model</span><b>${esc(q.model || "—")}</b></div><div><span>SIM</span><b>${esc(q.sim || "—")}</b></div>
        <div><span>Oxirgi aloqa</span><b>${smsVaqt(q.lastPing)}</b></div><div><span>Ilova versiyasi</span><b>${esc(q.appVer || "—")}</b></div></div>
      ${q.online ? "" : `<p class="muted sm" style="margin:0">Telefon 3 daqiqadan beri aloqaga chiqmadi. Internet, zaryad va ilovadagi YONIQ tugmasini tekshiring. SMS’lar navbatda kutadi.</p>`}
      <div class="xulosa"><div class="k"><b>${s.yuborildi}</b><span>Bugun yuborildi</span></div><div><b>${s.navbatda}</b><span>Navbatda</span></div>
        <div class="m"><b>${s.xato}</b><span>Xato</span></div><div class="s"><b>${s.ishlatildi}/${s.limit}</b><span>Kunlik limit</span></div></div></section>
    ${smsSozlamaKarta(c, j)}</div>`;
  h += smsTarixKarta(j.tarix || []);
  h += `<div class="amal-qator"><button class="btn btn-ghost btn-qizil-matn" data-act="sms-uz">${icon("logout", 18)} Telefonni uzish</button></div>` + smsXavfsizBlok(false);
  return h;
}

function smsSozlamaKarta(c, j) {
  const soatlar = Array.from({ length: 24 }, (_, i) => pad2(i) + ":00"), limitlar = [10, 20, 30, 40, 50, 60, 80, 100, 120, 150];
  const qm = smsQismlar(c.matn);
  return `<section class="card"><form id="sms-soz" class="forma" novalidate><div class="card-h" style="margin:0"><h2>Sozlamalar</h2></div>
    <label class="toggle"><input type="checkbox" id="sms-auto" ${c.auto ? "checked" : ""}><span>Avtomatik qarz eslatmasi</span></label>
    <p class="muted sm" style="margin:-6px 0 0">Har kuni soat 10:00 dan keyin (ish vaqtida) to‘lov muddati quyidagi kunlarga o‘tgan qarzdorlarga ketadi. Bir odamga 3 kunda ko‘pi bilan 1 ta SMS.</p>
    <div class="maydon"><span>Muddati o‘tganiga</span><div class="chiplar sms-kunlar">${(j.kunlar || [1, 3, 7, 14, 30]).map(k => `<label class="chip sms-kun"><input type="checkbox" name="sms-kun" value="${k}" ${c.kunlar.includes(k) ? "checked" : ""}> ${k} kun</label>`).join("")}</div></div>
    <div class="sms-qator"><label class="maydon"><span>Kunlik limit</span><select id="sms-limit">${limitlar.map(n => `<option value="${n}" ${n === c.limit ? "selected" : ""}>${n} ta</option>`).join("")}</select></label>
      <div class="maydon"><span>Ish vaqti</span><div class="sms-vaqt"><select id="sms-from" aria-label="Boshlanishi">${soatlar.map(t => `<option ${t === c.from ? "selected" : ""}>${t}</option>`).join("")}</select>
        <select id="sms-to" aria-label="Tugashi">${soatlar.slice(1).concat("23:00").filter((t, i, a) => a.indexOf(t) === i).map(t => `<option ${t === c.to ? "selected" : ""}>${t}</option>`).join("")}</select></div></div></div>
    <label class="maydon"><span>Eslatma matni</span><textarea id="sms-matn" rows="4">${esc(c.matn)}</textarea></label>
    <div class="chiplar orala">${["markaz", "ism", "summa", "davr", "tel"].map(k => `<button type="button" class="chip" data-act="sms-qolip" data-k="${k}">[${k}]</button>`).join("")}
      <button type="button" class="chip" data-act="sms-matn-asl">Asl matn</button></div>
    <p class="muted sm" id="sms-qism" style="margin:0">${smsQismMatn(qm)}</p>
    <label class="maydon"><span>Matn oxiridagi telefon [tel]</span><input id="sms-tel" value="${esc(c.tel || "")}" placeholder="${esc(markazTel())}"></label>
    <p class="xato" id="sms-soz-xato" hidden></p>
    <button type="submit" class="btn btn-primary">Saqlash</button></form></section>`;
}
const smsQismMatn = q => q.belgi ? `${q.belgi} belgi · ${q.qism} ta SMS${q.gsm === false ? " (kirill yoki maxsus belgi bor — har SMS 70 belgi)" : ""}. [ism], [summa] o‘rniga haqiqiy qiymat qo‘yiladi.` : "";

function smsTarixKarta(l) {
  const ism = x => { const o = x.pid && oquvchi(x.pid); return o ? o.ism : ""; };
  const navbat = l.filter(x => x.status === "queued").length;
  return `<section class="card"><div class="card-h"><h2>Tarix</h2><div class="amal-qator" style="margin:0">
      ${navbat ? `<button class="btn btn-ghost btn-sm" data-act="sms-bekor-hammasi">Navbatdagini bekor qilish (${navbat})</button>` : ""}
      <button class="icon-btn" data-act="sms-yangila" aria-label="Yangilash">${icon("refresh", 18)}</button></div></div>
    ${l.length ? `<div class="royxat sms-tarix">${l.map(x => {
      const [nom, cls] = SMS_HOLAT[x.status] || [x.status, ""];
      return `<div class="qator"><div class="q-mat"><span class="q-nom">${esc(ism(x) || x.phone)}${ism(x) ? ` <span class="muted sm">${esc(x.phone)}</span>` : ""}</span>
        <span class="q-sub">${esc(x.text)}</span>
        <span class="q-sub">${smsVaqt(x.sentAt || x.createdAt)} · ${x.source === "auto" ? "Avtomatik" : "Qo‘lda"}${x.error ? ` · <span class="qizil">${esc(x.error)}</span>` : ""}</span></div>
        <div class="q-ong"><span class="pill ${cls}">${nom}</span>${x.status === "queued" ? `<button class="btn btn-ghost btn-sm" data-act="sms-bekor" data-id="${esc(x.id)}">Bekor qilish</button>` : ""}</div></div>`;
    }).join("")}</div>` : `<p class="bosh-matn">Hali SMS yo‘q. Xabarlar bo‘limida «Avtomatik yuborish (telefon orqali)»ni bosing.</p>`}</section>`;
}

/* ---------- Hodisalar ---------- */
Object.assign(AMALLAR, {
  "sms-yangila": () => smsYangila(),
  "sms-rozi": async el => {
    el.disabled = true;
    try { SMS.j = await smsSorov("smsSet", { cfg: { agreed: true } }); SMS.saqla(); } catch (e) { toast(e.message, "warn"); el.disabled = false; }
    render();
  },
  "sms-kod": async el => {
    el.disabled = true;
    try {
      const j = await smsSorov("smsPairCode");
      SMS.kod = j.code; SMS.kodMuddat = j.muddat || Date.now() + 600000; render();
      // Telefon ulanishini kutadi: ulanishi bilan oyna o‘zi yopiladi
      clearInterval(SMS.kodTaymer);
      SMS.kodTaymer = setInterval(async () => {
        if (Date.now() > SMS.kodMuddat || UI.bolim !== "avtosms") { clearInterval(SMS.kodTaymer); SMS.kod = ""; rejaRender(); return; }
        await smsYangila(true);
        if (SMS.j && SMS.j.qurilma) { clearInterval(SMS.kodTaymer); SMS.kod = ""; render(); toast("Telefon ulandi: " + (SMS.j.qurilma.model || "")); smsSnap(true); }
      }, 4000);
    } catch (e) { el.disabled = false; xatoKorsat("#sms-xato", e.name === "TypeError" ? "Internet yo‘q yoki server javob bermadi." : e.message); }
  },
  "sms-uz": async () => {
    if (!(await tasdiq("Telefon CRM’dan uziladi va SMS yuborish to‘xtaydi. Qayta ulash uchun yangi kod kerak bo‘ladi.", { tugma: "Uzish", xavfli: true, sarlavha: "Telefonni uzish" }))) return;
    try { SMS.j = await smsSorov("smsUnpair"); SMS.saqla(); toast("Telefon uzildi"); } catch (e) { toast(e.message, "warn"); }
    render();
  },
  "sms-bekor": async el => {
    el.disabled = true;
    try { SMS.j = await smsSorov("smsCancel", { smsId: el.dataset.id }); toast("Bekor qilindi"); } catch (e) { toast(e.message, "warn"); }
    render();
  },
  "sms-bekor-hammasi": async () => {
    if (!(await tasdiq("Navbatdagi barcha SMS’lar bekor qilinadi.", { tugma: "Bekor qilish", xavfli: true }))) return;
    try { SMS.j = await smsSorov("smsCancel", { all: true }); toast("Navbat tozalandi"); } catch (e) { toast(e.message, "warn"); }
    render();
  },
  "sms-qolip": el => {
    const t = $("#sms-matn"); if (!t) return;
    const s = t.selectionStart ?? t.value.length, q = "[" + el.dataset.k + "]";
    t.value = t.value.slice(0, s) + q + t.value.slice(t.selectionEnd ?? s); t.focus(); t.setSelectionRange(s + q.length, s + q.length);
    $("#sms-qism").textContent = smsQismMatn(smsQismlar(t.value)).replace(/<[^>]+>/g, "");
  },
  "sms-matn-asl": () => { const t = $("#sms-matn"); if (t && SMS.j) { t.value = SMS.j.stdMatn || t.value; $("#sms-qism").textContent = smsQismMatn(smsQismlar(t.value)); } },
  // Xabarlar oynasidagi birinchi variant: navbatga qo‘yadi, telefon o‘z SIM kartasidan yuboradi
  "sms-yubor": async el => {
    const t = document.getElementById(el.dataset.target), matn = t ? t.value.trim() : "";
    if (!el.dataset.tel) return toast("Telefon raqami kiritilmagan", "warn");
    if (!matn) return toast("Xabar matni bo‘sh", "warn");
    el.disabled = true; const asl = el.innerHTML; el.textContent = "Navbatga qo‘yilmoqda…";
    try {
      const j = await smsSorov("smsEnqueue", { items: [{ pid: el.dataset.pid || "", phone: el.dataset.tel, text: matn }], source: smsKeng() ? "pc" : "manual" });
      if (j.qoshildi) { el.innerHTML = `${icon("check2", 18)} Navbatda — telefon yuboradi`; toast("Navbatga qo‘shildi. Telefon 1 daqiqa ichida yuboradi."); }
      else { el.disabled = false; el.innerHTML = asl; toast((j.rad && j.rad[0] && j.rad[0].sabab) || "Qo‘shilmadi", "warn"); }
    } catch (e) { el.disabled = false; el.innerHTML = asl; toast(e.name === "TypeError" ? "Internet yo‘q" : e.message, "warn"); }
  },
  // O‘quvchi kartasidagi «Avto-SMS yuborilmasin»
  "sms-taqiq": el => {
    const o = oquvchi(el.dataset.id); if (!o) return;
    Ombor.yoz("oquvchilar", { ...o, noAutoSms: !o.noAutoSms });
    toast(o.noAutoSms ? "Avto-SMS yana yuboriladi" : "Bu " + T.oquvchi + "ga avtomatik SMS yuborilmaydi");
    oquvchiProfil(o.id); SMS.snapImzo = "";
  },
});
Object.assign(FORMALAR, {
  "sms-soz": async f => {
    const kunlar = $$('input[name="sms-kun"]:checked', f).map(x => +x.value), from = $("#sms-from").value, to = $("#sms-to").value;
    if (from >= to) return xatoKorsat("#sms-soz-xato", "Ish vaqti: boshlanishi tugashidan oldin bo‘lsin.");
    if ($("#sms-auto").checked && !kunlar.length) return xatoKorsat("#sms-soz-xato", "Kamida bitta kunni tanlang.");
    const btn = f.querySelector('[type="submit"]'); btn.disabled = true;
    try {
      SMS.j = await smsSorov("smsSet", { cfg: { auto: $("#sms-auto").checked, kunlar, limit: +$("#sms-limit").value, from, to, matn: $("#sms-matn").value, tel: $("#sms-tel").value.trim() } });
      SMS.saqla(); toast("Saqlandi"); render(); smsSnap(true);
    } catch (e) { btn.disabled = false; xatoKorsat("#sms-soz-xato", e.message); }
  },
});
document.addEventListener("change", e => {
  if (e.target.id === "sms-rozi") { SMS.rozi = e.target.checked; const b = $("#sms-rozi-btn"); if (b) b.disabled = !e.target.checked; }
});
document.addEventListener("input", e => {
  if (e.target.id === "sms-matn") { const p = $("#sms-qism"); if (p) p.textContent = smsQismMatn(smsQismlar(e.target.value)); }
});
