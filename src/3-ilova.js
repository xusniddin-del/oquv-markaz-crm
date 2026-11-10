
/* =====================================================================
   6. ILOVA HOLATI, SESSIYA, ROLLAR VA KARKAS
   ===================================================================== */
const Sessiya = {
  xodimId: "",
  yukla() { try { const s = JSON.parse(Mahalliy.ol("oquv-crm-sessiya") || "null"); if (s && s.xodimId) this.xodimId = s.xodimId; } catch (e) {} },
  qoy(id) { this.xodimId = id; Mahalliy.qoy("oquv-crm-sessiya", JSON.stringify({ xodimId: id, vaqt: Date.now() })); },
  tugat() { this.xodimId = ""; Mahalliy.ochir("oquv-crm-sessiya"); },
};
const men = () => xodim(Sessiya.xodimId);
const rol = () => (men() || {}).rol || "";
const direktorMi = () => rol() === "direktor";
const oqituvchiMi = () => rol() === "oqituvchi";
function mumkin(b) { const h = SOZLAMALAR.huquqlar[rol()]; return h === "*" || (Array.isArray(h) && h.includes(b)); }
const menGuruhlarim = () => (oqituvchiMi() ? GR().filter(g => g.oqituvchiId && g.oqituvchiId === (men() || {}).oqituvchiId) : GR());

const UI = {
  bolim: "bosh", bannerYopildi: false,
  oq: { qidiruv: "", guruh: "", holat: "faol" },
  lid: { holat: "ochiq", qidiruv: "" },
  guruhHolat: "faol",
  dav: null, davGuruh: "", davSana: bugun(),
  tf: { oid: "", summa: 0, sana: bugun(), usul: SOZLAMALAR.tolovUsullari[0], guruhId: "", izoh: "" },
  tolovOy: joriyOy(),
  qarzGuruh: "",
  xabarTur: "qarz", xabarFokus: "", xabarSana: bugun(),
  jadvalKun: hafta(bugun()), jadvalXona: "",
  oqitOy: joriyOy(), kassaOy: joriyOy(),
  filial: Mahalliy.ol("oquv-crm-filial", ""),
  st: { tab: "umumiy", dan: sanaQosh(bugun(), -89), gacha: bugun(), qadam: "haftalik", mavsum: "", kun: bugun() },
  qb: { tab: "hammasi", qidiruv: "", guruh: "", oqit: "", holat: "faol", sahifa: 1, hajm: 15 },
  dq: { tur: "", daraja: "" },
  vz: { guruh: "" },
  sr: { holat: "yangi" },
  guruhMavsum: "",
  sozTab: "markaz",
  kirish: { tab: "kirish", xato: 0, blok: 0, royxatOk: false },
};

const Ilova = {
  holat: "kirish",        // kirish (Kirish / Ro‘yxatdan o‘tish) | ichida
  holatQoy(h) { this.holat = h; render(); },
  maLumotTayyor() {
    const m = men();
    this.holat = Sessiya.xodimId && m && m.faol !== false ? "ichida" : "kirish";
    if (this.holat === "kirish" && !markazBor()) UI.kirish.tab = "royxat";
    rejaRender();
  },
};

// Sahifani biroz kechiktirib qayta chizish (yozayotgan maydonni buzmasdan)
let renderTaymer = null, renderKutmoqda = false;
const yozmoqdami = () => { const a = document.activeElement; return a && $("#main") && $("#main").contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); };
function rejaRender() {
  clearTimeout(renderTaymer);
  renderTaymer = setTimeout(() => { if (yozmoqdami()) { renderKutmoqda = true; return; } render(); }, 120);
}
document.addEventListener("focusout", () => {
  if (!renderKutmoqda) return;
  setTimeout(() => { if (!yozmoqdami()) { renderKutmoqda = false; render(); } }, 60);
});

