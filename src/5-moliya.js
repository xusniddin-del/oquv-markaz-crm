
/* =====================================================================
   9. BO‘LIMLAR — MOLIYA VA BOSHQARUV
   ===================================================================== */

/* ---------- 9.1 O‘qituvchilar va oylik ---------- */
function renderOqituvchilar() {
  const qosh = `<button class="btn btn-primary" data-act="oqit-yangi">${icon("plus", 18)} ${katta(T.oqituvchi)} qo‘shish</button>`;
  if (!DB.oqituvchilar.length) return boshHolat({ ic: "teacher", sarlavha: `Hali ${T.oqituvchi} yo‘q`, matn: `${katta(T.oqituvchi)} qo‘shing va oylik turini tanlang: fiks, foiz yoki har dars uchun.`, tugma: qosh });
  const oy = UI.oqitOy;
  const l = DB.oqituvchilar.slice().sort((a, b) => (b.faol !== false) - (a.faol !== false) || ismBoyicha(a, b)).map(t => ({ t, o: oqituvchiOylik(t, oy) }));
  const jami = sum(l, x => x.o.hisob), tolangan = sum(l, x => x.o.tolangan);
  return bolimBosh(`${DB.oqituvchilar.filter(t => t.faol !== false).length} ta faol ${T.oqituvchi}`, qosh) + oyNav("oqit-oy", oy) + `
    <div class="tilelar">${tile("Hisoblangan oylik", pulV(jami), oyNomi(oy), "teacher")}${tile("To‘langan", pulV(tolangan), "", "check")}${tile("Qoldiq", pulV(Math.max(0, jami - tolangan)), "To‘lanishi kerak", "alert", jami - tolangan > 0 ? "warn" : "")}</div>
    <div class="kartalar">${l.map(({ t, o }) => `<article class="card guruh-k">
      <div class="gk-top"><div><h3>${esc(t.ism)}</h3><div class="muted sm">${esc(t.fan || "")}${t.tel ? ` · ${esc(t.tel)}` : ""}</div></div>${t.faol === false ? `<span class="pill">Nofaol</span>` : ""}</div>
      <div class="muted sm">${OYLIK_TURI[t.oylikTuri] || ""}: ${t.oylikTuri === "foiz" ? `${t.stavka || 0}%` : pulS(t.stavka || 0)} · ${o.guruhlar.length} ta ${T.guruh}, ${sum(o.guruhlar, g => guruhOquvchilari(g.id).length)} ta ${T.oquvchi}</div>
      <div class="info-quti">
        <div class="iq-top"><span>Hisoblangan</span><b>${pulS(o.hisob)}</b></div>
        <div class="muted sm">${esc(o.izoh)}</div>
        <div class="iq-top"><span>To‘langan</span><b class="${o.qoldiq ? "" : "yashil"}">${pulS(o.tolangan)}</b></div>
        ${o.qoldiq ? `<div class="iq-top"><span>Qoldiq</span><b class="warn-matn">${pulS(o.qoldiq)}</b></div>` : ""}
      </div>
      <div class="gk-pas">
        ${o.qoldiq ? `<button class="btn btn-primary btn-sm" data-act="oylik-tola" data-id="${t.id}">${icon("wallet", 18)} Oylik to‘lash</button>` : `<span class="pill ok">To‘langan</span>`}
        <button class="icon-btn tekis" data-act="oqit-tahrir" data-id="${t.id}" aria-label="Tahrirlash">${icon("edit", 20)}</button></div>
    </article>`).join("")}</div>`;
}
function oqituvchiForma(t) {
  const yangi = !t;
  t = t || { ism: "", tel: "", fan: "", oylikTuri: "foiz", stavka: 40, foizAsosi: "tushgan", izoh: "", faol: true };
  const x = t.id ? DB.xodimlar.find(z => z.oqituvchiId === t.id) : null;
  Modal.och(`<form id="oqit-forma" class="forma" data-id="${t.id || ""}" novalidate>
    <h2 class="sheet-h">${yangi ? `Yangi ${T.oqituvchi}` : esc(t.ism)}</h2>
    <label class="maydon"><span>Ism familiya *</span><input id="t-ism" value="${esc(t.ism)}" autocomplete="off" autofocus></label>
    <div class="ikki">
      <label class="maydon"><span>Telefon</span><input id="t-tel" type="tel" value="${esc(t.tel)}"></label>
      <label class="maydon"><span>Fan</span><input id="t-fan" value="${esc(t.fan)}" autocomplete="off"></label>
    </div>
    <div class="maydon"><span>Oylik turi</span><div class="seg">${Object.entries(OYLIK_TURI).map(([k, n]) => `<label><input type="radio" name="t-turi" value="${k}" ${t.oylikTuri === k ? "checked" : ""}><span>${n}</span></label>`).join("")}</div></div>
    <div class="ikki">
      <label class="maydon"><span id="t-stavka-yorliq">${t.oylikTuri === "foiz" ? "Foiz, %" : t.oylikTuri === "dars" ? `Bir dars uchun, ${SOZLAMALAR.valyuta}` : `Oylik, ${SOZLAMALAR.valyuta}`}</span><input id="t-stavka" inputmode="numeric" value="${t.oylikTuri === "foiz" ? +t.stavka || 0 : pul(t.stavka || 0, " ")}"></label>
      <label class="maydon" id="t-asos-joy" ${t.oylikTuri === "foiz" ? "" : "hidden"}><span>Foiz nimadan</span><select id="t-asos">
        <option value="tushgan" ${t.foizAsosi === "tushgan" ? "selected" : ""}>Tushgan puldan</option>
        <option value="hisoblangan" ${t.foizAsosi === "hisoblangan" ? "selected" : ""}>Hisoblangan summadan</option></select></label>
    </div>
    ${x ? `<div class="kredit"><div><span>Dasturga kirish logini</span><b>${esc(x.login)}</b></div></div>` : ""}
    ${parolMaydon("t-pin", `Dasturga kirish paroli (8 xonali${x ? ", bo‘sh qoldirsangiz o‘zgarmaydi" : ", ixtiyoriy: kiritsangiz login avtomatik tuziladi"})`, { yangi: true, yaratish: true })}
    <label class="toggle"><input type="checkbox" id="t-faol" ${t.faol !== false ? "checked" : ""}> Faol</label>
    <label class="maydon"><span>Izoh</span><input id="t-izoh-o" value="${esc(t.izoh)}" autocomplete="off"></label>
    <p class="xato" id="t-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div>
  </form>`);
}
function oylikForma(tid) {
  const t = oqituvchi(tid), o = oqituvchiOylik(t, UI.oqitOy);
  Modal.och(`<form id="oylik-forma" class="forma" data-id="${tid}" novalidate>
    <h2 class="sheet-h">${esc(t.ism)}: oylik to‘lash</h2>
    <p class="sheet-p" style="margin:0">${oyNomi(UI.oqitOy)} · hisoblangan ${pulS(o.hisob)}, to‘langan ${pulS(o.tolangan)}</p>
    <div class="ikki">
      <label class="maydon"><span>Summa *</span><input id="oy-summa" inputmode="numeric" data-pul value="${pul(o.qoldiq, " ")}" autofocus></label>
      <label class="maydon"><span>Sana</span><input id="oy-sana" type="date" value="${bugun()}"></label>
    </div>
    <div class="maydon"><span>Usul</span>${segTugmalar("oy-usul", SOZLAMALAR.tolovUsullari.map(u => [u, u]), SOZLAMALAR.tolovUsullari[0])}</div>
    <p class="muted sm" style="margin:0">Kassada «Oylik» xarajati sifatida yoziladi.</p>
    <p class="xato" id="oy-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">To‘lash</button></div>
  </form>`);
}

