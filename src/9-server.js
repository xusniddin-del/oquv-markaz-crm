
/* =====================================================================
   13. MARKAZLAR SERVERI (Google Sheets + Apps Script)
   Serverda faqat markaz kartasi: nomi, rahbar, telefon, holati va muddati.
   O‘quvchi, to‘lov va boshqa ma’lumotlar shu qurilmada qoladi.
   Dastur har ochilganda va ochiq turganda vaqti-vaqti bilan holatni so‘raydi:
   bloklangan yoki muddati tugagan markaz ishlay olmaydi, internet bo‘lmasa ochilmaydi.
   ===================================================================== */
const Server = {
  holat: "kutilmoqda",   // kutilmoqda | ok | internet | topilmadi | ulanmagan | sozlanmagan
  bugun: "",             // server sanasi (qurilma soatini o‘zgartirib aldab bo‘lmasin)
  xato: "",
  taymer: null,
  async sorov(amal, d = {}) {
    if (!SOZLAMALAR.server) { const e = new Error("Server manzili sozlanmagan"); e.kod = "sozlanmagan"; throw e; }
    const ac = new AbortController(), t = setTimeout(() => ac.abort(), 25000);
    try {
      // text/plain — brauzer qo‘shimcha (preflight) so‘rov yubormaydi, Apps Script shuni kutadi
      const r = await fetch(SOZLAMALAR.server, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ amal, ...d }), signal: ac.signal, redirect: "follow" });
      if (!r.ok) throw new Error("Server javobi: " + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  },
  qabul(j) {
    const L = DB.litsenziya;
    Object.assign(L, { holat: j.holat || "faol", sinovTugash: j.sinovTugash || L.sinovTugash || "", tugash: j.tugash || "", xabar: j.xabar || "", tekshirildi: Date.now(),
      tarif: j.tarif || "", kutilayotgan: +j.kutilayotgan || 0, tolovYoqilgan: !!j.tolovYoqilgan });
    if (Array.isArray(j.tariflar) && j.tariflar.length) L.tariflar = j.tariflar;
    if (Array.isArray(j.oylar) && j.oylar.length) L.oylar = j.oylar;
    if (j.bugun) this.bugun = j.bugun;
    Ombor.sozYoz();
  },
  stat() {
    return { oquvchilar: DB.oquvchilar.filter(oquvchiFaol).length, guruhlar: DB.guruhlar.filter(g => g.holat !== "yopilgan").length, xodimlar: DB.xodimlar.length, versiya: SOZLAMALAR.versiya };
  },
  async tekshir() {
    const oldin = this.holat + "|" + JSON.stringify(DB.litsenziya);
    if (DB.meta.demo || !markazBor()) this.holat = "ok";
    else if (!DB.litsenziya.markazId) this.holat = "ulanmagan";
    else {
      try {
        const L = DB.litsenziya, j = await this.sorov("holat", { id: L.markazId, token: L.token, nomi: DB.sozlamalar.markazNomi, stat: this.stat() });
        if (j.ok) { this.qabul(j); this.holat = "ok"; this.xato = ""; }
        else if (j.kod === "topilmadi") this.holat = "topilmadi";
        else { this.holat = "internet"; this.xato = j.xato || ""; }
      } catch (e) { this.holat = e.kod === "sozlanmagan" ? "sozlanmagan" : "internet"; this.xato = e.name === "AbortError" ? "Server javob bermadi" : e.message || ""; }
    }
    // Holat o‘zgarmagan bo‘lsa, yozilayotgan maydonni buzmaslik uchun ehtiyotkor qayta chizish
    if (oldin !== this.holat + "|" + JSON.stringify(DB.litsenziya)) { if (this.holat === "ok") rejaRender(); else render(); }
  },
  boshla() {
    if (location.hash === "#tolov") {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      if (DB.litsenziya.markazId && !DB.meta.demo) { toast("To‘lov tekshirilmoqda…"); tolovKut(12); }
    }
    this.tekshir();
    clearInterval(this.taymer);
    this.taymer = setInterval(() => this.tekshir(), SOZLAMALAR.tekshirDaqiqa * 60000);
    window.addEventListener("online", () => this.tekshir());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - (DB.litsenziya.tekshirildi || 0) > 60000) this.tekshir();
    });
  },
};
const serverBugun = () => Server.bugun || bugun();