const BOLIMLAR = {
  bosh:         { nom: "Bosh sahifa", qisqa: "Bosh", ic: "home", guruh: "Kundalik ishlar", tavsif: "Bugungi holat", render: renderBosh },
  statistika:   { nom: "Statistika", ic: "chart", guruh: "Kundalik ishlar", tavsif: "8 yo‘nalishda tahlil", render: renderStatistika },
  oquvchilar:   { nom: "Qabulxona", qisqa: "Qabul", ic: "users", guruh: "Kundalik ishlar", tavsif: `${katta(T.oquvchilar)} jadvali`, render: renderQabulxona },
  davomat:      { nom: "Davomat", ic: "check", guruh: "Kundalik ishlar", tavsif: "Keldi, kechikdi, kelmadi", render: renderDavomat },
  diqqat:       { nom: "Diqqat", ic: "alert", guruh: "Kundalik ishlar", tavsif: "Hal qilinishi kerak bo‘lganlar", render: renderDiqqat, nishon: () => diqqatlar().length },
  xabarlar:     { nom: "Xabarlar", ic: "message", guruh: "Kundalik ishlar", tavsif: `${katta(T.otaOna)}ga tayyor matn`, render: renderXabarlar },
  sorovlar:     { nom: "So‘rovlar", ic: "phone", guruh: "Kundalik ishlar", tavsif: "Murojaat va shikoyatlar", render: renderSorovlar, nishon: () => SR().filter(x => x.holat === "yangi").length },
  lidlar:       { nom: "Lidlar", ic: "funnel", guruh: "Sotuv", tavsif: "Sotuv voronkasi", render: renderLidlar },
  kurslar:      { nom: "Kurslar", ic: "teacher", guruh: "O‘quv jarayoni", tavsif: "Kurs va uning guruhlari", render: renderKurslar },
  guruhlar:     { nom: katta(T.guruhlar), ic: "layers", guruh: "O‘quv jarayoni", tavsif: "Narx, kunlar, xona", render: renderGuruhlar },
  jadval:       { nom: "Dars jadvali", qisqa: "Jadval", ic: "calendar", guruh: "O‘quv jarayoni", tavsif: "Haftalik jadval", render: renderJadval },
  vazifalar:    { nom: "Uy vazifalari", qisqa: "Vazifa", ic: "file", guruh: "O‘quv jarayoni", tavsif: "Vazifa va bajarilishi", render: renderVazifalar },
  tolov:        { nom: "To‘lovlar", qisqa: "To‘lov", ic: "wallet", guruh: "Moliya", tavsif: "To‘lov qabul qilish", render: renderTolov },
  qarzdorlar:   { nom: "Qarzdorlar", qisqa: "Qarzlar", ic: "alert", guruh: "Moliya", tavsif: "Kim qancha qarz", render: renderQarzdorlar },
  kassa:        { nom: "Kassa", ic: "cash", guruh: "Moliya", tavsif: "Xarajat va foyda", render: renderKassa },
  chegirmalar:  { nom: "Chegirmalar", ic: "gift", guruh: "Moliya", tavsif: "Chegirma turlari", render: renderChegirmalar },
  mavsumlar:    { nom: "Mavsumlar", ic: "calendar", guruh: "Moliya", tavsif: "O‘quv mavsumlari", render: renderMavsumlar },
  oqituvchilar: { nom: katta(T.oqituvchilar), ic: "user", guruh: "Boshqaruv", tavsif: "Oylik hisobi", render: renderOqituvchilar },
  filiallar:    { nom: "Filiallar", ic: "home", guruh: "Boshqaruv", tavsif: "Bir nechta filial", render: renderFiliallar },
  sozlamalar:   { nom: "Sozlamalar", ic: "sliders", guruh: "Boshqaruv", tavsif: "Xodim, xona, zaxira", render: renderSozlamalar },
  menyu:        { nom: "Menyu", ic: "grid", render: renderMenyu },
};

function ot(b) {
  if (!BOLIMLAR[b] || !mumkin(b)) b = "bosh";
  Modal.yop();
  UI.bolim = b; render(); window.scrollTo(0, 0);
  try { history.replaceState(null, "", "#" + b); } catch (e) {}
}

