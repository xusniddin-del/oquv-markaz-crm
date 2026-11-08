
/* =====================================================================
   12. FILIAL BO‘YICHA KO‘RINISH VA YORDAMCHILAR
   Xodimga filial biriktirilgan bo‘lsa yoki direktor tepada filial tanlasa,
   ro‘yxat va statistikalar faqat o‘sha filial bo‘yicha chiqadi.
   ===================================================================== */
function joriyFilial() { const m = Sessiya.xodimId && xodim(Sessiya.xodimId); return (m && m.filialId) || UI.filial || ""; }
function GR() { return Kesh.ol("GR", () => { const F = joriyFilial(); return F ? DB.guruhlar.filter(g => g.filialId === F) : DB.guruhlar; }); }
function OQ() {
  return Kesh.ol("OQ", () => {
    const F = joriyFilial(); if (!F) return DB.oquvchilar;
    return DB.oquvchilar.filter(o => (o.azolik || []).some(a => (guruh(a.guruhId) || {}).filialId === F) || (!(o.azolik || []).length && o.filialId === F));
  });
}
function TL() { return Kesh.ol("TL", () => { if (!joriyFilial()) return DB.tolovlar; const ids = new Set(OQ().map(o => o.id)); return DB.tolovlar.filter(t => ids.has(t.oquvchiId)); }); }
function XR() { return Kesh.ol("XR", () => { const F = joriyFilial(); return F ? DB.xarajatlar.filter(x => x.filialId === F) : DB.xarajatlar; }); }
function LD() { return Kesh.ol("LD", () => { const F = joriyFilial(); return F ? DB.lidlar.filter(l => !l.filialId || l.filialId === F) : DB.lidlar; }); }
function SR() { return Kesh.ol("SR", () => { const F = joriyFilial(); return F ? DB.sorovlar.filter(l => !l.filialId || l.filialId === F) : DB.sorovlar; }); }
const kursNomi = g => (g && (byId("kurslar").get(g.kursId) || {}).nomi) || (g && g.fan) || "";
const guruhSigimi = g => +g.sigim || +((xona(g.xonaId) || {}).sigim) || 0;
function chegirmaOptions(val) {
  const l = DB.chegirmalar.filter(c => c.faol !== false || c.id === val);
  return `<option value="">Chegirmasiz</option>` + l.map(c => `<option value="${c.id}" ${c.id === val ? "selected" : ""}>${esc(c.nomi)} (${c.turi === "summa" ? pul(c.qiymat) + " " + SOZLAMALAR.valyuta : c.qiymat + "%"})</option>`).join("")
    + [5, 10, 15, 20, 25, 30, 50].map(p => `<option value="f:${p}" ${val === "f:" + p ? "selected" : ""}>Boshqa: ${p}%</option>`).join("");
}
const chegirmaQiymat = v => (v && v.startsWith("f:") ? { chegirmaId: "", chegirma: +v.slice(2) } : { chegirmaId: v || "", chegirma: 0 });
Ombor.bekorYoz = function (kalit, sabab) { if (sabab === null) delete DB.bekorlar[kalit]; else DB.bekorlar[kalit] = sabab; ozgardi(); this.saqla(); };

/* ---------- Davr bo‘yicha hisob-kitob ---------- */
const birinchiQoshilgan = o => (o.azolik || []).map(a => a.qoshilgan).filter(Boolean).sort()[0] || "";
const oxirgiChiqqan = o => { const a = o.azolik || []; if (!a.length || a.some(x => !x.chiqqan)) return ""; return a.map(x => x.chiqqan).sort().pop(); };
const sanadaFaol = (o, s) => (o.azolik || []).some(a => azolikFaol(a, s));

// Davrni bo‘laklarga bo‘lish (kunlik / haftalik / oylik)
function bolaklar(dan, gacha, qadam) {
  const r = [];
  if (qadam === "oylik") {
    for (const ym of oylarOraligi(dan.slice(0, 7), gacha.slice(0, 7))) r.push({ kalit: ym, yorliq: oyQisqa(ym) + " " + ym.slice(2, 4), dan: ym + "-01" < dan ? dan : ym + "-01", gacha: oyOxiri(ym) > gacha ? gacha : oyOxiri(ym) });
  } else {
    const q = qadam === "haftalik" ? 7 : 1;
    for (let s = dan; s <= gacha && r.length < 400; s = sanaQosh(s, q)) {
      const ox = sanaQosh(s, q - 1);
      r.push({ kalit: s, yorliq: `${+s.slice(8)} ${OYLAR[+s.slice(5, 7) - 1].slice(0, 3).toLowerCase()}`, dan: s, gacha: ox > gacha ? gacha : ox });
    }
  }
  return r;
}
function davrStat(dan, gacha) {
  return Kesh.ol(`ds:${dan}:${gacha}`, () => {
    const ichida = s => s && s >= dan && s <= gacha;
    const tl = TL().filter(t => ichida(t.sana));
    const tushum = sum(tl.filter(t => !t.qaytarish), t => t.summa), qaytarilgan = sum(tl.filter(t => t.qaytarish), t => t.summa);
    const xr = XR().filter(x => ichida(x.sana));
    const xarajat = sum(xr, x => x.summa), ishHaqi = sum(xr.filter(x => x.kategoriya === "Oylik"), x => x.summa);
    let hisoblangan = 0, yigilgan = 0, chegirma = 0, muddatiOtgan = 0, otganSoni = 0;
    const b = bugun();
    OQ().forEach(o => hisobHolati(o).hisoblar.forEach(h => {
      if (ichida(h.davrSana)) { hisoblangan += h.summa; yigilgan += h.tolangan; chegirma += h.chegirma || 0; }
      if (h.qarz > 0 && h.muddat < b) { muddatiOtgan += h.qarz; otganSoni++; }
    }));
    const gIds = new Set(GR().map(g => g.id));
    const dav = davStat((gid, s) => gIds.has(gid) && ichida(s));
    const oxir = gacha > b ? b : gacha;
    const boshida = OQ().filter(o => sanadaFaol(o, dan));
    const qolgan = boshida.filter(o => sanadaFaol(o, oxir)).length;
    const yangi = OQ().filter(o => ichida(birinchiQoshilgan(o))).length;
    const ketgan = OQ().filter(o => ichida(oxirgiChiqqan(o))).length;
    return {
      tushum, qaytarilgan, sofTushum: tushum - qaytarilgan, xarajat, ishHaqi, sof: tushum - qaytarilgan - xarajat,
      hisoblangan, yigilgan, undirilish: hisoblangan ? Math.round(yigilgan * 100 / hisoblangan) : null, chegirma,
      muddatiOtgan, otganSoni, tolovSoni: tl.filter(t => !t.qaytarish).length, dav,
      yangi, ketgan, boshida: boshida.length, saqlanish: boshida.length ? Math.round(qolgan * 100 / boshida.length) : null,
    };
  });
}
const farqMatn = (a, b, teskari = false) => {
  if (!b) return "";
  const f = Math.round((a - b) * 100 / Math.abs(b)), yaxshi = teskari ? f <= 0 : f >= 0;
  return `<span class="farq ${yaxshi ? "up" : "down"}">${f >= 0 ? "↑" : "↓"} ${Math.abs(f)}%</span> oldingi davrga nisbatan`;
};

/* ---------- Grafiklar ---------- */
// Chiziqli grafik: series [{nom, rang, q:[son|null]}]
function chiziq(series, yorliqlar, { balandlik = 200, foiz = false } = {}) {
  const hamma = series.flatMap(s => s.q.filter(v => v !== null && v !== undefined));
  if (!hamma.length) return `<p class="bosh-matn">Bu davrda ma’lumot yo‘q.</p>`;
  let max = Math.max(0, ...hamma), min = Math.min(0, ...hamma);
  if (foiz) { max = 100; min = 0; } else { max = max > 0 ? yaxshiMax(max) : 0; min = min < 0 ? -yaxshiMax(-min) : 0; if (max === min) max = 1; }
  const n = yorliqlar.length, X = i => (n === 1 ? 50 : (i * 100) / (n - 1)), Y = v => 100 - ((v - min) / (max - min)) * 100;
  const fmt = v => (foiz ? Math.round(v) + "%" : qisqaPul(v));
  const chiz = [max, (max + min) / 2, min].map(v => `<div class="d-chiziq" style="bottom:${100 - Y(v)}%"><span>${fmt(v)}</span></div>`).join("") + (min < 0 ? `<div class="nol" style="top:${Y(0)}%"></div>` : "");
  const polylar = series.map((s, si) => {
    const pts = s.q.map((v, i) => (v === null || v === undefined ? null : `${X(i).toFixed(2)},${Y(v).toFixed(2)}`)).filter(Boolean);
    if (!pts.length) return "";
    const maydon = si === 0 && !foiz ? `<polygon points="${pts[0].split(",")[0]},${Y(Math.max(0, min))} ${pts.join(" ")} ${pts[pts.length - 1].split(",")[0]},${Y(Math.max(0, min))}" style="fill:${s.rang}"/>` : "";
    return maydon + `<polyline points="${pts.join(" ")}" style="stroke:${s.rang}"/>`;
  }).join("");
  const nuqtalar = series.map(s => { let i = s.q.length - 1; while (i >= 0 && (s.q[i] === null || s.q[i] === undefined)) i--; return i < 0 ? "" : `<span class="cx-nuqta" style="left:${X(i)}%;bottom:${100 - Y(s.q[i])}%;background:${s.rang}" title="${esc(s.nom)}: ${fmt(s.q[i])}"></span>`; }).join("");
  const qadam = Math.max(1, Math.ceil(n / 8));
  const xl = yorliqlar.map((l, i) => (i % qadam === 0 || i === n - 1 ? `<span class="cx-yorliq" style="left:${X(i)}%">${esc(l)}</span>` : "")).join("");
  const tavsif = series.map(s => `${s.nom}: ${s.q.filter(v => v !== null).map(fmt).join(", ")}`).join("; ");
  return `<div class="chiziq-q" role="img" aria-label="${esc(tavsif)}"><div class="chiziq" style="height:${balandlik}px">${chiz}
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${polylar}</svg>${nuqtalar}${xl}</div>
    ${series.length > 1 ? `<div class="legend">${series.map(s => `<span><i class="lc" style="background:${s.rang}"></i>${esc(s.nom)}</span>`).join("")}</div>` : ""}</div>`;
}
// Gorizontal ustunlar: items [{nom, q, matn}]
function qatorlar(items, { foiz = false, cls = "", bosh = "Ma’lumot yo‘q." } = {}) {
  if (!items.length) return `<p class="bosh-matn">${bosh}</p>`;
  const max = foiz ? 100 : Math.max(1, ...items.map(i => i.q));
  return items.map(i => `<div class="kat-q"><span>${esc(i.nom)}</span>${progress((i.q * 100) / max, cls)}<b>${i.matn ?? (foiz ? i.q + "%" : pul(i.q))}</b></div>`).join("");
}
const RANG = { a: "var(--primary)", b: "var(--warn)", c: "var(--ok)", d: "var(--bad)" };

/* =====================================================================
   13. DIQQAT — dastur o‘zi topadigan muammolar
   ===================================================================== */
