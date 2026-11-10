
/* =====================================================================
   10. HODISALAR (barcha tugmalar va formalar shu yerda)
   ===================================================================== */
const AMALLAR = {
  // Umumiy
  "modal-yop": () => Modal.yop(),
  "tasdiq-ha": () => { const r = Modal._res; Modal._res = null; Modal.yop(); if (r) r(true); },
  "nusxa": el => { const t = document.getElementById(el.dataset.target); if (t) nusxala(t.value, t); },
  "nusxa-pre": el => { const t = document.getElementById(el.dataset.target); if (t) nusxala(t.textContent); },
  "mavzu": () => { Mavzu.qoy(Mavzu.qoronguMi() ? "light" : "dark"); render(); },
  "mavzu-qoy": el => { Mavzu.qoy(el.dataset.v); render(); },
  "banner-yop": () => { UI.bannerYopildi = true; render(); },
  "men-menyu": () => {
    const m = men();
    Modal.och(`<div class="profil-bosh"><span class="avatar">${esc(boshHarf(m.ism))}</span><div><h2>${esc(m.ism)}</h2><div class="muted sm">${ROL_NOMI[m.rol]} · ${esc(m.login || "")}</div></div></div>
      <div class="forma">
        <button class="btn btn-ghost" data-act="parol-almashtir">Parolni almashtirish</button>
        <button class="btn btn-ghost" data-act="mavzu">${icon(Mavzu.qoronguMi() ? "sun" : "moon", 18)} ${Mavzu.qoronguMi() ? "Yorug‘ mavzu" : "Qorong‘i mavzu"}</button>
        <button class="btn btn-primary" data-act="chiqish">${icon("logout", 20)} Chiqish</button></div>`);
  },
  "chiqish": () => { Modal.yop(); Sessiya.tugat(); UI.kirish = { tab: "kirish", xato: 0, blok: 0, royxatOk: false }; UI.dav = null; Ilova.holatQoy("kirish"); },
  "parol-almashtir": () => Modal.och(`<form id="parol-forma" class="forma" novalidate><h2 class="sheet-h">Parolni almashtirish</h2>
      ${parolMaydon("p-eski", "Hozirgi parol")}
      ${parolMaydon("p-yangi", "Yangi parol (8 xonali raqam)", { yangi: true })}${parolMaydon("p-takror", "Yangi parolni takrorlang", { yangi: true })}
      <p class="xato" id="p-xato" hidden></p>
      <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`),

  // Kirish ekrani
  "kirish-tab": el => { UI.kirish.tab = el.dataset.v; UI.kirish.royxatOk = false; UI.kirish.tiklashOk = ""; render(); },
  "parol-korsat": el => { const i = document.getElementById(el.dataset.target); if (i) i.type = i.type === "password" ? "text" : "password"; },
  "parol-yarat": el => { const i = document.getElementById(el.dataset.target); if (i) { i.value = parolYasa(); i.type = "text"; } },
  "litsenziya-och": () => { UI.sozTab = "litsenziya"; ot("sozlamalar"); },

  // Zaxira, CSV, demo
  "zaxira": () => zaxiraOl(),
  "tikla-fayl": () => $("#fayl-tikla").click(),
  "tikla-matn": () => { const v = $("#tikla-matn").value.trim(); if (v) tikla(v); else toast("Avval zaxira matnini qo‘ying", "warn"); },
  "csv": el => csvBer(el.dataset.tur),
  "demo": async () => {
    if ((DB.oquvchilar.length || DB.guruhlar.length) && !DB.meta.demo) {
      if (!(await tasdiq(`Joriy ma’lumotlar demo bilan almashtiriladi. Avval zaxira oling.`, { tugma: "Demo yuklash", xavfli: true, sarlavha: "Demo rejimi" }))) return;
    }
    try { await Ombor.almashtir(await demoDB()); } catch (e) { toast("Demo yuklanmadi: " + (e.message || e), "warn"); return; }
    const d = DB.xodimlar.find(x => x.rol === "direktor"), dd = DEMO_XODIMLAR.find(x => x.rol === "direktor");
    Sessiya.qoy(d.id); UI.dav = null; UI.tf.oid = ""; Ilova.holat = "ichida"; Server.holat = "ok"; setTimeout(() => Server.tekshir(), 50);
    ot("bosh"); toast(`Demo: direktor sifatida kirdingiz (login ${dd.login}, parol ${dd.parol})`);
  },
  "tozala": async () => {
    if (!(await tasdiq(`Barcha ma’lumotlar o‘chiriladi: ${T.oquvchilar}, to‘lovlar, xodimlar. Ortga qaytarib bo‘lmaydi.`, { tugma: "Hammasini o‘chirish", xavfli: true, sarlavha: "Tozalash" }))) return;
    try { await Ombor.almashtir(boshDB()); } catch (e) { toast("Xato: " + (e.message || e), "warn"); return; }
    Sessiya.tugat(); UI.dav = null; UI.tf.oid = ""; UI.kirish = { tab: "royxat", xato: 0, blok: 0, royxatOk: false }; Ilova.holatQoy("kirish"); toast("Ma’lumotlar tozalandi");
  },

  // Davomat
  "dav-ochish": el => { UI.davGuruh = el.dataset.id; UI.davSana = bugun(); UI.dav = null; ot("davomat"); },
  "dav-guruh": el => { if (el.dataset.id !== UI.davGuruh) davOzgartir({ davGuruh: el.dataset.id }); },
  "dav-kun": el => davOzgartir({ davSana: sanaQosh(UI.davSana, +el.dataset.n) }),
  "dav-bugun": () => davOzgartir({ davSana: bugun() }),
  "dav-belgi": el => {
    const { oid, v } = el.dataset, b = UI.dav.belgilar;
    if (b[oid] === v) delete b[oid]; else b[oid] = v;
    UI.dav.ozgardi = true;
    $$(`.mark[data-oid="${oid}"]`).forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === b[oid])));
    davYangila();
  },
  "dav-hammasi": () => { const g = guruh(UI.davGuruh); if (!g) return; guruhOquvchilari(g.id, UI.davSana).forEach(o => { UI.dav.belgilar[o.id] = "keldi"; }); UI.dav.ozgardi = true; render(); },
  "dav-saqla": () => {
    const k = UI.dav.kalit, b = { ...UI.dav.belgilar };
    if (!Object.keys(b).length && !DB.davomat[k]) { toast("Hali hech kim belgilanmagan", "warn"); return; }
    Ombor.davomatYoz(k, b); UI.dav.ozgardi = false; render(); toast(Object.keys(b).length ? "Davomat saqlandi" : "Davomat o‘chirildi");
  },

  // Lidlar
  "lid-yangi": () => lidForma(),
  "lid-tahrir": el => lidForma(DB.lidlar.find(l => l.id === el.dataset.id)),
  "lid-filtr": el => { UI.lid.holat = el.dataset.v; render(); },
  "lid-keyingi": el => {
    const l = DB.lidlar.find(x => x.id === el.dataset.id); if (!l) return;
    const i = LID_HOLAT.findIndex(h => h.k === l.holat), k = LID_HOLAT[i + 1];
    if (!k) return;
    const y = { ...l, holat: k.k };
    if (k.k === "sinov" && !y.sinovSana) y.sinovSana = sanaQosh(bugun(), 1);
    if (k.k === "boglanildi") y.keyingiAloqa = sanaQosh(bugun(), 2);
    Ombor.yoz("lidlar", y); render(); toast(`${l.ism}: ${k.n}`);
  },
  "lid-oquvchi": el => {
    const l = DB.lidlar.find(x => x.id === el.dataset.id); if (!l) return;
    const g = DB.guruhlar.find(x => x.holat !== "yopilgan" && l.qiziqish && (x.fan === l.qiziqish || x.nomi === l.qiziqish));
    oquvchiForma(null, { ism: l.ism, tel: l.tel, manba: l.manba, izoh: l.izoh, lidId: l.id, guruhId: g ? g.id : "" });
  },
  "lid-ochir": async el => {
    const l = DB.lidlar.find(x => x.id === el.dataset.id); if (!l) return;
    if (!(await tasdiq(`«${esc(l.ism)}» lidi o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true }))) return;
    Ombor.ochir("lidlar", l.id); render(); toast("Lid o‘chirildi");
  },

  // O‘quvchilar
  "oq-yangi": () => oquvchiForma(null),
  "oq-tahrir": el => oquvchiForma(oquvchi(el.dataset.id)),
  "oq-holat": el => { UI.oq.holat = el.dataset.v; render(); },
  "profil": el => oquvchiProfil(el.dataset.id),
  "oq-ochir": async el => {
    const o = oquvchi(el.dataset.id); if (!o) return;
    if (!(await tasdiq(`${esc(o.ism)} o‘chirilsinmi? Uning to‘lovlari ham o‘chadi. Ketgan bo‘lsa, ${T.guruh} a’zoligida «Bugun ketdi»ni bosish yaxshiroq.`, { tugma: "O‘chirish", xavfli: true, sarlavha: `${katta(T.oquvchi)}ni o‘chirish` }))) return;
    DB.tolovlar.filter(t => t.oquvchiId === o.id).forEach(t => Ombor.ochir("tolovlar", t.id));
    Object.entries(DB.davomat).forEach(([k, v]) => { if (v[o.id]) { const n = { ...v }; delete n[o.id]; Ombor.davomatYoz(k, n); } });
    Ombor.ochir("oquvchilar", o.id); if (UI.tf.oid === o.id) UI.tf.oid = "";
    render(); toast(`${katta(T.oquvchi)} o‘chirildi`);
  },
  "azolik-yangi": el => azolikForma(el.dataset.id),
  "azolik-tahrir": el => azolikForma(el.dataset.id, el.dataset.i),
  "azolik-ketdi": async el => {
    const o = oquvchi(el.dataset.oid), a = o && o.azolik[+el.dataset.i]; if (!a) return;
    if (!(await tasdiq(`${esc(o.ism)} bugundan «${esc((guruh(a.guruhId) || {}).nomi || "")}» ${T.guruh}idan chiqariladi. Bugundan keyin to‘lov hisoblanmaydi.`, { tugma: "Chiqarish" }))) return oquvchiProfil(o.id);
    const y = toza(o); y.azolik[+el.dataset.i].chiqqan = bugun(); Ombor.yoz("oquvchilar", y); render(); oquvchiProfil(o.id); toast(`${o.ism} ${T.guruh}dan chiqarildi`);
  },

  // Guruhlar va jadval
  "guruh-yangi": () => guruhForma(),
  "guruh-tahrir": el => guruhForma(guruh(el.dataset.id)),
  "guruh-holat": el => { UI.guruhHolat = el.dataset.v; render(); },
  "guruh-oquvchilari": (el, e) => { e.preventDefault(); UI.oq.guruh = el.dataset.id; UI.oq.holat = "faol"; ot("oquvchilar"); },
  "guruh-ochir": async el => {
    const g = guruh(el.dataset.id); if (!g) return;
    const n = DB.oquvchilar.filter(o => (o.azolik || []).some(a => a.guruhId === g.id)).length;
    if (n) { await tasdiq(`Bu ${T.guruh}da ${n} ta ${T.oquvchi} tarixi bor. O‘chirish o‘rniga holatini «Yopilgan» qiling: tarix va to‘lovlar saqlanadi.`, { tugma: "Tushunarli", sarlavha: "O‘chirib bo‘lmaydi" }); return; }
    if (!(await tasdiq(`«${esc(g.nomi)}» o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true }))) return;
    Ombor.ochir("guruhlar", g.id); render(); toast(`${katta(T.guruh)} o‘chirildi`);
  },
  "jadval-kun": el => { UI.jadvalKun = +el.dataset.v; render(); },

  // To‘lov
  "tolovga": el => { tolovTanla(el.dataset.id); UI.tf.sana = bugun(); ot("tolov"); },
  "t-usul": el => { UI.tf.usul = el.dataset.v; $$('[data-act="t-usul"]').forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === UI.tf.usul))); },
  "t-summa-qoy": el => { UI.tf.summa = +el.dataset.v; $("#t-summa").value = pul(UI.tf.summa, " "); },
  "chek": el => chekOch(el.dataset.id),
  "t-ochir": async el => {
    const t = DB.tolovlar.find(x => x.id === el.dataset.id); if (!t) return;
    const o = oquvchi(t.oquvchiId);
    if (!(await tasdiq(`${esc(o ? o.ism : "")}ning ${pulS(t.summa)} to‘lovi (${sanaMatn(t.sana)}) o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true, sarlavha: "To‘lovni o‘chirish" }))) return;
    Ombor.ochir("tolovlar", t.id); render(); toast("To‘lov o‘chirildi");
  },

  // Qarzdorlar, xabarlar
  "qarz-guruh": el => { UI.qarzGuruh = el.dataset.id; render(); },
  "eslatma": el => { UI.xabarTur = "qarz"; UI.xabarFokus = el.dataset.id; ot("xabarlar"); },
  "x-tur": el => { UI.xabarTur = el.dataset.v; render(); },
  "x-fokus-yop": () => { UI.xabarFokus = ""; render(); },
  "x-kun": el => { UI.xabarSana = sanaQosh(UI.xabarSana, +el.dataset.n); render(); },
  "x-sana-qoy": el => { UI.xabarSana = el.dataset.s; render(); },
  "shablon-qoy": el => {
    const ta = $(`#sh-${el.dataset.tur}`), q = `[${el.dataset.k}]`;
    const a = ta.selectionStart ?? ta.value.length, b = ta.selectionEnd ?? a;
    ta.value = ta.value.slice(0, a) + q + ta.value.slice(b); ta.focus(); ta.selectionStart = ta.selectionEnd = a + q.length;
  },
  "shablon-saqla": () => { Object.keys(QOLIPLAR).forEach(k => { const t = $(`#sh-${k}`); if (t) DB.shablonlar[k] = t.value; }); Ombor.sozYoz(); toast("Shablonlar saqlandi"); },
  "shablon-asl": async () => { if (!(await tasdiq("Shablonlar dastlabki matnga qaytarilsinmi?", { tugma: "Qaytarish" }))) return; DB.shablonlar = { ...SOZLAMALAR.shablonlar }; Ombor.sozYoz(); render(); toast("Asl shablonlar qaytarildi"); },

  // O‘qituvchilar, kassa, hisobot
  "oqit-yangi": () => oqituvchiForma(),
  "oqit-tahrir": el => oqituvchiForma(oqituvchi(el.dataset.id)),
  "oqit-oy": el => { UI.oqitOy = oyQosh(UI.oqitOy, +el.dataset.n); render(); },
  "oylik-tola": el => oylikForma(el.dataset.id),
  "oy-usul": el => { $$('[data-act="oy-usul"]').forEach(x => x.setAttribute("aria-pressed", String(x === el))); },
  "kassa-oy": el => { UI.kassaOy = oyQosh(UI.kassaOy, +el.dataset.n); render(); },
  "xarajat-yangi": () => xarajatForma(),
  "xarajat-ochir": async el => {
    const x = DB.xarajatlar.find(z => z.id === el.dataset.id); if (!x) return;
    if (!(await tasdiq(`${esc(x.kategoriya)}: ${pulS(x.summa)} (${sanaMatn(x.sana)}) o‘chirilsinmi?`, { tugma: "O‘chirish", xavfli: true }))) return;
    Ombor.ochir("xarajatlar", x.id); render(); toast("Xarajat o‘chirildi");
  },
  "h-oy": el => { UI.hisobotOy = oyQosh(UI.hisobotOy, +el.dataset.n); render(); },

  // Sozlamalar
  "soz-tab": el => { UI.sozTab = el.dataset.v; render(); },
  "xodim-yangi": () => xodimForma(),
  "xodim-tahrir": el => xodimForma(xodim(el.dataset.id)),
  "xona-yangi": () => xonaForma(),
  "xona-tahrir": el => xonaForma(xona(el.dataset.id)),
  "xona-ochir": async el => {
    const x = xona(el.dataset.id); if (!x) return;
    if (!(await tasdiq(`«${esc(x.nomi)}» o‘chirilsinmi? Undagi ${T.guruhlar} xonasiz qoladi.`, { tugma: "O‘chirish", xavfli: true }))) return;
    DB.guruhlar.filter(g => g.xonaId === x.id).forEach(g => Ombor.yoz("guruhlar", { ...g, xonaId: "" }));
    Ombor.ochir("xonalar", x.id); render(); toast("Xona o‘chirildi");
  },
};

/* ---------- Formalar ---------- */
const FORMALAR = {
  "kirish-forma": () => {
    const l = $("#k-login").value, p = $("#k-parol").value;
    if (!l.trim() || !p) return xatoKorsat("#k-xato", "Login va parolni kiriting.");
    kirishTekshir(l, p);
  },
  // Rahbar parolini sotuvchi bergan tiklash kodi bilan yangilash
  "tiklash-forma": async f => {
    const kod = $("#t-kod").value.replace(/\D/g, ""), p1 = $("#t-parol").value, p2 = $("#t-parol2").value, L = DB.litsenziya;
    if (kod.length !== 6) return xatoKorsat("#t-xato", "6 xonali tiklash kodini kiriting.");
    if (p1.length < 8) return xatoKorsat("#t-xato", "Yangi parol kamida 8 belgidan iborat bo‘lsin.");
    if (p1 !== p2) return xatoKorsat("#t-xato", "Parollar bir xil emas.");
    const d = DB.xodimlar.find(x => x.rol === "direktor" && x.faol !== false) || DB.xodimlar.find(x => x.rol === "direktor");
    if (!d) return xatoKorsat("#t-xato", "Bu qurilmada rahbar topilmadi.");
    const tugma = f.querySelector('[type="submit"]'); tugma.disabled = true; tugma.textContent = "Tekshirilmoqda…";
    let j;
    try { j = await Server.sorov("parol_tiklash", { id: L.markazId, token: L.token, kod }); }
    catch (e) { j = { ok: false, xato: "Internet yo‘q yoki server javob bermadi." }; }
    if (!j.ok) { tugma.disabled = false; tugma.textContent = "Parolni yangilash"; return xatoKorsat("#t-xato", j.xato || "Kod qabul qilinmadi."); }
    Ombor.yoz("xodimlar", { ...d, pinXesh: await pinXesh(p1), faol: true });
    UI.kirish = { tab: "kirish", xato: 0, blok: 0, tiklashOk: d.login }; render();
  },
  // Yangi markaz: ma’lumotlar + rahbar paroli → 14 kunlik sinov
  "royxat-forma": async () => {
    const nom = $("#r-markaz").value.trim(), rahbar = $("#r-rahbar").value.trim(), tel = $("#r-tel").value.trim(), p1 = $("#r-parol").value, p2 = $("#r-parol2").value;
    const login = $("#r-login").value.trim().toLowerCase();
    if (!nom || !rahbar || !tel) return xatoKorsat("#r-xato", "Markaz nomi, rahbar va telefonni kiriting.");
    if (tel.replace(/\D/g, "").length < 9) return xatoKorsat("#r-xato", "Telefon raqamini to‘liq kiriting.");
    if (!loginTogri(login)) return xatoKorsat("#r-xato", "Login 3–30 belgi bo‘lsin: kichik lotin harflar, raqam, nuqta, «_» yoki «-».");
    if (p1.length < 8) return xatoKorsat("#r-xato", "Parol kamida 8 belgidan iborat bo‘lsin.");
    if (p1 !== p2) return xatoKorsat("#r-xato", "Parollar bir xil emas.");
    // Qurilmada boshqa markaz bo‘lsa, o‘chib ketmasin: zaxira nusxasi alohida saqlanadi (demo shunchaki almashtiriladi)
    if (markazBor()) Mahalliy.qoy(SOZLAMALAR.omborKaliti + "-arxiv", JSON.stringify(DB));
    // Markaz serverda ro‘yxatdan o‘tadi (internet kerak): sotuvchi uni admin saytda ko‘radi
    const tugma = $('#royxat-forma [type="submit"]'), tMatn = tugma.innerHTML;
    tugma.disabled = true; tugma.textContent = "Ro‘yxatdan o‘tkazilmoqda…";
    let j;
    try { j = await Server.sorov("royxat", { nomi: nom, rahbar, tel, manzil: $("#r-manzil").value.trim(), hajm: $("#r-hajm").value, login, versiya: SOZLAMALAR.versiya }); }
    catch (e) { j = { ok: false, xato: e.kod === "sozlanmagan" ? "Dastur serverga ulanmagan. Sotuvchiga murojaat qiling." : "Internet yo‘q yoki server javob bermadi. Internetni tekshirib, qayta urinib ko‘ring." }; }
    if (!j.ok) { tugma.disabled = false; tugma.innerHTML = tMatn; return xatoKorsat("#r-xato", j.xato || "Ro‘yxatdan o‘tib bo‘lmadi."); }
    const db = boshDB();
    db.sozlamalar = { markazNomi: nom, markazTel: tel, manzil: $("#r-manzil").value.trim() };
    db.litsenziya = { royxat: bugun(), sinovTugash: j.sinovTugash, tugash: j.tugash || "", markazId: j.id, token: j.token, holat: j.holat || "faol", xabar: j.xabar || "", tekshirildi: Date.now(),
      malumot: { rahbar, tel, manzil: $("#r-manzil").value.trim(), hajm: $("#r-hajm").value },
      tarif: j.tarif || "", tolovYoqilgan: !!j.tolovYoqilgan, kutilayotgan: 0, ...(j.tariflar ? { tariflar: j.tariflar } : {}), ...(j.oylar ? { oylar: j.oylar } : {}) };
    Server.bugun = j.bugun || ""; Server.holat = "ok";
    db.xodimlar.push({ id: yangiId(), ism: rahbar, rol: "direktor", login, oqituvchiId: "", filialId: "", faol: true, pinXesh: await pinXesh(p1) });
    await Ombor.almashtir(db);
    // Avtomatik kirmaydi: «Kirish» oynasiga o‘tadi, login va parolni o‘zi yozadi
    Sessiya.tugat(); UI.kirish = { tab: "kirish", xato: 0, blok: 0, royxatOk: true }; render(); window.scrollTo(0, 0);
  },
  "parol-forma": async () => {
    const m = men(), e = $("#p-eski").value, y = $("#p-yangi").value, t = $("#p-takror").value;
    if ((await pinXesh(e)) !== m.pinXesh) return xatoKorsat("#p-xato", "Hozirgi parol noto‘g‘ri.");
    if (!parolTogri(y)) return xatoKorsat("#p-xato", "Yangi parol aynan 8 ta raqam bo‘lsin.");
    if (y !== t) return xatoKorsat("#p-xato", "Yangi parollar bir xil emas.");
    Ombor.yoz("xodimlar", { ...m, pinXesh: await pinXesh(y) }); Modal.yop(); toast("Parol almashtirildi");
  },
  "lid-forma": f => {
    const ism = $("#l-ism").value.trim(), tel = $("#l-tel").value.trim();
    if (!ism || !tel) return xatoKorsat("#l-xato", "Ism va telefonni kiriting.");
    const eski = f.dataset.id ? DB.lidlar.find(x => x.id === f.dataset.id) : null;
    const l = { ...(eski || { id: yangiId(), yaratildi: Date.now(), oquvchiId: "", filialId: joriyFilial() }), ism, tel, qiziqish: $("#l-qiziqish").value.trim(), manba: $("#l-manba").value,
      holat: ($('input[name="l-holat"]:checked', f) || {}).value || "yangi", sinovSana: $("#l-sinov").value, keyingiAloqa: $("#l-keyingi").value, izoh: $("#l-izoh").value.trim() };
    Ombor.yoz("lidlar", l); Modal.yop(); render(); toast(eski ? "Lid saqlandi" : "Lid qo‘shildi");
  },
  "oquvchi-forma": f => {
    const ism = $("#o-ism").value.trim();
    if (!ism) return xatoKorsat("#o-xato", "Ism va familiyani kiriting.");
    const d = { ism, tel: $("#o-tel").value.trim(), otaTel: $("#o-otatel").value.trim(), tugilgan: $("#o-tugilgan").value, manba: $("#o-manba").value, izoh: $("#o-izoh").value.trim() };
    let o;
    if (f.dataset.id) o = Ombor.yoz("oquvchilar", { ...oquvchi(f.dataset.id), ...d });
    else {
      const gid = $("#o-guruh").value;
      if (!gid) return xatoKorsat("#o-xato", `${katta(T.guruh)}ni tanlang.`);
      const lx = limitXato(1); if (lx) return xatoKorsat("#o-xato", lx);
      o = Ombor.yoz("oquvchilar", { id: yangiId(), yaratildi: Date.now(), filialId: (guruh(gid) || {}).filialId || joriyFilial(), ...d, azolik: [{ guruhId: gid, qoshilgan: $("#o-sana").value || bugun(), chiqqan: "", ...chegirmaQiymat($("#o-chegirma").value) }] });
      const lid = f.dataset.lid && DB.lidlar.find(x => x.id === f.dataset.lid);
      if (lid) Ombor.yoz("lidlar", { ...lid, holat: "yozildi", oquvchiId: o.id });
    }
    Modal.yop(); render(); toast(f.dataset.id ? "Saqlandi" : `${katta(T.oquvchi)} qo‘shildi`);
    oquvchiProfil(o.id);
  },
  "azolik-forma": f => {
    const o = oquvchi(f.dataset.oid); if (!o) return;
    const y = toza(o), cheg = chegirmaQiymat($("#a-cheg").value), qosh = $("#a-qosh").value || bugun();
    if (f.dataset.i === "") {
      const lx = !oquvchiFaol(o) && limitXato(1); if (lx) { Modal.yop(); return tarifLimitOyna(lx); }
      const gid = $("#a-guruh").value;
      if (!gid) return xatoKorsat("#a-xato", `Bo‘sh ${T.guruh} yo‘q yoki tanlanmagan.`);
      y.azolik.push({ guruhId: gid, qoshilgan: qosh, chiqqan: "", ...cheg });
    } else {
      const a = y.azolik[+f.dataset.i], chiq = $("#a-chiq").value;
      if (chiq && chiq <= qosh) return xatoKorsat("#a-xato", "Ketgan sana qo‘shilgan sanadan keyin bo‘lsin.");
      Object.assign(a, { qoshilgan: qosh, ...cheg, chiqqan: chiq || "" });
    }
    Ombor.yoz("oquvchilar", y); render(); oquvchiProfil(o.id); toast("Saqlandi");
  },
  "guruh-forma": f => {
    const nomi = $("#g-nomi").value.trim(), narx = raqam($("#g-narx").value);
    if (!nomi) return xatoKorsat("#g-xato", `${katta(T.guruh)} nomini kiriting.`);
    if (!narx) return xatoKorsat("#g-xato", "Narxni kiriting.");
    const eski = f.dataset.id ? guruh(f.dataset.id) : null;
    const g = { ...(eski || { id: yangiId(), ochilgan: bugun() }), nomi, fan: $("#g-fan") ? $("#g-fan").value.trim() : (eski ? eski.fan || "" : ""), oqituvchiId: $("#g-oqit").value, xonaId: $("#g-xona").value,
      kunlar: $$('input[name="kun"]:checked', f).map(i => i.value), boshlanish: $("#g-bosh").value, tugash: $("#g-tug").value,
      narxTuri: ($('input[name="g-turi"]:checked', f) || {}).value || "oylik", narx, holat: $("#g-holat").value,
      kursId: $("#g-kurs").value, mavsumId: $("#g-mavsum").value, filialId: $("#g-filial") ? $("#g-filial").value : (eski ? eski.filialId || "" : joriyFilial()),
      sigim: raqam($("#g-sigim").value) || "", tugashSana: $("#g-tugsana").value };
    g.fan = (byId("kurslar").get(g.kursId) || {}).nomi || g.fan || "";
    Ombor.yoz("guruhlar", g); Modal.yop(); render();
    const t = toqnashuvlar().get(g.id);
    toast(t ? `Saqlandi, lekin jadvalda to‘qnashuv bor: ${t[0].bilan.nomi}` : eski ? "Saqlandi" : `${katta(T.guruh)} qo‘shildi`, t ? "warn" : "ok");
  },
  "tolov-forma": () => {
    const f = UI.tf;
    f.summa = raqam($("#t-summa").value); f.sana = $("#t-sana").value || bugun(); f.izoh = $("#t-izoh").value.trim(); f.guruhId = $("#t-guruh").value;
    if (!oquvchi(f.oid)) return xatoKorsat("#t-xato", `${katta(T.oquvchi)}ni tanlang.`);
    if (!f.summa) return xatoKorsat("#t-xato", "Summani kiriting.");
    const qayt = !!($("#t-qaytarish") && $("#t-qaytarish").checked);
    const t = Ombor.yoz("tolovlar", { id: yangiId(), oquvchiId: f.oid, guruhId: f.guruhId, summa: f.summa, sana: f.sana, usul: f.usul, izoh: f.izoh, xodimId: Sessiya.xodimId, yaratildi: Date.now(), ...(qayt ? { qaytarish: true } : {}) });
    UI.tf = { ...f, oid: "", summa: 0, izoh: "", guruhId: "" }; UI.tolovOy = f.sana.slice(0, 7);
    render(); chekOch(t.id);
  },
  "oqit-forma": async f => {
    const ism = $("#t-ism").value.trim();
    if (!ism) return xatoKorsat("#t-xato", "Ismni kiriting.");
    const turi = ($('input[name="t-turi"]:checked', f) || {}).value || "fiks", pin = $("#t-pin").value;
    if (pin && !parolTogri(pin)) return xatoKorsat("#t-xato", "Parol aynan 8 ta raqam bo‘lsin.");
    const eski = f.dataset.id ? oqituvchi(f.dataset.id) : null;
    const t = Ombor.yoz("oqituvchilar", { ...(eski || { id: yangiId() }), ism, tel: $("#t-tel").value.trim(), fan: $("#t-fan").value.trim(), oylikTuri: turi,
      stavka: raqam($("#t-stavka").value), foizAsosi: $("#t-asos").value, izoh: $("#t-izoh-o").value.trim(), faol: $("#t-faol").checked });
    const x = DB.xodimlar.find(z => z.oqituvchiId === t.id);
    let yx = null;
    if (x) yx = Ombor.yoz("xodimlar", { ...x, ism, faol: t.faol && x.faol !== false, ...(pin ? { pinXesh: await pinXesh(pin) } : {}) });
    else if (pin) { const id = yangiId(); yx = Ombor.yoz("xodimlar", { id, ism, rol: "oqituvchi", login: loginYasa(ism, id), oqituvchiId: t.id, filialId: joriyFilial(), pinXesh: await pinXesh(pin), faol: true }); }
    Modal.yop(); render();
    if (pin && yx) kreditOyna(yx, pin); else toast(eski ? "Saqlandi" : `${katta(T.oqituvchi)} qo‘shildi`);
  },
  "oylik-forma": f => {
    const summa = raqam($("#oy-summa").value);
    if (!summa) return xatoKorsat("#oy-xato", "Summani kiriting.");
    const usul = ($('[data-act="oy-usul"][aria-pressed="true"]') || {}).dataset?.v || SOZLAMALAR.tolovUsullari[0];
    const t = oqituvchi(f.dataset.id);
    Ombor.yoz("xarajatlar", { id: yangiId(), sana: $("#oy-sana").value || bugun(), kategoriya: "Oylik", summa, usul, izoh: `${oyNomi(UI.oqitOy)} oyligi`, oqituvchiId: t.id, oy: UI.oqitOy, xodimId: Sessiya.xodimId, yaratildi: Date.now() });
    Modal.yop(); render(); toast(`${t.ism}: ${pul(summa, " ")} ${SOZLAMALAR.valyuta} to‘landi`);
  },
  "xarajat-forma": () => {
    const summa = raqam($("#x-summa").value), kat = $("#x-kat").value;
    if (!summa) return xatoKorsat("#x-xato", "Summani kiriting.");
    const oylik = kat === "Oylik";
    if (oylik && !$("#x-oqit").value) return xatoKorsat("#x-xato", `${katta(T.oqituvchi)}ni tanlang.`);
    Ombor.yoz("xarajatlar", { id: yangiId(), sana: $("#x-sana").value || bugun(), kategoriya: kat, summa, usul: $("#x-usul").value, izoh: $("#x-izoh").value.trim(), filialId: $("#x-filial") ? $("#x-filial").value : joriyFilial(),
      oqituvchiId: oylik ? $("#x-oqit").value : "", oy: oylik ? ($("#x-oy").value || joriyOy()) : "", xodimId: Sessiya.xodimId, yaratildi: Date.now() });
    Modal.yop(); render(); toast("Xarajat saqlandi");
  },
  "markaz-forma": () => {
    DB.sozlamalar = { ...DB.sozlamalar, markazNomi: $("#m-nomi").value.trim(), markazTel: $("#m-tel").value.trim(), manzil: $("#m-manzil").value.trim() };
    Ombor.sozYoz(); render(); toast("Saqlandi");
  },
  "xodim-forma": async f => {
    const ism = $("#xd-ism").value.trim(), r = $("#xd-rol").value, pin = $("#xd-pin").value, faol = $("#xd-faol").checked;
    const eski = f.dataset.id ? xodim(f.dataset.id) : null, login = $("#xd-login").value.trim().toLowerCase();
    if (!loginTogri(login)) return xatoKorsat("#xd-xato", "Login 3–30 belgi bo‘lsin: kichik lotin harflar, raqam, nuqta, «_» yoki «-».");
    if (DB.xodimlar.some(z => z.login === login && z.id !== (eski || {}).id)) return xatoKorsat("#xd-xato", "Bu login band. Boshqasini yozing.");
    if (!ism || !r) return xatoKorsat("#xd-xato", "Ism va lavozimni kiriting.");
    if ((!eski || pin) && !parolTogri(pin)) return xatoKorsat("#xd-xato", "Parol aynan 8 ta raqamdan iborat bo‘lsin. «Yaratish» tugmasi tasodifiy parol beradi.");
    if (r === "oqituvchi" && !$("#xd-oqit").value) return xatoKorsat("#xd-xato", `Qaysi ${T.oqituvchi} ekanini tanlang (avval «${katta(T.oqituvchilar)}» bo‘limida qo‘shing).`);
    const direktorlar = DB.xodimlar.filter(x => x.rol === "direktor" && x.faol !== false && x.id !== (eski || {}).id);
    if (eski && eski.rol === "direktor" && (r !== "direktor" || !faol) && !direktorlar.length) return xatoKorsat("#xd-xato", "Kamida bitta faol direktor qolishi kerak.");
    const id = eski ? eski.id : yangiId();
    const x = Ombor.yoz("xodimlar", { ...(eski || { id }), ism, rol: r, login, oqituvchiId: r === "oqituvchi" ? $("#xd-oqit").value : "", filialId: $("#xd-filial") ? $("#xd-filial").value : (eski ? eski.filialId || "" : ""), faol, ...(pin ? { pinXesh: await pinXesh(pin) } : {}) });
    Modal.yop(); render();
    if (pin) kreditOyna(x, pin); else toast("Xodim saqlandi");
  },
  "xona-forma": f => {
    const nomi = $("#xn-nomi").value.trim();
    if (!nomi) return xatoKorsat("#xn-xato", "Xona nomini kiriting.");
    Ombor.yoz("xonalar", { ...(f.dataset.id ? xona(f.dataset.id) : { id: yangiId() }), nomi, sigim: raqam($("#xn-sigim").value) || "" });
    Modal.yop(); render(); toast("Xona saqlandi");
  },
};

/* ---------- Hodisa tinglovchilari ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el && AMALLAR[el.dataset.act]) {
    if (el.tagName === "A" && (el.getAttribute("href") || "").startsWith("#")) e.preventDefault();
    AMALLAR[el.dataset.act](el, e); return;
  }
  const a = e.target.closest('a[href^="#"]');
  if (a) { const k = a.getAttribute("href").slice(1); if (BOLIMLAR[k]) { e.preventDefault(); ot(k); } }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.matches("[data-pul]")) { const n = raqam(t.value); t.value = n ? pul(n, " ") : ""; }
  if (t.id === "oq-qidir") { UI.oq.qidiruv = t.value; $("#oq-royxat").innerHTML = oquvchilarRoyxati(); }
  if (t.id === "lid-qidir") { UI.lid.qidiruv = t.value; render(); }
  if (t.id === "t-summa") UI.tf.summa = raqam(t.value);
  if (t.id === "t-izoh") UI.tf.izoh = t.value;
  if (t.dataset.xabar) { const a = document.getElementById("tg-" + t.dataset.xabar); if (a) a.href = tgHavola(t.value); }
});
document.addEventListener("change", e => {
  const t = e.target;
  switch (t.id) {
    case "oq-guruh": UI.oq.guruh = t.value; $("#oq-royxat").innerHTML = oquvchilarRoyxati(); break;
    case "t-oq": tolovTanla(t.value); render(); break;
    case "t-sana": UI.tf.sana = t.value; break;
    case "t-guruh": UI.tf.guruhId = t.value; break;
    case "t-tarix-oy": UI.tolovOy = t.value; $("#t-tarix").innerHTML = tolovTarixi(); break;
    case "dav-sana": if (t.value) davOzgartir({ davSana: t.value }); break;
    case "x-sana": if (t.value) { UI.xabarSana = t.value; render(); } break;
    case "jadval-xona": UI.jadvalXona = t.value; render(); break;
    case "x-kat": { const j = $("#x-oylik-joy"); if (j) j.hidden = t.value !== "Oylik"; break; }
    case "fayl-tikla": {
      const f = t.files && t.files[0]; if (!f) break;
      const r = new FileReader(); r.onload = () => tikla(String(r.result)); r.readAsText(f); t.value = ""; break;
    }
  }
  if (t.name === "t-turi") {
    const y = $("#t-stavka-yorliq"); if (y) y.textContent = t.value === "foiz" ? "Foiz, %" : t.value === "dars" ? `Bir dars uchun, ${SOZLAMALAR.valyuta}` : `Oylik, ${SOZLAMALAR.valyuta}`;
    const j = $("#t-asos-joy"); if (j) j.hidden = t.value !== "foiz";
  }
  if (t.id === "xd-rol") { const j = $("#xd-oqit-joy"); if (j) j.hidden = t.value !== "oqituvchi"; }
});
document.addEventListener("submit", e => { e.preventDefault(); const f = FORMALAR[e.target.id]; if (f) f(e.target); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") Modal.yop();
});
// Yangi xodim: login ism yozilishi bilan avtomatik tuziladi
document.addEventListener("input", e => {
  if (e.target.id === "xd-login") e.target.dataset.qolda = "1";   // qo‘lda o‘zgartirilsa, avtomatik yangilanmaydi
  if (e.target.id !== "xd-ism") return;
  const l = $("#xd-login");
  if (l && !l.dataset.qolda) l.value = loginYasa(e.target.value);
});