function render() {
  if (Ilova.holat === "ichida" && (!men() || men().faol === false)) { Sessiya.tugat(); Ilova.holat = "kirish"; }
  const ekran = serverEkran();   // internet yo‘q, bloklangan yoki muddati tugagan bo‘lsa — kirish ham yopiq
  document.body.classList.toggle("kirish-rejim", Ilova.holat !== "ichida" || !!ekran);
  if (ekran) { $("#main").innerHTML = ekran; return; }
  if (Ilova.holat !== "ichida") { $("#main").innerHTML = renderKirish(); return; }
  if (!BOLIMLAR[UI.bolim] || !mumkin(UI.bolim)) UI.bolim = "bosh";
  const k = UI.bolim, b = BOLIMLAR[k], m = men();

  $("#top").innerHTML = `<div class="top-ich">
    <div class="brend"><span class="logo">${esc(markazLogo())}</span>
      <div style="min-width:0"><div class="markaz">${esc(markazNomi())}</div><h1 class="sarlavha">${b.nom}</h1></div></div>
    <div class="top-amal">
      ${DB.filiallar.length && !(m.filialId) ? `<label><span class="vh">Filial</span><select id="filial-tanlov" class="filial-sel"><option value="">Barcha filiallar</option>${DB.filiallar.map(f => `<option value="${f.id}" ${f.id === UI.filial ? "selected" : ""}>${esc(f.nomi)}</option>`).join("")}</select></label>` : ""}
      <button class="icon-btn" data-act="mavzu" aria-label="Yorug‘ yoki qorong‘i mavzu">${icon(Mavzu.qoronguMi() ? "sun" : "moon", 20)}</button>
      <button class="men-chip" data-act="men-menyu" aria-label="Profil: ${esc(m.ism)}"><span class="avatar">${esc(boshHarf(m.ism))}</span><span class="mc-mat"><b>${esc(m.ism)}</b><span>${ROL_NOMI[m.rol] || ""}</span></span></button>
    </div></div>`;

  const guruhlar = [];
  Object.entries(BOLIMLAR).forEach(([key, v]) => { if (v.guruh && mumkin(key)) { let g = guruhlar.find(x => x.n === v.guruh); if (!g) guruhlar.push(g = { n: v.guruh, l: [] }); g.l.push(key); } });
  $("#yon").innerHTML = `<div class="yon-brend"><span class="logo">${esc(markazLogo())}</span><b>${esc(markazNomi())}</b></div>`
    + guruhlar.map(g => `<div class="yon-sar">${g.n}</div>` + g.l.map(x => `<a href="#${x}" ${x === k ? `aria-current="page"` : ""}>${icon(BOLIMLAR[x].ic, 20)} ${BOLIMLAR[x].nom}${nishon(x)}</a>`).join("")).join("")
    + `<div class="yon-pas"><a href="#" data-act="chiqish">${icon("logout", 20)} Chiqish</a><span class="muted sm versiya">Versiya ${esc(SOZLAMALAR.versiya)}</span></div>`;

  const pastki = (SOZLAMALAR.pastkiMenyu[m.rol] || ["bosh"]).filter(x => mumkin(x) || x === "menyu");
  const pastkiJoriy = pastki.includes(k) ? k : (pastki.includes("menyu") ? "menyu" : "");
  $("#pastki").style.setProperty("--nav-n", pastki.length);
  $("#pastki").innerHTML = pastki.map(x => `<a class="nav-b" href="#${x}" ${x === pastkiJoriy ? `aria-current="page"` : ""}><span class="ic-joy">${icon(BOLIMLAR[x].ic, 22)}</span>${BOLIMLAR[x].qisqa || BOLIMLAR[x].nom}</a>`).join("");

  let html = "";
  try { html = b.render(); } catch (e) { console.error(e); html = boshHolat({ ic: "alert", sarlavha: "Bo‘limni ochishda xato", matn: esc(e.message) }); }
  // Qidiruv maydonida yozayotgan bo‘lsa, fokus va kursor joyida qoladi
  const a = document.activeElement, fokusId = a && a.id && $("#main").contains(a) ? a.id : "";
  const kursor = fokusId && "selectionStart" in a ? [a.selectionStart, a.selectionEnd] : null;
  $("#main").innerHTML = renderBanner() + `<div class="bolim">${html}</div>`;
  if (fokusId) { const y = document.getElementById(fokusId); if (y) { y.focus(); if (kursor) try { y.setSelectionRange(kursor[0], kursor[1]); } catch (e) {} } }
}

