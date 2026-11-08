
/* =====================================================================
   11. DEMO MA’LUMOTLAR (bugungi sanaga nisbatan yaratiladi)
   ===================================================================== */
const DEMO_XODIMLAR = [
  { id: "x1", ism: "Akmal Rasulov", rol: "direktor", login: "bilim.akmal", parol: "11111111" },
  { id: "x2", ism: "Dilnoza Karimova", rol: "admin", login: "bilim.dilnoza", parol: "22222222", filialId: "f1" },
  { id: "x5", ism: "Sardor Qosimov", rol: "kassir", login: "bilim.sardor", parol: "55555555" },
  { id: "x3", ism: "Dilshod Karimov", rol: "oqituvchi", login: "bilim.dilshod", parol: "33333333", oqituvchiId: "t1" },
  { id: "x4", ism: "Malika Yusupova", rol: "oqituvchi", login: "bilim.malika", parol: "44444444", oqituvchiId: "t2" },
];
async function demoDB() {
  const db = boshDB(), b = bugun(), h = joriyOy();
  const oy = n => oyQosh(h, n);
  const sana = (ym, kun) => { const s = `${ym}-${pad2(Math.min(kun, +oyOxiri(ym).slice(8)))}`; return s > b ? b : s; };
  const tas = s => { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return ((x >>> 0) % 1000) / 1000; };

  db.sozlamalar = { markazNomi: SOZLAMALAR.markazNomi, markazTel: SOZLAMALAR.markazTel, manzil: "Marg‘ilon sh., Mustaqillik ko‘chasi" };
  db.xodimlar = await Promise.all(DEMO_XODIMLAR.map(async x => ({ id: x.id, ism: x.ism, rol: x.rol, login: x.login, oqituvchiId: x.oqituvchiId || "", filialId: x.filialId || "", pinXesh: await pinXesh(x.parol), faol: true })));
  db.litsenziya = { royxat: b, sinovTugash: sanaQosh(b, SOZLAMALAR.sinovKun), tugash: "", malumot: { rahbar: "Akmal Rasulov", tel: SOZLAMALAR.markazTel, hajm: "50 gacha" } };
  const yil = b.slice(0, 4);
  db.filiallar = [{ id: "f1", nomi: "Markaziy filial", manzil: "Mustaqillik ko‘chasi 12", tel: "+998 90 000 00 01" }, { id: "f2", nomi: "Yangi shahar filiali", manzil: "Navbahor ko‘chasi 5", tel: "+998 90 000 00 02" }];
  db.kurslar = [
    { id: "k1", nomi: "Kompyuter savodxonligi", davomiylik: 6, narx: 350000, tavsif: "Word, Excel, internet, xavfsizlik", holat: "faol" },
    { id: "k2", nomi: "Ingliz tili", davomiylik: 12, narx: 400000, tavsif: "A1 dan B2 gacha", holat: "faol" },
    { id: "k3", nomi: "Matematika (boshlang‘ich)", davomiylik: 9, narx: 40000, tavsif: "1–4 sinflar uchun", holat: "faol" },
    { id: "k4", nomi: "IELTS", davomiylik: 4, narx: 650000, tavsif: "Intensiv tayyorlov", holat: "faol" },
  ];
  db.mavsumlar = [{ id: "m1", nomi: `${yil} Yoz`, boshlanish: `${yil}-06-01`, tugash: `${yil}-08-31` }, { id: "m2", nomi: `${yil} Kuz`, boshlanish: `${yil}-09-01`, tugash: `${yil}-12-31` }];
  db.chegirmalar = [
    { id: "c1", nomi: "Aka-uka chegirmasi", turi: "foiz", qiymat: 10, izoh: "Oiladan ikkinchi farzand uchun", faol: true },
    { id: "c2", nomi: "Oldindan 3 oy", turi: "foiz", qiymat: 15, izoh: "3 oylik to‘lov oldindan qilinsa", faol: true },
    { id: "c3", nomi: "Ijtimoiy yordam", turi: "summa", qiymat: 50000, izoh: "Kam ta’minlangan oilalar", faol: true },
  ];
  db.xonalar = [{ id: "r1", nomi: "1-xona", sigim: 12 }, { id: "r2", nomi: "2-xona", sigim: 10 }, { id: "r3", nomi: "Kompyuter xonasi", sigim: 14 }];
  db.oqituvchilar = [
    { id: "t1", ism: "Dilshod Karimov", tel: "+998 90 111 22 33", fan: "Kompyuter savodxonligi", oylikTuri: "foiz", stavka: 40, foizAsosi: "tushgan", izoh: "", faol: true },
    { id: "t2", ism: "Malika Yusupova", tel: "+998 91 222 33 44", fan: "Ingliz tili", oylikTuri: "fiks", stavka: 2500000, foizAsosi: "tushgan", izoh: "", faol: true },
    { id: "t3", ism: "Bekzod Toshmatov", tel: "+998 93 333 44 55", fan: "Matematika", oylikTuri: "dars", stavka: 70000, foizAsosi: "tushgan", izoh: "", faol: true },
  ];
  db.guruhlar = [
    { id: "g1", nomi: "Kompyuter savodxonligi", fan: "Kompyuter savodxonligi", oqituvchiId: "t1", xonaId: "r3", kunlar: ["Du", "Ch", "Ju"], boshlanish: "14:00", tugash: "15:30", narxTuri: "oylik", narx: 350000, holat: "faol", ochilgan: sana(oy(-4), 1), kursId: "k1", filialId: "f1", mavsumId: "m1", sigim: "", tugashSana: "" },
    { id: "g2", nomi: "Ingliz tili A1 (ertalab)", fan: "Ingliz tili", oqituvchiId: "t2", xonaId: "r1", kunlar: ["Se", "Pa", "Sh"], boshlanish: "09:00", tugash: "10:30", narxTuri: "oylik", narx: 450000, holat: "faol", ochilgan: sana(oy(-4), 1), kursId: "k2", filialId: "f1", mavsumId: "m1", sigim: "", tugashSana: "" },
    { id: "g3", nomi: "Ingliz tili B1", fan: "Ingliz tili", oqituvchiId: "t2", xonaId: "r1", kunlar: ["Se", "Pa", "Sh"], boshlanish: "16:00", tugash: "17:30", narxTuri: "oylik", narx: 500000, holat: "faol", ochilgan: sana(oy(-4), 1), kursId: "k2", filialId: "f1", mavsumId: "m1", sigim: 8, tugashSana: sanaQosh(b, -5) },
    { id: "g4", nomi: "Matematika (1–4 sinf)", fan: "Matematika", oqituvchiId: "t3", xonaId: "r2", kunlar: ["Du", "Ch", "Ju"], boshlanish: "15:00", tugash: "16:00", narxTuri: "dars", narx: 40000, holat: "faol", ochilgan: sana(oy(-3), 1), kursId: "k3", filialId: "f1", mavsumId: "m2", sigim: "", tugashSana: "" },
    { id: "g5", nomi: "IELTS intensiv", fan: "Ingliz tili", oqituvchiId: "t2", xonaId: "r2", kunlar: ["Du", "Se", "Ch", "Pa", "Ju"], boshlanish: "18:00", tugash: "19:30", narxTuri: "oylik", narx: 650000, holat: "faol", ochilgan: sana(oy(-2), 1), kursId: "k4", filialId: "f2", mavsumId: "m2", sigim: 6, tugashSana: "" },
  ];
  const ismlar = ["Azizbek Tursunov", "Madina Rahimova", "Sardor Aliyev", "Shahzoda Ergasheva", "Jasur Xolmatov", "Nilufar Qodirova", "Bobur Nazarov", "Kamola Ismoilova",
    "Jahongir Saidov", "Sevara Mirzayeva", "Otabek Yo‘ldoshev", "Zarina Abdullayeva", "Sanjar Hamidov", "Gulnoza Usmonova", "Doniyor Rustamov", "Feruza Jo‘rayeva",
    "Islom Mahmudov", "Dildora Qosimova", "Shoxrux Ergashev", "Munisa To‘xtayeva", "Asadbek Komilov", "Charos Sobirova", "Abdulloh Nurmatov", "Mohinur Fayzullayeva"];
  const reja = [ // [guruh, necha oy oldin qo‘shilgan, kun, chegirma, ketganmi, ikkinchi guruh]
    ["g1", -3, 2, 0], ["g1", -3, 5, 0], ["g1", -2, 10, 0], ["g1", -1, 3, 10], ["g1", 0, 2, 0], ["g1", -2, 17, 0, true],
    ["g2", -3, 1, 0], ["g2", -3, 4, 0, false, "g5"], ["g2", -2, 6, 0], ["g2", -1, 15, 0], ["g2", 0, 1, 20],
    ["g3", -3, 2, 0], ["g3", -2, 3, 0, false, "g5"], ["g3", -1, 8, 0], ["g3", -3, 9, 0],
    ["g4", -3, 3, 0], ["g4", -2, 1, 0], ["g4", -2, 12, 0], ["g4", -1, 5, 0], ["g4", 0, 1, 0], ["g4", -3, 7, 0],
    ["g5", -2, 2, 0], ["g5", -1, 1, 0], ["g5", -2, 5, 0],
  ];
  const manba = SOZLAMALAR.lidManbalari;
  db.oquvchilar = reja.map(([g, n, kun, cheg, ketgan, g2], i) => {
    const qosh = sana(oy(n), kun), az = [{ guruhId: g, qoshilgan: qosh, chiqqan: ketgan ? sana(oy(-1), 14) : "", chegirma: 0, chegirmaId: cheg === 10 ? "c1" : cheg === 20 ? "c3" : "" }];
    if (g2) az.push({ guruhId: g2, qoshilgan: sana(oy(-2), 3), chiqqan: "", chegirma: 0, chegirmaId: g2 === "g5" && i === 7 ? "c2" : "" });
    const tel = `+998 9${i % 10} ${String(100 + i * 37).slice(-3)} ${pad2(10 + i)} ${pad2(30 + i)}`;
    const yosh = g === "g4" ? 8 : 15 + (i % 8);
    return { id: "o" + (i + 1), ism: ismlar[i], tel, otaTel: `+998 9${(i + 3) % 10} ${String(400 + i * 23).slice(-3)} ${pad2(20 + i)} ${pad2(60 - i)}`,
      tugilgan: i === 4 ? `${+b.slice(0, 4) - 16}${b.slice(4)}` : `${+b.slice(0, 4) - yosh}-${pad2(1 + i % 12)}-${pad2(3 + i)}`,
      manba: manba[i % manba.length], izoh: "", yaratildi: sanaObj(qosh).getTime(), azolik: az };
  });
  // Davomat: so‘nggi 4 oy
  const boshlanish = `${oy(-3)}-01`;
  for (let s = boshlanish; s <= b; s = sanaQosh(s, 1)) {
    const k = KUNLAR[hafta(s)].k;
    for (const g of db.guruhlar) {
      if (!g.kunlar.includes(k) || s < g.ochilgan) continue;
      const belgi = {};
      db.oquvchilar.filter(o => o.azolik.some(a => a.guruhId === g.id && azolikFaol(a, s))).forEach(o => {
        const r = tas(o.id + s + g.id);
        belgi[o.id] = r < 0.72 ? "keldi" : r < 0.82 ? "kechikdi" : r < 0.93 ? "kelmadi" : "sababli";
      });
      if (Object.keys(belgi).length) db.davomat[`${g.id}|${s}`] = belgi;
    }
  }
  // Namunalar: biri 3 darsdan beri kelmayapti, bitta dars bekor qilingan, bitta dars belgilanmagan
  Object.keys(db.davomat).filter(k => k.startsWith("g2|")).sort().slice(-3).forEach(k => { if (db.davomat[k].o9) db.davomat[k].o9 = "kelmadi"; });
  const g1kunlar = Object.keys(db.davomat).filter(k => k.startsWith("g1|")).sort();
  if (g1kunlar.length > 4) { const k = g1kunlar[g1kunlar.length - 4]; delete db.davomat[k]; db.bekorlar[k] = "Bayram kuni"; }
  const g4kunlar = Object.keys(db.davomat).filter(k => k.startsWith("g4|") && k.split("|")[1] < b).sort();
  if (g4kunlar.length) delete db.davomat[g4kunlar[g4kunlar.length - 1]];
  // To‘lovlar: hisoblangan summalar asosida (ba’zilar qarzdor qoladi)
  DB = db; ozgardi();
  const qarzdor = { o3: 1, o5: 2, o9: 1, o14: 1, o19: 1, o23: 2 };   // necha oxirgi oy to‘lanmagan
  db.tolovlar = [];
  db.oquvchilar.forEach((o, i) => {
    const oylar = new Map();
    hisoblar(o).forEach(x => oylar.set(x.oy, (oylar.get(x.oy) || 0) + x.summa));
    const royxat = [...oylar.entries()].sort();
    const qoldir = qarzdor[o.id] || (royxat.length && royxat[royxat.length - 1][0] === h && tas(o.id) < 0.35 ? 1 : 0);
    royxat.slice(0, Math.max(0, royxat.length - qoldir)).forEach(([ym, s], j) => {
      const qisman = o.id === "o11" && ym === oy(-1);
      db.tolovlar.push({ id: `p${i}_${j}`, oquvchiId: o.id, guruhId: "", summa: qisman ? Math.round(s / 2 / 1000) * 1000 : s, sana: sana(ym, 2 + Math.floor(tas(o.id + ym) * 7)),
        usul: SOZLAMALAR.tolovUsullari[Math.floor(tas(ym + o.id) * SOZLAMALAR.tolovUsullari.length)], izoh: "", xodimId: tas(o.id + "x") < 0.6 ? "x2" : "x1", yaratildi: sanaObj(sana(ym, 3)).getTime() + i });
    });
  });
  // Ketgan o‘quvchiga ortiqcha to‘lov qaytarildi
  db.tolovlar.push({ id: "pq0", oquvchiId: "o6", guruhId: "g1", summa: 100000, sana: sana(oy(-1), 6), usul: "Naqd", izoh: "Ortiqcha to‘langan", xodimId: "x2", yaratildi: Date.now() });
  db.tolovlar.push({ id: "pq1", oquvchiId: "o6", guruhId: "g1", summa: 100000, sana: sana(oy(-1), 20), usul: "Naqd", izoh: "Ketgani uchun qaytarildi", xodimId: "x1", yaratildi: Date.now(), qaytarish: true });
  ozgardi();
  // Xarajatlar va oyliklar
  db.xarajatlar = [];
  [-3, -2, -1, 0].forEach(n => {
    const ym = oy(n);
    const x = (kat, summa, kun, izoh, usul = "Naqd", extra = {}) => db.xarajatlar.push({ id: yangiId(), sana: sana(ym, kun), kategoriya: kat, summa, usul, izoh, oqituvchiId: "", oy: "", xodimId: "x1", yaratildi: sanaObj(sana(ym, kun)).getTime(), ...extra });
    x("Ijara", 2000000, 1, `${oyFaqat(ym)} ijarasi`, "Karta");
    if (sana(ym, 10) <= b) x("Kommunal", 380000 + Math.round(tas(ym) * 20) * 10000, 10, "Elektr, gaz, internet");
    if (sana(ym, 4) <= b) x("Reklama", 500000 + Math.round(tas(ym + "r") * 5) * 100000, 4, "Instagram target", "Click");
    if (sana(ym, 15) <= b) x("Kanselyariya", 120000, 15, "Daftar, marker");
    if (n < 0) db.oqituvchilar.forEach(t => {
      const o = oqituvchiOylik(t, ym);
      if (o.hisob) db.xarajatlar.push({ id: yangiId(), sana: sana(ym, 28), kategoriya: "Oylik", summa: o.hisob, usul: "Karta", izoh: `${oyNomi(ym)} oyligi`, oqituvchiId: t.id, oy: ym, xodimId: "x1", yaratildi: Date.now() });
    });
  });
  // Lidlar
  const lid = [
    ["Ulug‘bek Rahmonov", "Ingliz tili", "yangi", 0, 0], ["Nodira Aliyeva", "IELTS intensiv", "yangi", -1, 0], ["Javohir Sattorov", "Kompyuter savodxonligi", "boglanildi", -3, -1],
    ["Malika Ortiqova", "Matematika", "boglanildi", -5, 1], ["Sherzod Qurbonov", "Ingliz tili", "sinov", -6, 1], ["Lola Hakimova", "Kompyuter savodxonligi", "sinov", -4, 0],
    ["Firdavs Normatov", "IELTS intensiv", "yozildi", -20, null], ["Yulduz Ahmedova", "Ingliz tili", "yozildi", -25, null], ["Temur Davronov", "Matematika", "rad", -12, null],
    ["Sabina Rasulova", "Ingliz tili", "boglanildi", -8, -2], ["Akbar Yusupov", "Kompyuter savodxonligi", "yangi", -2, 0], ["Rayhona Karimova", "Matematika", "yozildi", -33, null],
    ["Aziz Ochilov", "IELTS intensiv", "rad", -40, null], ["Dilfuza Nabiyeva", "Ingliz tili", "sinov", -2, 2],
  ];
  db.lidlar = lid.map(([ism, kurs, holat, kun, keyingi], i) => ({
    id: "l" + i, ism, tel: `+998 9${(i * 7) % 10} ${String(200 + i * 41).slice(-3)} ${pad2(40 + i)} ${pad2(11 + i * 3)}`, qiziqish: kurs, manba: manba[(i * 3) % manba.length], holat,
    sinovSana: holat === "sinov" ? sanaQosh(b, keyingi || 1) : "", keyingiAloqa: keyingi === null ? "" : sanaQosh(b, keyingi), izoh: i === 3 ? "Onasi qo‘ng‘iroq qildi, kechki guruh so‘radi" : "",
    yaratildi: sanaObj(sanaQosh(b, kun)).getTime() + i * 1000, oquvchiId: "",
  }));
  // Uy vazifalari
  const vz = [["g1", -9, "Word: rezyume shablonini to‘ldirish"], ["g1", -4, "Excel: oylik xarajat jadvali, SUM formulasi"], ["g1", -1, "Kuchli parol yaratish qoidalari, 5 ta misol"],
    ["g2", -8, "Unit 5: 1–4 mashqlar"], ["g2", -3, "20 ta yangi so‘zni yod olish"], ["g4", -2, "Ko‘paytirish jadvali: 6 va 7"]];
  db.vazifalar = vz.map(([g, d, matn], i) => {
    const s = sanaQosh(b, d), bajardi = {};
    db.oquvchilar.filter(o => o.azolik.some(a => a.guruhId === g && azolikFaol(a, s))).forEach(o => { if (tas(o.id + i) < 0.75) bajardi[o.id] = true; });
    return { id: "v" + i, guruhId: g, sana: s, muddat: sanaQosh(s, 2), matn, xodimId: g === "g1" ? "x3" : "x4", bajardi, yaratildi: sanaObj(s).getTime() };
  });
  // So‘rovlar
  db.sorovlar = [
    { id: "s1", oquvchiId: "o4", ism: "Ergasheva Dilfuza (onasi)", tel: "+998 90 888 99 00", turi: "Savol", matn: "Imtihon qachon bo‘ladi va sertifikat beriladimi?", holat: "yangi", javob: "", xodimId: "", filialId: "f1", yaratildi: Date.now() - 3 * 864e5 },
    { id: "s2", oquvchiId: "o16", ism: "Rustamov aka", tel: "+998 93 707 80 90", turi: "Shikoyat", matn: "Xonada sovuq, isitish ishlamayapti.", holat: "jarayonda", javob: "", xodimId: "x2", filialId: "f1", yaratildi: Date.now() - 864e5 },
    { id: "s3", oquvchiId: "", ism: "Sevara", tel: "+998 97 111 00 22", turi: "Taklif", matn: "Shanba kuni kechki guruh ochsangiz yaxshi bo‘lardi.", holat: "hal", javob: "Rahmat! Dekabrdan shanba 17:00 guruhi ochiladi.", xodimId: "x1", filialId: "", yaratildi: Date.now() - 6 * 864e5 },
  ];
  db.meta = { oxirgiZaxira: b, demo: true };
  return db;
}

/* =====================================================================
   12. ISHGA TUSHIRISH
   ===================================================================== */
(async function boshla() {
  document.documentElement.style.setProperty("--primary", SOZLAMALAR.asosiyRang);
  const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.content = SOZLAMALAR.asosiyRang;
  document.title = SOZLAMALAR.dasturNomi;
  Mavzu.qolla(Mavzu.ol());
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => rejaRender()); } catch (e) {}
  Sessiya.yukla();
  const h = location.hash.slice(1); if (BOLIMLAR[h]) UI.bolim = h;
  Ombor.yukla();
  Ilova.maLumotTayyor();
  Server.boshla();
  // Sotuvchi taqdimoti uchun: fayl manzili oxiriga #demo qo‘shib ochilsa, namunaviy markaz yuklanadi
  if (location.hash === "#demo") { try { history.replaceState(null, "", "#bosh"); } catch (e) {} AMALLAR.demo(); }
})();
