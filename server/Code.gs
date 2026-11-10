/**
 * O‘quv Markaz CRM — markazlar serveri (Google Apps Script + Google Sheets)
 *
 * «Markazlar» varag‘i: har bir ro‘yxatdan o‘tgan o‘quv markaz — bitta qator
 *   (nomi, rahbar, telefon, holati, muddati, tarifi).
 * «Tolovlar» varag‘i: markazlarning obuna to‘lovlari (TezCheck orqali yoki naqd).
 * O‘quvchilar va markazning boshqa ma’lumotlari bu yerga KELMAYDI —
 * ular markazning o‘z qurilmasida qoladi.
 *
 * Sozlash: SOZLASH.md faylidagi qadamlarni bajaring.
 */

const VARAQ = "Markazlar";
const USTUNLAR = ["id", "token", "nomi", "rahbar", "tel", "manzil", "hajm", "login", "royxat", "sinovTugash", "tugash",
  "holat", "xabar", "izoh", "oxirgiKirish", "oquvchilar", "guruhlar", "xodimlar", "versiya", "tarif", "tiklash"];
const TOLOV_VARAQ = "Tolovlar";
const TOLOV_USTUNLAR = ["billId", "markazId", "markaz", "tarif", "oylar", "summa", "holat", "yaratildi", "tolandi", "usul", "havola", "muhit", "izoh"];
const XABAR_VARAQ = "Xabarlar";   // markaz ↔ sotuvchi chati (parolni unutish va boshqa savollar)
const XABAR_USTUNLAR = ["id", "markazId", "markaz", "kimdan", "turi", "matn", "vaqt", "oqildi", "login"];
const SINOV_KUN = 14;
const VAQT_ZONA = "Asia/Tashkent";

// Tariflar (oylik narx, so‘m). limit — faol o‘quvchilar soni (0 = cheksiz). filial — bir nechta filial ochish mumkinmi
const TARIFLAR = [
  { k: "start", nom: "Start", narx: 100000, limit: 100, filial: false },
  { k: "standart", nom: "Standart", narx: 150000, limit: 300, filial: false },
  { k: "premium", nom: "Premium", narx: 200000, limit: 0, filial: true },
];
const OYLAR = [1, 3, 6, 12];

// TezCheck to‘lov tizimi. Maxfiy API kalit kodda EMAS: Project Settings → Script properties → TEZCHECK_KALIT
const TEZCHECK = "https://api.tezcheck.uz/api/merchant/v1";
const KASSA_KODI = "cdk_BO4xr5eNqXXsuxNz5SpNTX1CLomQ";   // sir emas, kassani bildiradi
const CRM_MANZIL = "https://xusniddin-del.github.io/oquv-markaz-crm/";

/* ---------- 1. Sozlash (birinchi marta va har yangilanishdan keyin bir marta Run) ---------- */
function sozlash() {
  const PAROL = "BU_YERGA_PAROL_YOZING";   // ← admin parolni almashtirmoqchi bo‘lsangizgina yozing (kamida 8 belgi)
  const TEZCHECK_KALIT = "";                // ← TezCheck maxfiy API kaliti (aps_…). Bir marta Run qilgach, bu yerdan o‘chirib qo‘ysangiz bo‘ladi
  const P = PropertiesService.getScriptProperties();
  if (TEZCHECK_KALIT) P.setProperty("TEZCHECK_KALIT", TEZCHECK_KALIT.trim());
  if (PAROL !== "BU_YERGA_PAROL_YOZING") {
    if (PAROL.length < 8) throw new Error("Parol kamida 8 belgi bo‘lsin.");
    P.setProperty("ADMIN_PAROL", PAROL);
  }
  if (!P.getProperty("ADMIN_PAROL")) throw new Error("Admin parol hali qo‘yilmagan: PAROL qatoriga parol yozib, qayta Run qiling.");
  varaq(); tolovVaraq(); xabarVaraq();
  // Kutilayotgan to‘lovlarni har 10 daqiqada tekshiruvchi taymer
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "tolovlarniTekshir").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("tolovlarniTekshir").timeBased().everyMinutes(10).create();
  Logger.log(P.getProperty("TEZCHECK_KALIT") ? "Tayyor. To‘lov tizimi ulangan." : "Tayyor. Diqqat: TEZCHECK_KALIT qo‘yilmagan — online to‘lov ishlamaydi.");
}