function renderBanner() {
  let h = "";
  const L = litsenziyaHolati();
  if (DB.litsenziya.xabar && !DB.meta.demo) h += `<div class="banner" role="status">${icon("message")}<div class="b-mat"><b>Sotuvchidan xabar:</b> ${esc(DB.litsenziya.xabar)}</div></div>`;
  const aloqa = DB.litsenziya.tolovYoqilgan ? "Davom ettirish uchun tarif tanlab to‘lang." : `Davom ettirish uchun sotuvchiga murojaat qiling${SOZLAMALAR.sotuvchi.tel ? `: <b>${esc(SOZLAMALAR.sotuvchi.tel)}</b>` : "."}`;
  if (direktorMi() && !DB.meta.demo && L.tur === "sinov" && L.qoldi !== null && L.qoldi <= SOZLAMALAR.sinovKun) h += `<div class="banner" role="status">${icon("gift")}<div class="b-mat"><b>Bepul sinov: ${L.qoldi === 0 ? "bugun oxirgi kun" : `${L.qoldi} kun qoldi`}.</b> ${sanaMatn(L.tugash)} gacha. ${aloqa}</div>
    <button class="btn btn-sm btn-soft" data-act="litsenziya-och">Tarif tanlash</button></div>`;
  else if (direktorMi() && !DB.meta.demo && L.tur === "faol" && L.qoldi <= 7) h += `<div class="banner" role="status">${icon("alert")}<div class="b-mat"><b>Obuna ${L.qoldi === 0 ? "bugun" : `${L.qoldi} kundan keyin`} tugaydi</b> (${sanaMatn(L.tugash)}). ${aloqa}</div>
    <button class="btn btn-sm btn-soft" data-act="litsenziya-och">Uzaytirish</button></div>`;
  if (!Mahalliy.ishlaydi) h += `<div class="banner xavf" role="alert">${icon("alert")}<div class="b-mat"><b>Brauzer xotirasi ishlamayapti.</b> Ma’lumotlar sahifa yopilganda o‘chadi. Ishni tugatgach albatta zaxira oling.</div></div>`;
  if (direktorMi() && !UI.bannerYopildi && (OQ().length || GR().length)) {
    const z = DB.meta.oxirgiZaxira, kun = z ? kunFarqi(z, bugun()) : null;
    if (kun === null || kun >= SOZLAMALAR.zaxiraEslatmaKun)
      h += `<div class="banner" role="status">${icon("alert")}<div class="b-mat"><b>Zaxira oling.</b> Ma’lumotlar faqat shu brauzerda turibdi. Oxirgi zaxira: ${kun === null ? "hali olinmagan" : `${kun} kun oldin`}.</div>
        <button class="btn btn-sm btn-primary" data-act="zaxira">${icon("download", 18)} Zaxira olish</button>
        <button class="icon-btn tekis" data-act="banner-yop" aria-label="Eslatmani yopish">${icon("x", 18)}</button></div>`;
  }
  return h;
}

function nishon(x) {
  const b = BOLIMLAR[x]; if (!b || !b.nishon) return "";
  let n = 0; try { n = b.nishon(); } catch (e) {}
  return n ? `<span class="nishon">${n > 99 ? "99+" : n}</span>` : "";
}
function renderMenyu() {
  return `<div class="menyu-grid">${Object.entries(BOLIMLAR).filter(([k, v]) => v.guruh && k !== "bosh" && mumkin(k)).map(([k, b]) =>
    `<a class="menyu-k" href="#${k}"><span class="tile-ic">${icon(b.ic)}</span><b>${b.nom}${nishon(k)}</b><span class="muted">${b.tavsif}</span></a>`).join("")}
    <a class="menyu-k" href="#" data-act="chiqish"><span class="tile-ic warn">${icon("logout")}</span><b>Chiqish</b><span class="muted">${esc(men().login || "")}</span></a></div>
    <p class="muted sm" style="text-align:center;margin:0">${esc(SOZLAMALAR.dasturNomi)} · versiya ${esc(SOZLAMALAR.versiya)}</p>`;
}

/* =====================================================================
   7. KIRISH EKRANI: «Kirish» va «Ro‘yxatdan o‘tish»
   Kirish — hamkor markaz xodimlari (login + rahbar bergan 8 xonali parol).
   Ro‘yxatdan o‘tish — yangi markaz o‘z ma’lumotlarini kiritadi, 14 kun bepul.
   ===================================================================== */