// Server ruxsat bermaguncha ko‘rsatiladigan ekran (null — ruxsat bor)
function serverEkran() {
  if (DB.meta.demo || !markazBor()) return null;
  const L = DB.litsenziya, h = litsenziyaHolati();
  const aloqa = `<p class="muted sm" style="text-align:center;margin:0">${esc(SOZLAMALAR.sotuvchi.nom)}${sotuvchiAloqa() ? " · " + sotuvchiAloqa() : ""}</p>`;
  const zaxira = Ilova.holat === "ichida" && direktorMi() ? `<button type="button" class="btn btn-ghost btn-sm" data-act="zaxira">${icon("download", 16)} Zaxira olish</button>` : "";
  const chiqish = Ilova.holat === "ichida" ? `<button type="button" class="btn btn-ghost btn-sm" data-act="chiqish">${icon("logout", 16)} Chiqish</button>` : "";
  const oyna = (sarlavha, matn, tugmalar = "", turi = "") => `<div class="kirish"><div class="kirish-bosh"><div class="logo katta${turi === "xavf" ? " xavf" : ""}">${esc(markazLogo())}</div>
      <h1>${sarlavha}</h1><p>${esc(markazNomi())}</p></div>
    <section class="card forma">${matn}${tugmalar ? `<div class="amal-qator">${tugmalar}</div>` : ""}</section>${aloqa}</div>`;
  const qayta = `<button type="button" class="btn btn-primary" data-act="server-qayta">${icon("refresh", 18)} Qayta urinish</button>`;

  if (Server.holat === "kutilmoqda") return `<div class="kirish"><div class="kirish-bosh"><div class="logo katta">${esc(markazLogo())}</div><h1>${esc(markazNomi())}</h1>
    <p class="yuklanmoqda"><span class="aylana" aria-hidden="true"></span> Tekshirilmoqda…</p></div></div>`;
  if (Server.holat === "sozlanmagan") return oyna("Server ulanmagan", `<p class="muted" style="margin:0">Dastur markazlar serveriga ulanmagan. Sotuvchiga murojaat qiling.</p>`);
  if (Server.holat === "internet") return oyna("Internetga ulaning", `<p class="muted" style="margin:0">Dastur ishlashi uchun internet kerak. Internetni yoqing va «Qayta urinish»ni bosing. Ma’lumotlaringiz saqlangan.</p>
      ${Server.xato ? `<p class="muted sm" style="margin:0">Sabab: ${esc(Server.xato)}</p>` : ""}`, qayta + zaxira + chiqish);
  if (Server.holat === "ulanmagan") return oyna("Markazni tizimga ulang", `<p class="muted" style="margin:0">Bu qurilmadagi markaz hali tizimda ro‘yxatdan o‘tmagan. Ulash uchun internet kerak, ma’lumotlaringiz o‘zgarmaydi.</p>
      <p class="xato" id="ul-xato" hidden></p>`, `<button type="button" class="btn btn-primary" data-act="markaz-ulash">Tizimga ulash</button>` + chiqish);
  if (Server.holat === "topilmadi") return oyna("Markaz topilmadi", `<p class="muted" style="margin:0">Bu markaz tizimda topilmadi yoki o‘chirilgan. Sotuvchiga murojaat qiling. Ma’lumotlaringiz shu qurilmada saqlangan.</p>`, qayta + zaxira + chiqish, "xavf");
  if (h.bloklangan) return oyna("Markaz bloklangan", `<p class="muted" style="margin:0">Dasturdan foydalanish to‘xtatilgan. Ma’lumotlaringiz saqlangan: sotuvchi blokdan chiqargach, hammasi joyida bo‘ladi.</p>
      ${L.xabar ? `<div class="info-quti"><span class="muted sm">Sotuvchidan xabar:</span><span class="matn">${esc(L.xabar)}</span></div>` : ""}`, qayta + zaxira + chiqish, "xavf");
  if (h.tugagan) return oyna(h.tur === "faol" ? "Obuna muddati tugadi" : "Bepul sinov muddati tugadi", `<p class="muted" style="margin:0">${sanaMatn(h.tugash)} da tugagan. Davom ettirish uchun tarif tanlab to‘lang: to‘lovdan keyin dastur shu yerning o‘zida ochiladi. Ma’lumotlaringiz saqlangan.</p>
      ${L.xabar ? `<div class="info-quti"><span class="muted sm">Sotuvchidan xabar:</span><span class="matn">${esc(L.xabar)}</span></div>` : ""}
      ${tarifTanlov()}`, `<button type="button" class="btn btn-ghost btn-sm" data-act="server-qayta">${icon("refresh", 16)} Qayta tekshirish</button>` + zaxira + chiqish, "xavf");
  return null;
}

