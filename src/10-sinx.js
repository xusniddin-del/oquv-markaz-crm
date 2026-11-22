
/* =====================================================================
   14. BULUTDA SAQLASH VA SINXRONLASH (Google Drive, Apps Script orqali)
   Har o‘zgarish (yozuv, o‘chirish, davomat, sozlama) navbatga tushadi va
   bir necha soniyada serverga yuboriladi. Boshqa qurilmalardagi o‘zgarishlar
   har daqiqada olinadi. Internet bo‘lmasa, navbat qurilmada kutadi.
   Bir yozuvni ikki qurilma o‘zgartirsa — oxirgisi qoladi; boshqa yozuvlar
   bir-biriga tegmaydi.
   ===================================================================== */
const Sinx = {
  h: { s: 0, navbat: {}, soz: "", sh: "", toliq: "" },   // s — serverdagi versiya; toliq: "" | "birinchi" | "almashtir"
  jim: false,        // serverdan kelganini qo‘llayotganda navbatga yozilmaydi
  ish: false, taymer: null, holat: "", oxirgi: 0, xatolar: 0,
  kalit: () => SOZLAMALAR.omborKaliti + "-sinx",
  faol: () => !!(SOZLAMALAR.server && DB.litsenziya.markazId && DB.litsenziya.token && !DB.meta.demo),
  yukla() {
    try { this.h = { s: 0, navbat: {}, soz: "", sh: "", toliq: "", ...JSON.parse(Mahalliy.ol(this.kalit()) || "{}") }; } catch (e) {}
    if (!this.h.s && !this.h.toliq) this.h.toliq = "birinchi";   // avvalgi versiyadagi markaz: hamma ma’lumot bir marta yuklanadi
  },
  saqla() { Mahalliy.qoy(this.kalit(), JSON.stringify(this.h)); },
  kutmoqda() { return Object.keys(this.h.navbat).length + (this.h.toliq ? 1 : 0); },
  belgila(n, k) {
    if (this.jim || k === undefined || k === null) return;
    this.h.navbat[n + "|" + k] = Date.now(); this.saqla(); this.rejala();
  },
  objTekshir() {
    if (this.jim) return;
    const a = JSON.stringify(DB.sozlamalar), b = JSON.stringify(DB.shablonlar);
    if (a !== this.h.soz) { this.h.soz = a; this.belgila("_obj", "sozlamalar"); }
    if (b !== this.h.sh) { this.h.sh = b; this.belgila("_obj", "shablonlar"); }
  },
  // Joriy qiymat (yo‘q bo‘lsa null — o‘chirilgan)
  qiymat(n, k) {
    if (n === "davomat" || n === "bekorlar") return k in DB[n] ? DB[n][k] : null;
    if (n === "_obj") return k === "sozlamalar" || k === "shablonlar" ? DB[k] : null;
    return (DB[n] || []).find(x => x.id === k) || null;
  },
  hammasi(t) {
    const r = [];
    KOLLEKSIYALAR.forEach(n => DB[n].forEach(x => { if (x.id) r.push({ n, k: x.id, v: x, t }); }));
    ["davomat", "bekorlar"].forEach(n => Object.keys(DB[n]).forEach(k => r.push({ n, k, v: DB[n][k], t })));
    r.push({ n: "_obj", k: "sozlamalar", v: DB.sozlamalar, t }, { n: "_obj", k: "shablonlar", v: DB.shablonlar, t });
    return r;
  },
  // Serverdan kelgan o‘zgarishlarni bazaga qo‘llaydi (qurilmada yuborilmagan yangiroq o‘zgarish bo‘lsa — o‘shani saqlaydi)
  qolla(ozg, db = DB) {
    let n = 0;
    for (const it of ozg || []) {
      const mahalliy = this.h.navbat[it.n + "|" + it.k];
      if (db === DB && mahalliy && mahalliy > it.t) continue;
      if (it.n === "davomat" || it.n === "bekorlar") { if (it.v === null) delete db[it.n][it.k]; else db[it.n][it.k] = it.v; }
      else if (it.n === "_obj") { if (it.v && (it.k === "sozlamalar" || it.k === "shablonlar")) db[it.k] = { ...db[it.k], ...it.v }; }
      else if (Array.isArray(db[it.n])) {
        const i = db[it.n].findIndex(x => x.id === it.k);
        if (it.v === null) { if (i >= 0) db[it.n].splice(i, 1); }
        else if (i >= 0) db[it.n][i] = it.v; else db[it.n].push(it.v);
      } else continue;
      n++;
    }
    if (db === DB) { this.h.soz = JSON.stringify(DB.sozlamalar); this.h.sh = JSON.stringify(DB.shablonlar); }
    return n;
  },
  rejala(ms = 2500) { clearTimeout(this.taymer); this.taymer = setTimeout(() => this.yubor(), ms); },
  async yubor() {
    if (!this.faol()) return false;
    if (this.ish) { this.rejala(3000); return false; }
    this.ish = true;
    const L = DB.litsenziya, toliq = this.h.toliq, navbat = { ...this.h.navbat };
    try {
      const ozg = toliq ? this.hammasi(toliq === "almashtir" ? Date.now() : 1) : Object.keys(navbat).map(nk => {
        const i = nk.indexOf("|"), n = nk.slice(0, i), k = nk.slice(i + 1);
        return { n, k, v: this.qiymat(n, k), t: navbat[nk] };
      });
      const j = await Server.sorov("sinx", { id: L.markazId, token: L.token, s: this.h.s, ozg, almashtir: toliq === "almashtir" });
      if (!j.ok) { const e = new Error(j.xato || "Server rad etdi"); e.kod = j.kod; throw e; }
      for (const nk in navbat) if (this.h.navbat[nk] === navbat[nk]) delete this.h.navbat[nk];
      if (this.h.toliq === toliq) this.h.toliq = "";
      this.jim = true;
      let n = 0;
      try { n = this.qolla(j.ozg); } finally { this.jim = false; }
      this.h.s = j.s; this.saqla();
      if (n) { ozgardi(); Ombor.saqla(); if (Ilova.holat === "ichida") { if (!men()) { Sessiya.tugat(); render(); } else rejaRender(); } }
      this.holat = "ok"; this.oxirgi = Date.now(); this.xatolar = 0;
      if (this.kutmoqda()) this.rejala(1000);
      return true;
    } catch (e) {
      this.holat = e.kod === "topilmadi" ? "topilmadi" : "xato"; this.xatolar++;
      if (this.kutmoqda()) this.rejala(Math.min(300000, 5000 * 2 ** Math.min(this.xatolar, 6)));   // internet yo‘q: 10 s, 20 s … 5 daqiqagacha
      return false;
    } finally { this.ish = false; }
  },
  boshla() {
    this.yukla();
    this.rejala(1500);
    setInterval(() => { if (document.visibilityState === "visible") this.yubor(); }, 60000);
    window.addEventListener("online", () => this.rejala(500));
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") this.rejala(500); });
  },

  // Istalgan qurilmadan kirish: login va parol serverda tekshiriladi, markaz ma’lumoti yuklab olinadi
  async serverKirish(login, parol, mahalliyXodim) {
    if (!SOZLAMALAR.server || !navigator.onLine) return false;
    let j;
    try { j = await Server.sorov("kirish", { login: login.trim().toLowerCase(), xesh: await pinXesh(parol) }); } catch (e) { return false; }
    if (!j.ok) { if (j.kod === "blok" || j.kod === "yuklanmagan" || /o‘chirilgan|bir nechta/.test(j.xato || "")) { xatoKorsat("#k-xato", j.xato); return "xato"; } return false; }
    const shuMarkaz = DB.litsenziya.markazId === j.id;
    if (markazBor() && !shuMarkaz && !DB.meta.demo) {
      // Qurilmada boshqa markaz bor: u serverga to‘liq yuklangan bo‘lsagina almashtiriladi
      if (this.faol()) await this.yubor();
      if (!this.faol() || this.kutmoqda()) { xatoKorsat("#k-xato", "Bu qurilmada boshqa markaz ma’lumotlari bor va ular hali serverga yuklanmagan. Avval o‘sha markazga kirib, internetga ulang yoki zaxira oling."); return "xato"; }
      if (!(await tasdiq(`Bu qurilmadagi «${esc(markazNomi())}» o‘rniga «${esc(j.nomi)}» ochiladi. U markazning ma’lumotlari serverda saqlangan — keyin yana login bilan kirsa bo‘ladi.`, { tugma: "Davom etish", sarlavha: "Boshqa markaz" }))) return "xato";
    }
    if (shuMarkaz) {
      // Shu markaz: parol boshqa qurilmada o‘zgargan — yangilarini olamiz
      this.h.s = Math.min(this.h.s, 0); await this.yubor();
    } else {
      const db = boshDB();
      this.qolla(j.ozg, db);
      db.litsenziya = { ...db.litsenziya, royxat: j.royxat || bugun(), sinovTugash: j.sinovTugash || "", tugash: j.tugash || "", markazId: j.id, token: j.token, holat: j.holat || "faol",
        xabar: j.xabar || "", tarif: j.tarif || "", tekshirildi: Date.now(), tolovYoqilgan: !!j.tolovYoqilgan, kutilayotgan: +j.kutilayotgan || 0,
        ...(j.tariflar ? { tariflar: j.tariflar } : {}), ...(j.oylar ? { oylar: j.oylar } : {}) };
      this.jim = true;
      try { await Ombor.almashtir(db); } finally { this.jim = false; }
      this.h = { s: j.s, navbat: {}, soz: JSON.stringify(DB.sozlamalar), sh: JSON.stringify(DB.shablonlar), toliq: "" }; this.saqla();
      Server.bugun = j.bugun || ""; Server.holat = "ok";
    }
    const x = DB.xodimlar.find(z => z.id === j.xodimId) || DB.xodimlar.find(z => (z.login || "").toLowerCase() === login.trim().toLowerCase());
    if (!x) { xatoKorsat("#k-xato", "Xodim topilmadi. Rahbaringizga murojaat qiling."); return "xato"; }
    const begona = $("#k-begona");
    if (begona && begona.checked) Mahalliy.qoy("oquv-crm-begona", "1"); else if (!shuMarkaz) Mahalliy.ochir("oquv-crm-begona");
    return x;
  },
  // «Begona kompyuter»: chiqqanda ma’lumot serverga yuborilib, shu brauzerdan o‘chiriladi
  async begonaTozala() {
    if (Mahalliy.ol("oquv-crm-begona") !== "1") return false;
    if (this.kutmoqda()) await this.yubor();
    if (this.kutmoqda()) { toast("Internet yo‘q: ma’lumotlar hali serverga yuborilmagan, shu sababli bu qurilmada qoldirildi.", "warn"); return false; }
    this.jim = true;
    try { await Ombor.almashtir(boshDB()); } finally { this.jim = false; }
    this.h = { s: 0, navbat: {}, soz: "", sh: "", toliq: "" }; Mahalliy.ochir(this.kalit()); Mahalliy.ochir("oquv-crm-begona");
    toast("Chiqdingiz. Ma’lumotlar bu kompyuterdan o‘chirildi", "ok");
    return true;
  },
};