const sotuvchiAloqa = () => { const s = SOZLAMALAR.sotuvchi; return [s.tel && `<b>${esc(s.tel)}</b>`, s.telegram && `<a href="https://t.me/${esc(s.telegram)}" target="_blank" rel="noopener">@${esc(s.telegram)}</a>`].filter(Boolean).join(" · "); };
// erkin: istalgan belgi (rahbar paroli, kirish); aks holda 8 xonali raqam (xodim paroli)
const parolMaydon = (id, yorliq, { yangi = false, yaratish = false, qiymat = "", erkin = false } = {}) => `<label class="maydon"><span>${yorliq}</span><div class="parol-q">
  <input id="${id}" type="password" ${erkin ? "" : `inputmode="numeric" maxlength="8"`} value="${esc(qiymat)}" autocomplete="${yangi ? "new-password" : "current-password"}" placeholder="${erkin ? "Parol" : "8 xonali raqam"}">
  <button type="button" class="icon-btn tekis" data-act="parol-korsat" data-target="${id}" aria-label="Parolni ko‘rsatish">${icon("eye", 20)}</button>
  ${yaratish ? `<button type="button" class="btn btn-ghost btn-sm" data-act="parol-yarat" data-target="${id}">Yaratish</button>` : ""}</div></label>`;
