
/* =====================================================================
   8. BO‘LIMLAR — O‘QUV JARAYONI VA SOTUV
   ===================================================================== */

/* ---------- 8.1 Bosh sahifa ---------- */
function renderBosh() {
  const b = bugun(), oy = joriyOy(), m = men();
  const kun = KUNLAR[hafta(b)];
  const bugungiDarslar = menGuruhlarim().filter(g => g.holat !== "yopilgan" && (g.kunlar || []).includes(kun.k)).sort((x, y) => (x.boshlanish || "").localeCompare(y.boshlanish || ""));
  const darslarKarta = `<section class="card"><div class="card-h"><div><h2>Bugungi darslar</h2><div class="muted sm">${kun.n}, ${sanaMatn(b)}</div></div><a class="link" href="#jadval">Jadval</a></div>
    ${bugungiDarslar.length ? `<div class="royxat">${bugungiDarslar.map(g => {
      const belgi = DB.davomat[`${g.id}|${b}`];
      return `<div class="qator"><button class="qator-btn" data-act="dav-ochish" data-id="${g.id}">
        <span class="avatar" style="font-size:12px">${esc(g.boshlanish || "—")}</span>
        <span class="q-mat"><span class="q-nom">${esc(g.nomi)}</span><span class="q-sub">${[(xona(g.xonaId) || {}).nomi, oqituvchiNomi(g), guruhOquvchilari(g.id).length + " ta " + T.oquvchi].filter(Boolean).map(esc).join(" · ")}</span></span>
        ${belgi ? `<span class="pill ok">Belgilangan</span>` : `<span class="pill warn">Davomat</span>`}</button></div>`;
    }).join("")}</div>` : `<p class="bosh-matn">Bugun dars yo‘q.</p>`}</section>`;

  if (oqituvchiMi()) {
    const t = oqituvchi(m.oqituvchiId);
    const gs = menGuruhlarim().filter(g => g.holat !== "yopilgan");
    const dav = davStat((gid, s) => gs.some(g => g.id === gid) && s.startsWith(oy));
    const oylik = t ? oqituvchiOylik(t, oy) : null;
    return `<div class="tilelar">
        ${tile("Mening " + T.guruhlarim(gs.length), gs.length, `${sum(gs, g => guruhOquvchilari(g.id).length)} ta ${T.oquvchi}`, "layers")}
        ${tile("Shu oy davomat", dav.foiz === null ? "—" : dav.foiz + "%", dav.jami ? `${dav.jami} ta belgi` : "Hali belgilanmagan", "check")}
        ${oylik ? tile("Shu oy oyligim (taxminiy)", pulV(oylik.hisob), esc(oylik.izoh), "wallet", "", "") : ""}
      </div>${darslarKarta}
      <section class="card"><div class="card-h"><h2>Mening ${T.guruhlarim(2)}</h2></div>
        ${gs.length ? `<div class="royxat">${gs.map(g => `<div class="qator"><span class="avatar">${icon("layers", 20)}</span><div class="q-mat"><div class="q-nom">${esc(g.nomi)}</div><div class="q-sub">${(g.kunlar || []).join(", ")} · ${esc(g.boshlanish || "")}${g.tugash ? "–" + esc(g.tugash) : ""} · ${guruhOquvchilari(g.id).length} ta ${T.oquvchi}</div></div></div>`).join("")}</div>`
        : `<p class="bosh-matn">Sizga hali ${T.guruh} biriktirilmagan. Direktorga murojaat qiling.</p>`}</section>`;
  }

  if (!GR().length && !OQ().length) {
    return `<section class="card xush"><h2>Boshlaymiz!</h2>
      <p>Dastur bo‘sh. Quyidagi tartibda to‘ldiring.</p>
      <ol class="qadamlar">
        <li><b>${katta(T.oqituvchilar)} va xonalar.</b> «${katta(T.oqituvchilar)}» va «Sozlamalar → Xonalar».</li>
        <li><b>${katta(T.guruhlar)}.</b> Narx turi (oylik yoki har dars), kunlar, vaqt.</li>
        <li><b>${katta(T.oquvchilar)} va lidlar.</b> Yangi murojaatlar «Lidlar»ga yoziladi.</li>
      </ol>
      <div class="xush-amal"><button class="btn btn-primary" data-act="guruh-yangi">${icon("plus", 18)} ${katta(T.guruh)} qo‘shish</button></div></section>`;
  }

  const s = oyStat(oy), oldin = oyStat(oyQosh(oy, -1));
  const qd = qarzdorlar(), jamiQarz = sum(qd, x => x.h.qarz);
  const faol = OQ().filter(oquvchiFaol).length;
  const yangiLid = LD().filter(l => (l.yaratildi ? sanaStr(new Date(l.yaratildi)) : "").startsWith(oy)).length;
  const qongiroq = LD().filter(l => !["yozildi", "rad"].includes(l.holat) && l.keyingiAloqa && l.keyingiAloqa <= b).sort((x, y) => x.keyingiAloqa.localeCompare(y.keyingiAloqa));
  const tugilgan = OQ().filter(o => oquvchiFaol(o) && o.tugilgan && o.tugilgan.slice(5) === b.slice(5));
  const oylar = Array.from({ length: 6 }, (_, i) => oyQosh(oy, i - 5));

  const hero = `<section class="card hero">
    <div class="card-h"><div><h2>Shu oy tushgan pul</h2><div class="muted sm">${oyNomi(oy)} · ${TL().filter(t => (t.sana || "").startsWith(oy)).length} ta to‘lov</div></div>
      <a class="btn btn-soft btn-sm" href="#tolov">${icon("plus", 18)} To‘lov</a></div>
    <div class="katta-son">${pulV(s.tushum)}</div>
    <div class="muted sm">O‘tgan oyda: ${pulS(oldin.tushum)}${direktorMi() ? ` · Sof foyda shu oy: <b class="${s.foyda < 0 ? "qizil" : "yashil"}">${pulS(s.foyda)}</b>` : ""}</div>
    ${diagramma(oylar.map(x => ({ kalit: x, yorliq: oyQisqa(x), qiymat: oyStat(x).tushum })), { tanlangan: oy, balandlik: 140, nom: "So‘nggi 6 oy tushumi" })}
  </section>`;
  const tiles = `<div class="tilelar">
    ${tile("Jami qarz", pulV(jamiQarz), `${qd.length} ta qarzdor`, "alert", "bad", "qarzdorlar")}
    ${tile(`Faol ${T.oquvchilar}`, faol, `${GR().filter(g => g.holat !== "yopilgan").length} ta faol ${T.guruh}`, "users", "", "oquvchilar")}
    ${tile("Shu oy yig‘ilish", s.foiz === null ? "—" : s.foiz + "%", `${pulS(s.yigilgan)} / ${pulS(s.hisoblangan)}`, "check", "", direktorMi() ? "statistika" : "")}
    ${tile("Yangi lidlar (shu oy)", yangiLid, qongiroq.length ? `Bugun ${qongiroq.length} ta qo‘ng‘iroq` : "Bugun qo‘ng‘iroq yo‘q", "funnel", "warn", "lidlar")}
  </div>`;
  const top5 = `<section class="card"><div class="card-h"><h2>Eng katta qarzdorlar</h2>${qd.length ? `<a class="link" href="#qarzdorlar">Hammasi (${qd.length})</a>` : ""}</div>
    ${qd.length ? `<div class="royxat">${qd.slice(0, 5).map(x => `<div class="qator">
      <button class="qator-btn" data-act="profil" data-id="${x.o.id}"><span class="avatar">${esc(boshHarf(x.o.ism))}</span>
      <span class="q-mat"><span class="q-nom">${esc(x.o.ism)}</span><span class="q-sub">${oquvchiGuruhlari(x.o).map(g => esc(g.nomi)).join(", ") || "—"} · ${davrMatni(x.h)}</span></span></button>
      <div class="q-ong"><b class="qizil">${pulS(x.h.qarz)}</b>${kechikishPill(x.h)}</div></div>`).join("")}</div>`
      : `<p class="bosh-matn">Qarzdor yo‘q. Barcha to‘lovlar vaqtida.</p>`}</section>`;
  const lidKarta = qongiroq.length ? `<section class="card"><div class="card-h"><h2>Bugun bog‘lanish kerak</h2><a class="link" href="#lidlar">Lidlar</a></div>
    <div class="royxat">${qongiroq.slice(0, 6).map(l => `<div class="qator"><button class="qator-btn" data-act="lid-tahrir" data-id="${l.id}">
      <span class="avatar">${esc(boshHarf(l.ism))}</span><span class="q-mat"><span class="q-nom">${esc(l.ism)}</span><span class="q-sub">${esc(l.tel)} · ${esc(l.qiziqish || "")}</span></span>
      <span class="pill ${l.keyingiAloqa < b ? "bad" : "warn"}">${l.keyingiAloqa < b ? sanaMatn(l.keyingiAloqa) : "Bugun"}</span></button></div>`).join("")}</div></section>` : "";
  const tugKarta = tugilgan.length ? `<section class="card"><div class="card-h"><h2>${icon("gift", 20)} Bugun tug‘ilgan kun</h2></div>
    <div class="royxat">${tugilgan.map(o => `<div class="qator"><button class="qator-btn" data-act="profil" data-id="${o.id}"><span class="avatar">${esc(boshHarf(o.ism))}</span><span class="q-mat"><span class="q-nom">${esc(o.ism)}</span><span class="q-sub">${esc(o.otaTel || o.tel || "")}</span></span></button></div>`).join("")}</div></section>` : "";

  const dq = diqqatlar();
  const dqKarta = dq.length ? `<section class="card"><div class="card-h"><div><h2>Diqqat talab qiladi</h2><div class="muted sm">${dq.filter(x => x.daraja === "muhim").length} ta muhim</div></div><a class="link" href="#diqqat">Hammasi (${dq.length})</a></div>${dq.slice(0, 4).map(ogohHtml).join("")}</section>` : "";
  return `<div class="bosh-yuqori">${hero}${tiles}</div><div class="ikki-ustun">${dqKarta}${darslarKarta}${top5}${lidKarta}${tugKarta}</div>`;
}
T.guruhlarim = n => (n === 1 ? T.guruh + "im" : T.guruhlar + "im");