Object.assign(AMALLAR, {
  "server-qayta": async el => { el.disabled = true; el.textContent = "Tekshirilmoqda…"; await Server.tekshir(); render(); },
  // Avval serversiz ro‘yxatdan o‘tgan (yoki zaxiradan tiklangan) markazni tizimga ulash
  "markaz-ulash": async el => {
    const L = DB.litsenziya, m = L.malumot || {}, d = DB.xodimlar.find(x => x.rol === "direktor") || {};
    el.disabled = true; el.textContent = "Ulanmoqda…";
    try {
      const j = await Server.sorov("royxat", { nomi: markazNomi(), rahbar: m.rahbar || d.ism || "", tel: m.tel || DB.sozlamalar.markazTel || "", manzil: m.manzil || DB.sozlamalar.manzil || "", hajm: m.hajm || "", login: d.login || "", versiya: SOZLAMALAR.versiya });
      if (!j.ok) throw new Error(j.xato || "Server rad etdi");
      Object.assign(L, { markazId: j.id, token: j.token }); Server.qabul(j); Server.holat = "ok"; render(); toast("Markaz tizimga ulandi");
    } catch (e) {
      el.disabled = false; el.textContent = "Tizimga ulash";
      xatoKorsat("#ul-xato", /telefon/.test(e.message) ? "Telefon raqami kiritilmagan. Sozlamalarda markaz telefonini yozing yoki sotuvchiga murojaat qiling." : "Ulanib bo‘lmadi: " + (e.message || "internetni tekshiring"));
    }
  },
  "obuna-yangila": async el => { el.disabled = true; await Server.tekshir(); render(); toast(Server.holat === "ok" ? "Holat yangilandi" : "Server bilan bog‘lanib bo‘lmadi", Server.holat === "ok" ? "ok" : "warn"); },
});

/* ---------- Tariflar va obuna to‘lovi (TezCheck: Click, Payme, Uzcard/Humo) ---------- */
// Server tariflarni har tekshiruvda yuboradi; bu — server javobi kelguncha ishlatiladigan nusxa
const TARIFLAR_STD = [
  { k: "start", nom: "Start", narx: 100000, limit: 100, filial: false },
  { k: "standart", nom: "Standart", narx: 150000, limit: 300, filial: false },
  { k: "premium", nom: "Premium", narx: 200000, limit: 0, filial: true },
];
const tariflar = () => DB.litsenziya.tariflar || TARIFLAR_STD;
// Joriy tarif cheklovi: bepul sinovda va demoda cheklov yo‘q
function tarifJoriy() {
  const L = DB.litsenziya;
  if (DB.meta.demo || !L.tarif || litsenziyaHolati().tur !== "faol") return null;
  return tariflar().find(t => t.k === L.tarif) || null;
}
function limitXato(qoshiladi) {
  const t = tarifJoriy();
  if (!t || !t.limit) return "";
  const bor = DB.oquvchilar.filter(oquvchiFaol).length;
  if (bor + qoshiladi <= t.limit) return "";
  return `${t.nom} tarifida ${t.limit} tagacha faol ${T.oquvchi} bo‘ladi (hozir ${bor} ta). Ko‘proq ${T.oquvchi} uchun tarifni oshiring: Sozlamalar → Obuna.`;
}
function tarifLimitOyna(matn) {
  Modal.och(`<div class="forma"><h2 class="sheet-h">Tarif chegarasi</h2><p class="muted" style="margin:0">${esc(matn)}</p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Yopish</button>
    ${direktorMi() ? `<button type="button" class="btn btn-primary" data-act="litsenziya-och">Tarifni oshirish</button>` : ""}</div></div>`);
}
const tolovUI = () => (UI.tolov = UI.tolov || { tarif: DB.litsenziya.tarif || "standart", oylar: 1, kutish: false });