/* ---------- 2. Yordamchilar ---------- */
function varaqOl(nom, ustunlar) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(nom);
  if (!sh) { sh = ss.insertSheet(nom); sh.setFrozenRows(1); }
  const sar = sh.getRange(1, 1, 1, ustunlar.length).getValues()[0];
  if (ustunlar.some((u, i) => sar[i] !== u)) {   // yangi ustun qo‘shilgan bo‘lsa, sarlavhani yangilaydi
    sh.getRange(1, 1, sh.getMaxRows(), ustunlar.length).setNumberFormat("@");   // hammasi oddiy matn: telefon va sanalar o‘zgarib ketmasin
    sh.getRange(1, 1, 1, ustunlar.length).setValues([ustunlar]).setFontWeight("bold");
  }
  return sh;
}
const varaq = () => varaqOl(VARAQ, USTUNLAR);
const tolovVaraq = () => varaqOl(TOLOV_VARAQ, TOLOV_USTUNLAR);
const xabarVaraq = () => varaqOl(XABAR_VARAQ, XABAR_USTUNLAR);
function bugun() { return Utilities.formatDate(new Date(), VAQT_ZONA, "yyyy-MM-dd"); }
function hozir() { return Utilities.formatDate(new Date(), VAQT_ZONA, "yyyy-MM-dd HH:mm"); }
function sanaQosh(s, kun) {
  const p = s.split("-").map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + kun));
  return d.toISOString().slice(0, 10);
}
function oyQosh(s, n) {
  const p = s.split("-").map(Number), d = new Date(Date.UTC(p[0], p[1] - 1 + n, 1));
  const oxir = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return Utilities.formatDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), Math.min(p[2], oxir), 12)), "UTC", "yyyy-MM-dd");
}
function matn(v) {   // jadvalda qo‘lda yozilgan sana Date bo‘lib qolsa ham matnga keltiradi
  if (v instanceof Date) return Utilities.formatDate(v, VAQT_ZONA, "yyyy-MM-dd");
  return v === null || v === undefined ? "" : String(v);
}
function qatorlarOl(sh, ustunlar, kalit) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, ustunlar.length).getValues().map((r, i) => {
    const o = { _qator: i + 2 };
    ustunlar.forEach((k, j) => { o[k] = matn(r[j]); });
    return o;
  }).filter(o => o[kalit]);
}
function yozOl(sh, ustunlar, o) {
  const arr = ustunlar.map(k => (o[k] === undefined || o[k] === null ? "" : String(o[k])));
  if (o._qator) sh.getRange(o._qator, 1, 1, ustunlar.length).setValues([arr]);
  else sh.appendRow(arr);
}
const qatorlar = sh => qatorlarOl(sh, USTUNLAR, "id");
const yoz = (sh, o) => yozOl(sh, USTUNLAR, o);
const tolovlar = sh => qatorlarOl(sh, TOLOV_USTUNLAR, "billId");
const tolovYoz = (sh, o) => yozOl(sh, TOLOV_USTUNLAR, o);
const xabarlar = sh => qatorlarOl(sh, XABAR_USTUNLAR, "id");
const xabarYoz = (sh, o) => yozOl(sh, XABAR_USTUNLAR, o);
const YASHIRIN = "••••••••";
// Chat xabarini tashqariga chiqarish. Yangi parol faqat markazga, faqat bir marta ochiq ko‘rinadi
function xabarOchiq(x, parolBilan) {
  const r = { id: x.id, kimdan: x.kimdan, turi: x.turi, matn: x.turi === "parol" && !parolBilan ? YASHIRIN : x.matn, vaqt: +x.vaqt, oqildi: x.oqildi, login: x.login };
  return r;
}
function chatXabarlar(markazId, sh) {
  return xabarlar(sh || xabarVaraq()).filter(x => x.markazId === markazId).sort((a, b) => +a.vaqt - +b.vaqt).slice(-60);
}
const tel9 = t => String(t || "").replace(/\D/g, "").slice(-9);
const prop = k => PropertiesService.getScriptProperties().getProperty(k);
const tarifOl = k => TARIFLAR.find(t => t.k === k);
function ochiq(o) {   // admin uchun: token va tiklash kodisiz
  const r = {}; USTUNLAR.forEach(k => { if (k !== "token" && k !== "tiklash") r[k] = o[k]; }); return r;
}
function holatJavob(o, kutilayotgan) {
  return { ok: true, id: o.id, nomi: o.nomi, holat: o.holat || "faol", sinovTugash: o.sinovTugash, tugash: o.tugash, xabar: o.xabar,
    tarif: o.tarif || "", tariflar: TARIFLAR, oylar: OYLAR, tolovYoqilgan: !!prop("TEZCHECK_KALIT"), kutilayotgan: kutilayotgan || 0, bugun: bugun() };
}
function javob(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- 3. TezCheck ---------- */
function tcSorov(yol, body, idem) {
  const kalit = prop("TEZCHECK_KALIT");
  if (!kalit) throw new Error("Online to‘lov hali ulanmagan. Sotuvchiga murojaat qiling.");
  const h = { Authorization: "Bearer " + kalit, "X-Cash-Desk-Code": prop("KASSA_KODI") || KASSA_KODI, Accept: "application/json" };
  if (idem) h["Idempotency-Key"] = idem;
  const r = UrlFetchApp.fetch(TEZCHECK + yol, { method: "post", contentType: "application/json", headers: h, payload: JSON.stringify(body || {}), muteHttpExceptions: true });
  const kod = r.getResponseCode();
  let j = {}; try { j = JSON.parse(r.getContentText()); } catch (e) {}
  if (kod >= 300) { const e = j.error || {}; throw new Error("To‘lov tizimi: " + (e.code ? e.code + " — " : "") + (e.message || ("HTTP " + kod))); }
  return j.data || {};
}

// Markaz obunasini uzaytiradi: joriy muddat (yoki bugun) ustiga oylar qo‘shiladi
function uzaytir(o, tarif, oylar) {
  const boshi = [bugun(), o.tugash || "", o.sinovTugash || ""].sort().pop();
  o.tugash = oyQosh(boshi, +oylar);
  o.tarif = tarif;
}

// Bitta chekni TezCheck'dan so‘raydi. To‘langan bo‘lsa — markaz muddati uzayadi
function chekTekshir(tsh, msh, t) {
  const d = tcSorov("/bills/" + encodeURIComponent(t.billId), {});
  const b = d.bill || {}, p = d.payment || {};
  const tolangan = d.paid === true || b.paid === true || p.state === "succeeded";
  const muhit = d.environment || b.environment || p.environment || (d.livemode === false || b.livemode === false ? "test" : "live");
  const summaOk = !p.amount_minor || +p.amount_minor >= +t.summa * 100;
  if (tolangan && summaOk && (muhit === "live" || prop("TEST_TOLOV") === "ha")) {
    t.holat = "tolandi"; t.tolandi = hozir(); t.usul = p.provider_code || ""; t.muhit = muhit;
    tolovYoz(tsh, t);
    const o = qatorlar(msh).find(x => x.id === t.markazId);
    if (o) { uzaytir(o, t.tarif, t.oylar); yoz(msh, o); }
    return "tolandi";
  }
  if (!tolangan && ["expired", "revoked", "exhausted"].indexOf(b.state) >= 0) { t.holat = "bekor"; t.izoh = "Chek " + b.state; tolovYoz(tsh, t); return "bekor"; }
  return "kutilmoqda";
}

// Kutilayotgan cheklarni tekshiradi (3 kundan eskilari «eskirdi» bo‘ladi). Qolgan kutilayotganlar sonini qaytaradi
function kutilayotganlar(markazId) {
  const tsh = tolovVaraq(), msh = varaq(), chegara = sanaQosh(bugun(), -3);
  let qoldi = 0;
  tolovlar(tsh).filter(t => t.holat === "kutilmoqda" && (!markazId || t.markazId === markazId)).forEach(t => {
    if (t.yaratildi.slice(0, 10) < chegara) { t.holat = "eskirdi"; tolovYoz(tsh, t); return; }
    try { if (chekTekshir(tsh, msh, t) === "kutilmoqda") qoldi++; } catch (e) { qoldi++; }
  });
  return qoldi;
}

// Taymer (har 10 daqiqada): markaz to‘lov sahifasidan qaytmasa ham to‘lov hisobga olinadi
function tolovlarniTekshir() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try { kutilayotganlar(); } finally { lock.releaseLock(); }
}