const DIQQAT_TUR = { guruh: "Guruh holati", qatnashmayapti: `${katta(T.oquvchi)} qatnashmayapti`, tolov: "To‘lov muddati o‘tgan", davomat: "Davomat belgilanmagan", lid: "Lidlar", oylik: "Oylik", sorov: "So‘rovlar" };
function diqqatlar() {
  return Kesh.ol("diqqat", () => {
    const r = [], b = bugun(), dir = direktorMi();
    const gs = menGuruhlarim().filter(g => g.holat !== "yopilgan");
    for (const g of gs) {
      const n = guruhOquvchilari(g.id).length, sig = guruhSigimi(g);
      if (g.tugashSana && g.tugashSana < b) r.push({ id: "gt" + g.id, tur: "guruh", daraja: "muhim", sarlavha: `«${g.nomi}» tugagan`, matn: `Tugash sanasi ${sanaMatn(g.tugashSana)} edi, lekin ${T.guruh} hali faol. Yoping yoki muddatini uzaytiring.`, act: "guruh-tahrir", aid: g.id, tugma: "Ochish" });
      if (!n && g.ochilgan && kunFarqi(g.ochilgan, b) > 14) r.push({ id: "gb" + g.id, tur: "guruh", daraja: "ogohlantirish", sarlavha: `«${g.nomi}»da ${T.oquvchi} yo‘q`, matn: `${T.guruh} 2 haftadan beri bo‘sh turibdi.`, act: "guruh-tahrir", aid: g.id, tugma: "Ochish" });
      if (sig && n > sig) r.push({ id: "gs" + g.id, tur: "guruh", daraja: "ogohlantirish", sarlavha: `«${g.nomi}» to‘lib ketgan`, matn: `${n} ta ${T.oquvchi}, sig‘im ${sig} o‘rin.`, act: "guruh-tahrir", aid: g.id, tugma: "Ochish" });
      // Davomat belgilanmagan darslar (so‘nggi 7 kun, bugundan tashqari)
      const qolgan = [];
      for (let i = 1; i <= 7; i++) {
        const s = sanaQosh(b, -i), k = `${g.id}|${s}`;
        if ((g.kunlar || []).includes(KUNLAR[hafta(s)].k) && (!g.ochilgan || s >= g.ochilgan) && !DB.davomat[k] && DB.bekorlar[k] === undefined && guruhOquvchilari(g.id, s).length) qolgan.push(s);
      }
      if (qolgan.length) r.push({ id: "dv" + g.id, tur: "davomat", daraja: qolgan.length > 1 ? "muhim" : "ogohlantirish", sarlavha: `«${g.nomi}»: ${qolgan.length} ta dars belgilanmagan`, matn: qolgan.map(sanaMatn).join(", "), act: "dav-ochish-sana", aid: g.id, s: qolgan[0], tugma: "Belgilash" });
    }
    // O‘quvchilar: ketma-ket kelmaslik va past davomat
    const gIds = new Set(gs.map(g => g.id));
    for (const o of OQ()) {
      if (!oquvchiFaol(o)) continue;
      for (const a of faolAzoliklar(o)) {
        if (!gIds.has(a.guruhId)) continue;
        const belgilar = (davomatIndeks().get(a.guruhId) || []).filter(d => d.sana >= a.qoshilgan && d.belgilar[o.id]).map(d => ({ s: d.sana, h: d.belgilar[o.id] }));
        const oxirgi3 = belgilar.slice(-3);
        const songgi = belgilar.filter(x => x.s >= sanaQosh(b, -14));
        const g = guruh(a.guruhId);
        if (oxirgi3.length === 3 && oxirgi3.every(x => x.h === "kelmadi")) r.push({ id: "q3" + o.id + a.guruhId, tur: "qatnashmayapti", daraja: "muhim", sarlavha: `${o.ism} 3 darsdan beri kelmayapti`, matn: `${g.nomi}. Oxirgi: ${sanaMatn(oxirgi3[2].s)}. ${katta(T.otaOna)} bilan bog‘laning.`, act: "profil", aid: o.id, tugma: "Profil" });
        else if (songgi.length >= 3 && songgi.filter(x => QATNASHDI(x.h)).length / songgi.length < 0.5) r.push({ id: "q5" + o.id + a.guruhId, tur: "qatnashmayapti", daraja: "ogohlantirish", sarlavha: `${o.ism}: davomat 50% dan past`, matn: `${g.nomi}, so‘nggi 2 hafta.`, act: "profil", aid: o.id, tugma: "Profil" });
      }
    }
    if (!oqituvchiMi()) {
      for (const x of qarzdorlar()) {
        if (x.h.kechikish <= 0) continue;
        r.push({ id: "t" + x.o.id, tur: "tolov", daraja: x.h.kechikish > 30 ? "muhim" : "ogohlantirish", sarlavha: `${x.o.ism}: ${pulS(x.h.qarz)} qarz`, matn: `${x.h.kechikish} kun kechikdi (${davrMatni(x.h)}).`, act: "tolovga", aid: x.o.id, tugma: "To‘lov" });
      }
      const lidlar = LD().filter(l => !["yozildi", "rad"].includes(l.holat) && l.keyingiAloqa && l.keyingiAloqa < b);
      if (lidlar.length) r.push({ id: "lid", tur: "lid", daraja: "ogohlantirish", sarlavha: `${lidlar.length} ta lid bilan bog‘lanish kechikdi`, matn: lidlar.slice(0, 4).map(l => l.ism).join(", ") + (lidlar.length > 4 ? "…" : ""), act: "ot", bolim: "lidlar", tugma: "Lidlar" });
      const sr = SR().filter(x => x.holat === "yangi" && x.yaratildi && Date.now() - x.yaratildi > 2 * 864e5);
      if (sr.length) r.push({ id: "sr", tur: "sorov", daraja: "ogohlantirish", sarlavha: `${sr.length} ta so‘rov 2 kundan beri javobsiz`, matn: sr.slice(0, 3).map(x => x.ism).join(", "), act: "ot", bolim: "sorovlar", tugma: "So‘rovlar" });
    }
    if (dir) {
      const otgan = oyQosh(joriyOy(), -1);
      const qarz = DB.oqituvchilar.filter(t => t.faol !== false).map(t => ({ t, o: oqituvchiOylik(t, otgan) })).filter(x => x.o.qoldiq > 0);
      if (qarz.length) r.push({ id: "oy", tur: "oylik", daraja: "ogohlantirish", sarlavha: `${oyNomi(otgan)} oyligi to‘liq to‘lanmagan`, matn: qarz.map(x => `${x.t.ism}: ${pulS(x.o.qoldiq)}`).join(", "), act: "oylik-otgan", tugma: katta(T.oqituvchilar) });
    }
    return r.sort((a, b2) => (a.daraja === "muhim" ? 0 : 1) - (b2.daraja === "muhim" ? 0 : 1));
  });
}
const ogohHtml = x => `<div class="ogoh ${x.daraja}"><span class="ogoh-ic">${icon(x.daraja === "muhim" ? "alert" : "phone", 18)}</span>
  <div class="q-mat"><b>${esc(x.sarlavha)}</b><span class="muted sm">${esc(x.matn)}</span></div>
  <button class="btn btn-ghost btn-sm" data-act="${x.act}" data-id="${esc(x.aid || "")}" data-s="${esc(x.s || "")}" data-bolim="${esc(x.bolim || "")}">${esc(x.tugma)}</button></div>`;
function renderDiqqat() {
  const hamma = diqqatlar();
  const l = hamma.filter(x => (!UI.dq.tur || x.tur === UI.dq.tur) && (!UI.dq.daraja || x.daraja === UI.dq.daraja));
  const turlar = Object.keys(DIQQAT_TUR).filter(k => hamma.some(x => x.tur === k));
  return `<div class="qator-orasi"><div class="chiplar orala" role="group" aria-label="Turi">
      <button class="chip" data-act="dq-tur" data-v="" aria-pressed="${!UI.dq.tur}">Hammasi <span class="son">${hamma.length}</span></button>
      ${turlar.map(k => `<button class="chip" data-act="dq-tur" data-v="${k}" aria-pressed="${UI.dq.tur === k}">${DIQQAT_TUR[k]} <span class="son">${hamma.filter(x => x.tur === k).length}</span></button>`).join("")}</div>
    ${segTugmalar("dq-daraja", [["", "Hamma daraja"], ["muhim", "Muhim"], ["ogohlantirish", "Ogohlantirish"]], UI.dq.daraja)}</div>
    ${l.length ? `<section class="card">${l.map(ogohHtml).join("")}</section>` : boshHolat({ ic: "check2", sarlavha: "Diqqat talab qiladigan ish yo‘q", matn: `Dastur har ochilganda ${T.guruhlar}, ${T.oquvchilar}, davomat va to‘lovlarni tekshiradi. Muammo topilsa shu yerda chiqadi.` })}`;
}

/* =====================================================================
   14. STATISTIKA (8 tab)
   ===================================================================== */