function renderKirish() {
  const k = UI.kirish, bor = markazBor(), L = DB.litsenziya;
  const bosh = `<div class="kirish-bosh"><div class="logo katta">${esc(SOZLAMALAR.logoMatni)}</div><h1>${esc(SOZLAMALAR.dasturNomi)}</h1><p>O‘quv markazlarini boshqarish tizimi</p></div>
    ${segTugmalar("kirish-tab", [["kirish", "Kirish"], ["royxat", "Ro‘yxatdan o‘tish"]], k.tab)}`;
  const pas = `<p class="muted sm" style="text-align:center;margin:0">Savollar uchun: ${esc(SOZLAMALAR.sotuvchi.nom)}${sotuvchiAloqa() ? " · " + sotuvchiAloqa() : ""} · v${esc(SOZLAMALAR.versiya)}</p>`;
  if (k.tab === "kirish") {
    const kutish = Math.max(0, Math.ceil((k.blok - Date.now()) / 1000));
    return `<div class="kirish">${bosh}
      <section class="card"><form id="kirish-forma" class="forma" novalidate>
        ${k.tiklashOk ? `<div class="banner ok">${icon("check2")}<div class="b-mat"><b>Parol yangilandi!</b> Loginingiz: <b>${esc(k.tiklashOk)}</b>. Endi yangi parol bilan kiring.</div></div>`
          : k.royxatOk ? `<div class="banner ok">${icon("check2")}<div class="b-mat"><b>Ro‘yxatdan o‘tdingiz!</b> ${SOZLAMALAR.sinovKun} kunlik bepul sinov ${sanaMatn(L.sinovTugash)} gacha. Endi login va parolingizni yozib kiring.</div></div>`
          : bor ? `<div class="info-quti"><b>${esc(markazNomi())}</b></div>` : ""}
        <label class="maydon"><span>Login</span><input id="k-login" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Loginingiz" value="${esc(k.tiklashOk || "")}" autofocus></label>
        ${parolMaydon("k-parol", "Parol", { erkin: true })}
        <p class="xato" id="k-xato" ${kutish ? "" : "hidden"}>${kutish ? `Ko‘p marta xato kiritildi. ${kutish} soniyadan keyin urinib ko‘ring.` : ""}</p>
        <button type="submit" class="btn btn-primary btn-blok" ${kutish ? "disabled" : ""}>Kirish</button>
        <p class="muted sm" style="margin:0">Xodimlar login va parolni markaz rahbaridan oladi.</p>
        ${bor && L.markazId ? `<button type="button" class="btn btn-ghost btn-sm" data-act="kirish-tab" data-v="tiklash" style="align-self:flex-start">Parolni unutdingizmi?</button>` : ""}
      </form></section>
      ${bor ? "" : `<section class="card forma"><b>Bu qurilmada hali markaz yo‘q</b>
        <p class="muted sm" style="margin:0">Hamkor markaz bo‘lsangiz, rahbaringizdan zaxira faylni olib tiklang. Yangi markaz bo‘lsangiz, ro‘yxatdan o‘ting: 14 kun bepul.</p>
        <div class="amal-qator"><button class="btn btn-soft" data-act="kirish-tab" data-v="royxat">Ro‘yxatdan o‘tish</button><button class="btn btn-ghost" data-act="tikla-fayl">${icon("upload", 18)} Zaxiradan tiklash</button></div></section>`}
      ${pas}</div>`;
  }
  if (k.tab === "tiklash") return `<div class="kirish">${bosh}
    <section class="card"><form id="tiklash-forma" class="forma" novalidate>
      <h2 style="margin:0;font-size:18px">Rahbar parolini tiklash</h2>
      <ol class="muted sm" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">
        <li>Sotuvchiga murojaat qiling${SOZLAMALAR.sotuvchi.tel ? `: <b>${esc(SOZLAMALAR.sotuvchi.tel)}</b>` : ""}. U sizga 6 xonali tiklash kodini beradi (24 soat amal qiladi).</li>
        <li>Kodni va yangi parolni shu yerga yozing.</li></ol>
      <label class="maydon"><span>Tiklash kodi</span><input id="t-kod" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6 xonali kod"></label>
      ${parolMaydon("t-parol", "Yangi parol (kamida 8 belgi)", { yangi: true, erkin: true })}
      ${parolMaydon("t-parol2", "Yangi parolni takrorlang", { yangi: true, erkin: true })}
      <p class="xato" id="t-xato" hidden></p>
      <button type="submit" class="btn btn-primary btn-blok">Parolni yangilash</button>
      <p class="muted sm" style="margin:0">Xodim bo‘lsangiz, parolingizni markaz rahbari yangilaydi: Sozlamalar → Xodimlar.</p>
      <button type="button" class="btn btn-ghost btn-sm" data-act="kirish-tab" data-v="kirish" style="align-self:flex-start">← Kirishga qaytish</button>
    </form></section>${pas}</div>`;
  return `<div class="kirish">${bosh}
    <section class="card"><form id="royxat-forma" class="forma" novalidate>
      <p class="muted" style="margin:0">O‘quv markazingiz haqida ma’lumot kiriting va dasturdan <b>${SOZLAMALAR.sinovKun} kun bepul</b> foydalaning.</p>
      <label class="maydon"><span>O‘quv markaz nomi *</span><input id="r-markaz" autocomplete="organization" placeholder="Masalan: Bilim o‘quv markazi" autofocus></label>
      <div class="ikki"><label class="maydon"><span>Rahbar (F.I.Sh) *</span><input id="r-rahbar" autocomplete="name"></label>
        <label class="maydon"><span>Telefon *</span><input id="r-tel" type="tel" autocomplete="tel" placeholder="+998 90 123 45 67"></label></div>
      <div class="ikki"><label class="maydon"><span>Shahar / manzil</span><input id="r-manzil" autocomplete="address-level2"></label>
        <label class="maydon"><span>${katta(T.oquvchilar)} soni (taxminan)</span><select id="r-hajm"><option>50 gacha</option><option>50–150</option><option>150–300</option><option>300 dan ko‘p</option></select></label></div>
      <label class="maydon"><span>Login o‘ylab toping *</span><input id="r-login" autocapitalize="none" spellcheck="false" autocomplete="username" placeholder="masalan: bilim_markaz"></label>
      ${parolMaydon("r-parol", "Parol o‘ylab toping * (kamida 8 belgi)", { yangi: true, erkin: true })}${parolMaydon("r-parol2", "Parolni takrorlang *", { yangi: true, erkin: true })}
      <p class="xato" id="r-xato" hidden></p>
      <button type="submit" class="btn btn-primary btn-blok">${icon("gift", 20)} Ro‘yxatdan o‘tish</button>
      <p class="muted sm" style="margin:0">Login: kichik lotin harflar, raqam, nuqta yoki pastki chiziq. Xodimlarga login va parolni keyin dastur ichida o‘zingiz berasiz.</p>
    </form></section>${pas}</div>`;
}
async function kirishTekshir(login, parol) {
  const k = UI.kirish;
  if (k.blok > Date.now()) return render();
  const x = DB.xodimlar.find(z => (z.login || "").toLowerCase() === login.trim().toLowerCase());
  if (x && x.faol !== false && (await pinXesh(parol)) === x.pinXesh) {
    Sessiya.qoy(x.id); k.xato = 0; UI.bolim = "bosh"; UI.dav = null; Ilova.holat = "ichida";
    try { history.replaceState(null, "", "#bosh"); } catch (e) {}
    render(); toast(`Xush kelibsiz, ${x.ism.split(" ")[0]}!`); return;
  }
  k.xato++;
  if (k.xato >= SOZLAMALAR.parolUrinish) { k.blok = Date.now() + 30000; k.xato = 0; render(); setTimeout(render, 30500); return; }
  xatoKorsat("#k-xato", x && x.faol === false ? "Bu xodimning kirishi o‘chirilgan. Rahbaringizga murojaat qiling." : "Login yoki parol noto‘g‘ri.");
  const p = $("#k-parol"); if (p) { p.value = ""; p.focus(); }
}