/* ---------- 4. Kirish nuqtalari ---------- */
function doGet() { return javob({ ok: true, nom: "O‘quv Markaz CRM server", bugun: bugun() }); }

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (x) { return javob({ ok: false, xato: "So‘rov noto‘g‘ri." }); }
  const lock = LockService.getScriptLock();
  try { lock.waitLock(25000); } catch (x) { return javob({ ok: false, xato: "Server band. Birozdan keyin urinib ko‘ring." }); }
  try { return javob(amal(d || {})); }
  catch (x) { return javob({ ok: false, xato: String((x && x.message) || x) }); }
  finally { lock.releaseLock(); }
}

/* ---------- 5. Amallar ---------- */
function markazTop(sh, d) {
  const o = qatorlar(sh).find(x => x.id === d.id);
  return o && o.token === d.token ? o : null;
}

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
      xabar: avval ? "Bu telefon raqami avval ro‘yxatdan o‘tgan, shuning uchun bepul sinov berilmadi. Tarif tanlab to‘lang yoki sotuvchiga murojaat qiling." : "", izoh: avval ? "Takroriy ro‘yxat" : "",
      oxirgiKirish: hozir(), oquvchilar: 0, guruhlar: 0, xodimlar: 1, versiya: String(d.versiya || ""), tarif: "" };
    yoz(sh, o);
    return Object.assign(holatJavob(o), { token: o.token, takror: avval });
  }

  // Markaz dasturi har ochilganda holatini so‘raydi (kutilayotgan to‘lovlar ham shu yerda tekshiriladi)
  if (d.amal === "holat" || d.amal === "tolov_tekshir") {
    if (!markazTop(sh, d)) return { ok: false, kod: "topilmadi", xato: "Markaz tizimda topilmadi." };
    const kutilayotgan = kutilayotganlar(d.id);
    const o = markazTop(sh, d);   // to‘lov muddatni o‘zgartirgan bo‘lishi mumkin — qayta o‘qiladi
    o.oxirgiKirish = hozir();
    const s = d.stat || {};
    ["oquvchilar", "guruhlar", "xodimlar", "versiya"].forEach(k => { if (s[k] !== undefined) o[k] = String(s[k]); });
    if (d.nomi) o.nomi = String(d.nomi).trim().slice(0, 120);
    yoz(sh, o);
    return holatJavob(o, kutilayotgan);
  }

  // Markaz tarif tanlab to‘lov qilmoqchi: TezCheck'da chek yaratiladi, to‘lov sahifasi havolasi qaytadi
  if (d.amal === "tolov_yarat") {
    const o = markazTop(sh, d);
    if (!o) return { ok: false, kod: "topilmadi", xato: "Markaz tizimda topilmadi." };
    if (o.holat === "bloklangan") return { ok: false, xato: "Markaz bloklangan. Sotuvchiga murojaat qiling." };
    const t = tarifOl(d.tarif), oylar = +d.oylar;
    if (!t || OYLAR.indexOf(oylar) < 0) return { ok: false, xato: "Tarif yoki muddat noto‘g‘ri." };
    const summa = t.narx * oylar, tsh = tolovVaraq();
    // Bir kun ichida xuddi shu tarif uchun yaratilgan to‘lanmagan chek bo‘lsa — o‘shani qaytaradi
    const bor = tolovlar(tsh).find(x => x.markazId === o.id && x.holat === "kutilmoqda" && x.tarif === t.k && +x.oylar === oylar && x.havola && x.yaratildi.slice(0, 10) >= sanaQosh(bugun(), -1));
    if (bor) return { ok: true, havola: bor.havola, billId: bor.billId, summa };
    const ref = o.id + "-" + t.k + "-" + oylar + "-" + Date.now();
    const r = tcSorov("/bills", {
      amount_minor: summa * 100,
      title: "O‘quv Markaz CRM — " + t.nom + " tarif, " + oylar + " oy",
      description: o.nomi + " (" + o.id + ")",
      external_reference: ref,
      return_url: CRM_MANZIL + "#tolov",
    }, ref);
    const billId = (r.bill || {}).id, havola = r.payment_url;
    if (!billId || !havola) throw new Error("To‘lov tizimi to‘lov havolasini bermadi.");
    tolovYoz(tsh, { billId, markazId: o.id, markaz: o.nomi, tarif: t.k, oylar, summa, holat: "kutilmoqda", yaratildi: hozir(), tolandi: "", usul: "", havola, muhit: "", izoh: (r.bill || {}).reference || "" });
    return { ok: true, havola, billId, summa };
  }

  // Markaz sotuvchiga yozadi (masalan «Parolni unutdim»). Kirmasdan ham ishlaydi: markaz tokeni qurilmada bor
  if (d.amal === "chat_yoz") {
    const o = markazTop(sh, d);
    if (!o) return { ok: false, kod: "topilmadi", xato: "Markaz tizimda topilmadi." };
    const turi = d.turi === "parol_sorov" ? "parol_sorov" : "matn";
    const matnT = String(d.matn || (turi === "parol_sorov" ? "Parolni unutdim" : "")).trim().slice(0, 1000);
    if (!matnT) return { ok: false, xato: "Xabar bo‘sh." };
    const xsh = xabarVaraq();
    xabarYoz(xsh, { id: "x" + Date.now() + Math.floor(Math.random() * 1000), markazId: o.id, markaz: o.nomi, kimdan: "markaz", turi, matn: matnT, vaqt: Date.now(), oqildi: "", login: String(d.login || "").slice(0, 40) });
    return { ok: true, xabarlar: chatXabarlar(o.id, xsh).map(x => xabarOchiq(x, false)) };
  }
  // Markaz chatni o‘qiydi. Sotuvchi yuborgan yangi parol shu yerda bir marta beriladi, keyin jadvalda yashiriladi
  if (d.amal === "chat_ol") {
    const o = markazTop(sh, d);
    if (!o) return { ok: false, kod: "topilmadi", xato: "Markaz tizimda topilmadi." };
    const xsh = xabarVaraq(), l = chatXabarlar(o.id, xsh), chiq = [];
    l.forEach(x => {
      const yangiParol = x.kimdan === "admin" && x.turi === "parol" && !x.oqildi;
      chiq.push(xabarOchiq(x, yangiParol));
      if (x.kimdan === "admin" && !x.oqildi) { x.oqildi = hozir(); if (yangiParol) x.matn = YASHIRIN; xabarYoz(xsh, x); }
    });
    return { ok: true, xabarlar: chiq };
  }

  // ----- Admin amallari: parol talab qilinadi -----
  if (String(d.amal || "").indexOf("admin_") === 0) {
    const kesh = CacheService.getScriptCache(), xatolar = +(kesh.get("admin_xato") || 0);
    if (xatolar >= 10) return { ok: false, kod: "blok", xato: "Ko‘p marta noto‘g‘ri parol. 10 daqiqadan keyin urinib ko‘ring." };
    const parol = prop("ADMIN_PAROL");
    if (!parol) return { ok: false, xato: "Server sozlanmagan: sozlash() funksiyasini ishga tushiring." };
    if (d.parol !== parol) { kesh.put("admin_xato", String(xatolar + 1), 600); return { ok: false, kod: "parol", xato: "Parol noto‘g‘ri." }; }

    if (d.amal === "admin_kirish") return { ok: true, bugun: bugun() };
    // Qo‘ng‘iroqcha: markazlardan kelgan o‘qilmagan xabarlar va suhbatlar ro‘yxati
    if (d.amal === "admin_bildirish") {
      const guruh = {};
      xabarlar(xabarVaraq()).forEach(x => {
        const g = guruh[x.markazId] = guruh[x.markazId] || { markazId: x.markazId, markaz: x.markaz, oqilmagan: 0, parolSorov: false, oxirgi: null };
        if (x.kimdan === "markaz" && !x.oqildi) { g.oqilmagan++; if (x.turi === "parol_sorov") g.parolSorov = true; }
        if (!g.oxirgi || +x.vaqt > g.oxirgi.vaqt) g.oxirgi = xabarOchiq(x, false);
      });
      const suhbatlar = Object.keys(guruh).map(k => guruh[k]).sort((a, b) => (b.oqilmagan > 0) - (a.oqilmagan > 0) || b.oxirgi.vaqt - a.oxirgi.vaqt).slice(0, 50);
      return { ok: true, soni: suhbatlar.reduce((s, g) => s + g.oqilmagan, 0), suhbatlar };
    }
    if (d.amal === "admin_royxat") {
      if (d.tekshir) kutilayotganlar();
      return { ok: true, bugun: bugun(), markazlar: qatorlar(sh).map(ochiq), tolovlar: tolovlar(tolovVaraq()).map(t => { const r = Object.assign({}, t); delete r._qator; return r; }),
        tariflar: TARIFLAR, oylar: OYLAR, tolovYoqilgan: !!prop("TEZCHECK_KALIT") };
    }

    const o = qatorlar(sh).find(x => x.id === d.id);
    if (!o) return { ok: false, xato: "Markaz topilmadi." };
    if (d.amal === "admin_ozgar") {
      const m = d.maydonlar || {};
      if (m.holat !== undefined) { if (["faol", "bloklangan"].indexOf(m.holat) < 0) return { ok: false, xato: "Holat noto‘g‘ri." }; o.holat = m.holat; }
      if (m.tarif !== undefined) { if (m.tarif && !tarifOl(m.tarif)) return { ok: false, xato: "Tarif noto‘g‘ri." }; o.tarif = m.tarif; }
      ["tugash", "sinovTugash"].forEach(k => { if (m[k] !== undefined) { if (m[k] && !/^\d{4}-\d{2}-\d{2}$/.test(m[k])) throw new Error("Sana noto‘g‘ri."); o[k] = m[k]; } });
      ["xabar", "izoh", "nomi", "rahbar", "tel", "manzil"].forEach(k => { if (m[k] !== undefined) o[k] = String(m[k]).slice(0, 500); });
      yoz(sh, o);
      return { ok: true, bugun: bugun(), markaz: ochiq(o) };
    }
    // Naqd yoki kartaga o‘tkazilgan to‘lovni qo‘lda yozish: muddat uzayadi, tushumga qo‘shiladi
    if (d.amal === "admin_tolov_qosh") {
      const t = tarifOl(d.tarif), oylar = +d.oylar, summa = Math.max(0, Math.round(+d.summa || 0));
      if (!t || !(oylar >= 1 && oylar <= 24)) return { ok: false, xato: "Tarif yoki muddat noto‘g‘ri." };
      const tsh = tolovVaraq(), tol = { billId: "naqd-" + Date.now(), markazId: o.id, markaz: o.nomi, tarif: t.k, oylar, summa: summa || t.narx * oylar, holat: "tolandi",
        yaratildi: hozir(), tolandi: hozir(), usul: String(d.usul || "naqd").slice(0, 40), havola: "", muhit: "qo‘lda", izoh: String(d.izoh || "").slice(0, 300) };
      tolovYoz(tsh, tol);
      uzaytir(o, t.k, oylar); yoz(sh, o);
      const r = Object.assign({}, tol); delete r._qator;
      return { ok: true, bugun: bugun(), markaz: ochiq(o), tolov: r };
    }
    // Suhbatni ochish: markaz xabarlari o‘qilgan bo‘ladi
    if (d.amal === "admin_chat_ol") {
      const xsh = xabarVaraq(), l = chatXabarlar(o.id, xsh);
      l.forEach(x => { if (x.kimdan === "markaz" && !x.oqildi) { x.oqildi = hozir(); xabarYoz(xsh, x); } });
      return { ok: true, xabarlar: l.map(x => xabarOchiq(x, x.kimdan === "admin" && x.turi === "parol" && !x.oqildi)) };
    }
    // Sotuvchi javob yozadi yoki rahbarga yangi parol yuboradi (markaz qurilmasida avtomatik o‘rnatiladi)
    if (d.amal === "admin_chat_yoz") {
      const turi = d.turi === "parol" ? "parol" : "matn", matnT = String(d.matn || "").trim().slice(0, 1000);
      if (turi === "parol" && (matnT.length < 8 || matnT.length > 64)) return { ok: false, xato: "Parol 8–64 belgi bo‘lsin." };
      if (!matnT) return { ok: false, xato: "Xabar bo‘sh." };
      const xsh = xabarVaraq();
      xabarYoz(xsh, { id: "x" + Date.now() + Math.floor(Math.random() * 1000), markazId: o.id, markaz: o.nomi, kimdan: "admin", turi, matn: matnT, vaqt: Date.now(), oqildi: "", login: "" });
      return { ok: true, xabarlar: chatXabarlar(o.id, xsh).map(x => xabarOchiq(x, x.kimdan === "admin" && x.turi === "parol" && !x.oqildi)) };
    }
    if (d.amal === "admin_ochir") { sh.deleteRow(o._qator); return { ok: true }; }
  }
  return { ok: false, xato: "Noma’lum amal." };
}
