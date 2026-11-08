/**
 * O‘quv Markaz CRM — markazlar serveri (Google Apps Script + Google Sheets)
 *
 * Bu kod Google jadvalga biriktiriladi. Jadvalning «Markazlar» varag‘ida
 * har bir ro‘yxatdan o‘tgan o‘quv markaz bitta qator bo‘ladi.
 * O‘quvchilar, to‘lovlar va boshqa ma’lumotlar bu yerga KELMAYDI —
 * ular markazning o‘z qurilmasida qoladi. Bu yerda faqat markaz kartasi:
 * nomi, rahbar, telefon, holati (faol / bloklangan) va muddati.
 *
 * Sozlash: SOZLASH.md faylidagi qadamlarni bajaring.
 */

const VARAQ = "Markazlar";
const USTUNLAR = ["id", "token", "nomi", "rahbar", "tel", "manzil", "hajm", "login", "royxat", "sinovTugash", "tugash",
  "holat", "xabar", "izoh", "oxirgiKirish", "oquvchilar", "guruhlar", "xodimlar", "versiya"];
const SINOV_KUN = 14;
const VAQT_ZONA = "Asia/Tashkent";

/* ---------- 1. Bir marta ishga tushiriladi ---------- */
function sozlash() {
  const PAROL = "BU_YERGA_PAROL_YOZING";   // ← admin sayt paroli (kamida 8 belgi). Ishga tushirgach, bu qatorni o‘chirib qo‘ysangiz ham bo‘ladi
  if (PAROL === "BU_YERGA_PAROL_YOZING" || PAROL.length < 8) throw new Error("Avval PAROL ni o‘zingizning parolingizga almashtiring (kamida 8 belgi).");
  PropertiesService.getScriptProperties().setProperty("ADMIN_PAROL", PAROL);
  varaq();
  Logger.log("Tayyor. Endi Deploy → New deployment → Web app qiling.");
}

/* ---------- 2. Yordamchilar ---------- */
function varaq() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(VARAQ);
  if (!sh) {
    sh = ss.insertSheet(VARAQ);
    sh.getRange(1, 1, sh.getMaxRows(), USTUNLAR.length).setNumberFormat("@");   // hammasi oddiy matn: telefon va sanalar o‘zgarib ketmasin
    sh.getRange(1, 1, 1, USTUNLAR.length).setValues([USTUNLAR]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}
function bugun() { return Utilities.formatDate(new Date(), VAQT_ZONA, "yyyy-MM-dd"); }
function hozir() { return Utilities.formatDate(new Date(), VAQT_ZONA, "yyyy-MM-dd HH:mm"); }
function sanaQosh(s, kun) {
  const p = s.split("-").map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + kun));
  return d.toISOString().slice(0, 10);
}
function matn(v) {   // jadvalda qo‘lda yozilgan sana Date bo‘lib qolsa ham matnga keltiradi
  if (v instanceof Date) return Utilities.formatDate(v, VAQT_ZONA, "yyyy-MM-dd");
  return v === null || v === undefined ? "" : String(v);
}
function qatorlar(sh) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, USTUNLAR.length).getValues().map((r, i) => {
    const o = { _qator: i + 2 };
    USTUNLAR.forEach((k, j) => { o[k] = matn(r[j]); });
    return o;
  }).filter(o => o.id);
}
function yoz(sh, o) {
  const arr = USTUNLAR.map(k => (o[k] === undefined || o[k] === null ? "" : String(o[k])));
  if (o._qator) sh.getRange(o._qator, 1, 1, USTUNLAR.length).setValues([arr]);
  else sh.appendRow(arr);
}
const tel9 = t => String(t || "").replace(/\D/g, "").slice(-9);
function ochiq(o) {   // admin uchun: tokensiz
  const r = {}; USTUNLAR.forEach(k => { if (k !== "token") r[k] = o[k]; }); return r;
}
function holatJavob(o) {
  return { ok: true, id: o.id, nomi: o.nomi, holat: o.holat || "faol", sinovTugash: o.sinovTugash, tugash: o.tugash, xabar: o.xabar, bugun: bugun() };
}
function javob(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- 3. Kirish nuqtalari ---------- */
function doGet() { return javob({ ok: true, nom: "O‘quv Markaz CRM server", bugun: bugun() }); }

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (x) { return javob({ ok: false, xato: "So‘rov noto‘g‘ri." }); }
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (x) { return javob({ ok: false, xato: "Server band. Birozdan keyin urinib ko‘ring." }); }
  try { return javob(amal(d || {})); }
  catch (x) { return javob({ ok: false, xato: String((x && x.message) || x) }); }
  finally { lock.releaseLock(); }
}