// Ombor yozuvlari navbatga tushadi
(() => {
  const yoz = Ombor.yoz, ochir = Ombor.ochir, dav = Ombor.davomatYoz, bekor = Ombor.bekorYoz, soz = Ombor.sozYoz, alm = Ombor.almashtir;
  Ombor.yoz = function (kol, obj) { const r = yoz.call(this, kol, obj); Sinx.belgila(kol, r.id); return r; };
  Ombor.ochir = function (kol, id) { ochir.call(this, kol, id); Sinx.belgila(kol, id); };
  Ombor.davomatYoz = function (kalit, b) { dav.call(this, kalit, b); Sinx.belgila("davomat", kalit); };
  Ombor.bekorYoz = function (kalit, sabab) { bekor.call(this, kalit, sabab); Sinx.belgila("bekorlar", kalit); };
  Ombor.sozYoz = function () { soz.call(this); Sinx.objTekshir(); };
  // Zaxiradan tiklash / yangi ro‘yxat: serverdagi nusxa shu baza bilan to‘liq almashtiriladi
  Ombor.almashtir = async function (yangi) {
    await alm.call(this, yangi);
    if (Sinx.jim) return;
    Sinx.h = { s: 0, navbat: {}, soz: JSON.stringify(DB.sozlamalar), sh: JSON.stringify(DB.shablonlar), toliq: "almashtir" }; Sinx.saqla(); Sinx.rejala(500);
  };
})();