const ST_TABLAR = [["umumiy", "Umumiy"], ["mavsumlar", "Mavsumlar"], ["davomat", "Davomat"], ["moliya", "Moliya"], ["talabalar", katta(T.oquvchilar)], ["kurslar", "Kurslar"], ["oqituvchilar", katta(T.oqituvchilar)], ["operatsiyalar", "Operatsiyalar"]];
function renderStatistika() {
  const st = UI.st, b = bugun();
  const tayyor = [["7", "7 kun"], ["30", "30 kun"], ["buoy", "Bu oy"], ["otgan", "O‘tgan oy"], ["90", "3 oy"], ["yil", "12 oy"]];
  const panel = `<section class="card davr-panel">
    <div class="chiplar" role="group" aria-label="Tayyor davrlar">${tayyor.map(([k, n]) => `<button class="chip" data-act="st-tayyor" data-v="${k}">${n}</button>`).join("")}</div>
    ${DB.mavsumlar.length ? `<label><span class="vh">Mavsum</span><select id="st-mavsum"><option value="">Mavsum: tanlanmagan</option>${DB.mavsumlar.map(m => `<option value="${m.id}" ${m.id === st.mavsum ? "selected" : ""}>${esc(m.nomi)}</option>`).join("")}</select></label>` : ""}
    <label><span class="vh">Boshlanish</span><input id="st-dan" type="date" value="${st.dan}"></label><span class="orasi">—</span>
    <label><span class="vh">Tugash</span><input id="st-gacha" type="date" value="${st.gacha}"></label>
    <label><span class="vh">Qadam</span><select id="st-qadam">${[["kunlik", "Kunlik"], ["haftalik", "Haftalik"], ["oylik", "Oylik"]].map(([k, n]) => `<option value="${k}" ${k === st.qadam ? "selected" : ""}>${n}</option>`).join("")}</select></label>
  </section>
  <div class="chiplar tab-chiplar" role="tablist">${ST_TABLAR.map(([k, n]) => `<button class="chip" role="tab" data-act="st-tab" data-v="${k}" aria-pressed="${st.tab === k}">${n}</button>`).join("")}</div>`;
  const fn = { umumiy: stUmumiy, mavsumlar: stMavsumlar, davomat: stDavomat, moliya: stMoliya, talabalar: stTalabalar, kurslar: stKurslar, oqituvchilar: stOqituvchilar, operatsiyalar: stOperatsiyalar }[st.tab] || stUmumiy;
  void b;
  return panel + fn();
}
function oldingiDavr() { const n = kunFarqi(UI.st.dan, UI.st.gacha) + 1; return [sanaQosh(UI.st.dan, -n), sanaQosh(UI.st.dan, -1)]; }
function pulOqimi() {
  const bl = bolaklar(UI.st.dan, UI.st.gacha, UI.st.qadam);
  const d = bl.map(x => davrStat(x.dan, x.gacha));
  return chiziq([
    { nom: "Tushum", rang: RANG.a, q: d.map(x => x.sofTushum) },
    { nom: "Xarajat", rang: RANG.b, q: d.map(x => x.xarajat) },
    { nom: "Sof pul oqimi", rang: RANG.c, q: d.map(x => x.sof) },
  ], bl.map(x => x.yorliq));
}
function guruhTolishi() {
  const gs = GR().filter(g => g.holat !== "yopilgan" && guruhSigimi(g));
  return gs.map(g => ({ g, n: guruhOquvchilari(g.id).length, sig: guruhSigimi(g) })).map(x => ({ ...x, f: Math.round(x.n * 100 / x.sig) }));
}
function markazHolati(s) {
  const tol = guruhTolishi(), [a, b] = SOZLAMALAR.sigimMaqsad;
  const ortTol = tol.length ? Math.round(sum(tol, x => x.f) / tol.length) : null;
  const sigBall = ortTol === null ? null : ortTol < a ? Math.round(ortTol * 100 / a) : ortTol > b ? Math.max(0, 100 - (ortTol - b) * 2) : 100;
  const q = [["Moliya (undirilish)", s.undirilish], [`${katta(T.oquvchilar)} (saqlanish)`, s.saqlanish], ["Davomat", s.dav.foiz], ["Guruh sig‘imi", sigBall]];
  const bor = q.filter(x => x[1] !== null);
  return { ball: bor.length ? Math.round(sum(bor, x => Math.min(100, x[1])) / bor.length) : null, q };
}
function stUmumiy() {
  const s = davrStat(UI.st.dan, UI.st.gacha), [od, og] = oldingiDavr(), o = davrStat(od, og);
  const h = markazHolati(s), faol = OQ().filter(oquvchiFaol).length;
  const amallar = diqqatlar().slice(0, 5);
  const ballCls = h.ball === null ? "" : h.ball >= 80 ? "yaxshi" : h.ball < 50 ? "yomon" : "";
  return `<div class="tilelar t6" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
      ${tile("Tushum", pulV(s.sofTushum), farqMatn(s.sofTushum, o.sofTushum) || "Taqqoslash uchun ma’lumot yo‘q", "wallet")}
      ${tile("Sof pul oqimi", `<span class="${s.sof < 0 ? "qizil" : ""}">${pul(s.sof)}</span><small>${SOZLAMALAR.valyuta}</small>`, s.tushum ? `${Math.round(s.sof * 100 / s.tushum)}% marja` : "Marja: —", "chart")}
      ${tile("To‘lov undirilishi", s.undirilish === null ? "—" : s.undirilish + "%", s.hisoblangan ? `${pulS(s.yigilgan)} / ${pulS(s.hisoblangan)}` : "Bu davrda hisoblangan to‘lov yo‘q", "check")}
      ${tile(`Faol ${T.oquvchilar}`, faol, `Davrda ${s.yangi} ta yangi, ${s.ketgan} ta ketgan`, "users")}
    </div>
    <div class="ikki-ustun" style="grid-template-columns:minmax(0,1fr)">
      <section class="card"><div class="card-h"><div><h2>Pul oqimi</h2><div class="muted sm">Tushum, xarajat va sof pul oqimi</div></div></div>${pulOqimi()}</section>
    </div>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><div><h2>Markaz holati</h2><div class="muted sm">Moliya, ${T.oquvchilar}, davomat va sig‘imdan hisoblangan</div></div>${h.ball === null ? "" : `<span class="ball ${ballCls}">${h.ball}/100</span>`}</div>
        ${h.q.map(([n, v]) => `<div class="holat-q"><div class="qator-orasi"><span>${n}</span>${v === null ? `<span class="pill">Ma’lumot yo‘q</span>` : `<b>${Math.min(100, v)}/100</b>`}</div>${v === null ? "" : progress(v, v >= 80 ? "ok" : "")}</div>`).join("")}</section>
      <section class="card"><div class="card-h"><div><h2>Ustuvor amallar</h2><div class="muted sm">Avval muhim masalalar</div></div>${amallar.length ? `<a class="link" href="#diqqat">Hammasi (${diqqatlar().length})</a>` : ""}</div>
        ${amallar.length ? amallar.map(ogohHtml).join("") : `<p class="bosh-matn">Hozircha hamma narsa joyida.</p>`}</section>
    </div>`;
}
function stMavsumlar() {
  if (!DB.mavsumlar.length) return boshHolat({ ic: "calendar", sarlavha: "Mavsum qo‘shilmagan", matn: "Mavsum (masalan, «2026 Kuz») qo‘shsangiz, har bir mavsum natijalari shu yerda solishtiriladi.", tugma: direktorMi() ? `<button class="btn btn-primary" data-act="mavsum-yangi">${icon("plus", 18)} Mavsum qo‘shish</button>` : "" });
  const l = DB.mavsumlar.slice().sort((a, b) => b.boshlanish.localeCompare(a.boshlanish)).map(m => ({ m, s: davrStat(m.boshlanish, m.tugash), g: GR().filter(g => g.mavsumId === m.id).length }));
  return `<section class="card"><div class="card-h"><h2>Mavsumlar bo‘yicha</h2></div><div class="jadval-oram"><table class="keng-jadval"><thead><tr>
    <th>Mavsum</th><th>Davr</th><th class="o">${katta(T.guruhlar)}</th><th class="o">Yangi</th><th class="o">Ketgan</th><th class="o">Tushum</th><th class="o">Xarajat</th><th class="o">Sof</th><th class="o">Davomat</th><th class="o">Undirilish</th></tr></thead>
    <tbody>${l.map(({ m, s, g }) => `<tr><td><b>${esc(m.nomi)}</b></td><td>${sanaMatn(m.boshlanish)} — ${sanaMatn(m.tugash)}</td><td class="o">${g}</td><td class="o">${s.yangi}</td><td class="o">${s.ketgan}</td>
      <td class="o">${pul(s.sofTushum)}</td><td class="o">${pul(s.xarajat)}</td><td class="o ${s.sof < 0 ? "qizil" : ""}">${pul(s.sof)}</td><td class="o">${s.dav.foiz ?? "—"}${s.dav.foiz === null ? "" : "%"}</td><td class="o">${s.undirilish ?? "—"}${s.undirilish === null ? "" : "%"}</td></tr>`).join("")}</tbody></table></div></section>
    <section class="card"><div class="card-h"><h2>Mavsumlar tushumi</h2></div>${qatorlar(l.map(x => ({ nom: x.m.nomi, q: Math.max(0, x.s.sofTushum) })))}</section>`;
}
function rejaDarslar(dan, gacha) {
  const r = { reja: 0, yakun: 0, kutilmoqda: 0, bekor: 0, belgilanmagan: 0 }, b = bugun();
  for (const g of menGuruhlarim().filter(g => g.holat !== "yopilgan")) {
    for (let s = dan; s <= gacha; s = sanaQosh(s, 1)) {
      if (!(g.kunlar || []).includes(KUNLAR[hafta(s)].k) || (g.ochilgan && s < g.ochilgan)) continue;
      const k = `${g.id}|${s}`; r.reja++;
      if (DB.bekorlar[k] !== undefined) r.bekor++;
      else if (DB.davomat[k]) r.yakun++;
      else if (s >= b) r.kutilmoqda++;
      else r.belgilanmagan++;
    }
  }
  return r;
}
function stDavomat() {
  const kun = UI.st.kun, gIds = new Set(menGuruhlarim().map(g => g.id));
  const d = davStat((gid, s) => gIds.has(gid) && s === kun), r = rejaDarslar(kun, kun);
  const bl = bolaklar(UI.st.dan, UI.st.gacha, UI.st.qadam);
  const dinamika = bl.map(x => davStat((gid, s) => gIds.has(gid) && s >= x.dan && s <= x.gacha).foiz);
  const past = guruhDavomatlari(UI.st.dan, UI.st.gacha).filter(x => x.d.foiz !== null && x.d.foiz < SOZLAMALAR.davomatMaqsad);
  return `<section class="card"><div class="card-h"><div><h2>Kunlik davomat</h2><div class="muted sm">Tanlangan kunning darslari va qatnashuv</div></div>
      <label><span class="vh">Kun</span><input id="st-kun" type="date" value="${kun}" style="width:auto"></label></div>
      <div class="dav-kun"><div class="halqa" style="--p:${d.foiz || 0}"><div><div><b>${d.foiz === null ? "—" : d.foiz + "%"}</b><span>Qatnashuv</span></div></div></div>
        <div style="flex:1;min-width:220px">${d.jami ? "" : `<p style="margin:0 0 10px"><b>Hali davomat belgilanmagan.</b> <span class="muted">Belgilangach, qatnashuv shu yerda ko‘rinadi.</span></p>`}
        <div class="xulosa"><div class="k"><b>${d.keldi}</b><span>Keldi</span></div><div class="s"><b>${d.kechikdi}</b><span>Kechikdi</span></div><div class="m"><b>${d.kelmadi}</b><span>Kelmadi</span></div><div><b>${d.sababli}</b><span>Sababli</span></div></div></div></div>
      <div class="xulosa x5" style="margin-top:14px"><div><b>${r.reja}</b><span>Rejadagi darslar</span></div><div class="k"><b>${r.yakun}</b><span>Yakunlangan</span></div><div><b>${r.kutilmoqda}</b><span>Kutilmoqda</span></div><div class="m"><b>${r.belgilanmagan}</b><span>Belgilanmagan</span></div><div><b>${r.bekor}</b><span>Bekor qilingan</span></div></div>
      <div style="text-align:right;margin-top:10px"><a class="link" href="#jadval">Dars jadvalini ochish →</a></div></section>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><div><h2>Qatnashuv dinamikasi</h2><div class="muted sm">Tanlangan davr bo‘yicha</div></div></div>${chiziq([{ nom: "Qatnashuv", rang: RANG.c, q: dinamika }], bl.map(x => x.yorliq), { foiz: true })}</section>
      <section class="card"><div class="card-h"><div><h2>E’tibor talab qiladigan ${T.guruhlar}</h2><div class="muted sm">Davomati ${SOZLAMALAR.davomatMaqsad}% dan past</div></div></div>
        ${qatorlar(past.map(x => ({ nom: x.g.nomi, q: x.d.foiz })), { foiz: true, bosh: `Barcha ${T.guruhlar}da davomat yaxshi.` })}</section>
    </div>`;
}
function guruhDavomatlari(dan, gacha) { return menGuruhlarim().filter(g => g.holat !== "yopilgan").map(g => ({ g, d: davStat((gid, s) => gid === g.id && s >= dan && s <= gacha) })).sort((a, b) => (a.d.foiz ?? 101) - (b.d.foiz ?? 101)); }
function stMoliya() {
  const s = davrStat(UI.st.dan, UI.st.gacha), [od, og] = oldingiDavr(), o = davrStat(od, og);
  const ichida = x => x >= UI.st.dan && x <= UI.st.gacha;
  const tl = TL().filter(t => ichida(t.sana) && !t.qaytarish);
  const kursT = new Map(); tl.forEach(t => { const k = kursNomi(guruh(tolovGuruhi(t))) || "Boshqa"; kursT.set(k, (kursT.get(k) || 0) + t.summa); });
  const xr = XR().filter(x => ichida(x.sana)); const kat = new Map(); xr.forEach(x => kat.set(x.kategoriya, (kat.get(x.kategoriya) || 0) + x.summa));
  const usul = new Map(); tl.forEach(t => usul.set(t.usul, (usul.get(t.usul) || 0) + t.summa));
  const b = bugun(), kutil = [];
  OQ().forEach(ob => hisobHolati(ob).ochiq.forEach(h => { if (h.muddat >= b) kutil.push({ o: ob, h }); }));
  kutil.sort((a, c) => a.h.muddat.localeCompare(c.h.muddat));
  const map2 = m => [...m.entries()].map(([nom, q]) => ({ nom, q })).sort((a, c) => c.q - a.q);
  return `<div class="tilelar" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
      ${tile("Tushum", pulV(s.tushum), farqMatn(s.tushum, o.tushum), "wallet")}
      ${tile("Jami xarajat", pulV(s.xarajat), farqMatn(s.xarajat, o.xarajat, true), "cash", "warn")}
      ${tile("Ish haqi", pulV(s.ishHaqi), s.xarajat ? `Xarajatlarning ${Math.round(s.ishHaqi * 100 / s.xarajat)}%` : "", "user")}
      ${tile("Sof pul oqimi", `<span class="${s.sof < 0 ? "qizil" : ""}">${pul(s.sof)}</span><small>${SOZLAMALAR.valyuta}</small>`, s.tushum ? `${Math.round(s.sof * 100 / s.tushum)}% marja` : "", "chart")}
      ${tile("Undirilish darajasi", s.undirilish === null ? "—" : s.undirilish + "%", s.hisoblangan ? `${pulS(s.yigilgan)} / ${pulS(s.hisoblangan)}` : "Hisoblangan to‘lov yo‘q", "check")}
      ${tile("Muddati o‘tgan", pulV(s.muddatiOtgan), `${s.otganSoni} ta to‘lov (hozir)`, "alert", "bad")}
      ${tile("Qaytarilgan mablag‘", pulV(s.qaytarilgan), "Tanlangan davrda", "upload")}
      ${tile("Chegirmalar", pulV(s.chegirma), `O‘rtacha chek: ${pulS(s.tolovSoni ? s.tushum / s.tolovSoni : 0)}`, "gift")}
    </div>
    <section class="card"><div class="card-h"><div><h2>Pul oqimi</h2><div class="muted sm">Tushum, xarajat va sof pul oqimi dinamikasi</div></div></div>${pulOqimi()}</section>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><h2>Tushum tarkibi (kurslar)</h2></div>${qatorlar(map2(kursT), { bosh: "Davrda tushum yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>Xarajat tarkibi</h2></div>${qatorlar(map2(kat), { cls: "warn", bosh: "Davrda xarajat yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>To‘lov usullari</h2></div>${qatorlar(map2(usul), { bosh: "Davrda to‘lov yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>Kutilayotgan to‘lovlar</h2><span class="muted sm">${pulS(sum(kutil, x => x.h.qarz))}</span></div>
        ${kutil.length ? `<table class="mini-jadval"><tbody>${kutil.slice(0, 8).map(x => `<tr><td><b>${esc(x.o.ism)}</b><div class="muted sm">${esc(x.h.tavsif)} · muddat ${sanaMatn(x.h.muddat)}</div></td><td class="o">${pulS(x.h.qarz)}</td></tr>`).join("")}</tbody></table>` : `<p class="bosh-matn">Kutilayotgan to‘lov yo‘q.</p>`}</section>
    </div>`;
}
function kohortlar(oylar) {
  const b = bugun();
  return oylar.map(ym => { const l = OQ().filter(o => birinchiQoshilgan(o).startsWith(ym)); return { ym, n: l.length, f: l.length ? Math.round(l.filter(o => sanadaFaol(o, b) || oquvchiFaol(o)).length * 100 / l.length) : null }; });
}
function stTalabalar() {
  const s = davrStat(UI.st.dan, UI.st.gacha), bl = bolaklar(UI.st.dan, UI.st.gacha, UI.st.qadam);
  const faol = OQ().filter(oquvchiFaol).length, jami = OQ().length;
  const haftalar = Math.max(1, (kunFarqi(UI.st.dan, UI.st.gacha) + 1) / 7);
  const oylar = Array.from({ length: 6 }, (_, i) => oyQosh(joriyOy(), i - 5)), koh = kohortlar(oylar), kohBor = koh.filter(x => x.f !== null);
  const dv = bl.map(x => davrStat(x.dan, x.gacha));
  const gIds = new Set(GR().map(g => g.id)), d = davStat((gid, sn) => gIds.has(gid) && sn >= UI.st.dan && sn <= UI.st.gacha);
  const manba = new Map(); LD().filter(l => l.yaratildi && sanaStr(new Date(l.yaratildi)) >= UI.st.dan && sanaStr(new Date(l.yaratildi)) <= UI.st.gacha).forEach(l => manba.set(l.manba || "Boshqa", (manba.get(l.manba || "Boshqa") || 0) + 1));
  return `<div class="tilelar" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
      ${tile(`Faol ${T.oquvchilar}`, faol, "Hozir", "users")}
      ${tile(`Yangi ${T.oquvchilar}`, s.yangi, "Tanlangan davrda", "plus")}
      ${tile("Saqlab qolish", s.saqlanish === null ? "—" : s.saqlanish + "%", `Davr boshida ${s.boshida} ta edi`, "check")}
      ${tile("Chiqib ketish", s.saqlanish === null ? "—" : 100 - s.saqlanish + "%", `${s.ketgan} ta ketgan`, "alert", "warn")}
      ${tile("Jami (tarixiy)", jami, `${jami - faol} ta nofaol`, "db")}
      ${tile("Sof o‘sish", (s.yangi - s.ketgan > 0 ? "+" : "") + (s.yangi - s.ketgan), "Yangi minus ketgan", "chart")}
      ${tile("Haftalik yangi qabul", String(Math.round(s.yangi / haftalar * 10) / 10).replace(".", ","), "O‘rtacha", "calendar")}
      ${tile("Kohort saqlanishi", kohBor.length ? Math.round(sum(kohBor, x => x.f) / kohBor.length) + "%" : "—", "So‘nggi 6 oy o‘rtachasi", "check")}
    </div>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><div><h2>Yangi qabul dinamikasi</h2><div class="muted sm">Ro‘yxatdan o‘tgan ${T.oquvchilar}</div></div></div>${chiziq([{ nom: "Yangi", rang: RANG.a, q: dv.map(x => x.yangi) }, { nom: "Ketgan", rang: RANG.d, q: dv.map(x => x.ketgan) }], bl.map(x => x.yorliq))}</section>
      <section class="card"><div class="card-h"><div><h2>Kohort saqlanishi</h2><div class="muted sm">Har oy kelganlarning hozir qolgan ulushi</div></div></div>${chiziq([{ nom: "Saqlanish", rang: RANG.c, q: koh.map(x => x.f) }], oylar.map(oyQisqa), { foiz: true })}</section>
      <section class="card"><div class="card-h"><h2>Davomat tarkibi</h2></div>${qatorlar([{ nom: "Keldi", q: d.keldi }, { nom: "Kechikdi", q: d.kechikdi }, { nom: "Kelmadi", q: d.kelmadi }, { nom: "Sababli", q: d.sababli }].filter(x => x.q), { bosh: "Davrda davomat yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>Lid manbalari</h2></div>${qatorlar([...manba.entries()].map(([nom, q]) => ({ nom, q, matn: q + " ta" })).sort((a, b) => b.q - a.q), { bosh: "Davrda lid yo‘q." })}</section>
    </div>`;
}
function kursStat(k, dan, gacha) {
  const gs = GR().filter(g => (k ? g.kursId === k.id : !g.kursId));
  const gIds = new Set(gs.map(g => g.id));
  const az = OQ().flatMap(o => (o.azolik || []).filter(a => gIds.has(a.guruhId)));
  const faol = new Set(OQ().filter(o => faolAzoliklar(o).some(a => gIds.has(a.guruhId))).map(o => o.id)).size;
  const qoldi = az.length ? Math.round(az.filter(a => !a.chiqqan || a.chiqqan > bugun()).length * 100 / az.length) : null;
  const tushum = sum(TL().filter(t => !t.qaytarish && t.sana >= dan && t.sana <= gacha && gIds.has(tolovGuruhi(t))), t => t.summa);
  return { gs, faol, qoldi, tushum, dav: davStat((gid, s) => gIds.has(gid) && s >= dan && s <= gacha) };
}
function stKurslar() {
  const l = DB.kurslar.map(k => ({ k, s: kursStat(k, UI.st.dan, UI.st.gacha) }));
  if (!l.length) return boshHolat({ ic: "teacher", sarlavha: "Kurslar yaratilmagan", matn: `Kurs qo‘shib, ${T.guruhlar}ni unga biriktirsangiz, kurslar bo‘yicha tahlil shu yerda chiqadi.`, tugma: `<a class="btn btn-primary" href="#kurslar">Kurslarga o‘tish</a>` });
  const qb = l.filter(x => x.s.qoldi !== null);
  return `<div class="tilelar" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
      ${tile("Jami kurslar", l.length, `${l.filter(x => x.k.holat !== "yopilgan").length} ta faol`, "teacher")}
      ${tile(`Kurslardagi ${T.oquvchilar}`, sum(l, x => x.s.faol), `Faol ${T.guruhlar} kesimida`, "users")}
      ${tile("O‘rtacha saqlanish", qb.length ? Math.round(sum(qb, x => x.s.qoldi) / qb.length) + "%" : "—", "Ketmay qolganlar ulushi", "check")}
      ${tile("Kursga bog‘langan tushum", pulV(sum(l, x => x.s.tushum)), "Tanlangan davrda", "wallet")}
    </div>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><h2>Kurslar mashhurligi</h2></div>${qatorlar(l.map(x => ({ nom: x.k.nomi, q: x.s.faol, matn: x.s.faol + " ta" })).sort((a, b) => b.q - a.q))}</section>
      <section class="card"><div class="card-h"><h2>Kursda qolish darajasi</h2></div>${qatorlar(qb.map(x => ({ nom: x.k.nomi, q: x.s.qoldi })).sort((a, b) => b.q - a.q), { foiz: true, cls: "ok" })}</section>
      <section class="card"><div class="card-h"><h2>Kurslar bo‘yicha davomat</h2></div>${qatorlar(l.filter(x => x.s.dav.foiz !== null).map(x => ({ nom: x.k.nomi, q: x.s.dav.foiz })), { foiz: true, cls: "ok", bosh: "Davrda davomat yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>Kurslar bo‘yicha tushum</h2></div>${qatorlar(l.map(x => ({ nom: x.k.nomi, q: x.s.tushum })).filter(x => x.q).sort((a, b) => b.q - a.q), { bosh: "Davrda tushum yo‘q." })}</section>
    </div>`;
}
function oqituvchiStat(t, dan, gacha) {
  const gs = GR().filter(g => g.oqituvchiId === t.id), gIds = new Set(gs.map(g => g.id));
  const faol = gs.reduce((n, g) => n + guruhOquvchilari(g.id).length, 0);
  const ketgan = new Set(OQ().filter(o => (o.azolik || []).some(a => gIds.has(a.guruhId) && a.chiqqan && a.chiqqan >= dan && a.chiqqan <= gacha)).map(o => o.id)).size;
  const az = OQ().flatMap(o => (o.azolik || []).filter(a => gIds.has(a.guruhId)));
  const saqlash = az.length ? Math.round(az.filter(a => !a.chiqqan || a.chiqqan > bugun()).length * 100 / az.length) : null;
  let reja = 0, belgi = 0; const b = bugun(), ox = gacha >= b ? sanaQosh(b, -1) : gacha;
  for (const g of gs) for (let s = dan; s <= ox; s = sanaQosh(s, 1)) {
    if (!(g.kunlar || []).includes(KUNLAR[hafta(s)].k) || (g.ochilgan && s < g.ochilgan) || DB.bekorlar[`${g.id}|${s}`] !== undefined || !guruhOquvchilari(g.id, s).length) continue;
    reja++; if (DB.davomat[`${g.id}|${s}`]) belgi++;
  }
  const vz = DB.vazifalar.filter(v => gIds.has(v.guruhId) && v.sana >= dan && v.sana <= gacha);
  let jamiV = 0, bajV = 0; vz.forEach(v => { const n = guruhOquvchilari(v.guruhId, v.sana).length; jamiV += n; bajV += Object.keys(v.bajardi || {}).length; });
  return { gs, faol, ketgan, saqlash, intizom: reja ? Math.round(belgi * 100 / reja) : null, dav: davStat((gid, s) => gIds.has(gid) && s >= dan && s <= gacha), vazifa: jamiV ? Math.round(bajV * 100 / jamiV) : null };
}
function stOqituvchilar() {
  const l = DB.oqituvchilar.filter(t => t.faol !== false).map(t => ({ t, s: oqituvchiStat(t, UI.st.dan, UI.st.gacha) })).filter(x => x.s.gs.length || !joriyFilial());
  if (!l.length) return boshHolat({ ic: "user", sarlavha: `${katta(T.oqituvchilar)} yo‘q`, matn: `${katta(T.oqituvchilar)} qo‘shilgach, ularning natijalari shu yerda chiqadi.` });
  const o = (k) => { const b = l.filter(x => x.s[k] !== null); return b.length ? Math.round(sum(b, x => x.s[k]) / b.length) + "%" : "Ma’lumot yo‘q"; };
  return `<div class="tilelar" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
      ${tile(`Faol ${T.oqituvchilar}`, l.length, "Tanlangan markazda", "user")}
      ${tile(`O‘rtacha ${T.oquvchi}`, String(Math.round(sum(l, x => x.s.faol) / l.length * 10) / 10).replace(".", ","), `Har bir ${T.oqituvchi}ga`, "users")}
      ${tile(`${katta(T.oquvchi)}ni saqlash`, o("saqlash"), `${katta(T.oqituvchilar)} o‘rtachasi`, "check")}
      ${tile("Davomatni belgilash", o("intizom"), "O‘tgan darslar bo‘yicha", "calendar")}
    </div>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><div><h2>Eng ko‘p ${T.oquvchi} yo‘qotganlar</h2><div class="muted sm">Davrda ${T.guruh}dan chiqib ketganlar</div></div></div>${qatorlar(l.filter(x => x.s.ketgan).map(x => ({ nom: x.t.ism, q: x.s.ketgan, matn: x.s.ketgan + " ta" })).sort((a, b) => b.q - a.q), { cls: "", bosh: "Davrda hech kim ketmagan." })}</section>
      <section class="card"><div class="card-h"><div><h2>Davomatni belgilash intizomi</h2><div class="muted sm">O‘tgan darslarning necha foizida davomat kiritilgan</div></div></div>${qatorlar(l.filter(x => x.s.intizom !== null).map(x => ({ nom: x.t.ism, q: x.s.intizom })), { foiz: true, cls: "ok", bosh: "Davrda o‘tgan dars yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>${katta(T.oquvchilar)} davomati</h2></div>${qatorlar(l.filter(x => x.s.dav.foiz !== null).map(x => ({ nom: x.t.ism, q: x.s.dav.foiz })), { foiz: true, cls: "ok", bosh: "Davrda davomat yo‘q." })}</section>
      <section class="card"><div class="card-h"><h2>Uy vazifasi bajarilishi</h2></div>${qatorlar(l.filter(x => x.s.vazifa !== null).map(x => ({ nom: x.t.ism, q: x.s.vazifa })), { foiz: true, bosh: "Davrda uy vazifasi berilmagan." })}</section>
    </div>`;
}
function stOperatsiyalar() {
  const s = davrStat(UI.st.dan, UI.st.gacha), bl = bolaklar(UI.st.dan, UI.st.gacha, UI.st.qadam), gIds = new Set(GR().map(g => g.id));
  const tol = guruhTolishi(), [a, b] = SOZLAMALAR.sigimMaqsad;
  const past = guruhDavomatlari(UI.st.dan, UI.st.gacha).filter(x => x.d.foiz !== null && x.d.foiz < SOZLAMALAR.davomatMaqsad);
  return `<div class="tilelar" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
      ${tile("Davomat", s.dav.foiz === null ? "Ma’lumot yo‘q" : s.dav.foiz + "%", s.dav.jami ? `${s.dav.jami} ta belgi` : "Davrda qayd yo‘q", "check")}
      ${tile(`Faol ${T.guruhlar}`, GR().filter(g => g.holat !== "yopilgan").length, "", "layers")}
      ${tile("Faol kurslar", DB.kurslar.filter(k => k.holat !== "yopilgan").length, "", "teacher")}
      ${tile("O‘rtacha guruh sig‘imi", tol.length ? Math.round(sum(tol, x => x.f) / tol.length) + "%" : "—", `Maqsad: ${a}–${b}%`, "users")}
    </div>
    <div class="ikki-ustun">
      <section class="card"><div class="card-h"><h2>Davomat dinamikasi</h2></div>${chiziq([{ nom: "Davomat", rang: RANG.c, q: bl.map(x => davStat((gid, sn) => gIds.has(gid) && sn >= x.dan && sn <= x.gacha).foiz) }], bl.map(x => x.yorliq), { foiz: true })}</section>
      <section class="card"><div class="card-h"><div><h2>Guruh sig‘imi</h2><div class="muted sm">${katta(T.oquvchilar)} / o‘rinlar</div></div></div>${qatorlar(tol.sort((x, y) => y.f - x.f).map(x => ({ nom: x.g.nomi, q: Math.min(100, x.f), matn: `${x.n}/${x.sig}` })), { foiz: true, bosh: `Sig‘imi belgilangan ${T.guruh} yo‘q. ${katta(T.guruh)} yoki xonaga o‘rin sonini kiriting.` })}</section>
    </div>
    <section class="card"><div class="card-h"><div><h2>E’tibor talab qiladigan ${T.guruhlar}</h2><div class="muted sm">Davomati ${SOZLAMALAR.davomatMaqsad}% dan past</div></div></div>${qatorlar(past.map(x => ({ nom: x.g.nomi, q: x.d.foiz })), { foiz: true, bosh: "Davomat barqaror. Past davomatli guruh yo‘q." })}</section>`;
}