/* ---------- 4. Amallar ---------- */
function amal(d) {
  const sh = varaq();

  // Yangi markaz ro‘yxatdan o‘tadi
  if (d.amal === "royxat") {
    const nomi = String(d.nomi || "").trim().slice(0, 120), rahbar = String(d.rahbar || "").trim().slice(0, 120), tel = String(d.tel || "").trim().slice(0, 40);
    if (!nomi || !rahbar || tel9(tel).length < 9) return { ok: false, xato: "Markaz nomi, rahbar va telefon to‘liq bo‘lsin." };
    const l = qatorlar(sh);
    const avval = l.some(o => tel9(o.tel) === tel9(tel));   // shu raqam avval ro‘yxatdan o‘tgan bo‘lsa, qayta bepul sinov berilmaydi
    const id = "M" + String(l.reduce((m, o) => Math.max(m, +String(o.id).slice(1) || 0), 0) + 1).padStart(4, "0");
    const b = bugun();
    const o = { id, token: Utilities.getUuid(), nomi, rahbar, tel, manzil: String(d.manzil || "").slice(0, 200), hajm: String(d.hajm || "").slice(0, 40),
      login: String(d.login || "").slice(0, 40), royxat: b, sinovTugash: sanaQosh(b, avval ? -1 : SINOV_KUN), tugash: "", holat: "faol",
      xabar: avval ? "Bu telefon raqami avval ro‘yxatdan o‘tgan. Davom ettirish uchun sotuvchiga murojaat qiling." : "", izoh: avval ? "Takroriy ro‘yxat" : "",
      oxirgiKirish: hozir(), oquvchilar: 0, guruhlar: 0, xodimlar: 1, versiya: String(d.versiya || "") };
    yoz(sh, o);
    return Object.assign(holatJavob(o), { token: o.token, takror: avval });
  }

  // Markaz dasturi har ochilganda holatini so‘raydi
  if (d.amal === "holat") {
    const o = qatorlar(sh).find(x => x.id === d.id);
    if (!o || o.token !== d.token) return { ok: false, kod: "topilmadi", xato: "Markaz tizimda topilmadi." };
    o.oxirgiKirish = hozir();
    const s = d.stat || {};
    ["oquvchilar", "guruhlar", "xodimlar", "versiya"].forEach(k => { if (s[k] !== undefined) o[k] = String(s[k]); });
    if (d.nomi) o.nomi = String(d.nomi).trim().slice(0, 120);
    yoz(sh, o);
    return holatJavob(o);
  }

  // ----- Admin amallari: parol talab qilinadi -----
  if (String(d.amal || "").indexOf("admin_") === 0) {
    const kesh = CacheService.getScriptCache(), xatolar = +(kesh.get("admin_xato") || 0);
    if (xatolar >= 10) return { ok: false, kod: "blok", xato: "Ko‘p marta noto‘g‘ri parol. 10 daqiqadan keyin urinib ko‘ring." };
    const parol = PropertiesService.getScriptProperties().getProperty("ADMIN_PAROL");
    if (!parol) return { ok: false, xato: "Server sozlanmagan: sozlash() funksiyasini ishga tushiring." };
    if (d.parol !== parol) { kesh.put("admin_xato", String(xatolar + 1), 600); return { ok: false, kod: "parol", xato: "Parol noto‘g‘ri." }; }

    if (d.amal === "admin_kirish") return { ok: true, bugun: bugun() };
    if (d.amal === "admin_royxat") return { ok: true, bugun: bugun(), markazlar: qatorlar(sh).map(ochiq) };

    const o = qatorlar(sh).find(x => x.id === d.id);
    if (!o) return { ok: false, xato: "Markaz topilmadi." };
    if (d.amal === "admin_ozgar") {
      const m = d.maydonlar || {};
      if (m.holat !== undefined) { if (["faol", "bloklangan"].indexOf(m.holat) < 0) return { ok: false, xato: "Holat noto‘g‘ri." }; o.holat = m.holat; }
      ["tugash", "sinovTugash"].forEach(k => { if (m[k] !== undefined) { if (m[k] && !/^\d{4}-\d{2}-\d{2}$/.test(m[k])) throw new Error("Sana noto‘g‘ri."); o[k] = m[k]; } });
      ["xabar", "izoh", "nomi", "rahbar", "tel", "manzil"].forEach(k => { if (m[k] !== undefined) o[k] = String(m[k]).slice(0, 500); });
      yoz(sh, o);
      return { ok: true, bugun: bugun(), markaz: ochiq(o) };
    }
    if (d.amal === "admin_ochir") { sh.deleteRow(o._qator); return { ok: true }; }
  }
  return { ok: false, xato: "Noma’lum amal." };
}