// Sozlamalar → Ma’lumotlar: bulut holati
function sinxHolatHTML() {
  if (!Sinx.faol()) return "";
  const k = Sinx.kutmoqda(), vaqt = Sinx.oxirgi ? `${pad2(new Date(Sinx.oxirgi).getHours())}:${pad2(new Date(Sinx.oxirgi).getMinutes())}` : "";
  const matn = k ? `<b style="color:var(--warn,#b45309)">${k} ta o‘zgarish hali yuborilmagan</b>${Sinx.holat === "xato" ? " — internet yo‘q, ulanganda o‘zi yuboriladi" : ""}`
    : Sinx.oxirgi ? `<b>Hammasi saqlangan</b> · ${vaqt}` : "Tekshirilmoqda…";
  return `<section class="card forma"><div class="card-h" style="margin:0"><h2>Bulutda saqlash</h2></div>
    <p class="muted" style="margin:0">Ma’lumotlar serverda ham saqlanadi. Boshqa kompyuter yoki telefonda shu sahifani ochib, login va parol bilan kiring — hammasi o‘sha yerda bo‘ladi.</p>
    <div class="muted sm">${matn}</div>
    <button class="btn btn-soft" data-act="sinx-hozir">${icon("refresh", 18)} Hozir sinxronlash</button></section>`;
}
Object.assign(AMALLAR, {
  "sinx-hozir": async el => { el.disabled = true; const ok = await Sinx.yubor(); render(); toast(ok ? "Sinxronlandi" : "Server bilan bog‘lanib bo‘lmadi", ok ? "ok" : "warn"); },
  "parol-sorov-login": async el => {
    const l = ($("#ps-login") || {}).value || "";
    if (!l.trim()) return xatoKorsat("#ps-xato", "Rahbar loginini yozing.");
    el.disabled = true;
    try { const j = await Server.sorov("parol_sorov_login", { login: l.trim().toLowerCase() }); if (!j.ok) throw new Error(j.xato); }
    catch (e) { el.disabled = false; return xatoKorsat("#ps-xato", "Yuborilmadi: " + (e.name === "TypeError" ? "internet yo‘q" : e.message)); }
    const q = $("#ps-joy"); if (q) q.innerHTML = `<div class="info-quti"><span class="matn"><b>So‘rov yuborildi.</b> Sotuvchi ro‘yxatdan o‘tishda yozilgan telefon raqamingizga qo‘ng‘iroq qilib, yangi parolni aytadi. Keyin shu yerda login va yangi parol bilan kiring.</span></div>`;
  },
});
// Chiqishda «begona kompyuter» bo‘lsa — tozalash
(() => {
  const asl = AMALLAR.chiqish;
  AMALLAR.chiqish = async (...a) => { const tozalandi = await Sinx.begonaTozala(); asl(...a); if (tozalandi) { UI.kirish.tab = "kirish"; render(); } };
})();