// Tarif kartalari + muddat + «To‘lash» (Obuna sahifasida va muddat tugagan oynada)
function tarifTanlov() {
  const L = DB.litsenziya, u = tolovUI(), tl = tariflar(), oylar = L.oylar || [1, 3, 6, 12];
  if (!tl.some(t => t.k === u.tarif)) u.tarif = tl[0].k;
  const tanl = tl.find(t => t.k === u.tarif), jami = tanl.narx * u.oylar;
  const faolSon = DB.oquvchilar.filter(oquvchiFaol).length;
  const kartalar = tl.map(t => {
    const sigmaydi = t.limit && faolSon > t.limit;
    return `<button type="button" class="tarif${t.k === u.tarif ? " tanlangan" : ""}" data-act="tolov-tarif" data-k="${t.k}" aria-pressed="${t.k === u.tarif}">
      <span class="t-nom">${esc(t.nom)}${L.tarif === t.k && litsenziyaHolati().tur === "faol" ? ` <span class="pill ok">Joriy</span>` : ""}</span>
      <span class="t-narx">${pulS(t.narx)}<small> / oy</small></span>
      <span class="t-shart">${t.limit ? `${t.limit} tagacha ${T.oquvchi}` : `Cheksiz ${T.oquvchilar}`}</span>
      <span class="t-shart">${t.filial ? "Bir nechta filial" : "Bitta filial"} · barcha bo‘limlar</span>
      ${sigmaydi ? `<span class="t-ogoh">Sizda ${faolSon} ta faol ${T.oquvchi} bor</span>` : ""}</button>`;
  }).join("");
  const kutish = L.kutilayotgan > 0 ? `<div class="info-quti"><span class="matn"><b>To‘lov tekshirilmoqda.</b> To‘lagan bo‘lsangiz, bir necha daqiqada obuna o‘zi yangilanadi.</span>
    <button type="button" class="btn btn-soft btn-sm" data-act="tolov-tekshir">${icon("refresh", 16)} Tekshirish</button></div>` : "";
  if (!L.tolovYoqilgan) return `<div class="tariflar">${kartalar}</div>${kutish}<p class="muted sm" style="margin:0">To‘lov uchun sotuvchiga murojaat qiling: ${esc(SOZLAMALAR.sotuvchi.nom)}${sotuvchiAloqa() ? " · " + sotuvchiAloqa() : ""}.</p>`;
  return `<div class="tariflar">${kartalar}</div>
    <div class="maydon"><span>Muddat</span><div class="seg" role="group" aria-label="Muddat">${oylar.map(n => `<button type="button" data-act="tolov-oy" data-n="${n}" aria-pressed="${n === u.oylar}">${n === 12 ? "1 yil" : n + " oy"}</button>`).join("")}</div></div>
    ${kutish}<p class="xato" id="tl-xato" hidden></p>
    <button type="button" class="btn btn-primary btn-katta" data-act="tolov-boshla" ${u.kutish ? "disabled" : ""}>${u.kutish ? "To‘lov sahifasi ochilmoqda…" : `To‘lash — ${pulS(jami)}`}</button>
    <p class="muted sm" style="margin:0;text-align:center">Click, Payme yoki Uzcard/Humo karta orqali. To‘lovdan keyin obuna avtomatik uzayadi${litsenziyaHolati().tugash && !litsenziyaHolati().tugagan ? ` (${sanaMatn(litsenziyaHolati().tugash)} dan keyin)` : ""}.</p>`;
}

Object.assign(AMALLAR, {
  "tolov-tarif": el => { tolovUI().tarif = el.dataset.k; render(); },
  "tolov-oy": el => { tolovUI().oylar = +el.dataset.n; render(); },
  "tolov-boshla": async () => {
    const u = tolovUI(), L = DB.litsenziya;
    u.kutish = true; render();
    try {
      const j = await Server.sorov("tolov_yarat", { id: L.markazId, token: L.token, tarif: u.tarif, oylar: u.oylar });
      if (!j.ok || !j.havola) throw new Error(j.xato || "To‘lov havolasi olinmadi");
      L.kutilayotgan = Math.max(1, +L.kutilayotgan || 0); Ombor.sozYoz();
      location.href = j.havola;   // TezCheck to‘lov sahifasi; to‘lovdan keyin #tolov bilan qaytadi
    } catch (e) {
      u.kutish = false; render();
      xatoKorsat("#tl-xato", e.name === "TypeError" ? "Internet yo‘q yoki server javob bermadi." : e.message);
    }
  },
  "tolov-tekshir": async el => { if (el) { el.disabled = true; } await tolovKut(1); },
});

// To‘lov sahifasidan qaytganda (#tolov) yoki «Tekshirish»da: to‘lov tushguncha bir necha marta so‘raydi
async function tolovKut(marta = 12) {
  const L = DB.litsenziya, oldin = L.tugash + "|" + L.tarif;
  for (let i = 0; i < marta; i++) {
    try {
      const j = await Server.sorov("tolov_tekshir", { id: L.markazId, token: L.token });
      if (j.ok) { Server.qabul(j); Server.holat = "ok"; }
    } catch (e) {}
    if (L.tugash + "|" + L.tarif !== oldin) {
      const t = tariflar().find(x => x.k === L.tarif);
      render(); toast(`To‘lov qabul qilindi! ${t ? t.nom + " tarifi, " : ""}obuna ${sanaMatn(L.tugash)} gacha`, "ok"); return true;
    }
    if (!L.kutilayotgan) break;
    if (i < marta - 1) await new Promise(r => setTimeout(r, 5000));
  }
  render();
  if (marta === 1) toast(L.kutilayotgan ? "To‘lov hali tushmagan. Bir ozdan keyin yana tekshiring." : "Kutilayotgan to‘lov yo‘q", "warn");
  return false;
}