/* ---------- 9.2 Kassa (xarajat va foyda) ---------- */
function renderKassa() {
  const oy = UI.kassaOy, s = oyStat(oy), dir = direktorMi();
  const xs = XR().filter(x => (x.sana || "").startsWith(oy)).sort((a, b) => (b.sana || "").localeCompare(a.sana || "") || (b.yaratildi || 0) - (a.yaratildi || 0));
  const kat = SOZLAMALAR.xarajatTurlari.map(k => [k, sum(xs.filter(x => x.kategoriya === k), x => x.summa)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  const maxK = Math.max(1, ...kat.map(x => x[1]));
  const oylar = Array.from({ length: 6 }, (_, i) => oyQosh(oy, i - 5));
  // Kassa qoldig‘i usul bo‘yicha (barcha vaqt)
  const qoldiq = SOZLAMALAR.tolovUsullari.map(u => [u, sum(TL().filter(t => t.usul === u), tolovSumma) - sum(XR().filter(x => x.usul === u), x => x.summa)]);
  return bolimBosh(`${oyNomi(oy)}: ${xs.length} ta xarajat`, `<button class="btn btn-primary" data-act="xarajat-yangi">${icon("plus", 18)} Xarajat qo‘shish</button>`) + oyNav("kassa-oy", oy) + `
    <div class="tilelar" style="grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr))">
      ${tile("Tushum", pulV(s.tushum), "To‘lovlar", "wallet")}
      ${tile("Xarajat", pulV(s.xarajat), `${xs.length} ta yozuv`, "cash", "warn")}
      ${dir ? tile("Sof foyda", `<span class="${s.foyda < 0 ? "qizil" : "yashil"}">${pul(s.foyda)}</span><small>${SOZLAMALAR.valyuta}</small>`, s.tushum ? `Rentabellik ${Math.round(s.foyda * 100 / s.tushum)}%` : "", "chart") : ""}
    </div>
    ${dir ? `<div class="ikki-ustun">
      <section class="card"><div class="card-h"><div><h2>Tushum va xarajat</h2><div class="muted sm">So‘nggi 6 oy</div></div></div>
        <div class="legend"><span><i class="l-bar"></i>Tushum</span><span><i class="l-b"></i>Xarajat</span></div>
        ${juftDiagramma(oylar.map(m => { const x = oyStat(m); return { kalit: m, yorliq: oyQisqa(m), a: x.tushum, b: x.xarajat }; }), { tanlangan: oy, nom: "Tushum va xarajat" })}</section>
      <section class="card"><div class="card-h"><div><h2>Kassa qoldig‘i</h2><div class="muted sm">Barcha vaqt: kirim − chiqim</div></div></div>
        <table class="mini-jadval"><tbody>${qoldiq.map(([u, v]) => `<tr><td>${esc(u)}</td><td class="o"><b class="${v < 0 ? "qizil" : ""}">${pulS(v)}</b></td></tr>`).join("")}
        <tr><td><b>Jami</b></td><td class="o"><b>${pulS(sum(qoldiq, x => x[1]))}</b></td></tr></tbody></table></section>
    </div>` : ""}
    <section class="card"><div class="card-h"><h2>Xarajat turlari</h2></div>
      ${kat.length ? kat.map(([k, v]) => `<div class="kat-q"><span>${esc(k)}</span>${progress(v * 100 / maxK, "warn")}<b>${pulS(v)}</b></div>`).join("") : `<p class="bosh-matn">Bu oyda xarajat yo‘q.</p>`}</section>
    <section class="card"><div class="card-h"><h2>Xarajatlar</h2><button class="btn btn-ghost btn-sm" data-act="csv" data-tur="xarajatlar">${icon("file", 18)} Excel</button></div>
      ${xs.length ? `<div class="royxat">${xs.map(x => `<div class="qator"><span class="avatar">${icon("cash", 20)}</span>
        <div class="q-mat"><div class="q-nom">${esc(x.kategoriya)}${x.oqituvchiId && oqituvchi(x.oqituvchiId) ? `: ${esc(oqituvchi(x.oqituvchiId).ism)}` : ""}</div>
        <div class="q-sub">${sanaMatn(x.sana)} · ${esc(x.usul || "")}${x.izoh ? ` · ${esc(x.izoh)}` : ""}</div></div>
        <div class="q-ong"><b>${pulS(x.summa)}</b></div>
        ${dir ? `<button class="icon-btn tekis" data-act="xarajat-ochir" data-id="${x.id}" aria-label="O‘chirish">${icon("trash", 18)}</button>` : ""}</div>`).join("")}</div>` : `<p class="bosh-matn">Bu oyda xarajat kiritilmagan.</p>`}</section>`;
}
function xarajatForma() {
  Modal.och(`<form id="xarajat-forma" class="forma" novalidate>
    <h2 class="sheet-h">Yangi xarajat</h2>
    <div class="ikki">
      <label class="maydon"><span>Turi</span><select id="x-kat">${tanlov(SOZLAMALAR.xarajatTurlari, SOZLAMALAR.xarajatTurlari[0])}</select></label>
      <label class="maydon"><span>Summa *</span><input id="x-summa" inputmode="numeric" data-pul autocomplete="off" autofocus></label>
    </div>
    <div class="ikki" id="x-oylik-joy" hidden>
      <label class="maydon"><span>${katta(T.oqituvchi)}</span><select id="x-oqit">${oqituvchiOptions("")}</select></label>
      <label class="maydon"><span>Qaysi oy uchun</span><input id="x-oy" type="month" value="${UI.kassaOy}"></label>
    </div>
    <div class="ikki">
      <label class="maydon"><span>Sana</span><input id="x-sana" type="date" value="${UI.kassaOy === joriyOy() ? bugun() : UI.kassaOy + "-01"}"></label>
      <label class="maydon"><span>Usul</span><select id="x-usul">${tanlov(SOZLAMALAR.tolovUsullari, SOZLAMALAR.tolovUsullari[0])}</select></label>
    </div>
    <label class="maydon"><span>Izoh</span><input id="x-izoh" autocomplete="off" placeholder="Masalan: noyabr ijarasi"></label>
    ${DB.filiallar.length ? `<label class="maydon"><span>Filial</span><select id="x-filial"><option value="">Umumiy</option>${DB.filiallar.map(f => `<option value="${f.id}" ${f.id === joriyFilial() ? "selected" : ""}>${esc(f.nomi)}</option>`).join("")}</select></label>` : ""}
    <p class="xato" id="x-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div>
  </form>`);
}

/* ---------- 9.4 Sozlamalar ---------- */
function renderSozlamalar() {
  const tablar = [["markaz", "Markaz"], ["xodimlar", "Xodimlar"], ["xonalar", "Xonalar"], ["litsenziya", "Obuna"], ["malumot", "Ma’lumotlar"]];
  let h = `<div class="chiplar" role="group" aria-label="Sozlamalar bo‘limi">${tablar.map(([k, n]) => `<button class="chip" data-act="soz-tab" data-v="${k}" aria-pressed="${UI.sozTab === k}">${n}</button>`).join("")}</div>`;
  const t = UI.sozTab, mv = Mavzu.ol();
  if (t === "markaz") return h + `<div class="ikki-ustun">
    <section class="card"><form id="markaz-forma" class="forma" novalidate><div class="card-h" style="margin:0"><h2>Markaz ma’lumotlari</h2></div>
      <label class="maydon"><span>Markaz nomi</span><input id="m-nomi" value="${esc(markazNomi())}" autocomplete="off"></label>
      <div class="ikki"><label class="maydon"><span>Telefon</span><input id="m-tel" value="${esc(markazTel())}"></label>
      <label class="maydon"><span>Manzil</span><input id="m-manzil" value="${esc(DB.sozlamalar.manzil || "")}"></label></div>
      <button type="submit" class="btn btn-primary">Saqlash</button></form></section>
    <section class="card forma"><div class="card-h" style="margin:0"><h2>Ko‘rinish</h2></div>
      ${segTugmalar("mavzu-qoy", [["light", "Yorug‘"], ["dark", "Qorong‘i"], ["tizim", "Telefondagidek"]], mv)}
      <p class="muted sm" style="margin:0">To‘lov muddati: har oyning ${SOZLAMALAR.tolovKuni}-kuni. Oy o‘rtasida qo‘shilganlarga ${SOZLAMALAR.proporsional ? "dars kunlariga qarab qisman" : "to‘liq oy"} hisoblanadi. Bu qoidalar dastur kodidagi SOZLAMALAR’da o‘zgartiriladi.</p></section></div>`;

  if (t === "litsenziya") {
    const L = DB.litsenziya, lh = litsenziyaHolati(), oxirgi = L.tekshirildi ? new Date(L.tekshirildi) : null;
    return h + `<section class="card forma" style="max-width:640px"><div class="card-h" style="margin:0"><h2>Obuna</h2>${lh.tur === "faol" ? `<span class="pill ok">Faol</span>` : lh.tur === "sinov" ? `<span class="pill warn">Bepul sinov</span>` : lh.tur === "bloklangan" ? `<span class="pill bad">Bloklangan</span>` : ""}</div>
      <div class="kredit"><div><span>Ro‘yxatdagi telefon</span><b>${esc((L.malumot || {}).tel || DB.sozlamalar.markazTel || "—")}</b></div>
        <div><span>Tarif</span><b>${esc((tariflar().find(t => t.k === L.tarif) || {}).nom || (lh.tur === "sinov" ? "Bepul sinov (cheklovsiz)" : "—"))}${tarifJoriy() && tarifJoriy().limit ? ` · ${DB.oquvchilar.filter(oquvchiFaol).length}/${tarifJoriy().limit} ${T.oquvchi}` : ""}</b></div>
        <div><span>Ro‘yxatdan o‘tgan</span><b>${sanaMatn(L.royxat)}</b></div>
        <div><span>${lh.tur === "faol" ? "Obuna" : "Sinov"} tugashi</span><b>${sanaMatn(lh.tugash)}${lh.qoldi !== null ? ` (${lh.qoldi < 0 ? "tugagan" : lh.qoldi + " kun qoldi"})` : ""}</b></div>
        <div><span>Oxirgi tekshiruv</span><b>${oxirgi ? `${sanaMatn(sanaStr(oxirgi))}, ${pad2(oxirgi.getHours())}:${pad2(oxirgi.getMinutes())}` : "—"}</b></div></div>
      <p class="muted sm" style="margin:0">Savollar bo‘lsa: ${esc(SOZLAMALAR.sotuvchi.nom)}${sotuvchiAloqa() ? " · " + sotuvchiAloqa() : ""}.</p>
      <div class="amal-qator"><button class="btn btn-soft" data-act="obuna-yangila">${icon("refresh", 18)} Holatni yangilash</button></div></section>
      <section class="card forma" style="max-width:860px"><div class="card-h" style="margin:0"><h2>Tarif tanlash va to‘lash</h2></div>${tarifTanlov()}</section>`;
  }

  if (t === "xodimlar") return h + bolimBosh("Har bir xodim o‘z logini va 8 xonali paroli bilan kiradi. Login avtomatik tuziladi, parolni siz berasiz. Lavozimiga qarab faqat ruxsat berilgan bo‘limlarni ko‘radi.", `<button class="btn btn-primary" data-act="xodim-yangi">${icon("plus", 18)} Xodim qo‘shish</button>`) + `
    <section class="card"><div class="royxat">${DB.xodimlar.slice().sort(ismBoyicha).map(x => `<div class="qator"><button class="qator-btn" data-act="xodim-tahrir" data-id="${x.id}">
      <span class="avatar">${esc(boshHarf(x.ism))}</span><span class="q-mat"><span class="q-nom">${esc(x.ism)}${x.id === Sessiya.xodimId ? ` <span class="pill primary">Siz</span>` : ""}</span>
      <span class="q-sub"><b>${esc(x.login || "")}</b> · ${ROL_NOMI[x.rol]}${x.oqituvchiId && oqituvchi(x.oqituvchiId) ? ` · ${esc(oqituvchi(x.oqituvchiId).ism)}` : ""}${x.filialId && byId("filiallar").get(x.filialId) ? ` · ${esc(byId("filiallar").get(x.filialId).nomi)}` : ""}</span></span>
      ${x.faol === false ? `<span class="pill">O‘chirilgan</span>` : `<span class="pill ok">Faol</span>`}</button></div>`).join("")}</div></section>
    <section class="card"><div class="card-h"><h2>Lavozimlar nimani ko‘radi</h2></div><table class="mini-jadval"><tbody>
      <tr><td><b>Direktor</b></td><td>Hamma bo‘limlar, foyda, oyliklar, xodimlar, sozlamalar, o‘chirish</td></tr>
      <tr><td><b>Administrator</b></td><td>Qabulxona, lidlar, so‘rovlar, kurslar, ${T.guruhlar}, jadval, davomat, uy vazifalari, to‘lov, qarzdorlar, xabarlar, xarajat kiritish, diqqat</td></tr>
      <tr><td><b>Sotuv menejeri</b></td><td>Lidlar, so‘rovlar, xabarlar, qabulxona, kurslar, jadval</td></tr>
      <tr><td><b>Kassir</b></td><td>To‘lov qabul qilish, qarzdorlar, kassa (xarajat), qabulxona, xabarlar</td></tr>
      <tr><td><b>${katta(T.oqituvchi)}</b></td><td>Faqat o‘z ${T.guruhlar}i: jadval, davomat, uy vazifalari, ${T.oquvchilar} ro‘yxati</td></tr>
      <tr><td><b>Filial</b></td><td>Xodimga filial biriktirilsa, u faqat o‘sha filial ma’lumotlarini ko‘radi</td></tr></tbody></table></section>`;

  if (t === "xonalar") return h + bolimBosh(`${DB.xonalar.length} ta xona`, `<button class="btn btn-primary" data-act="xona-yangi">${icon("plus", 18)} Xona qo‘shish</button>`) +
    (DB.xonalar.length ? `<section class="card"><div class="royxat">${DB.xonalar.slice().sort(ismBoyicha).map(x => {
      const gs = GR().filter(g => g.xonaId === x.id && g.holat !== "yopilgan");
      return `<div class="qator"><button class="qator-btn" data-act="xona-tahrir" data-id="${x.id}"><span class="avatar">${icon("home", 20)}</span>
        <span class="q-mat"><span class="q-nom">${esc(x.nomi)}</span><span class="q-sub">${x.sigim ? x.sigim + " o‘rin · " : ""}${gs.length} ta ${T.guruh}</span></span></button></div>`;
    }).join("")}</div></section>` : boshHolat({ ic: "home", sarlavha: "Xona qo‘shilmagan", matn: "Xonalar jadvalda to‘qnashuvlarni aniqlash uchun kerak." }));

  // Ma’lumotlar
  const z = DB.meta.oxirgiZaxira;
  return h + `<div class="kartalar yuqori">
    <section class="card forma"><div class="card-h" style="margin:0"><h2>Zaxira nusxa</h2></div>
      <p class="muted" style="margin:0">Butun bazani bitta faylga saqlaydi. Haftada bir marta oling va Telegram «Saqlangan xabarlar»ga tashlab qo‘ying.</p>
      <div class="muted sm">Oxirgi zaxira: <b>${z ? sanaMatn(z) : "hali olinmagan"}</b></div>
      <button class="btn btn-primary" data-act="zaxira">${icon("download", 20)} Zaxira olish (JSON)</button></section>
    <section class="card forma"><div class="card-h" style="margin:0"><h2>Zaxiradan tiklash</h2></div>
      <p class="muted" style="margin:0">Joriy ma’lumotlar zaxiradagisi bilan almashtiriladi. Boshqa kompyuter yoki telefonga ko‘chirish ham shu yo‘l bilan. Eski versiya (v1) zaxiralari ham qabul qilinadi.</p>
      <button class="btn btn-soft" data-act="tikla-fayl">${icon("upload", 20)} Faylni tanlash</button>
      <details class="yordam"><summary>Matndan tiklash</summary><label class="vh" for="tikla-matn">Zaxira matni</label>
        <textarea id="tikla-matn" class="kod" rows="5" placeholder="Zaxira matnini shu yerga qo‘ying"></textarea>
        <button class="btn btn-ghost" data-act="tikla-matn">Tiklash</button></details></section>
    <section class="card forma"><div class="card-h" style="margin:0"><h2>Excel (CSV)</h2></div>
      <div class="amal-qator">${[["oquvchilar", katta(T.oquvchilar)], ["tolovlar", "To‘lovlar"], ["qarzdorlar", "Qarzdorlar"], ["lidlar", "Lidlar"], ["xarajatlar", "Xarajatlar"], ["guruhlar", katta(T.guruhlar)]].map(([k, n]) => `<button class="btn btn-ghost btn-sm" data-act="csv" data-tur="${k}">${icon("file", 18)} ${n}</button>`).join("")}</div></section>
    <section class="card forma"><div class="card-h" style="margin:0"><h2>Tozalash</h2></div>
      <p class="muted" style="margin:0">Barcha ma’lumotlarni o‘chiradi. Avval zaxira oling.</p>
      <div class="amal-qator"><button class="btn btn-ghost btn-qizil-matn" data-act="tozala">${icon("trash", 18)} Hammasini tozalash</button></div></section>
    <section class="card"><div class="card-h"><h2>Bazada</h2></div><div class="xulosa">
      <div><b>${OQ().length}</b><span>${katta(T.oquvchilar)}</span></div><div><b>${GR().length}</b><span>${katta(T.guruhlar)}</span></div>
      <div><b>${TL().length}</b><span>To‘lovlar</span></div><div><b>${LD().length}</b><span>Lidlar</span></div></div></section>
  </div>`;
}
function xodimForma(x) {
  const yangi = !x;
  x = x || { ism: "", rol: "admin", oqituvchiId: "", faol: true, login: "" };
  Modal.och(`<form id="xodim-forma" class="forma" data-id="${x.id || ""}" novalidate>
    <h2 class="sheet-h">${yangi ? "Yangi xodim" : esc(x.ism)}</h2>
    <label class="maydon"><span>Ism familiya *</span><input id="xd-ism" value="${esc(x.ism)}" autocomplete="off" autofocus></label>
    <label class="maydon"><span>Login (avtomatik tuziladi, o‘zgartirish mumkin)</span><input id="xd-login" value="${esc(x.login || "")}" autocapitalize="none" spellcheck="false" autocomplete="off" data-qolda="${x.login ? "1" : ""}"></label>
    <label class="maydon"><span>Lavozim</span><select id="xd-rol">${Object.entries(ROL_NOMI).map(([k, n]) => `<option value="${k}" ${x.rol === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label class="maydon" id="xd-oqit-joy" ${x.rol === "oqituvchi" ? "" : "hidden"}><span>Qaysi ${T.oqituvchi}</span><select id="xd-oqit">${oqituvchiOptions(x.oqituvchiId)}</select></label>
    ${DB.filiallar.length ? `<label class="maydon"><span>Filial (bo‘sh — barcha filiallar)</span><select id="xd-filial"><option value="">Barcha filiallar</option>${DB.filiallar.map(f => `<option value="${f.id}" ${f.id === x.filialId ? "selected" : ""}>${esc(f.nomi)}</option>`).join("")}</select></label>` : ""}
    ${parolMaydon("xd-pin", `Parol (8 xonali raqam)${yangi ? " *" : " — bo‘sh qoldirsangiz o‘zgarmaydi"}`, { yangi: true, yaratish: true })}
    <label class="toggle"><input type="checkbox" id="xd-faol" ${x.faol !== false ? "checked" : ""}> Kirishga ruxsat</label>
    <p class="xato" id="xd-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div>
  </form>`);
}
// Xodimga beriladigan login va parol
function kreditOyna(x, parol) {
  const matn = `${markazNomi()}\nDastur: ${SOZLAMALAR.dasturNomi}\nLogin: ${x.login}\nParol: ${parol}\nLavozim: ${ROL_NOMI[x.rol]}`;
  Modal.och(`<h2 class="sheet-h">Xodimga bering</h2><p class="sheet-p">${esc(x.ism)} shu login va parol bilan kiradi. Parol boshqa ko‘rsatilmaydi.</p>
    <div class="kredit"><div><span>Login</span><b>${esc(x.login)}</b></div><div><span>Parol</span><b>${esc(parol)}</b></div><div><span>Lavozim</span><b>${ROL_NOMI[x.rol]}</b></div></div>
    <textarea id="kredit-matn" class="vh" readonly>${esc(matn)}</textarea>
    <div class="sheet-actions"><button class="btn btn-ghost" data-act="nusxa" data-target="kredit-matn">${icon("copy", 18)} Nusxalash</button>
      <a class="btn btn-soft" href="${esc(tgHavola(matn))}" target="_blank" rel="noopener">${icon("send", 18)} Telegram</a>
      <button class="btn btn-primary" data-act="modal-yop">Tayyor</button></div>`);
}
function xonaForma(x) {
  const yangi = !x; x = x || { nomi: "", sigim: "" };
  Modal.och(`<form id="xona-forma" class="forma" data-id="${x.id || ""}" novalidate>
    <h2 class="sheet-h">${yangi ? "Yangi xona" : "Xona"}</h2>
    <div class="ikki"><label class="maydon"><span>Nomi *</span><input id="xn-nomi" value="${esc(x.nomi)}" placeholder="1-xona" autofocus></label>
    <label class="maydon"><span>Sig‘imi (o‘rin)</span><input id="xn-sigim" inputmode="numeric" value="${esc(x.sigim)}"></label></div>
    <p class="xato" id="xn-xato" hidden></p>
    <div class="sheet-actions">${yangi ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="xona-ochir" data-id="${x.id}">O‘chirish</button>`}
      <button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div></form>`);
}

/* ---------- 9.5 Zaxira, tiklash, CSV ---------- */
const faylNomi = () => markazNomi().toLowerCase().replace(/[‘’'`ʻ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "markaz";
async function zaxiraOl() {
  const nusxa = { ...DB, meta: { ...DB.meta, oxirgiZaxira: bugun() } };
  const ok = await faylBer(`${faylNomi()}-zaxira-${bugun()}.json`, JSON.stringify(nusxa, null, 1), "application/json");
  if (!ok) return;
  DB.meta.oxirgiZaxira = bugun(); Ombor.sozYoz(); render();
}
async function tikla(matn) {
  let x;
  try { x = JSON.parse(matn); } catch (e) { toast("Fayl o‘qilmadi: bu zaxira fayli emas", "warn"); return; }
  if (!x || !Array.isArray(x.oquvchilar) || !Array.isArray(x.guruhlar)) { toast("Bu faylda zaxira ma’lumotlari topilmadi", "warn"); return; }
  const ha = await tasdiq(`Zaxirada ${x.guruhlar.length} ta ${T.guruh}, ${x.oquvchilar.length} ta ${T.oquvchi} bor. Joriy ma’lumotlar almashtiriladi.`, { tugma: "Tiklash", sarlavha: "Zaxiradan tiklash", xavfli: true });
  if (!ha) return;
  try {
    toast("Tiklanmoqda…");
    await Ombor.almashtir(x);
    if (!DB.xodimlar.length) { Sessiya.tugat(); Ilova.holat = "kirish"; UI.kirish.tab = "royxat"; }
    else if (!men()) { Sessiya.tugat(); Ilova.holat = "kirish"; UI.kirish.tab = "kirish"; }
    UI.dav = null; UI.tf.oid = ""; Server.holat = "kutilmoqda"; render(); toast("Ma’lumotlar tiklandi");
    Server.tekshir();
  } catch (e) { toast("Tiklashda xato: " + (e.message || e), "warn"); }
}
function csvMatn(q) {
  const f = v => { const s = String(v ?? ""); return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return "﻿" + q.map(r => r.map(f).join(";")).join("\r\n");
}
const CSV = {
  oquvchilar: () => [["Ism", "Telefon", `${katta(T.otaOna)} telefoni`, katta(T.guruhlar), "Holati", "Manba", "Tug‘ilgan sana", "Balans", "Qarz"],
    ...OQ().slice().sort(ismBoyicha).map(o => { const h = hisobHolati(o); return [o.ism, o.tel, o.otaTel, oquvchiGuruhlari(o).map(g => g.nomi).join(", "), oquvchiFaol(o) ? "Faol" : "Ketgan", o.manba, o.tugilgan, h.balans, h.qarz]; })],
  tolovlar: () => [["Sana", katta(T.oquvchi), katta(T.guruh), "Summa", "Usul", "Qabul qildi", "Izoh"],
    ...TL().slice().sort((a, b) => (a.sana || "").localeCompare(b.sana || "")).map(t => [t.sana, (oquvchi(t.oquvchiId) || {}).ism || "", (guruh(tolovGuruhi(t)) || {}).nomi || "", t.summa, t.usul, (xodim(t.xodimId) || {}).ism || "", t.izoh || ""])],
  qarzdorlar: () => [[katta(T.oquvchi), `${katta(T.otaOna)} telefoni`, katta(T.guruhlar), "Qarz", "Davr", "Kechikkan kun"],
    ...qarzdorlar().map(x => [x.o.ism, x.o.otaTel, oquvchiGuruhlari(x.o).map(g => g.nomi).join(", "), x.h.qarz, davrMatni(x.h), x.h.kechikish])],
  lidlar: () => [["Yaratilgan", "Ism", "Telefon", "Kurs", "Manba", "Holat", "Sinov sanasi", "Keyingi bog‘lanish", "Izoh"],
    ...LD().map(l => [l.yaratildi ? sanaStr(new Date(l.yaratildi)) : "", l.ism, l.tel, l.qiziqish, l.manba, (LID_HOLAT.find(h => h.k === l.holat) || {}).n || l.holat, l.sinovSana, l.keyingiAloqa, l.izoh])],
  xarajatlar: () => [["Sana", "Turi", "Summa", "Usul", katta(T.oqituvchi), "Izoh"],
    ...XR().slice().sort((a, b) => (a.sana || "").localeCompare(b.sana || "")).map(x => [x.sana, x.kategoriya, x.summa, x.usul, (oqituvchi(x.oqituvchiId) || {}).ism || "", x.izoh || ""])],
  guruhlar: () => { const oy = joriyOy(); return [[katta(T.guruh), katta(T.oqituvchi), "Narx", "Turi", katta(T.oquvchilar), "Davomat %", "Hisoblangan", "Yig‘ilgan"],
    ...GR().map(g => { const s = guruhOyStat(g, oy); return [g.nomi, oqituvchiNomi(g), g.narx, g.narxTuri === "dars" ? "Har dars" : "Oylik", s.oquvchi, s.dav.foiz ?? "", s.hisoblangan, s.yigilgan]; })]; },
};
function csvBer(tur) {
  const q = CSV[tur]();
  if (q.length < 2) { toast("Eksport uchun ma’lumot yo‘q", "warn"); return; }
  faylBer(`${tur}-${bugun()}.csv`, csvMatn(q), "text/csv;charset=utf-8");
}
