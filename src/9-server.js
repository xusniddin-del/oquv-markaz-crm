
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
    Object.assign(L, { holat: j.holat || "faol", sinovTugash: j.sinovTugash || L.sinovTugash || "", tugash: j.tugash || "", xabar: j.xabar || "", tekshirildi: Date.now() });
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
  if (h.tugagan) return oyna(h.tur === "faol" ? "Obuna muddati tugadi" : "Bepul sinov muddati tugadi", `<p class="muted" style="margin:0">${sanaMatn(h.tugash)} da tugagan. Davom ettirish uchun sotuvchiga murojaat qiling: to‘lovdan keyin dastur shu yerning o‘zida ochiladi. Ma’lumotlaringiz saqlangan.</p>
      ${L.xabar ? `<div class="info-quti"><span class="muted sm">Sotuvchidan xabar:</span><span class="matn">${esc(L.xabar)}</span></div>` : ""}`, qayta + zaxira + chiqish, "xavf");
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
