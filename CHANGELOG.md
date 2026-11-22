# Versiyalar tarixi

## 1.4.1 — 2026-11-22

- Eski versiyada ro‘yxatdan o‘tgan va ma’lumoti hali serverga yuklanmagan markazga boshqa qurilmadan kirilsa, «Login yoki parol noto‘g‘ri» o‘rniga nima qilish kerakligi yoziladi.
- Admin: bunday markazga yangi parol yuborilganda ogohlantirish chiqadi.
- Kirish oynasidagi «Bu mening qurilmam emas» belgisi oddiy o‘lchamda.

## 1.4.0 — 2026-11-22

Istalgan qurilmadan kirish.

- Ma’lumotlar serverda ham saqlanadi (sotuvchining Google Drive'i). Boshqa kompyuter yoki telefonda login va parol bilan kirilsa, markazning hamma ma’lumoti yuklanadi.
- Bir nechta qurilma bir vaqtda: har bir yozuv alohida birlashtiriladi, bir yozuvni ikki joyda o‘zgartirilsa — oxirgisi qoladi. Internet yo‘qda o‘zgarishlar navbatda kutadi.
- Mavjud mijozlar: dastur yangi versiyada birinchi ochilganda qurilmadagi ma’lumot avtomatik serverga yuklanadi, hech narsa o‘chmaydi.
- «Bu mening qurilmam emas» belgisi: chiqishda ma’lumot o‘sha brauzerdan o‘chiriladi.
- Boshqa qurilmadan «Parolni unutdim»: rahbar logini bilan so‘rov; sotuvchi yuborgan yangi parol hamma qurilmada ishlaydi.
- Yangi qurilmada birinchi «Kirish» oynasi ochiladi. Sozlamalar → Ma’lumotlarda bulut holati ko‘rinadi.
- Zaxiradan tiklash markazning barcha qurilmalariga tarqaladi.
- Server yangilanishi shart: SOZLASH.md, 6-bo‘lim.

## 1.3.2 — 2026-11-21

Xavfsizlik va ishonchlilik.

- Obuna tekshiruvini aylanib o‘tish yopildi: «bilim.akmal» loginli xodim yoki zaxira faylidagi `demo: true` endi markazni demo qilib qo‘ymaydi.
- Demo rejim 3 kun ishlaydi, keyin ro‘yxatdan o‘tish taklif qilinadi (demo’ni haqiqiy ish uchun bepul ishlatib bo‘lmaydi).
- Brauzer xotirasi to‘lsa, qizil ogohlantirish chiqadi (avval ma’lumot jim-jit yo‘qolardi). Sozlamalar → Ma’lumotlarda band joy ko‘rinadi. Joy yetmasa, eski arxiv nusxasi o‘chiriladi.
- Brauzerdan «doimiy xotira» so‘raladi: ma’lumot o‘z-o‘zidan o‘chirilmaydi.
- Server: jadvalga formula yozib bo‘lmaydi; ro‘yxatdan o‘tishda spam cheklovi (soatiga 30, bir raqamdan kuniga 1); o‘qilmagan yangi parol 24 soatdan keyin eskiradi; to‘lov summasi chekdagi summa bilan ham solishtiriladi; holat so‘rovi kamroq jadval o‘qiydi.
- Admin panel: parol o‘rniga 6 soatlik sessiya kaliti. Begona odam noto‘g‘ri parol terib blok qo‘zg‘atsa ham, ochiq panel ishlayveradi. «Chiqish» sessiyani serverda ham yopadi.
- Admin panel: ishlamay qolgan eski «Rahbar parolini tiklash» bo‘limi olib tashlandi.

## 1.3.0 — 2026-11-10

- «Parolni unutdim» chati: rahbar kirish oynasida tugmani bosadi, sotuvchi bilan chat ochiladi va so‘rov avtomatik yuboriladi.
- Admin panelda bildirishnomalar qo‘ng‘iroqchasi: qaysi markaz yozgani, rahbar, telefon va login. Sotuvchi chatda javob yozadi yoki «Yangi parol yuborish» qiladi — parol markaz qurilmasida avtomatik o‘rnatiladi va chatda bir marta ko‘rinadi.
- (1.2.0 dagi tiklash kodi o‘rniga.)

## 1.1.0 — 2026-11-09

- Tariflar: Start 100 000 so‘m (100 tagacha o‘quvchi), Standart 150 000 so‘m (300 tagacha), Premium 200 000 so‘m (cheksiz, bir nechta filial).
- Online to‘lov TezCheck orqali: Click, Payme, Uzcard/Humo. Markaz Sozlamalar → Obuna yoki muddat tugagan oynadan tarif va muddatni tanlab to‘laydi; to‘lovdan keyin obuna o‘zi uzayadi.
- Tarif chegarasi: limitdan ortiq o‘quvchi va (Premium’dan boshqa tariflarda) ikkinchi filial qo‘shib bo‘lmaydi. Bepul sinovda cheklov yo‘q.
- Admin panel: shu oy va o‘tgan oy tushumi, to‘lovlar ro‘yxati, tarifni o‘zgartirish, naqd/kartaga to‘lovni qo‘lda qabul qilish.

## 1.0.0 — 2026-11-08

Birinchi ommaviy versiya.

- Ro‘yxatdan o‘tish (markaz o‘z login va parolini o‘ylab topadi), 14 kun bepul sinov.
- Kirish: login + parol. Xodimlar: rahbar login, 8 xonali parol va lavozim beradi (direktor, administrator, sotuv menejeri, kassir, o‘qituvchi).
- Bo‘limlar: Bosh sahifa, Statistika, Qabulxona, Davomat, Diqqat, Xabarlar, So‘rovlar, Lidlar, Kurslar, Guruhlar, Dars jadvali, Uy vazifalari, To‘lovlar, Qarzdorlar, Kassa, Chegirmalar, Mavsumlar, O‘qituvchilar, Filiallar, Sozlamalar.
- To‘lov: oylik yoki har dars uchun, chegirmalar, qaytarish, chek.
- O‘quvchilarni CSV/Excel’dan import: guruhlar kun va vaqti bilan avtomatik ochiladi.
- Zaxira olish va tiklash (JSON), CSV eksport.
- Markazlar serveri (Google Sheets) va sotuvchi uchun admin sayt: barcha markazlar, bloklash, obunani uzaytirish, markazga xabar, izoh.
- Dastur har ochilganda va har 10 daqiqada holatni tekshiradi; internet kerak.
- Bir telefon raqamiga qayta bepul sinov berilmaydi.