/* =====================================================================
   15. QABULXONA (o‘quvchilar jadvali)
   ===================================================================== */
function xavf(o) {
  return Kesh.ol("xavf:" + o.id, () => {
    const r = [], b = bugun();
    for (const a of faolAzoliklar(o)) {
      const bl = (davomatIndeks().get(a.guruhId) || []).filter(d => d.belgilar[o.id]).map(d => d.belgilar[o.id]);
      if (bl.length >= 3 && bl.slice(-3).every(h => h === "kelmadi")) r.push("3 darsdan beri kelmayapti");
      const songgi = (davomatIndeks().get(a.guruhId) || []).filter(d => d.sana >= sanaQosh(b, -14) && d.belgilar[o.id]).map(d => d.belgilar[o.id]);
      if (songgi.length >= 3 && songgi.filter(QATNASHDI).length / songgi.length < 0.5) r.push("Davomat 50% dan past");
    }
    const h = hisobHolati(o); if (h.kechikish > 30) r.push(`To‘lov ${h.kechikish} kun kechikkan`);
    return [...new Set(r)];
  });
}
const tolovHolati = h => h.qarz ? (h.kechikish > 0 ? `<span class="pill ${h.kechikish > 14 ? "bad" : "warn"}">Muddati o‘tgan · ${h.kechikish} kun</span>` : `<span class="pill">To‘lashi kerak</span>`) : h.ortiqcha ? `<span class="pill ok">Oldindan to‘langan</span>` : `<span class="pill ok">To‘langan</span>`;
function qabulRoyxati() {
  const q = UI.qb, oq = oqituvchiMi(), gIds = new Set(menGuruhlarim().map(g => g.id));
  const s = q.qidiruv.trim().toLowerCase(), sr = s.replace(/\D/g, "");
  return OQ().filter(o => {
    const faol = oquvchiFaol(o);
    if (q.holat === "faol" && !faol) return false;
    if (q.holat === "nofaol" && faol) return false;
    if (oq && !(o.azolik || []).some(a => gIds.has(a.guruhId))) return false;
    if (q.guruh && !(o.azolik || []).some(a => a.guruhId === q.guruh)) return false;
    if (q.oqit && !(o.azolik || []).some(a => (guruh(a.guruhId) || {}).oqituvchiId === q.oqit)) return false;
    if (s && !((o.ism || "").toLowerCase().includes(s) || (sr.length >= 2 && `${o.tel}${o.otaTel}`.replace(/\D/g, "").includes(sr)))) return false;
    if (!oq && q.tab !== "hammasi") {
      const h = hisobHolati(o);
      if (q.tab === "tolashi" && !(h.qarz && h.kechikish <= 0)) return false;
      if (q.tab === "otgan" && !(h.qarz && h.kechikish > 0)) return false;
      if (q.tab === "xavf" && !xavf(o).length) return false;
    }
    return true;
  }).sort(ismBoyicha);
}
function renderQabulxona() {
  const oq = oqituvchiMi(), q = UI.qb;
  if (!OQ().length && !oq) return boshHolat({ ic: "users", sarlavha: `Hali ${T.oquvchi} yo‘q`, matn: `Yangi ${T.oquvchi} qo‘shing yoki eski ro‘yxatni Excel (CSV) fayldan import qiling.`,
    tugma: `<div class="amal-qator" style="justify-content:center"><button class="btn btn-primary" data-act="oq-yangi">${icon("plus", 18)} Yangi ${T.oquvchi}</button><button class="btn btn-ghost" data-act="import">${icon("upload", 18)} Import</button></div>` });
  const sanoq = k => { const eski = q.tab; q.tab = k; const n = qabulRoyxati().length; q.tab = eski; return n; };
  const tablar = oq ? [] : [["hammasi", "Barchasi"], ["tolashi", "To‘lov qilishi kerak"], ["otgan", "Muddati o‘tgan to‘lovlar"], ["xavf", "Yo‘qotish ehtimoli"]];
  return `<div class="qator-orasi">
      <div class="chiplar tab-chiplar">${tablar.map(([k, n]) => `<button class="chip" data-act="qb-tab" data-v="${k}" aria-pressed="${q.tab === k}">${n} <span class="son">${sanoq(k)}</span></button>`).join("")}</div>
      ${oq ? "" : `<div class="amal-qator"><a class="btn btn-ghost btn-sm" href="#diqqat">${icon("alert", 18)} Diqqat${nishon("diqqat")}</a>
        <button class="btn btn-ghost btn-sm" data-act="import">${icon("upload", 18)} Import</button>
        <button class="btn btn-ghost btn-sm" data-act="csv" data-tur="oquvchilar">${icon("file", 18)} Excel</button>
        <button class="btn btn-primary btn-sm" data-act="oq-yangi">${icon("plus", 18)} Yangi ${T.oquvchi}</button></div>`}
    </div>
    <section class="card">
      <div class="asboblar" style="grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));margin-bottom:12px">
        <label class="qidiruv"><span class="vh">Qidirish</span>${icon("search", 20)}<input id="qb-qidir" type="search" value="${esc(q.qidiruv)}" placeholder="Ism yoki telefon" autocomplete="off"></label>
        <label><span class="vh">${katta(T.guruh)}</span><select id="qb-guruh"><option value="">Barcha ${T.guruhlar}</option>${menGuruhlarim().slice().sort(ismBoyicha).map(g => `<option value="${g.id}" ${g.id === q.guruh ? "selected" : ""}>${esc(g.nomi)}</option>`).join("")}</select></label>
        ${oq ? "" : `<label><span class="vh">${katta(T.oqituvchi)}</span><select id="qb-oqit"><option value="">Barcha ${T.oqituvchilar}</option>${DB.oqituvchilar.map(t => `<option value="${t.id}" ${t.id === q.oqit ? "selected" : ""}>${esc(t.ism)}</option>`).join("")}</select></label>`}
        ${segTugmalar("qb-holat", [["faol", "Faol"], ["nofaol", "Ketgan"], ["hammasi", "Hammasi"]], q.holat)}
      </div>
      <div id="qb-royxat">${qabulJadval()}</div>
    </section>`;
}
function qabulJadval() {
  const oq = oqituvchiMi(), q = UI.qb, l = qabulRoyxati();
  if (!l.length) return `<div class="bosh-holat"><div class="bh-ic">${icon("search", 28)}</div><h3>Tanlangan filtrlarga mos natija yo‘q</h3><p>Filtrlarni o‘zgartiring yoki tozalang.</p><button class="btn btn-ghost" data-act="qb-tozala">Filtrlarni tozalash</button></div>`;
  const sahifalar = Math.max(1, Math.ceil(l.length / q.hajm));
  if (q.sahifa > sahifalar) q.sahifa = sahifalar;
  const bosh = (q.sahifa - 1) * q.hajm, kor = l.slice(bosh, bosh + q.hajm);
  const guruhlar = o => oquvchiGuruhlari(o).map(g => esc(g.nomi)).join(", ") || "—";
  const jadval = `<div class="faqat-keng jadval-oram"><table class="keng-jadval qb-jadval"><thead><tr><th>Ism va familiya</th><th>Telefon</th><th>Holati</th>${oq ? "" : `<th>To‘lov</th><th class="o">Balans</th><th></th>`}</tr></thead><tbody>
    ${kor.map(o => { const h = oq ? null : hisobHolati(o), x = oq ? [] : xavf(o); return `<tr>
      <td><button class="ism-btn" data-act="profil" data-id="${o.id}">${esc(o.ism)}</button><div class="q-sub muted">${guruhlar(o)}</div></td>
      <td>${esc(o.tel || "—")}${o.otaTel ? `<div class="q-sub muted">${katta(T.otaOna)}: ${esc(o.otaTel)}</div>` : ""}</td>
      <td>${oquvchiFaol(o) ? `<span class="pill ok">Faol</span>` : `<span class="pill">Ketgan</span>`} ${x.length ? `<span class="pill bad" title="${esc(x.join(", "))}">Xavf</span>` : ""}</td>
      ${oq ? "" : `<td>${tolovHolati(h)}</td><td class="o"><b class="${h.qarz ? "qizil" : h.ortiqcha ? "yashil" : ""}">${h.qarz ? "−" + pul(h.qarz) : pul(h.ortiqcha)}</b></td>
      <td class="o"><button class="icon-btn tekis" data-act="tolovga" data-id="${o.id}" aria-label="${esc(o.ism)} uchun to‘lov">${icon("wallet", 18)}</button></td>`}</tr>`; }).join("")}</tbody></table></div>`;
  const kartalar = `<div class="faqat-tor royxat">${kor.map(o => { const h = oq ? null : hisobHolati(o), x = oq ? [] : xavf(o); return `<div class="qator">
      <button class="qator-btn" data-act="profil" data-id="${o.id}"><span class="avatar">${esc(boshHarf(o.ism))}</span>
        <span class="q-mat"><span class="q-nom">${esc(o.ism)}${oquvchiFaol(o) ? "" : ` <span class="pill">Ketgan</span>`}${x.length ? ` <span class="pill bad">Xavf</span>` : ""}</span>
        <span class="q-sub">${guruhlar(o)}${o.tel ? ` · ${esc(o.tel)}` : ""}</span></span>
        ${h ? `<span class="q-ong">${balansPill(h)}</span>` : ""}</button>
      ${oq ? "" : `<button class="icon-btn tekis" data-act="tolovga" data-id="${o.id}" aria-label="${esc(o.ism)} uchun to‘lov">${icon("wallet", 20)}</button>`}</div>`; }).join("")}</div>`;
  return jadval + kartalar + `<div class="sahifalash"><span class="muted sm">${bosh + 1}–${bosh + kor.length} / ${l.length} ta</span>
    <div class="amal-qator" style="align-items:center"><label class="muted sm">Qatorlar <select id="qb-hajm">${[15, 30, 50, 100].map(n => `<option ${n === q.hajm ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <button class="icon-btn tekis" data-act="qb-sahifa" data-n="-1" ${q.sahifa <= 1 ? "disabled" : ""} aria-label="Oldingi sahifa">${icon("chevL", 18)}</button>
    <span class="sm">${q.sahifa} / ${sahifalar}</span>
    <button class="icon-btn tekis" data-act="qb-sahifa" data-n="1" ${q.sahifa >= sahifalar ? "disabled" : ""} aria-label="Keyingi sahifa">${icon("chevR", 18)}</button></div></div>`;
}
// CSV import: Ism; Telefon; Ota-ona telefoni; Guruh; Qo‘shilgan sana
function importTahlil(matn) {
  const qatorlar = matn.replace(/^﻿/, "").split(/\r?\n/).filter(x => x.trim());
  if (!qatorlar.length) return [];
  const ajr = [";", "\t", ","].map(a => [a, qatorlar[0].split(a).length]).sort((a, b) => b[1] - a[1])[0][0];
  const bol = q => { const r = []; let cur = "", qq = false; for (const c of q) { if (c === '"') qq = !qq; else if (c === ajr && !qq) { r.push(cur.trim()); cur = ""; } else cur += c; } r.push(cur.trim()); return r; };
  let rows = qatorlar.map(bol), ustun = { ism: 0, tel: 1, ota: 2, guruh: 3, sana: 4 };
  const sar = rows[0].map(x => x.toLowerCase());
  if (sar.some(x => /ism|name|f\.?i\.?o/.test(x))) {
    const top = re => sar.findIndex(x => re.test(x));
    ustun = { ism: top(/ism|name|f\.?i\.?o/), tel: top(/^tel|telefon|phone/), ota: top(/ota|ona|parent/), guruh: top(/guruh|group|sinf/),
      tug: top(/tug|birth/), sana: sar.findIndex(x => /sana|date/.test(x) && !/tug|birth/.test(x)) };
    rows = rows.slice(1);
  }
  const gNom = new Map(GR().map(g => [g.nomi.toLowerCase().trim(), g.id]));
  return rows.map(r => ({ ism: r[ustun.ism] || "", tel: ustun.tel >= 0 ? r[ustun.tel] || "" : "", otaTel: ustun.ota >= 0 ? r[ustun.ota] || "" : "",
    guruhId: ustun.guruh >= 0 ? gNom.get((r[ustun.guruh] || "").toLowerCase().trim()) || "" : "", guruhNomi: ustun.guruh >= 0 ? r[ustun.guruh] || "" : "",
    tugilgan: ustun.tug >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(r[ustun.tug] || "") ? r[ustun.tug] : "",
    sana: ustun.sana >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(r[ustun.sana] || "") ? r[ustun.sana] : bugun() })).filter(x => x.ism);
}
// Guruh nomidan dars kunlari va vaqtni o‘qiydi: «Kids 1 (Du-Ch-Ju, 08:00–10:00)»
function nomdanJadval(nom) {
  const kunlar = KUNLAR.map(k => k.k).filter(k => new RegExp(`(^|[^\\p{L}])${k}`, "u").test(nom));
  const v = nom.match(/(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/);
  return { kunlar, boshlanish: v ? `${pad2(+v[1])}:${v[2]}` : "", tugash: v ? `${pad2(+v[3])}:${v[4]}` : "" };
}
function importOyna(matn) {
  const l = importTahlil(matn), bor = new Set(DB.oquvchilar.map(o => (o.ism + "|" + (o.tel || "").replace(/\D/g, "")).toLowerCase()));
  const yangi = l.filter(x => !bor.has((x.ism + "|" + x.tel.replace(/\D/g, "")).toLowerCase()));
  UI.importlar = yangi;
  const yoq = [...new Set(yangi.filter(x => !x.guruhId && x.guruhNomi).map(x => x.guruhNomi.trim()))];
  Modal.och(`<h2 class="sheet-h">Import</h2>
    ${l.length ? `<p class="sheet-p">${l.length} ta qator topildi. ${yangi.length} tasi yangi${l.length - yangi.length ? `, ${l.length - yangi.length} tasi bazada bor (o‘tkazib yuboriladi)` : ""}. ${yangi.filter(x => x.guruhId || x.guruhNomi).length} tasi ${T.guruh}ga biriktiriladi.</p>
      <table class="mini-jadval"><thead><tr><th>Ism</th><th>Telefon</th><th>${katta(T.guruh)}</th></tr></thead><tbody>${yangi.slice(0, 8).map(x => `<tr><td>${esc(x.ism)}</td><td>${esc(x.tel)}</td><td>${x.guruhId ? esc(guruh(x.guruhId).nomi) : x.guruhNomi ? `${esc(x.guruhNomi)} <span class="muted sm">(yangi)</span>` : "—"}</td></tr>`).join("")}</tbody></table>
      ${yangi.length > 8 ? `<p class="muted sm">…va yana ${yangi.length - 8} ta</p>` : ""}
      ${yoq.length ? `<div class="info-quti"><label class="toggle"><input type="checkbox" id="imp-guruh" checked> Topilmagan ${yoq.length} ta ${T.guruh}ni ochish</label>
        <div class="kunlar">${yoq.map(n => `<span class="pill primary">${esc(n)}</span>`).join("")}</div>
        <label class="maydon"><span>Bu ${T.guruhlar} narxi (oylik), ${SOZLAMALAR.valyuta}</span><input id="imp-narx" inputmode="numeric" data-pul placeholder="400 000" autocomplete="off"></label>
        <p class="muted sm" style="margin:0">Nomda kunlar (Du-Ch-Ju) va vaqt (08:00–10:00) bo‘lsa, jadvalga o‘zi qo‘yiladi.</p></div>` : ""}
      <p class="xato" id="imp-xato" hidden></p>`
    : `<p class="sheet-p">Faylda ma’lumot topilmadi. Ustunlar tartibi: Ism; Telefon; ${katta(T.otaOna)} telefoni; ${katta(T.guruh)}; Qo‘shilgan sana (YYYY-MM-DD).</p>`}
    <div class="sheet-actions"><button class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button>${yangi.length ? `<button class="btn btn-primary" data-act="import-tasdiq">${yangi.length} tasini qo‘shish</button>` : ""}</div>`);
}

/* =====================================================================
   16. KURSLAR, MAVSUMLAR, CHEGIRMALAR, FILIALLAR
   ===================================================================== */
function renderKurslar() {
  const qosh = direktorMi() || rol() === "admin" ? `<button class="btn btn-primary" data-act="kurs-yangi">${icon("plus", 18)} Kurs qo‘shish</button>` : "";
  if (!DB.kurslar.length) return boshHolat({ ic: "teacher", sarlavha: "Kurslar yaratilmagan", matn: `Kurs, masalan «Ingliz tili» yoki «Kompyuter savodxonligi». Bir kursda bir nechta ${T.guruh} bo‘ladi.`, tugma: qosh });
  const dan = sanaQosh(bugun(), -29), gacha = bugun();
  const l = DB.kurslar.slice().sort((a, b) => (a.holat === "yopilgan") - (b.holat === "yopilgan") || ismBoyicha(a, b)).map(k => ({ k, s: kursStat(k, dan, gacha) }));
  const kurssiz = GR().filter(g => !g.kursId && g.holat !== "yopilgan");
  return bolimBosh(`${DB.kurslar.filter(k => k.holat !== "yopilgan").length} ta faol kurs · ko‘rsatkichlar so‘nggi 30 kun bo‘yicha`, qosh) + `<div class="kartalar">${l.map(({ k, s }) => `<article class="card guruh-k">
      <div class="gk-top"><div><h3>${esc(k.nomi)}</h3><div class="muted sm">${k.davomiylik ? k.davomiylik + " oy" : "Muddatsiz"}${k.narx ? ` · ${pulS(k.narx)}` : ""}</div></div>${k.holat === "yopilgan" ? `<span class="pill">Yopilgan</span>` : ""}</div>
      ${k.tavsif ? `<div class="muted sm">${esc(k.tavsif)}</div>` : ""}
      <div class="xulosa" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div><b>${s.gs.filter(g => g.holat !== "yopilgan").length}</b><span>Faol ${T.guruhlar}</span></div><div><b>${s.faol}</b><span>${katta(T.oquvchilar)}</span></div>
        <div class="k"><b>${s.dav.foiz ?? "—"}${s.dav.foiz === null ? "" : "%"}</b><span>Davomat</span></div><div><b>${s.qoldi ?? "—"}${s.qoldi === null ? "" : "%"}</b><span>Saqlanish</span></div></div>
      <div class="iq-top"><span class="muted">Tushum (30 kun)</span><b>${pulS(s.tushum)}</b></div>
      <div class="kunlar">${s.gs.filter(g => g.holat !== "yopilgan").map(g => `<span class="pill primary">${esc(g.nomi)}</span>`).join("")}</div>
      ${qosh ? `<div class="gk-pas"><button class="btn btn-soft btn-sm" data-act="guruh-kursga" data-id="${k.id}">${icon("plus", 16)} ${katta(T.guruh)} ochish</button><button class="icon-btn tekis" data-act="kurs-tahrir" data-id="${k.id}" aria-label="Tahrirlash">${icon("edit", 20)}</button></div>` : ""}
    </article>`).join("")}</div>
    ${kurssiz.length ? `<section class="card"><div class="card-h"><h2>Kursga biriktirilmagan ${T.guruhlar}</h2></div><div class="kunlar">${kurssiz.map(g => `<button class="chip" data-act="guruh-tahrir" data-id="${g.id}">${esc(g.nomi)}</button>`).join("")}</div></section>` : ""}`;
}
function kursForma(k) {
  const yangi = !k; k = k || { nomi: "", davomiylik: "", narx: "", tavsif: "", holat: "faol" };
  Modal.och(`<form id="kurs-forma" class="forma" data-id="${k.id || ""}" novalidate><h2 class="sheet-h">${yangi ? "Yangi kurs" : "Kurs"}</h2>
    <label class="maydon"><span>Kurs nomi *</span><input id="k-nomi" value="${esc(k.nomi)}" placeholder="Ingliz tili" autofocus autocomplete="off"></label>
    <div class="ikki"><label class="maydon"><span>Davomiyligi, oy</span><input id="k-oy" inputmode="numeric" value="${esc(k.davomiylik || "")}"></label>
      <label class="maydon"><span>Odatiy narx (oylik)</span><input id="k-narx" inputmode="numeric" data-pul value="${k.narx ? pul(k.narx, " ") : ""}"></label></div>
    <label class="maydon"><span>Tavsif</span><input id="k-tavsif" value="${esc(k.tavsif || "")}" autocomplete="off"></label>
    <label class="toggle"><input type="checkbox" id="k-faol" ${k.holat !== "yopilgan" ? "checked" : ""}> Faol</label>
    <p class="xato" id="k-xato" hidden></p>
    <div class="sheet-actions">${yangi || !direktorMi() ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="kurs-ochir" data-id="${k.id}">O‘chirish</button>`}
      <button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`);
}
function renderMavsumlar() {
  const qosh = `<button class="btn btn-primary" data-act="mavsum-yangi">${icon("plus", 18)} Mavsum qo‘shish</button>`;
  if (!DB.mavsumlar.length) return boshHolat({ ic: "calendar", sarlavha: "Mavsum yo‘q", matn: `Mavsum, masalan «2026 Kuz: 1-sentabr — 31-dekabr». ${katta(T.guruhlar)}ni mavsumga biriktirib, natijalarni solishtirasiz.`, tugma: qosh });
  const b = bugun();
  return bolimBosh(`${DB.mavsumlar.length} ta mavsum`, qosh) + `<div class="kartalar">${DB.mavsumlar.slice().sort((x, y) => y.boshlanish.localeCompare(x.boshlanish)).map(m => {
    const s = davrStat(m.boshlanish, m.tugash), gs = GR().filter(g => g.mavsumId === m.id), joriy = m.boshlanish <= b && m.tugash >= b;
    return `<article class="card guruh-k"><div class="gk-top"><div><h3>${esc(m.nomi)}</h3><div class="muted sm">${sanaMatn(m.boshlanish)} — ${sanaMatn(m.tugash)}</div></div>${joriy ? `<span class="pill ok">Joriy</span>` : m.tugash < b ? `<span class="pill">Tugagan</span>` : `<span class="pill primary">Kelgusi</span>`}</div>
      <div class="xulosa" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div><b>${gs.length}</b><span>${katta(T.guruhlar)}</span></div><div><b>${s.yangi}</b><span>Yangi ${T.oquvchilar}</span></div></div>
      <div class="iq-top"><span class="muted">Tushum</span><b>${pulS(s.sofTushum)}</b></div><div class="iq-top"><span class="muted">Sof</span><b class="${s.sof < 0 ? "qizil" : ""}">${pulS(s.sof)}</b></div>
      <div class="gk-pas"><button class="btn btn-soft btn-sm" data-act="mavsum-stat" data-id="${m.id}">${icon("chart", 16)} Statistika</button><button class="icon-btn tekis" data-act="mavsum-tahrir" data-id="${m.id}" aria-label="Tahrirlash">${icon("edit", 20)}</button></div></article>`;
  }).join("")}</div>`;
}
function mavsumForma(m) {
  const yangi = !m, y = bugun().slice(0, 4);
  m = m || { nomi: "", boshlanish: `${y}-09-01`, tugash: `${y}-12-31` };
  Modal.och(`<form id="mavsum-forma" class="forma" data-id="${m.id || ""}" novalidate><h2 class="sheet-h">${yangi ? "Yangi mavsum" : "Mavsum"}</h2>
    <label class="maydon"><span>Nomi *</span><input id="m-nom" value="${esc(m.nomi)}" placeholder="${y} Kuz" autofocus autocomplete="off"></label>
    <div class="ikki"><label class="maydon"><span>Boshlanish</span><input id="m-bosh" type="date" value="${m.boshlanish}"></label><label class="maydon"><span>Tugash</span><input id="m-tug" type="date" value="${m.tugash}"></label></div>
    <p class="xato" id="m-xato" hidden></p>
    <div class="sheet-actions">${yangi ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="mavsum-ochir" data-id="${m.id}">O‘chirish</button>`}
      <button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`);
}
function renderChegirmalar() {
  const dir = direktorMi();
  const qosh = dir ? `<button class="btn btn-primary" data-act="chegirma-yangi">${icon("plus", 18)} Chegirma qo‘shish</button>` : "";
  const oy = joriyOy();
  const ishlatish = c => OQ().filter(o => faolAzoliklar(o).some(a => a.chegirmaId === c.id));
  const summa = c => sum(OQ(), o => sum(hisobHolati(o).hisoblar.filter(h => h.oy === oy && (o.azolik || []).some(a => a.guruhId === h.guruhId && a.chegirmaId === c.id)), h => h.chegirma || 0));
  const qolda = OQ().filter(o => faolAzoliklar(o).some(a => !a.chegirmaId && +a.chegirma));
  if (!DB.chegirmalar.length && !qolda.length) return boshHolat({ ic: "gift", sarlavha: "Chegirma turlari yo‘q", matn: "Masalan: «Aka-uka 10%», «Oldindan 3 oy 15%», «Ijtimoiy 50 000 so‘m». Keyin o‘quvchini guruhga qo‘shganda tanlanadi.", tugma: qosh });
  const jami = sum(DB.chegirmalar, summa) + sum(qolda, o => sum(hisobHolati(o).hisoblar.filter(h => h.oy === oy), h => h.chegirma || 0));
  return bolimBosh(`Shu oy berilgan chegirma: <b>${pulS(jami)}</b>`, qosh) + `<div class="kartalar">${DB.chegirmalar.map(c => { const l = ishlatish(c); return `<article class="card guruh-k">
      <div class="gk-top"><div><h3>${esc(c.nomi)}</h3><div class="muted sm">${esc(c.izoh || "")}</div></div><span class="narx">${c.turi === "summa" ? pulS(c.qiymat) : c.qiymat + "%"}</span></div>
      <div class="iq-top"><span class="muted">Foydalanayotganlar</span><b>${l.length} ta ${T.oquvchi}</b></div>
      <div class="iq-top"><span class="muted">Shu oy summasi</span><b>${pulS(summa(c))}</b></div>
      ${l.length ? `<div class="kunlar">${l.slice(0, 6).map(o => `<button class="chip" data-act="profil" data-id="${o.id}">${esc(o.ism)}</button>`).join("")}</div>` : ""}
      <div class="gk-pas">${c.faol === false ? `<span class="pill">Nofaol</span>` : `<span class="pill ok">Faol</span>`}${dir ? `<button class="icon-btn tekis" data-act="chegirma-tahrir" data-id="${c.id}" aria-label="Tahrirlash">${icon("edit", 20)}</button>` : ""}</div></article>`; }).join("")}</div>
    ${qolda.length ? `<section class="card"><div class="card-h"><h2>Qo‘lda kiritilgan foizlar</h2></div><div class="kunlar">${qolda.map(o => `<button class="chip" data-act="profil" data-id="${o.id}">${esc(o.ism)}: ${faolAzoliklar(o).filter(a => +a.chegirma).map(a => a.chegirma + "%").join(", ")}</button>`).join("")}</div></section>` : ""}`;
}
function chegirmaForma(c) {
  const yangi = !c; c = c || { nomi: "", turi: "foiz", qiymat: 10, izoh: "", faol: true };
  Modal.och(`<form id="chegirma-forma" class="forma" data-id="${c.id || ""}" novalidate><h2 class="sheet-h">${yangi ? "Yangi chegirma" : "Chegirma"}</h2>
    <label class="maydon"><span>Nomi *</span><input id="c-nom" value="${esc(c.nomi)}" placeholder="Aka-uka chegirmasi" autofocus autocomplete="off"></label>
    <div class="maydon"><span>Turi</span><div class="seg"><label><input type="radio" name="c-turi" value="foiz" ${c.turi !== "summa" ? "checked" : ""}><span>Foiz, %</span></label><label><input type="radio" name="c-turi" value="summa" ${c.turi === "summa" ? "checked" : ""}><span>Summa, ${SOZLAMALAR.valyuta}</span></label></div></div>
    <label class="maydon"><span>Qiymati *</span><input id="c-qiymat" inputmode="numeric" value="${c.turi === "summa" ? pul(c.qiymat, " ") : c.qiymat}"></label>
    <label class="maydon"><span>Izoh</span><input id="c-izoh" value="${esc(c.izoh || "")}" placeholder="Kimga beriladi" autocomplete="off"></label>
    <label class="toggle"><input type="checkbox" id="c-faol" ${c.faol !== false ? "checked" : ""}> Faol</label>
    <p class="xato" id="c-xato" hidden></p>
    <div class="sheet-actions">${yangi ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="chegirma-ochir" data-id="${c.id}">O‘chirish</button>`}
      <button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`);
}
function renderFiliallar() {
  const qosh = `<button class="btn btn-primary" data-act="filial-yangi">${icon("plus", 18)} Filial qo‘shish</button>`;
  if (!DB.filiallar.length) return boshHolat({ ic: "home", sarlavha: "Filiallar qo‘shilmagan", matn: `Markazingizning bir nechta filiali bo‘lsa, ularni qo‘shing. ${katta(T.guruhlar)} va xodimlar filialga biriktiriladi, tepada filial tanlab ishlaysiz.`, tugma: qosh });
  const oy = joriyOy();
  return bolimBosh(`${DB.filiallar.length} ta filial · tepadagi tanlov orqali filial bo‘yicha ishlang`, qosh) + `<div class="kartalar">${DB.filiallar.map(f => {
    const gs = DB.guruhlar.filter(g => g.filialId === f.id && g.holat !== "yopilgan"), gIds = new Set(gs.map(g => g.id));
    const oq = DB.oquvchilar.filter(o => faolAzoliklar(o).some(a => gIds.has(a.guruhId)));
    const ids = new Set(DB.oquvchilar.filter(o => (o.azolik || []).some(a => (guruh(a.guruhId) || {}).filialId === f.id)).map(o => o.id));
    const tushum = sum(DB.tolovlar.filter(t => ids.has(t.oquvchiId) && (t.sana || "").startsWith(oy)), tolovSumma);
    const xod = DB.xodimlar.filter(x => x.filialId === f.id).length;
    return `<article class="card guruh-k"><div class="gk-top"><div><h3>${esc(f.nomi)}</h3><div class="muted sm">${esc([f.manzil, f.tel].filter(Boolean).join(" · "))}</div></div>${UI.filial === f.id ? `<span class="pill primary">Tanlangan</span>` : ""}</div>
      <div class="xulosa" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>${gs.length}</b><span>${katta(T.guruhlar)}</span></div><div><b>${oq.length}</b><span>${katta(T.oquvchilar)}</span></div><div><b>${xod}</b><span>Xodimlar</span></div></div>
      <div class="iq-top"><span class="muted">Shu oy tushum</span><b>${pulS(tushum)}</b></div>
      <div class="gk-pas"><button class="btn btn-soft btn-sm" data-act="filial-tanla" data-id="${f.id}">Shu filialda ishlash</button><button class="icon-btn tekis" data-act="filial-tahrir" data-id="${f.id}" aria-label="Tahrirlash">${icon("edit", 20)}</button></div></article>`;
  }).join("")}</div>`;
}
function filialForma(f) {
  const yangi = !f; f = f || { nomi: "", manzil: "", tel: "" };
  Modal.och(`<form id="filial-forma" class="forma" data-id="${f.id || ""}" novalidate><h2 class="sheet-h">${yangi ? "Yangi filial" : "Filial"}</h2>
    <label class="maydon"><span>Nomi *</span><input id="f-nom" value="${esc(f.nomi)}" placeholder="Markaziy filial" autofocus autocomplete="off"></label>
    <div class="ikki"><label class="maydon"><span>Manzil</span><input id="f-manzil" value="${esc(f.manzil || "")}"></label><label class="maydon"><span>Telefon</span><input id="f-tel" type="tel" value="${esc(f.tel || "")}"></label></div>
    ${yangi && DB.guruhlar.some(g => !g.filialId) ? `<label class="toggle"><input type="checkbox" id="f-hammasi" ${DB.filiallar.length ? "" : "checked"}> Filialsiz ${T.guruhlar} va xodimlarni shu filialga biriktirish</label>` : ""}
    <p class="xato" id="f-xato" hidden></p>
    <div class="sheet-actions">${yangi ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="filial-ochir" data-id="${f.id}">O‘chirish</button>`}
      <button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`);
}

/* =====================================================================
   17. UY VAZIFALARI VA SO‘ROVLAR
   ===================================================================== */
function renderVazifalar() {
  const gs = menGuruhlarim().filter(g => g.holat !== "yopilgan").sort(ismBoyicha);
  if (!gs.length) return boshHolat({ ic: "file", sarlavha: `${katta(T.guruh)} yo‘q`, matn: oqituvchiMi() ? `Sizga hali ${T.guruh} biriktirilmagan.` : `Avval ${T.guruh} oching.` });
  if (!gs.some(g => g.id === UI.vz.guruh)) UI.vz.guruh = gs[0].id;
  const g = guruh(UI.vz.guruh), l = DB.vazifalar.filter(v => v.guruhId === g.id).sort((a, b) => (b.sana || "").localeCompare(a.sana || "") || (b.yaratildi || 0) - (a.yaratildi || 0));
  const n = guruhOquvchilari(g.id).length, b = bugun();
  const ortacha = l.slice(0, 10).map(v => { const m = guruhOquvchilari(g.id, v.sana).length; return m ? Object.keys(v.bajardi || {}).length / m : null; }).filter(x => x !== null);
  return `<div class="chiplar" role="group" aria-label="${katta(T.guruh)}">${gs.map(x => `<button class="chip" data-act="vz-guruh" data-id="${x.id}" aria-pressed="${x.id === g.id}">${esc(x.nomi)}</button>`).join("")}</div>
    ${bolimBosh(`${n} ta ${T.oquvchi} · ${l.length} ta vazifa${ortacha.length ? ` · o‘rtacha bajarilish ${Math.round(sum(ortacha, x => x) * 100 / ortacha.length)}%` : ""}`, `<button class="btn btn-primary" data-act="vazifa-yangi">${icon("plus", 18)} Vazifa berish</button>`)}
    ${l.length ? `<div class="kartalar">${l.map(v => { const m = guruhOquvchilari(g.id, v.sana).length, bj = Object.keys(v.bajardi || {}).length, f = m ? Math.round(bj * 100 / m) : 0; return `<article class="card vz-k">
      <div class="qator-orasi"><span class="muted sm">${sanaMatn(v.sana)} · muddat ${sanaMatn(v.muddat)}</span>${v.muddat < b ? `<span class="pill">Muddati o‘tgan</span>` : `<span class="pill primary">Davom etmoqda</span>`}</div>
      <div class="matn">${esc(v.matn)}</div>
      <div class="hb"><span class="hb-l">Bajardi</span>${progress(f, "ok")}<b style="width:auto">${bj}/${m}</b></div>
      <div class="gk-pas"><button class="btn btn-soft btn-sm" data-act="vazifa-tekshir" data-id="${v.id}">${icon("check2", 16)} Tekshirish</button>
        <div><a class="icon-btn tekis" href="${esc(tgHavola(`${g.nomi}: uy vazifasi (${sanaMatn(v.muddat)} gacha)\n${v.matn}`))}" target="_blank" rel="noopener" aria-label="Telegram orqali yuborish">${icon("send", 18)}</a>
        <button class="icon-btn tekis" data-act="vazifa-ochir" data-id="${v.id}" aria-label="O‘chirish">${icon("trash", 18)}</button></div></div></article>`; }).join("")}</div>`
      : boshHolat({ ic: "file", sarlavha: "Hali vazifa berilmagan", matn: `Vazifa bering, keyin kim bajarganini belgilang. Statistikada ${T.oqituvchilar} bo‘yicha bajarilish foizi chiqadi.` })}`;
}
function vazifaForma() {
  Modal.och(`<form id="vazifa-forma" class="forma" novalidate><h2 class="sheet-h">${esc(guruh(UI.vz.guruh).nomi)}: uy vazifasi</h2>
    <label class="maydon"><span>Vazifa matni *</span><textarea id="v-matn" rows="4" autofocus placeholder="Masalan: 12-mashq, 45-betdagi so‘zlarni yod olish"></textarea></label>
    <div class="ikki"><label class="maydon"><span>Berilgan sana</span><input id="v-sana" type="date" value="${bugun()}"></label><label class="maydon"><span>Muddat</span><input id="v-muddat" type="date" value="${sanaQosh(bugun(), 2)}"></label></div>
    <p class="xato" id="v-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Berish</button></div></form>`);
}
function vazifaTekshir(id) {
  const v = DB.vazifalar.find(x => x.id === id); if (!v) return;
  const l = guruhOquvchilari(v.guruhId, v.sana);
  UI.vzBelgi = { ...(v.bajardi || {}) };
  Modal.och(`<h2 class="sheet-h">Kim bajardi?</h2><p class="sheet-p">${esc(v.matn.slice(0, 120))}</p>
    <div>${l.map(o => `<div class="belgi-q"><span>${esc(o.ism)}</span><div class="seg" style="width:220px">
      <button type="button" data-act="vz-belgi" data-oid="${o.id}" data-v="1" aria-pressed="${!!UI.vzBelgi[o.id]}">Bajardi</button>
      <button type="button" data-act="vz-belgi" data-oid="${o.id}" data-v="0" aria-pressed="${!UI.vzBelgi[o.id]}">Yo‘q</button></div></div>`).join("") || `<p class="bosh-matn">${katta(T.guruh)}da ${T.oquvchi} yo‘q.</p>`}</div>
    <div class="sheet-actions"><button class="btn btn-ghost" data-act="vz-hammasi">Hammasi bajardi</button><button class="btn btn-primary" data-act="vz-saqla" data-id="${v.id}">Saqlash</button></div>`);
}
const SOROV_HOLAT = [["yangi", "Yangi"], ["jarayonda", "Jarayonda"], ["hal", "Hal qilindi"]];
function renderSorovlar() {
  const qosh = `<button class="btn btn-primary" data-act="sorov-yangi">${icon("plus", 18)} So‘rov qo‘shish</button>`;
  const hamma = SR();
  if (!hamma.length) return boshHolat({ ic: "phone", sarlavha: "So‘rovlar yo‘q", matn: `${katta(T.otaOna)} yoki ${T.oquvchilar}dan kelgan savol, shikoyat va takliflarni yozib boring: hech biri e’tiborsiz qolmaydi.`, tugma: qosh });
  const l = hamma.filter(x => UI.sr.holat === "hammasi" || x.holat === UI.sr.holat).sort((a, b) => (b.yaratildi || 0) - (a.yaratildi || 0));
  return `<div class="qator-orasi"><div class="chiplar">${[...SOROV_HOLAT, ["hammasi", "Hammasi"]].map(([k, n]) => `<button class="chip" data-act="sr-holat" data-v="${k}" aria-pressed="${UI.sr.holat === k}">${n} <span class="son">${k === "hammasi" ? hamma.length : hamma.filter(x => x.holat === k).length}</span></button>`).join("")}</div>${qosh}</div>
    ${l.length ? `<div class="kartalar">${l.map(x => { const o = x.oquvchiId && oquvchi(x.oquvchiId), xd = xodim(x.xodimId); return `<article class="card vz-k">
      <div class="qator-orasi"><div><b>${esc(x.ism || (o && o.ism) || "Noma’lum")}</b><div class="muted sm">${esc(x.tel || (o && (o.otaTel || o.tel)) || "")}${o ? ` · ${esc(o.ism)}` : ""}</div></div><span class="pill ${x.turi === "Shikoyat" ? "bad" : "primary"}">${esc(x.turi)}</span></div>
      <div class="matn">${esc(x.matn)}</div>
      ${x.javob ? `<div class="info-quti"><span class="muted sm">Javob${xd ? ` (${esc(xd.ism)})` : ""}:</span><span class="matn">${esc(x.javob)}</span></div>` : ""}
      <div class="muted sm">${x.yaratildi ? sanaMatn(sanaStr(new Date(x.yaratildi))) : ""}</div>
      <div class="gk-pas">${segTugmalar("sr-ozgar", SOROV_HOLAT, x.holat, `data-id="${x.id}"`)}<button class="icon-btn tekis" data-act="sorov-javob" data-id="${x.id}" aria-label="Javob yozish">${icon("message", 18)}</button></div></article>`; }).join("")}</div>`
      : `<p class="bosh-matn">Bu holatda so‘rov yo‘q.</p>`}`;
}
function sorovForma() {
  Modal.och(`<form id="sorov-forma" class="forma" novalidate><h2 class="sheet-h">Yangi so‘rov</h2>
    <label class="maydon"><span>${katta(T.oquvchi)} (ixtiyoriy)</span><select id="s-oq"><option value="">Tanlanmagan</option>${OQ().filter(oquvchiFaol).sort(ismBoyicha).map(o => `<option value="${o.id}">${esc(o.ism)}</option>`).join("")}</select></label>
    <div class="ikki"><label class="maydon"><span>Kim murojaat qildi</span><input id="s-ism" placeholder="Masalan: onasi" autocomplete="off"></label><label class="maydon"><span>Telefon</span><input id="s-tel" type="tel"></label></div>
    <label class="maydon"><span>Turi</span><select id="s-turi">${tanlov(SOZLAMALAR.sorovTurlari, SOZLAMALAR.sorovTurlari[0])}</select></label>
    <label class="maydon"><span>Matn *</span><textarea id="s-matn" rows="3" autofocus></textarea></label>
    <p class="xato" id="s-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`);
}
function sorovJavob(id) {
  const x = DB.sorovlar.find(z => z.id === id); if (!x) return;
  const o = x.oquvchiId && oquvchi(x.oquvchiId);
  Modal.och(`<form id="javob-forma" class="forma" data-id="${id}" novalidate><h2 class="sheet-h">Javob</h2><p class="sheet-p" style="margin:0">${esc(x.matn)}</p>
    <label class="maydon"><span>Javob matni</span><textarea id="j-matn" rows="4" data-xabar="javob" autofocus>${esc(x.javob || `Assalomu alaykum${x.ism ? ", " + x.ism : ""}! `)}</textarea></label>
    <div class="tel">Telefon: <b>${esc(x.tel || (o && (o.otaTel || o.tel)) || "kiritilmagan")}</b></div>
    <div class="sheet-actions"><a class="btn btn-ghost" id="tg-javob" href="${esc(tgHavola(x.javob || ""))}" target="_blank" rel="noopener">${icon("send", 18)} Telegram</a>
      <button type="submit" class="btn btn-primary">Saqlash va hal qilindi</button></div></form>`);
}

/* =====================================================================
   18. YANGI BO‘LIMLAR TUGMALARI VA FORMALARI
   ===================================================================== */
Object.assign(AMALLAR, {
  // Statistika
  "st-tab": el => { UI.st.tab = el.dataset.v; render(); },
  "st-tayyor": el => {
    const b = bugun(), v = el.dataset.v, st = UI.st; st.mavsum = "";
    if (v === "7") { st.dan = sanaQosh(b, -6); st.gacha = b; st.qadam = "kunlik"; }
    else if (v === "30") { st.dan = sanaQosh(b, -29); st.gacha = b; st.qadam = "kunlik"; }
    else if (v === "buoy") { st.dan = joriyOy() + "-01"; st.gacha = b; st.qadam = "kunlik"; }
    else if (v === "otgan") { const o = oyQosh(joriyOy(), -1); st.dan = o + "-01"; st.gacha = oyOxiri(o); st.qadam = "kunlik"; }
    else if (v === "90") { st.dan = sanaQosh(b, -89); st.gacha = b; st.qadam = "haftalik"; }
    else { st.dan = oyQosh(joriyOy(), -11) + "-01"; st.gacha = b; st.qadam = "oylik"; }
    render();
  },
  "mavsum-stat": el => { const m = byId("mavsumlar").get(el.dataset.id); if (!m) return; Object.assign(UI.st, { mavsum: m.id, dan: m.boshlanish, gacha: m.tugash, qadam: kunFarqi(m.boshlanish, m.tugash) > 92 ? "oylik" : "haftalik", tab: "umumiy" }); ot("statistika"); },
  // Diqqat
  "dq-tur": el => { UI.dq.tur = el.dataset.v; render(); },
  "dq-daraja": el => { UI.dq.daraja = el.dataset.v; render(); },
  "dav-ochish-sana": el => { UI.davGuruh = el.dataset.id; UI.davSana = el.dataset.s || bugun(); UI.dav = null; ot("davomat"); },
  "oylik-otgan": () => { UI.oqitOy = oyQosh(joriyOy(), -1); ot("oqituvchilar"); },
  // Davomat: bekor qilish
  "dav-bekor": async () => {
    const k = UI.dav.kalit;
    Modal.och(`<form id="bekor-forma" class="forma" data-k="${esc(k)}" novalidate><h2 class="sheet-h">Darsni bekor qilish</h2>
      <p class="sheet-p" style="margin:0">${esc(guruh(UI.davGuruh).nomi)} · ${sanaMatn(UI.davSana)}. Bekor qilingan dars davomat va «har dars» to‘lovida hisoblanmaydi.</p>
      <label class="maydon"><span>Sabab</span><input id="bk-sabab" placeholder="Masalan: bayram, o‘qituvchi kasal" autofocus autocomplete="off"></label>
      <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Ortga</button><button type="submit" class="btn btn-danger">Bekor qilish</button></div></form>`);
  },
  "dav-bekor-qaytar": () => { Ombor.bekorYoz(`${UI.davGuruh}|${UI.davSana}`, null); UI.dav = null; render(); toast("Dars tiklandi"); },
  // Qabulxona
  "qb-tab": el => { UI.qb.tab = el.dataset.v; UI.qb.sahifa = 1; render(); },
  "qb-holat": el => { UI.qb.holat = el.dataset.v; UI.qb.sahifa = 1; render(); },
  "qb-sahifa": el => { UI.qb.sahifa = Math.max(1, UI.qb.sahifa + +el.dataset.n); $("#qb-royxat").innerHTML = qabulJadval(); },
  "qb-tozala": () => { Object.assign(UI.qb, { tab: "hammasi", qidiruv: "", guruh: "", oqit: "", holat: "hammasi", sahifa: 1 }); render(); },
  "import": () => $("#fayl-import").click(),
  "import-tasdiq": () => {
    const l = UI.importlar || [], och = $("#imp-guruh") && $("#imp-guruh").checked;
    if (och) {
      const narx = raqam($("#imp-narx").value);
      if (!narx) return xatoKorsat("#imp-xato", `Yangi ${T.guruhlar} uchun oylik narxni kiriting.`);
      const yangiG = new Map();
      l.filter(x => !x.guruhId && x.guruhNomi).forEach(x => {
        const nom = x.guruhNomi.trim();
        if (!yangiG.has(nom)) yangiG.set(nom, Ombor.yoz("guruhlar", { id: yangiId(), nomi: nom, fan: "", oqituvchiId: "", xonaId: "", ...nomdanJadval(nom), narxTuri: "oylik", narx,
          holat: "faol", ochilgan: bugun(), kursId: "", mavsumId: "", filialId: joriyFilial(), sigim: "", tugashSana: "" }).id);
        x.guruhId = yangiG.get(nom);
      });
    }
    l.forEach(x => Ombor.yoz("oquvchilar", { id: yangiId(), ism: x.ism, tel: x.tel, otaTel: x.otaTel, tugilgan: x.tugilgan || "", manba: "", izoh: "Import", yaratildi: Date.now(), filialId: joriyFilial(),
      azolik: x.guruhId ? [{ guruhId: x.guruhId, qoshilgan: x.sana, chiqqan: "", chegirma: 0, chegirmaId: "" }] : [] }));
    UI.importlar = null; Modal.yop(); render(); toast(`${l.length} ta ${T.oquvchi} qo‘shildi`);
  },
  // Kurslar
  "kurs-yangi": () => kursForma(),
  "kurs-tahrir": el => kursForma(byId("kurslar").get(el.dataset.id)),
  "guruh-kursga": el => { const k = byId("kurslar").get(el.dataset.id); guruhForma(); const s = $("#g-kurs"); if (s) s.value = k.id; const n = $("#g-narx"); if (n && k.narx) n.value = pul(k.narx, " "); const nm = $("#g-nomi"); if (nm) nm.value = k.nomi + " — "; },
  "kurs-ochir": async el => {
    const k = byId("kurslar").get(el.dataset.id); if (!k) return;
    if (DB.guruhlar.some(g => g.kursId === k.id)) { await tasdiq(`Bu kursda ${T.guruhlar} bor. O‘chirish o‘rniga «Faol» belgisini olib tashlang.`, { tugma: "Tushunarli", sarlavha: "O‘chirib bo‘lmaydi" }); return; }
    if (!(await tasdiq(`«${esc(k.nomi)}» kursi o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true }))) return;
    Ombor.ochir("kurslar", k.id); render(); toast("Kurs o‘chirildi");
  },
  // Mavsumlar, chegirmalar, filiallar
  "mavsum-yangi": () => mavsumForma(),
  "mavsum-tahrir": el => mavsumForma(byId("mavsumlar").get(el.dataset.id)),
  "mavsum-ochir": async el => {
    const m = byId("mavsumlar").get(el.dataset.id); if (!m) return;
    if (!(await tasdiq(`«${esc(m.nomi)}» o‘chirilsinmi? ${katta(T.guruhlar)} o‘chmaydi, faqat mavsumdan ajraladi.`, { tugma: "O‘chirish", xavfli: true }))) return;
    DB.guruhlar.filter(g => g.mavsumId === m.id).forEach(g => Ombor.yoz("guruhlar", { ...g, mavsumId: "" }));
    Ombor.ochir("mavsumlar", m.id); render(); toast("Mavsum o‘chirildi");
  },
  "guruh-mavsum": el => { UI.guruhMavsum = el.dataset.v; render(); },
  "chegirma-yangi": () => chegirmaForma(),
  "chegirma-tahrir": el => chegirmaForma(byId("chegirmalar").get(el.dataset.id)),
  "chegirma-ochir": async el => {
    const c = byId("chegirmalar").get(el.dataset.id); if (!c) return;
    if (DB.oquvchilar.some(o => (o.azolik || []).some(a => a.chegirmaId === c.id))) { await tasdiq(`Bu chegirma ${T.oquvchilar}da ishlatilgan. Tarix buzilmasligi uchun o‘chirish o‘rniga «Faol» belgisini olib tashlang.`, { tugma: "Tushunarli", sarlavha: "O‘chirib bo‘lmaydi" }); return; }
    if (!(await tasdiq(`«${esc(c.nomi)}» o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true }))) return;
    Ombor.ochir("chegirmalar", c.id); render(); toast("Chegirma o‘chirildi");
  },
  "filial-yangi": () => filialForma(),
  "filial-tahrir": el => filialForma(byId("filiallar").get(el.dataset.id)),
  "filial-tanla": el => { UI.filial = el.dataset.id; Mahalliy.qoy("oquv-crm-filial", UI.filial); ot("bosh"); toast(`Filial: ${byId("filiallar").get(UI.filial).nomi}`); },
  "filial-ochir": async el => {
    const f = byId("filiallar").get(el.dataset.id); if (!f) return;
    if (DB.guruhlar.some(g => g.filialId === f.id)) { await tasdiq(`Bu filialda ${T.guruhlar} bor. Avval ularni boshqa filialga o‘tkazing.`, { tugma: "Tushunarli", sarlavha: "O‘chirib bo‘lmaydi" }); return; }
    if (!(await tasdiq(`«${esc(f.nomi)}» o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true }))) return;
    DB.xodimlar.filter(x => x.filialId === f.id).forEach(x => Ombor.yoz("xodimlar", { ...x, filialId: "" }));
    if (UI.filial === f.id) { UI.filial = ""; Mahalliy.qoy("oquv-crm-filial", ""); }
    Ombor.ochir("filiallar", f.id); render(); toast("Filial o‘chirildi");
  },
  // Uy vazifalari
  "vz-guruh": el => { UI.vz.guruh = el.dataset.id; render(); },
  "vazifa-yangi": () => vazifaForma(),
  "vazifa-tekshir": el => vazifaTekshir(el.dataset.id),
  "vz-belgi": el => { const { oid, v } = el.dataset; if (v === "1") UI.vzBelgi[oid] = true; else delete UI.vzBelgi[oid]; $$(`[data-act="vz-belgi"][data-oid="${oid}"]`).forEach(b => b.setAttribute("aria-pressed", String((b.dataset.v === "1") === !!UI.vzBelgi[oid]))); },
  "vz-hammasi": () => { $$('[data-act="vz-belgi"][data-v="1"]').forEach(b => AMALLAR["vz-belgi"](b)); },
  "vz-saqla": el => { const v = DB.vazifalar.find(x => x.id === el.dataset.id); Ombor.yoz("vazifalar", { ...v, bajardi: { ...UI.vzBelgi } }); Modal.yop(); render(); toast("Saqlandi"); },
  "vazifa-ochir": async el => { if (!(await tasdiq("Vazifa o‘chirilsinmi?", { tugma: "O‘chirish", xavfli: true }))) return; Ombor.ochir("vazifalar", el.dataset.id); render(); },
  // So‘rovlar
  "sr-holat": el => { UI.sr.holat = el.dataset.v; render(); },
  "sorov-yangi": () => sorovForma(),
  "sorov-javob": el => sorovJavob(el.dataset.id),
  "sr-ozgar": el => { const x = DB.sorovlar.find(z => z.id === el.dataset.id); Ombor.yoz("sorovlar", { ...x, holat: el.dataset.v }); render(); },
});
Object.assign(FORMALAR, {
  "bekor-forma": f => { Ombor.bekorYoz(f.dataset.k, $("#bk-sabab").value.trim()); Modal.yop(); UI.dav = null; render(); toast("Dars bekor qilindi"); },
  "kurs-forma": f => {
    const nomi = $("#k-nomi").value.trim(); if (!nomi) return xatoKorsat("#k-xato", "Kurs nomini kiriting.");
    Ombor.yoz("kurslar", { ...(f.dataset.id ? byId("kurslar").get(f.dataset.id) : { id: yangiId() }), nomi, davomiylik: raqam($("#k-oy").value) || "", narx: raqam($("#k-narx").value) || "", tavsif: $("#k-tavsif").value.trim(), holat: $("#k-faol").checked ? "faol" : "yopilgan" });
    Modal.yop(); render(); toast("Kurs saqlandi");
  },
  "mavsum-forma": f => {
    const nomi = $("#m-nom").value.trim(), bosh = $("#m-bosh").value, tug = $("#m-tug").value;
    if (!nomi) return xatoKorsat("#m-xato", "Nomini kiriting.");
    if (!bosh || !tug || tug < bosh) return xatoKorsat("#m-xato", "Tugash sanasi boshlanishdan keyin bo‘lsin.");
    Ombor.yoz("mavsumlar", { ...(f.dataset.id ? byId("mavsumlar").get(f.dataset.id) : { id: yangiId() }), nomi, boshlanish: bosh, tugash: tug });
    Modal.yop(); render(); toast("Mavsum saqlandi");
  },
  "chegirma-forma": f => {
    const nomi = $("#c-nom").value.trim(), turi = ($('input[name="c-turi"]:checked', f) || {}).value || "foiz", q = raqam($("#c-qiymat").value);
    if (!nomi) return xatoKorsat("#c-xato", "Nomini kiriting.");
    if (!q || (turi === "foiz" && q > 100)) return xatoKorsat("#c-xato", turi === "foiz" ? "Foiz 1 dan 100 gacha bo‘lsin." : "Summani kiriting.");
    Ombor.yoz("chegirmalar", { ...(f.dataset.id ? byId("chegirmalar").get(f.dataset.id) : { id: yangiId() }), nomi, turi, qiymat: q, izoh: $("#c-izoh").value.trim(), faol: $("#c-faol").checked });
    Modal.yop(); render(); toast("Chegirma saqlandi");
  },
  "filial-forma": f => {
    const nomi = $("#f-nom").value.trim(); if (!nomi) return xatoKorsat("#f-xato", "Filial nomini kiriting.");
    const fl = Ombor.yoz("filiallar", { ...(f.dataset.id ? byId("filiallar").get(f.dataset.id) : { id: yangiId() }), nomi, manzil: $("#f-manzil").value.trim(), tel: $("#f-tel").value.trim() });
    const h = $("#f-hammasi");
    if (h && h.checked) { DB.guruhlar.filter(g => !g.filialId).forEach(g => Ombor.yoz("guruhlar", { ...g, filialId: fl.id })); }
    Modal.yop(); render(); toast("Filial saqlandi");
  },
  "vazifa-forma": () => {
    const matn = $("#v-matn").value.trim(); if (!matn) return xatoKorsat("#v-xato", "Vazifa matnini yozing.");
    Ombor.yoz("vazifalar", { id: yangiId(), guruhId: UI.vz.guruh, sana: $("#v-sana").value || bugun(), muddat: $("#v-muddat").value || bugun(), matn, xodimId: Sessiya.xodimId, bajardi: {}, yaratildi: Date.now() });
    Modal.yop(); render(); toast("Vazifa berildi");
  },
  "sorov-forma": () => {
    const matn = $("#s-matn").value.trim(); if (!matn) return xatoKorsat("#s-xato", "So‘rov matnini yozing.");
    const oid = $("#s-oq").value, o = oid && oquvchi(oid);
    Ombor.yoz("sorovlar", { id: yangiId(), oquvchiId: oid, ism: $("#s-ism").value.trim() || (o ? o.ism : ""), tel: $("#s-tel").value.trim() || (o ? (o.otaTel || o.tel) : ""), turi: $("#s-turi").value, matn, holat: "yangi", javob: "", xodimId: Sessiya.xodimId, filialId: joriyFilial(), yaratildi: Date.now() });
    Modal.yop(); UI.sr.holat = "yangi"; render(); toast("So‘rov qo‘shildi");
  },
  "javob-forma": f => { const x = DB.sorovlar.find(z => z.id === f.dataset.id); Ombor.yoz("sorovlar", { ...x, javob: $("#j-matn").value.trim(), holat: "hal", xodimId: Sessiya.xodimId }); Modal.yop(); render(); toast("Javob saqlandi"); },
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "qb-qidir") { UI.qb.qidiruv = t.value; UI.qb.sahifa = 1; $("#qb-royxat").innerHTML = qabulJadval(); }
});
document.addEventListener("change", e => {
  const t = e.target;
  switch (t.id) {
    case "filial-tanlov": UI.filial = t.value; Mahalliy.qoy("oquv-crm-filial", t.value); UI.dav = null; render(); break;
    case "qb-guruh": UI.qb.guruh = t.value; UI.qb.sahifa = 1; $("#qb-royxat").innerHTML = qabulJadval(); break;
    case "qb-oqit": UI.qb.oqit = t.value; UI.qb.sahifa = 1; $("#qb-royxat").innerHTML = qabulJadval(); break;
    case "qb-hajm": UI.qb.hajm = +t.value; UI.qb.sahifa = 1; $("#qb-royxat").innerHTML = qabulJadval(); break;
    case "st-dan": if (t.value) { UI.st.dan = t.value; if (UI.st.gacha < t.value) UI.st.gacha = t.value; UI.st.mavsum = ""; render(); } break;
    case "st-gacha": if (t.value) { UI.st.gacha = t.value; if (UI.st.dan > t.value) UI.st.dan = t.value; UI.st.mavsum = ""; render(); } break;
    case "st-qadam": UI.st.qadam = t.value; render(); break;
    case "st-kun": if (t.value) { UI.st.kun = t.value; render(); } break;
    case "st-mavsum": { const m = byId("mavsumlar").get(t.value); UI.st.mavsum = t.value; if (m) { UI.st.dan = m.boshlanish; UI.st.gacha = m.tugash; UI.st.qadam = kunFarqi(m.boshlanish, m.tugash) > 92 ? "oylik" : "haftalik"; } render(); break; }
    case "fayl-import": { const f = t.files && t.files[0]; if (!f) break; const r = new FileReader(); r.onload = () => importOyna(String(r.result)); r.readAsText(f); t.value = ""; break; }
  }
});