/* ---------- 8.2 Lidlar (sotuv voronkasi) ---------- */
function renderLidlar() {
  const b = bugun(), q = UI.lid.qidiruv.trim().toLowerCase();
  const l = LD().filter(x => !q || `${x.ism} ${x.tel} ${x.qiziqish}`.toLowerCase().includes(q))
    .sort((x, y) => (x.keyingiAloqa || "9999").localeCompare(y.keyingiAloqa || "9999") || (y.yaratildi || 0) - (x.yaratildi || 0));
  const oy = joriyOy();
  const shuOy = LD().filter(x => x.yaratildi && sanaStr(new Date(x.yaratildi)).startsWith(oy));
  const yozildi = shuOy.filter(x => x.holat === "yozildi").length;
  const qosh = `<button class="btn btn-primary" data-act="lid-yangi">${icon("plus", 18)} Lid qo‘shish</button>`;
  if (!LD().length) return boshHolat({ ic: "funnel", sarlavha: "Hali lid yo‘q", matn: "Qo‘ng‘iroq qilgan yoki yozgan har bir odamni shu yerga kiriting: sinov darsidan to yozilguncha kuzatasiz.", tugma: qosh });

  const karta = x => {
    const kech = x.keyingiAloqa && x.keyingiAloqa < b && !["yozildi", "rad"].includes(x.holat);
    const keyingi = LID_HOLAT[LID_HOLAT.findIndex(h => h.k === x.holat) + 1];
    return `<article class="lid-k ${kech ? "kech" : ""}">
      <button class="lk-nom" data-act="lid-tahrir" data-id="${x.id}">${esc(x.ism)}</button>
      <div class="lk-sub">${esc(x.tel)}${x.qiziqish ? ` · ${esc(x.qiziqish)}` : ""}</div>
      <div class="lk-pas">
        <span class="pill">${esc(x.manba || "—")}</span>
        ${x.holat === "sinov" && x.sinovSana ? `<span class="pill primary">Sinov: ${sanaMatn(x.sinovSana)}</span>` : ""}
        ${x.keyingiAloqa && !["yozildi", "rad"].includes(x.holat) ? `<span class="pill ${kech ? "bad" : x.keyingiAloqa === b ? "warn" : ""}">${icon("phone", 13)} ${x.keyingiAloqa === b ? "Bugun" : sanaMatn(x.keyingiAloqa)}</span>` : ""}
      </div>
      ${x.holat === "sinov" ? `<button class="btn btn-soft btn-sm" data-act="lid-oquvchi" data-id="${x.id}">${icon("arrowR", 16)} ${katta(T.oquvchi)} qilish</button>`
        : keyingi && keyingi.k !== "rad" && x.holat !== "yozildi" ? `<button class="btn btn-ghost btn-sm" data-act="lid-keyingi" data-id="${x.id}">${icon("arrowR", 16)} ${keyingi.n}</button>` : ""}
    </article>`;
  };
  const ustunlar = LID_HOLAT.map(h => {
    const ich = l.filter(x => x.holat === h.k);
    const kor = ["yozildi", "rad"].includes(h.k) ? ich.slice(0, 15) : ich;
    return `<div class="kb-ustun"><div class="kb-bosh"><span><span class="st-nuqta st-${h.k}"></span> ${h.n}</span><span class="son">${ich.length}</span></div>
      ${kor.map(karta).join("") || `<div class="bo-sh">Bo‘sh</div>`}</div>`;
  }).join("");
  const filtr = UI.lid.holat;
  const mobil = l.filter(x => filtr === "ochiq" ? !["yozildi", "rad"].includes(x.holat) : x.holat === filtr);
  return bolimBosh(`Shu oy: ${shuOy.length} ta lid, ${yozildi} tasi yozildi${shuOy.length ? ` (${Math.round(yozildi * 100 / shuOy.length)}%)` : ""}`, qosh) + `
    <label class="qidiruv"><span class="vh">Lid qidirish</span>${icon("search", 20)}<input id="lid-qidir" type="search" value="${esc(UI.lid.qidiruv)}" placeholder="Ism, telefon yoki kurs" autocomplete="off"></label>
    <div class="kanban">${ustunlar}</div>
    <div class="lid-mobil">
      <div class="chiplar" role="group" aria-label="Holat bo‘yicha">
        <button class="chip" data-act="lid-filtr" data-v="ochiq" aria-pressed="${filtr === "ochiq"}">Ochiq <span class="son">${l.filter(x => !["yozildi", "rad"].includes(x.holat)).length}</span></button>
        ${LID_HOLAT.map(h => `<button class="chip" data-act="lid-filtr" data-v="${h.k}" aria-pressed="${filtr === h.k}">${h.n} <span class="son">${l.filter(x => x.holat === h.k).length}</span></button>`).join("")}
      </div>
      ${mobil.length ? `<div class="kartalar">${mobil.map(karta).join("")}</div>` : `<p class="bosh-matn">Bu holatda lid yo‘q.</p>`}
    </div>`;
}
function lidForma(l) {
  const yangi = !l;
  l = l || { ism: "", tel: "", qiziqish: "", manba: SOZLAMALAR.lidManbalari[0], holat: "yangi", sinovSana: "", keyingiAloqa: bugun(), izoh: "" };
  const kurslar = [...new Set(GR().map(g => g.fan || g.nomi).filter(Boolean))];
  Modal.och(`<form id="lid-forma" class="forma" data-id="${l.id || ""}" novalidate>
    <h2 class="sheet-h">${yangi ? "Yangi lid" : "Lid"}</h2>
    <div class="ikki">
      <label class="maydon"><span>Ism *</span><input id="l-ism" value="${esc(l.ism)}" autocomplete="off" autofocus></label>
      <label class="maydon"><span>Telefon *</span><input id="l-tel" type="tel" value="${esc(l.tel)}" placeholder="+998 90 123 45 67"></label>
    </div>
    <div class="ikki">
      <label class="maydon"><span>Qiziqqan kurs</span><input id="l-qiziqish" list="l-kurslar" value="${esc(l.qiziqish)}" autocomplete="off"><datalist id="l-kurslar">${kurslar.map(k => `<option value="${esc(k)}">`).join("")}</datalist></label>
      <label class="maydon"><span>Qayerdan bildi</span><select id="l-manba">${tanlov(SOZLAMALAR.lidManbalari, l.manba)}</select></label>
    </div>
    <div class="maydon"><span>Holati</span><div class="seg" style="flex-wrap:wrap">${LID_HOLAT.map(h => `<label><input type="radio" name="l-holat" value="${h.k}" ${h.k === l.holat ? "checked" : ""}><span>${h.n}</span></label>`).join("")}</div></div>
    <div class="ikki">
      <label class="maydon"><span>Sinov darsi sanasi</span><input id="l-sinov" type="date" value="${esc(l.sinovSana)}"></label>
      <label class="maydon"><span>Keyingi bog‘lanish</span><input id="l-keyingi" type="date" value="${esc(l.keyingiAloqa)}"></label>
    </div>
    <label class="maydon"><span>Izoh</span><textarea id="l-izoh" rows="3" style="min-height:80px">${esc(l.izoh)}</textarea></label>
    <p class="xato" id="l-xato" hidden></p>
    <div class="sheet-actions">
      ${yangi ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="lid-ochir" data-id="${l.id}">${icon("trash", 18)} O‘chirish</button>`}
      ${!yangi && l.holat !== "yozildi" ? `<button type="button" class="btn btn-soft" data-act="lid-oquvchi" data-id="${l.id}">${katta(T.oquvchi)} qilish</button>` : ""}
      ${!yangi && l.tel ? `<a class="btn btn-ghost" href="${esc(tgHavola(shablonTold("lid", { ism: l.ism, kurs: l.qiziqish || "kurslarimiz", markaz: markazNomi() })))}" target="_blank" rel="noopener">${icon("send", 18)} Taklif</a>` : ""}
      <button type="submit" class="btn btn-primary">Saqlash</button>
    </div>
  </form>`);
}

/* ---------- 8.3 O‘quvchilar ---------- */
// O‘quvchilar ro‘yxati (Qabulxona) — 12-bo‘limda
function oquvchiProfil(id) {
  const o = oquvchi(id); if (!o) return Modal.yop();
  const oq = oqituvchiMi(), h = oq ? null : hisobHolati(o);
  const b = bugun();
  const azoliklar = (o.azolik || []).map((a, i) => ({ a, i, g: guruh(a.guruhId) })).sort((x, y) => (y.a.qoshilgan || "").localeCompare(x.a.qoshilgan || ""));
  const tolovlar = (tolovIndeks().get(o.id) || []).slice().sort((x, y) => (y.sana || "").localeCompare(x.sana || "")).slice(0, 8);
  let k = 0, km = 0, ks = 0;
  for (const [kal, v] of Object.entries(DB.davomat)) { if (kal.split("|")[1] < sanaQosh(b, -30)) continue; if (QATNASHDI(v[o.id])) k++; else if (v[o.id] === "kelmadi") km++; else if (v[o.id] === "sababli") ks++; }
  Modal.och(`<div class="profil-bosh"><span class="avatar">${esc(boshHarf(o.ism))}</span><div class="q-mat"><h2>${esc(o.ism)}</h2>
      <div class="muted sm">${[o.tel && "Tel: " + o.tel, o.otaTel && katta(T.otaOna) + ": " + o.otaTel].filter(Boolean).map(esc).join(" · ") || "Telefon kiritilmagan"}</div>
      <div class="muted sm">${[o.manba && "Manba: " + o.manba, o.tugilgan && "Tug‘ilgan: " + sanaMatn(o.tugilgan)].filter(Boolean).map(esc).join(" · ")}</div></div>
      <button class="icon-btn tekis" data-act="modal-yop" aria-label="Yopish">${icon("x")}</button></div>
    ${h ? `<div class="balans-k ${h.qarz ? "qarz" : h.ortiqcha ? "ortiq" : ""}"><div><div class="muted sm">${h.qarz ? "Qarz" : h.ortiqcha ? "Oldindan to‘langan" : "Balans"}</div><b class="${h.qarz ? "qizil" : h.ortiqcha ? "yashil" : ""}">${pulS(h.qarz || h.ortiqcha)}</b></div>
      <div class="muted sm" style="text-align:right">To‘langan: ${pulS(h.tolangan)}<br>Hisoblangan: ${pulS(h.jami)}</div></div>` : ""}
    <div class="amal-qator">
      ${oq ? "" : `<button class="btn btn-primary btn-sm" data-act="tolovga" data-id="${o.id}">${icon("wallet", 18)} To‘lov</button>
      <button class="btn btn-soft btn-sm" data-act="azolik-yangi" data-id="${o.id}">${icon("plus", 18)} ${katta(T.guruh)}ga qo‘shish</button>
      <button class="btn btn-ghost btn-sm" data-act="oq-tahrir" data-id="${o.id}">${icon("edit", 18)} Tahrirlash</button>`}
    </div>
    <div class="bo-sar">${katta(T.guruhlar)}</div>
    ${azoliklar.length ? `<table class="mini-jadval"><tbody>${azoliklar.map(({ a, i, g }) => {
      const faol = azolikFaol(a, b) || (a.qoshilgan > b && !a.chiqqan);
      return `<tr><td><b>${esc(g ? g.nomi : "O‘chirilgan " + T.guruh)}</b><div class="muted sm">${g ? esc(guruhNarxMatn(g)) : ""}${chegirmaMatn(a) ? ` · ${esc(chegirmaMatn(a))}` : ""}</div>
        <div class="muted sm">${sanaMatn(a.qoshilgan)} dan${a.chiqqan ? ` ${sanaMatn(a.chiqqan)} gacha` : ""}</div></td>
        <td class="o">${faol ? `<span class="pill ok">Faol</span>` : `<span class="pill">Ketgan</span>`}
        ${oq ? "" : `<br><button class="btn btn-ghost btn-sm" style="margin-top:6px" data-act="azolik-tahrir" data-id="${o.id}" data-i="${i}">O‘zgartirish</button>`}</td></tr>`;
    }).join("")}</tbody></table>` : `<p class="bosh-matn">Hech qaysi ${T.guruh}ga biriktirilmagan.</p>`}
    <div class="bo-sar">Davomat (so‘nggi 30 kun)</div>
    <div class="xulosa" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="k"><b>${k}</b><span>Qatnashdi</span></div><div class="m"><b>${km}</b><span>Kelmadi</span></div><div class="s"><b>${ks}</b><span>Sababli</span></div></div>
    ${h ? `<div class="bo-sar">Hisob-kitob</div>
      ${h.hisoblar.length ? `<table class="mini-jadval"><thead><tr><th>Davr</th><th class="o">Summa</th><th class="o">Holat</th></tr></thead><tbody>${h.hisoblar.slice(-8).reverse().map(x => `<tr><td>${esc(x.tavsif)}<div class="muted sm">${esc((guruh(x.guruhId) || {}).nomi || "")}</div></td><td class="o">${pulS(x.summa)}</td>
        <td class="o">${x.qarz === 0 ? `<span class="pill ok">To‘langan</span>` : x.tolangan ? `<span class="pill warn">${pul(x.qarz)} qoldi</span>` : `<span class="pill bad">To‘lanmagan</span>`}</td></tr>`).join("")}</tbody></table>` : `<p class="bosh-matn">Hali hisoblangan to‘lov yo‘q.</p>`}
      <div class="bo-sar">To‘lovlar</div>
      ${tolovlar.length ? `<table class="mini-jadval"><tbody>${tolovlar.map(t => `<tr><td>${sanaMatn(t.sana)}<div class="muted sm">${esc(t.usul)}${t.izoh ? " · " + esc(t.izoh) : ""}</div></td><td class="o"><b class="${t.qaytarish ? "qizil" : ""}">${t.qaytarish ? "−" : ""}${pulS(t.summa)}</b></td></tr>`).join("")}</tbody></table>` : `<p class="bosh-matn">To‘lov yo‘q.</p>`}` : ""}
    ${o.izoh ? `<div class="bo-sar">Izoh</div><p style="margin:0">${esc(o.izoh)}</p>` : ""}`, { keng: true });
  Modal.profilId = id;
}
function oquvchiForma(o, oldin = {}) {
  if (!GR().length) { tasdiq(`${katta(T.oquvchi)} ${T.guruh}ga biriktiriladi. Avval ${T.guruh} qo‘shing.`, { tugma: `${katta(T.guruh)} qo‘shish`, sarlavha: `${katta(T.guruh)} yo‘q` }).then(ha => ha && guruhForma()); return; }
  const yangi = !o;
  o = o || { ism: oldin.ism || "", tel: oldin.tel || "", otaTel: "", tugilgan: "", manba: oldin.manba || "", izoh: oldin.izoh || "" };
  Modal.och(`<form id="oquvchi-forma" class="forma" data-id="${o.id || ""}" data-lid="${esc(oldin.lidId || "")}" novalidate>
    <h2 class="sheet-h">${yangi ? `Yangi ${T.oquvchi}` : `${katta(T.oquvchi)}ni tahrirlash`}</h2>
    <label class="maydon"><span>Ism va familiya *</span><input id="o-ism" value="${esc(o.ism)}" autocomplete="off" autofocus></label>
    <div class="ikki">
      <label class="maydon"><span>Telefon</span><input id="o-tel" type="tel" value="${esc(o.tel)}" placeholder="+998 90 123 45 67"></label>
      <label class="maydon"><span>${katta(T.otaOna)} telefoni</span><input id="o-otatel" type="tel" value="${esc(o.otaTel)}" placeholder="+998 91 765 43 21"></label>
    </div>
    <div class="ikki">
      <label class="maydon"><span>Tug‘ilgan sana</span><input id="o-tugilgan" type="date" value="${esc(o.tugilgan)}"></label>
      <label class="maydon"><span>Qayerdan bildi</span><select id="o-manba"><option value="">—</option>${tanlov(SOZLAMALAR.lidManbalari, o.manba)}</select></label>
    </div>
    ${yangi ? `<div class="ikki">
      <label class="maydon"><span>${katta(T.guruh)} *</span><select id="o-guruh">${guruhOptions(oldin.guruhId || UI.oq.guruh)}</select></label>
      <label class="maydon"><span>Qo‘shilgan sana</span><input id="o-sana" type="date" value="${bugun()}"></label></div>
      <label class="maydon"><span>Chegirma</span><select id="o-chegirma">${chegirmaOptions("")}</select></label>` : ""}
    <label class="maydon"><span>Izoh</span><textarea id="o-izoh" rows="2" style="min-height:70px">${esc(o.izoh)}</textarea></label>
    <p class="xato" id="o-xato" hidden></p>
    <div class="sheet-actions">
      ${yangi || !direktorMi() ? "" : `<button type="button" class="btn btn-ghost btn-qizil-matn chap" data-act="oq-ochir" data-id="${o.id}">${icon("trash", 18)} O‘chirish</button>`}
      <button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button>
      <button type="submit" class="btn btn-primary">Saqlash</button>
    </div></form>`);
}
function azolikForma(oid, i) {
  const o = oquvchi(oid); if (!o) return;
  const yangi = i === undefined || i === null || i === "";
  const a = yangi ? { guruhId: "", qoshilgan: bugun(), chiqqan: "", chegirma: 0 } : o.azolik[+i];
  const band = new Set((o.azolik || []).filter(x => !x.chiqqan || x.chiqqan > bugun()).map(x => x.guruhId));
  Modal.och(`<form id="azolik-forma" class="forma" data-oid="${oid}" data-i="${yangi ? "" : i}" novalidate>
    <h2 class="sheet-h">${esc(o.ism)}: ${yangi ? `${T.guruh}ga qo‘shish` : `${T.guruh} a’zoligi`}</h2>
    <label class="maydon"><span>${katta(T.guruh)}</span><select id="a-guruh" ${yangi ? "" : "disabled"}>${GR().filter(g => (yangi ? g.holat !== "yopilgan" && !band.has(g.id) : g.id === a.guruhId)).sort(ismBoyicha).map(g => `<option value="${g.id}" ${g.id === a.guruhId ? "selected" : ""}>${esc(g.nomi)} · ${esc(guruhNarxMatn(g))}</option>`).join("")}</select></label>
    <div class="ikki">
      <label class="maydon"><span>Qo‘shilgan sana</span><input id="a-qosh" type="date" value="${esc(a.qoshilgan)}"></label>
      <label class="maydon"><span>Chegirma</span><select id="a-cheg">${chegirmaOptions(a.chegirmaId || (+a.chegirma ? "f:" + a.chegirma : ""))}</select></label>
    </div>
    ${yangi ? "" : `<label class="maydon"><span>Ketgan sana (bo‘sh — hali o‘qiyapti)</span><input id="a-chiq" type="date" value="${esc(a.chiqqan || "")}"></label>
      <p class="muted sm" style="margin:0">Ketgan sanadan keyin to‘lov hisoblanmaydi. Oy o‘rtasida ketsa, faqat qatnagan dars kunlari hisoblanadi.</p>`}
    <p class="xato" id="a-xato" hidden></p>
    <div class="sheet-actions">
      ${yangi ? "" : `<button type="button" class="btn btn-ghost chap" data-act="azolik-ketdi" data-oid="${oid}" data-i="${i}">Bugun ketdi</button>`}
      <button type="button" class="btn btn-ghost" data-act="profil" data-id="${oid}">Orqaga</button>
      <button type="submit" class="btn btn-primary">Saqlash</button>
    </div></form>`);
}

/* ---------- 8.4 Guruhlar ---------- */
function renderGuruhlar() {
  const qosh = `<button class="btn btn-primary" data-act="guruh-yangi">${icon("plus", 18)} ${katta(T.guruh)} qo‘shish</button>`;
  if (!GR().length) return boshHolat({ ic: "layers", sarlavha: `Hali ${T.guruh} yo‘q`, matn: `Birinchi ${T.guruh}ni qo‘shing: nomi, ${T.oqituvchi}, kunlar, vaqt va narx.`, tugma: qosh });
  const toq = toqnashuvlar();
  const l = GR().filter(g => (UI.guruhHolat === "hammasi" || (g.holat || "faol") === UI.guruhHolat) && (!UI.guruhMavsum || g.mavsumId === UI.guruhMavsum)).sort(ismBoyicha);
  return bolimBosh(`${GR().filter(g => g.holat !== "yopilgan").length} ta faol ${T.guruh}`, qosh) +
    `<div class="qator-orasi">${segTugmalar("guruh-holat", [["faol", "Faol"], ["yopilgan", "Yopilgan"], ["hammasi", "Hammasi"]], UI.guruhHolat)}
    ${DB.mavsumlar.length ? `<div class="chiplar"><button class="chip" data-act="guruh-mavsum" data-v="" aria-pressed="${!UI.guruhMavsum}">Barcha mavsumlar</button>${DB.mavsumlar.map(m => `<button class="chip" data-act="guruh-mavsum" data-v="${m.id}" aria-pressed="${UI.guruhMavsum === m.id}">${esc(m.nomi)}</button>`).join("")}</div>` : ""}</div>` +
    (l.length ? `<div class="kartalar">${l.map(g => {
      const n = guruhOquvchilari(g.id).length, x = xona(g.xonaId), t = toq.get(g.id);
      return `<article class="card guruh-k">
        <div class="gk-top"><div><h3>${esc(g.nomi)}</h3><div class="muted sm">${[kursNomi(g), (byId("filiallar").get(g.filialId) || {}).nomi, (byId("mavsumlar").get(g.mavsumId) || {}).nomi].filter(Boolean).map(esc).join(" · ")}</div></div><span class="narx">${pulS(g.narx)}<small> / ${g.narxTuri === "dars" ? "dars" : "oy"}</small></span></div>
        <div class="muted sm">${katta(T.oqituvchi)}: ${esc(oqituvchiNomi(g) || "tanlanmagan")}${x ? ` · ${esc(x.nomi)}` : ""}${g.boshlanish ? ` · ${esc(g.boshlanish)}${g.tugash ? "–" + esc(g.tugash) : ""}` : ""}</div>
        <div class="kunlar">${KUNLAR.map(k => `<span class="kun ${(g.kunlar || []).includes(k.k) ? "on" : ""}" title="${k.n}">${k.k}</span>`).join("")}</div>
        ${t ? `<span class="pill bad">To‘qnashuv: ${t.map(z => `${esc(z.bilan.nomi)} (${z.sabab.join(", ")})`).join("; ")}</span>` : ""}
        ${g.holat === "yopilgan" ? `<span class="pill">Yopilgan</span>` : ""}
        <div class="gk-pas"><a class="link" href="#oquvchilar" data-act="guruh-oquvchilari" data-id="${g.id}">${n} ta ${T.oquvchi}${guruhSigimi(g) ? ` / ${guruhSigimi(g)} o‘rin` : ""}</a>
          <div><button class="icon-btn tekis" data-act="guruh-tahrir" data-id="${g.id}" aria-label="Tahrirlash">${icon("edit", 20)}</button>
          ${direktorMi() ? `<button class="icon-btn tekis" data-act="guruh-ochir" data-id="${g.id}" aria-label="O‘chirish">${icon("trash", 20)}</button>` : ""}</div></div>
      </article>`;
    }).join("")}</div>` : `<p class="bosh-matn">Bu holatda ${T.guruh} yo‘q.</p>`);
}
function guruhForma(g) {
  const yangi = !g;
  g = g || { nomi: "", fan: "", kursId: "", filialId: joriyFilial(), mavsumId: "", sigim: "", tugashSana: "", oqituvchiId: "", xonaId: "", kunlar: ["Du", "Ch", "Ju"], boshlanish: "14:00", tugash: "15:30", narxTuri: "oylik", narx: "", holat: "faol", ochilgan: bugun() };
  Modal.och(`<form id="guruh-forma" class="forma" data-id="${g.id || ""}" novalidate>
    <h2 class="sheet-h">${yangi ? `Yangi ${T.guruh}` : `${katta(T.guruh)}ni tahrirlash`}</h2>
    <div class="ikki">
      <label class="maydon"><span>${katta(T.guruh)} nomi *</span><input id="g-nomi" value="${esc(g.nomi)}" placeholder="Masalan: Ingliz tili A1 (ertalab)" autocomplete="off" autofocus></label>
      <label class="maydon"><span>Kurs</span><select id="g-kurs"><option value="">Tanlanmagan</option>${DB.kurslar.filter(k => k.holat !== "yopilgan" || k.id === g.kursId).sort(ismBoyicha).map(k => `<option value="${k.id}" ${k.id === g.kursId ? "selected" : ""}>${esc(k.nomi)}</option>`).join("")}</select></label>
    </div>
    <div class="ikki">
      ${DB.filiallar.length ? `<label class="maydon"><span>Filial</span><select id="g-filial">${DB.filiallar.map(f => `<option value="${f.id}" ${f.id === g.filialId ? "selected" : ""}>${esc(f.nomi)}</option>`).join("")}</select></label>` : ""}
      <label class="maydon"><span>Mavsum</span><select id="g-mavsum"><option value="">Tanlanmagan</option>${DB.mavsumlar.map(m => `<option value="${m.id}" ${m.id === g.mavsumId ? "selected" : ""}>${esc(m.nomi)}</option>`).join("")}</select></label>
    </div>
    <div class="ikki">
      <label class="maydon"><span>${katta(T.oqituvchi)}</span><select id="g-oqit">${oqituvchiOptions(g.oqituvchiId)}</select></label>
      <label class="maydon"><span>Xona</span><select id="g-xona"><option value="">Tanlanmagan</option>${DB.xonalar.slice().sort(ismBoyicha).map(x => `<option value="${x.id}" ${x.id === g.xonaId ? "selected" : ""}>${esc(x.nomi)}</option>`).join("")}</select></label>
    </div>
    <fieldset class="maydon"><legend>Dars kunlari</legend><div class="kun-tanlov">${KUNLAR.map(k => `<label class="kun-chk" title="${k.n}"><input type="checkbox" name="kun" value="${k.k}" ${(g.kunlar || []).includes(k.k) ? "checked" : ""}><span>${k.k}</span></label>`).join("")}</div></fieldset>
    <div class="ikki">
      <label class="maydon"><span>Boshlanish</span><input id="g-bosh" type="time" value="${esc(g.boshlanish)}"></label>
      <label class="maydon"><span>Tugash</span><input id="g-tug" type="time" value="${esc(g.tugash)}"></label>
    </div>
    <div class="maydon"><span>To‘lov turi</span><div class="seg">
      <label><input type="radio" name="g-turi" value="oylik" ${g.narxTuri !== "dars" ? "checked" : ""}><span>Oylik</span></label>
      <label><input type="radio" name="g-turi" value="dars" ${g.narxTuri === "dars" ? "checked" : ""}><span>Har dars uchun</span></label></div></div>
    <div class="ikki">
      <label class="maydon"><span>Narx, ${SOZLAMALAR.valyuta} *</span><input id="g-narx" inputmode="numeric" data-pul value="${g.narx ? pul(g.narx, " ") : ""}" placeholder="400 000" autocomplete="off"></label>
      <label class="maydon"><span>Holati</span><select id="g-holat"><option value="faol" ${g.holat !== "yopilgan" ? "selected" : ""}>Faol</option><option value="yopilgan" ${g.holat === "yopilgan" ? "selected" : ""}>Yopilgan</option></select></label>
    </div>
    <div class="ikki">
      <label class="maydon"><span>Sig‘imi (o‘rin)</span><input id="g-sigim" inputmode="numeric" value="${esc(g.sigim || "")}" placeholder="Xonadan olinadi"></label>
      <label class="maydon"><span>Tugash sanasi</span><input id="g-tugsana" type="date" value="${esc(g.tugashSana || "")}"></label>
    </div>
    <p class="muted sm" style="margin:0">«Har dars uchun»da pul faqat davomatda «Keldi» belgilangan darslar uchun hisoblanadi.</p>
    <p class="xato" id="g-xato" hidden></p>
    <div class="sheet-actions"><button type="button" class="btn btn-ghost" data-act="modal-yop">Bekor qilish</button><button type="submit" class="btn btn-primary">Saqlash</button></div>
  </form>`);
}

/* ---------- 8.5 Dars jadvali ---------- */
function renderJadval() {
  const gs = menGuruhlarim().filter(g => g.holat !== "yopilgan" && (!UI.jadvalXona || g.xonaId === UI.jadvalXona));
  if (!menGuruhlarim().length) return boshHolat({ ic: "calendar", sarlavha: `Jadvalda ${T.guruh} yo‘q`, matn: oqituvchiMi() ? `Sizga hali ${T.guruh} biriktirilmagan.` : `${katta(T.guruh)} qo‘shilgach, haftalik jadval shu yerda chiqadi.` });
  const toq = toqnashuvlar(), bk = hafta(bugun());
  const kunGuruhlari = i => gs.filter(g => (g.kunlar || []).includes(KUNLAR[i].k)).sort((x, y) => (x.boshlanish || "99").localeCompare(y.boshlanish || "99"));
  return `<div class="qator-orasi">
      <div class="chiplar kun-chiplar" role="group" aria-label="Kun">${KUNLAR.map((k, i) => `<button class="chip" data-act="jadval-kun" data-v="${i}" aria-pressed="${UI.jadvalKun === i}">${k.k} <span class="son">${kunGuruhlari(i).length}</span></button>`).join("")}</div>
      ${DB.xonalar.length && !oqituvchiMi() ? `<label><span class="vh">Xona</span><select id="jadval-xona" style="min-height:40px;padding:6px 10px"><option value="">Barcha xonalar</option>${DB.xonalar.map(x => `<option value="${x.id}" ${x.id === UI.jadvalXona ? "selected" : ""}>${esc(x.nomi)}</option>`).join("")}</select></label>` : ""}
    </div>
    ${toq.size && !oqituvchiMi() ? `<div class="banner xavf">${icon("alert")}<div class="b-mat"><b>Jadvalda to‘qnashuv bor.</b> Bir xona yoki bir ${T.oqituvchi} bir vaqtda ikki ${T.guruh}da. Qizil kartalarni tekshiring.</div></div>` : ""}
    <div class="hafta">${KUNLAR.map((k, i) => `<div class="kun-ustun ${UI.jadvalKun === i ? "tanlangan" : ""} ${bk === i ? "bugun" : ""}">
      <div class="ku-bosh"><span>${k.n}</span>${bk === i ? `<span class="pill primary">Bugun</span>` : ""}</div>
      ${kunGuruhlari(i).map(g => `<div class="dars-k ${toq.has(g.id) ? "toqnash" : ""}">
        <span class="vaqt">${esc(g.boshlanish || "—")}${g.tugash ? "–" + esc(g.tugash) : ""}</span><b>${esc(g.nomi)}</b>
        <span class="muted">${[(xona(g.xonaId) || {}).nomi, oqituvchiNomi(g)].filter(Boolean).map(esc).join(" · ")}</span>
        <span class="muted">${guruhOquvchilari(g.id).length} ta ${T.oquvchi}</span></div>`).join("") || `<div class="bo-sh">Dars yo‘q</div>`}
    </div>`).join("")}</div>`;
}

/* ---------- 8.6 Davomat ---------- */
function renderDavomat() {
  const gs = menGuruhlarim().filter(g => g.holat !== "yopilgan").sort(ismBoyicha);
  if (!gs.length) return boshHolat({ ic: "check", sarlavha: `${katta(T.guruh)} yo‘q`, matn: oqituvchiMi() ? `Sizga hali ${T.guruh} biriktirilmagan.` : `Davomat uchun avval ${T.guruh} va ${T.oquvchilar} qo‘shing.` });
  if (!gs.some(g => g.id === UI.davGuruh)) {
    const k = KUNLAR[hafta(UI.davSana)].k;
    UI.davGuruh = (gs.find(g => (g.kunlar || []).includes(k)) || gs[0]).id;
  }
  const g = guruh(UI.davGuruh), s = UI.davSana, kalit = `${g.id}|${s}`;
  if (!UI.dav || UI.dav.kalit !== kalit) UI.dav = { kalit, belgilar: { ...(DB.davomat[kalit] || {}) }, ozgardi: false };
  const l = guruhOquvchilari(g.id, s);
  const kun = KUNLAR[hafta(s)], darsKuni = (g.kunlar || []).includes(kun.k), saqlangan = !!DB.davomat[kalit], bekor = DB.bekorlar[kalit];
  const tanlovHtml = `<div class="chiplar" role="group" aria-label="${katta(T.guruh)}">${gs.map(x => `<button class="chip" data-act="dav-guruh" data-id="${x.id}" aria-pressed="${x.id === g.id}">${esc(x.nomi)}</button>`).join("")}</div>
    <div class="sana-qator">
      <button class="icon-btn" data-act="dav-kun" data-n="-1" aria-label="Oldingi kun">${icon("chevL")}</button>
      <label class="vh" for="dav-sana">Sana</label><input id="dav-sana" type="date" value="${s}">
      <button class="icon-btn" data-act="dav-kun" data-n="1" aria-label="Keyingi kun">${icon("chevR")}</button>
      ${s !== bugun() ? `<button class="btn btn-soft btn-sm" data-act="dav-bugun">Bugun</button>` : ""}
    </div>
    <div class="dav-info">${kun.n}, ${sanaMatn(s)}
      ${darsKuni ? `<span class="pill ok">Dars kuni</span>` : `<span class="pill warn">Dars kuni emas</span>`}
      ${saqlangan ? `<span class="pill primary">Saqlangan</span>` : ""}
      ${g.narxTuri === "dars" ? `<span class="pill">Har dars uchun to‘lov</span>` : ""}
      ${bekor ? `<span class="pill bad">Bekor qilingan</span>` : ""}</div>`;
  if (bekor !== undefined) return tanlovHtml + `<section class="card bosh-holat"><div class="bh-ic">${icon("x", 30)}</div><h3>Dars bekor qilingan</h3><p>${esc(bekor || "Sabab ko‘rsatilmagan")}</p>
    ${oqituvchiMi() ? "" : `<button class="btn btn-soft" data-act="dav-bekor-qaytar">Bekorni qaytarish</button>`}</section>`;
  if (!l.length) return tanlovHtml + boshHolat({ ic: "users", sarlavha: `Bu ${T.guruh}da ${T.oquvchi} yo‘q`, matn: `${esc(g.nomi)} ${T.guruh}iga ${T.oquvchi} qo‘shing (o‘quvchi profilidan).` });
  return tanlovHtml + `<section class="card">
      <div class="card-h"><h2>${esc(g.nomi)}</h2><div class="amal-qator"><button class="btn btn-ghost btn-sm" data-act="dav-bekor">Darsni bekor qilish</button><button class="btn btn-soft btn-sm" data-act="dav-hammasi">Hammasi keldi</button></div></div>
      <div class="xulosa x5" id="dav-xulosa">${davXulosa(l)}</div>
      <div class="royxat" style="margin-top:6px">${l.map(o => `<div class="dav-qator">
        <div class="dq-ism"><span class="avatar">${esc(boshHarf(o.ism))}</span><span>${esc(o.ism)}</span></div>
        <div class="dav-tugmalar" role="group" aria-label="${esc(o.ism)} davomati">${Object.keys(HOLAT_NOMI).map(v => `<button class="mark" data-act="dav-belgi" data-oid="${o.id}" data-v="${v}" aria-pressed="${UI.dav.belgilar[o.id] === v}">${HOLAT_NOMI[v]}</button>`).join("")}</div>
      </div>`).join("")}</div>
    </section>
    <div class="saqla-bar ${UI.dav.ozgardi ? "ozgardi" : ""}" id="saqla-bar">
      <span class="holat" id="saqla-holat">${davHolatMatni(l)}</span>
      <button class="btn btn-primary" data-act="dav-saqla">${icon("check2", 20)} Saqlash</button>
    </div>`;
}
function davXulosa(l) {
  const b = UI.dav.belgilar, c = { keldi: 0, kechikdi: 0, kelmadi: 0, sababli: 0 };
  l.forEach(o => { if (c[b[o.id]] !== undefined) c[b[o.id]]++; });
  return `<div class="k"><b>${c.keldi}</b><span>Keldi</span></div><div class="s"><b>${c.kechikdi}</b><span>Kechikdi</span></div><div class="m"><b>${c.kelmadi}</b><span>Kelmadi</span></div><div><b>${c.sababli}</b><span>Sababli</span></div><div><b>${l.length - c.keldi - c.kechikdi - c.kelmadi - c.sababli}</b><span>Belgilanmagan</span></div>`;
}
function davHolatMatni(l) {
  if (UI.dav.ozgardi) return "O‘zgarishlar saqlanmagan";
  const n = l.filter(o => UI.dav.belgilar[o.id]).length;
  return n ? `${l.length} tadan ${n} tasi belgilangan` : "Har bir ism yonidagi tugmani bosing";
}
function davYangila() {
  const g = guruh(UI.davGuruh); if (!g) return;
  const l = guruhOquvchilari(g.id, UI.davSana);
  const x = $("#dav-xulosa"); if (x) x.innerHTML = davXulosa(l);
  const bar = $("#saqla-bar"); if (bar) bar.classList.toggle("ozgardi", UI.dav.ozgardi);
  const h = $("#saqla-holat"); if (h) h.textContent = davHolatMatni(l);
}
async function davOzgartir(yangi) {
  if (UI.dav && UI.dav.ozgardi && !(await tasdiq("Belgilangan davomat hali saqlanmagan. Saqlamasdan o‘tasizmi?", { tugma: "Ha, o‘tish", sarlavha: "Davomat saqlanmagan" }))) { render(); return; }
  Object.assign(UI, yangi); UI.dav = null; render();
}

/* ---------- 8.7 To‘lov ---------- */
function renderTolov() {
  if (!OQ().length) return boshHolat({ ic: "wallet", sarlavha: `Hali ${T.oquvchi} yo‘q`, matn: `To‘lov qabul qilish uchun avval ${T.oquvchi} qo‘shing.`, tugma: `<button class="btn btn-primary" data-act="oq-yangi">${icon("plus", 18)} ${katta(T.oquvchi)} qo‘shish</button>` });
  const f = UI.tf;
  const opt = o => `<option value="${o.id}" ${o.id === f.oid ? "selected" : ""}>${esc(o.ism)}</option>`;
  const faol = OQ().filter(oquvchiFaol), ketgan = OQ().filter(o => !oquvchiFaol(o)).sort(ismBoyicha);
  const qoshilgan = new Set();
  const variantlar = GR().filter(g => g.holat !== "yopilgan").sort(ismBoyicha).map(g => {
    const l = faol.filter(o => !qoshilgan.has(o.id) && faolAzoliklar(o).some(a => a.guruhId === g.id)).sort(ismBoyicha);
    l.forEach(o => qoshilgan.add(o.id));
    return l.length ? `<optgroup label="${esc(g.nomi)}">${l.map(opt).join("")}</optgroup>` : "";
  }).join("") + (() => { const qol = faol.filter(o => !qoshilgan.has(o.id)); return qol.length ? `<optgroup label="Boshqalar">${qol.map(opt).join("")}</optgroup>` : ""; })()
    + (ketgan.length ? `<optgroup label="Ketganlar">${ketgan.map(opt).join("")}</optgroup>` : "");
  const tarixOylar = [...new Set([joriyOy(), ...TL().map(t => (t.sana || "").slice(0, 7)).filter(Boolean)])].sort().reverse();
  return `<div class="ikki-ustun">
    <section class="card"><div class="card-h"><h2>To‘lov qabul qilish</h2></div>
      <form id="tolov-forma" class="forma" novalidate>
        <label class="maydon"><span>${katta(T.oquvchi)} *</span><select id="t-oq"><option value="">Tanlang…</option>${variantlar}</select></label>
        <div id="t-info">${tolovInfo()}</div>
        <div class="ikki">
          <label class="maydon"><span>Summa, ${SOZLAMALAR.valyuta} *</span><input id="t-summa" inputmode="numeric" data-pul value="${f.summa ? pul(f.summa, " ") : ""}" placeholder="0" autocomplete="off"></label>
          <label class="maydon"><span>Sana</span><input id="t-sana" type="date" value="${esc(f.sana)}"></label>
        </div>
        <div class="maydon"><span>To‘lov usuli</span>${segTugmalar("t-usul", SOZLAMALAR.tolovUsullari.map(u => [u, u]), f.usul)}</div>
        <div class="ikki">
          <label class="maydon"><span>${katta(T.guruh)} uchun</span><select id="t-guruh"><option value="">Umumiy balansga</option>${tolovGuruhVariant()}</select></label>
          <label class="maydon"><span>Izoh</span><input id="t-izoh" value="${esc(f.izoh)}" placeholder="Ixtiyoriy" autocomplete="off"></label>
        </div>
        ${direktorMi() ? `<label class="toggle"><input type="checkbox" id="t-qaytarish" ${f.qaytarish ? "checked" : ""}> Pulni qaytarish (o‘quvchiga qaytarib berildi)</label>` : ""}
        <p class="xato" id="t-xato" hidden></p>
        <button type="submit" class="btn btn-primary btn-blok">${icon("check2", 20)} To‘lovni saqlash</button>
      </form></section>
    <section class="card"><div class="card-h"><h2>To‘lov tarixi</h2>
      <label><span class="vh">Oy</span><select id="t-tarix-oy" style="min-height:40px;padding:6px 10px"><option value="">Barcha oylar</option>${tarixOylar.map(m => `<option value="${m}" ${m === UI.tolovOy ? "selected" : ""}>${oyNomi(m)}</option>`).join("")}</select></label></div>
      <div id="t-tarix">${tolovTarixi()}</div></section></div>`;
}
function tolovGuruhVariant() {
  const o = oquvchi(UI.tf.oid);
  return (o ? oquvchiGuruhlari(o) : []).map(g => `<option value="${g.id}" ${g.id === UI.tf.guruhId ? "selected" : ""}>${esc(g.nomi)}</option>`).join("");
}
function tolovInfo() {
  const o = oquvchi(UI.tf.oid); if (!o) return "";
  const h = hisobHolati(o), gs = oquvchiGuruhlari(o);
  const oylik = sum(faolAzoliklar(o).map(a => ({ a, g: guruh(a.guruhId) })).filter(x => x.g && x.g.narxTuri !== "dars"), x => yaxlit(x.g.narx * (1 - (+x.a.chegirma || 0) / 100)));
  return `<div class="info-quti">
    <div class="iq-top"><span>${gs.map(g => esc(g.nomi)).join(", ") || `${katta(T.guruh)}siz`}</span>
      <b class="${h.qarz ? "qizil" : "yashil"}">${h.qarz ? `Qarz: ${pulS(h.qarz)}` : h.ortiqcha ? `Oldindan: ${pulS(h.ortiqcha)}` : "Qarzi yo‘q"}</b></div>
    <div class="chiplar orala">
      ${h.qarz ? `<button type="button" class="chip" data-act="t-summa-qoy" data-v="${h.qarz}">Qarzni yopish · ${pul(h.qarz)}</button>` : ""}
      ${oylik ? `<button type="button" class="chip" data-act="t-summa-qoy" data-v="${oylik}">1 oylik · ${pul(oylik)}</button>` : ""}
      ${h.qarz && oylik && h.qarz < oylik * 2 ? "" : ""}
    </div>
    ${h.ochiq.length ? `<span class="muted sm">To‘lanmagan: ${h.ochiq.slice(0, 4).map(x => `${esc(x.tavsif)} (${pul(x.qarz)})`).join(", ")}${h.ochiq.length > 4 ? "…" : ""}</span>` : ""}
  </div>`;
}
function tolovTanla(oid) {
  const f = UI.tf; f.oid = oid; f.guruhId = ""; f.qaytarish = false;
  const o = oquvchi(oid); if (!o) return;
  const h = hisobHolati(o);
  const oylik = sum(faolAzoliklar(o).map(a => ({ a, g: guruh(a.guruhId) })).filter(x => x.g && x.g.narxTuri !== "dars"), x => yaxlit(x.g.narx * (1 - (+x.a.chegirma || 0) / 100)));
  f.summa = h.qarz || oylik || 0;
}
function tolovTarixi() {
  const l = TL().filter(t => !UI.tolovOy || (t.sana || "").startsWith(UI.tolovOy))
    .sort((a, b) => (b.sana || "").localeCompare(a.sana || "") || (b.yaratildi || 0) - (a.yaratildi || 0));
  if (!l.length) return `<p class="bosh-matn">${UI.tolovOy ? "Bu oyda hali to‘lov yo‘q." : "Hali to‘lov kiritilmagan."}</p>`;
  const usullar = SOZLAMALAR.tolovUsullari.map(u => [u, sum(l.filter(t => t.usul === u), tolovSumma)]).filter(x => x[1]);
  return `<div class="iq-top" style="margin-bottom:6px"><span class="muted">${l.length} ta to‘lov · ${usullar.map(([u, s]) => `${esc(u)}: ${pul(s)}`).join(" · ")}</span><b class="summa">${pulS(sum(l, tolovSumma))}</b></div>
    <div class="royxat">${l.slice(0, 200).map(t => {
      const o = oquvchi(t.oquvchiId), x = xodim(t.xodimId);
      return `<div class="qator"><button class="qator-btn" data-act="chek" data-id="${t.id}"><span class="avatar">${esc(boshHarf(o ? o.ism : "?"))}</span>
        <span class="q-mat"><span class="q-nom">${esc(o ? o.ism : "O‘chirilgan")}</span>
          <span class="q-sub">${sanaMatn(t.sana)}${t.guruhId && guruh(t.guruhId) ? ` · ${esc(guruh(t.guruhId).nomi)}` : ""}${x ? ` · ${esc(x.ism.split(" ")[0])}` : ""}${t.izoh ? ` · ${esc(t.izoh)}` : ""}</span></span>
        <span class="q-ong"><b class="${t.qaytarish ? "qizil" : ""}">${t.qaytarish ? "−" : ""}${pulS(t.summa)}</b><span class="pill ${t.qaytarish ? "bad" : ""}">${t.qaytarish ? "Qaytarildi" : esc(t.usul)}</span></span></button>
        ${direktorMi() ? `<button class="icon-btn tekis" data-act="t-ochir" data-id="${t.id}" aria-label="To‘lovni o‘chirish">${icon("trash", 18)}</button>` : ""}</div>`;
    }).join("")}</div>`;
}
function chekOch(tid) {
  const t = TL().find(x => x.id === tid); if (!t) return;
  const o = oquvchi(t.oquvchiId), x = xodim(t.xodimId), h = o ? hisobHolati(o) : null;
  const tartib = TL().slice().sort((a, b) => (a.yaratildi || 0) - (b.yaratildi || 0)).findIndex(z => z.id === t.id) + 1;
  const matn = shablonTold("tolov", { ism: o ? o.ism : "", summa: pul(t.summa, " "), sana: sanaMatn(t.sana), usul: t.usul, balans: h ? (h.qarz ? "−" + pul(h.qarz, " ") : pul(h.ortiqcha, " ")) : "0", markaz: markazNomi() });
  Modal.och(`<h2 class="sheet-h">To‘lov cheki</h2>
    <div class="chek">
      <div class="ch-sar">${esc(markazNomi())}</div><div class="muted sm" style="text-align:center">${esc(markazTel())}</div>
      <div class="ch-jami">${t.qaytarish ? "Qaytarildi: " : ""}${pulS(t.summa)}</div>
      <div class="ch-q"><span>Chek №</span><b>${String(tartib).padStart(5, "0")}</b></div>
      <div class="ch-q"><span>${katta(T.oquvchi)}</span><b>${esc(o ? o.ism : "—")}</b></div>
      ${t.guruhId && guruh(t.guruhId) ? `<div class="ch-q"><span>${katta(T.guruh)}</span><b>${esc(guruh(t.guruhId).nomi)}</b></div>` : ""}
      <div class="ch-q"><span>Sana</span><b>${sanaMatn(t.sana)}</b></div>
      <div class="ch-q"><span>Usul</span><b>${esc(t.usul)}</b></div>
      ${x ? `<div class="ch-q"><span>Qabul qildi</span><b>${esc(x.ism)}</b></div>` : ""}
      ${h ? `<div class="ch-q"><span>Joriy balans</span><b class="${h.qarz ? "qizil" : "yashil"}">${h.qarz ? "Qarz " + pulS(h.qarz) : pulS(h.ortiqcha)}</b></div>` : ""}
    </div>
    <label class="vh" for="chek-matn">Xabar matni</label>
    <textarea id="chek-matn" rows="3" style="margin-top:12px" data-xabar="chek">${esc(matn)}</textarea>
    <div class="sheet-actions">
      <button class="btn btn-ghost" data-act="nusxa" data-target="chek-matn">${icon("copy", 18)} Nusxalash</button>
      <a class="btn btn-soft" id="tg-chek" href="${esc(tgHavola(matn))}" target="_blank" rel="noopener">${icon("send", 18)} Telegram</a>
      <button class="btn btn-primary" data-act="modal-yop">Yopish</button>
    </div>`);
}

/* ---------- 8.8 Qarzdorlar ---------- */
function renderQarzdorlar() {
  const hammasi = qarzdorlar();
  if (!hammasi.length) return boshHolat({ ic: "check2", sarlavha: "Qarzdorlar yo‘q", matn: OQ().length ? "Barcha to‘lovlar o‘z vaqtida. Zo‘r natija!" : `${katta(T.oquvchilar)} qo‘shilgach, to‘lamaganlar shu yerda chiqadi.` });
  const gs = GR().filter(g => hammasi.some(x => (x.o.azolik || []).some(a => a.guruhId === g.id))).sort(ismBoyicha);
  if (UI.qarzGuruh && !gs.some(g => g.id === UI.qarzGuruh)) UI.qarzGuruh = "";
  const l = qarzdorlar(UI.qarzGuruh);
  const kechikkan = l.filter(x => x.h.kechikish > 0);
  return `<div class="chiplar" role="group" aria-label="${katta(T.guruh)} bo‘yicha">
      <button class="chip" data-act="qarz-guruh" data-id="" aria-pressed="${!UI.qarzGuruh}">Hammasi <span class="son">${hammasi.length}</span></button>
      ${gs.map(g => `<button class="chip" data-act="qarz-guruh" data-id="${g.id}" aria-pressed="${UI.qarzGuruh === g.id}">${esc(g.nomi)} <span class="son">${qarzdorlar(g.id).length}</span></button>`).join("")}
    </div>
    <section class="card jami-qator">
      <div><div class="muted sm">Jami qarz</div><div class="katta">${pulS(sum(l, x => x.h.qarz))}</div></div>
      <div><div class="muted sm">Qarzdorlar</div><div style="font-size:22px;font-weight:700">${l.length} ta</div></div>
      <div><div class="muted sm">Muddati o‘tgan</div><div style="font-size:22px;font-weight:700" class="warn-matn">${kechikkan.length} ta</div></div>
      <button class="btn btn-ghost btn-sm" data-act="csv" data-tur="qarzdorlar">${icon("file", 18)} Excel</button>
    </section>
    <div class="kartalar">${l.map(x => `<article class="card qarz-k">
      <div class="qk-top"><span class="avatar">${esc(boshHarf(x.o.ism))}</span>
        <div class="q-mat"><button class="lk-nom q-nom" style="background:none;border:0;padding:0;font:inherit;font-weight:600;color:inherit;cursor:pointer;text-align:left" data-act="profil" data-id="${x.o.id}">${esc(x.o.ism)}</button>
        <div class="q-sub">${oquvchiGuruhlari(x.o).map(g => esc(g.nomi)).join(", ") || "Ketgan"}${x.o.otaTel ? ` · ${esc(x.o.otaTel)}` : ""}</div></div>
        <div class="qk-summa">${pulS(x.h.qarz)}</div></div>
      <div class="qk-meta"><span class="pill">${davrMatni(x.h)}</span>${kechikishPill(x.h)}</div>
      <div class="qk-amal">
        <button class="btn btn-soft btn-sm" data-act="tolovga" data-id="${x.o.id}">${icon("wallet", 18)} To‘lov</button>
        <button class="btn btn-ghost btn-sm" data-act="eslatma" data-id="${x.o.id}">${icon("message", 18)} Eslatma</button>
      </div></article>`).join("")}</div>`;
}

/* ---------- 8.9 Xabarlar ---------- */
const QOLIPLAR = {
  qarz: ["ism", "summa", "davr", "guruh", "markaz"],
  kelmadi: ["ism", "sana", "guruh", "oqituvchi", "markaz"],
  tolov: ["ism", "summa", "sana", "usul", "balans", "markaz"],
  lid: ["ism", "kurs", "markaz"],
};
function xabarKarta(id, ism, tel, matn, izoh) {
  return `<article class="card xabar-k">
    <div class="qk-top"><span class="avatar">${esc(boshHarf(ism))}</span><div class="q-mat"><div class="q-nom">${esc(ism)}</div><div class="q-sub">${izoh}</div></div></div>
    <div class="tel">Telefon: <b>${esc(tel || "kiritilmagan")}</b></div>
    <label class="vh" for="xm-${id}">Xabar matni</label>
    <textarea id="xm-${id}" data-xabar="${id}" rows="4">${esc(matn)}</textarea>
    <div class="xk-amal">
      <button class="btn btn-ghost" data-act="nusxa" data-target="xm-${id}">${icon("copy", 18)} Nusxalash</button>
      <a class="btn btn-primary" id="tg-${id}" href="${esc(tgHavola(matn))}" target="_blank" rel="noopener">${icon("send", 18)} Telegram</a>
    </div></article>`;
}
function renderXabarlar() {
  const turlar = [["qarz", "Qarzdorlar"], ["kelmadi", "Kelmaganlar"], ["lid", "Lidlar"], ["shablon", "Shablonlar"]];
  let html = segTugmalar("x-tur", turlar, UI.xabarTur);
  const markaz = markazNomi(), b = bugun();
  if (UI.xabarTur === "qarz") {
    let l = qarzdorlar();
    const fokus = UI.xabarFokus && oquvchi(UI.xabarFokus);
    if (fokus) { l = l.filter(x => x.o.id === UI.xabarFokus); html += `<div class="fokus"><span>Faqat: ${esc(fokus.ism)}</span><button class="btn btn-sm btn-ghost" data-act="x-fokus-yop">Hammasini ko‘rsatish</button></div>`; }
    if (!l.length) return html + boshHolat({ ic: "check2", sarlavha: "Qarzdorlar yo‘q", matn: "Eslatma yuboradigan hech kim yo‘q." });
    return html + `<div class="kartalar">${l.map(x => xabarKarta(`q-${x.o.id}`, x.o.ism, x.o.otaTel || x.o.tel,
      shablonTold("qarz", { ism: x.o.ism, summa: pul(x.h.qarz, " "), davr: davrMatni(x.h), guruh: oquvchiGuruhlari(x.o).map(g => g.nomi).join(", "), markaz }),
      `Qarz <b class="qizil">${pulS(x.h.qarz)}</b> · ${davrMatni(x.h)}`)).join("")}</div>`;
  }
  if (UI.xabarTur === "kelmadi") {
    const s = UI.xabarSana, yoz = [];
    for (const [k, v] of Object.entries(DB.davomat)) {
      const [gid, sana] = k.split("|"); if (sana !== s) continue;
      for (const [oid, h] of Object.entries(v)) if (h === "kelmadi") { const o = oquvchi(oid), g = guruh(gid); if (o && g) yoz.push({ o, g }); }
    }
    html += `<div class="sana-qator"><button class="icon-btn" data-act="x-kun" data-n="-1" aria-label="Oldingi kun">${icon("chevL")}</button>
      <label class="vh" for="x-sana">Sana</label><input id="x-sana" type="date" value="${s}">
      <button class="icon-btn" data-act="x-kun" data-n="1" aria-label="Keyingi kun">${icon("chevR")}</button></div>`;
    if (!yoz.length) {
      const oxirgi = Object.entries(DB.davomat).filter(([, v]) => Object.values(v).includes("kelmadi")).map(([k]) => k.split("|")[1]).filter(x => x <= b).sort().pop();
      return html + boshHolat({ ic: "users", sarlavha: `${sanaMatn(s)} kuni kelmaganlar yo‘q`, matn: "Davomatda «Kelmadi» belgilanganlar shu yerda chiqadi.", tugma: oxirgi && oxirgi !== s ? `<button class="btn btn-soft" data-act="x-sana-qoy" data-s="${oxirgi}">Oxirgi kelmagan kun: ${sanaMatn(oxirgi)}</button>` : "" });
    }
    return html + `<div class="kartalar">${yoz.map(({ o, g }) => xabarKarta(`k-${o.id}-${g.id}`, o.ism, o.otaTel || o.tel,
      shablonTold("kelmadi", { ism: o.ism, sana: sanaMatn(s), guruh: g.nomi, oqituvchi: oqituvchiNomi(g), markaz }),
      `${esc(g.nomi)} · <span class="qizil">kelmadi</span>`)).join("")}</div>`;
  }
  if (UI.xabarTur === "lid") {
    const l = LD().filter(x => !["yozildi", "rad"].includes(x.holat) && x.keyingiAloqa && x.keyingiAloqa <= b);
    if (!l.length) return html + boshHolat({ ic: "funnel", sarlavha: "Bugun yoziladigan lid yo‘q", matn: "«Keyingi bog‘lanish» sanasi bugun yoki o‘tgan lidlar shu yerda chiqadi." });
    return html + `<div class="kartalar">${l.map(x => xabarKarta(`l-${x.id}`, x.ism, x.tel,
      shablonTold("lid", { ism: x.ism, kurs: x.qiziqish || "kurslarimiz", markaz }), `${esc(x.qiziqish || "")} · ${esc((LID_HOLAT.find(h => h.k === x.holat) || {}).n || "")}`)).join("")}</div>`;
  }
  const nomlar = { qarz: "Qarz eslatmasi", kelmadi: "Kelmaganlik haqida", tolov: "To‘lov cheki", lid: "Lidga taklif" };
  return html + `<div class="ikki-ustun">${Object.keys(QOLIPLAR).map(tur => `<section class="card"><div class="card-h"><h2>${nomlar[tur]}</h2></div>
      <label class="vh" for="sh-${tur}">${nomlar[tur]}</label><textarea id="sh-${tur}" rows="5">${esc(DB.shablonlar[tur])}</textarea>
      <div class="chiplar orala" style="margin-top:10px">${QOLIPLAR[tur].map(k => `<button type="button" class="chip" data-act="shablon-qoy" data-tur="${tur}" data-k="${k}">[${k}]</button>`).join("")}</div></section>`).join("")}</div>
    ${direktorMi() || rol() === "admin" ? `<div class="amal-qator"><button class="btn btn-primary" data-act="shablon-saqla">${icon("check2", 20)} Shablonlarni saqlash</button>
      <button class="btn btn-ghost" data-act="shablon-asl">Asl holiga qaytarish</button></div>` : ""}`;
}
