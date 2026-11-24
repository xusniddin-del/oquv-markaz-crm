# O‘quv Markaz CRM

Kichik va o‘rta o‘quv markazlari uchun boshqaruv tizimi: o‘quvchilar, guruhlar, davomat, to‘lovlar, qarzdorlar, lidlar, kassa, o‘qituvchilar oyligi, dars jadvali va statistika.

**Sayt:** https://xusniddin-del.github.io/oquv-markaz-crm/

## Qanday ishlaydi

- Bitta HTML sahifa. Ma’lumotlar brauzerda (localStorage) va serverda — sotuvchining Google Drive'ida, har markazga bitta fayl. Istalgan kompyuter yoki telefondan login va parol bilan kiriladi.
- Bir nechta qurilma bir vaqtda ishlaydi: o‘zgarishlar bir necha soniyada serverga ketadi, boshqa qurilmalar har daqiqada oladi. Internet uzilsa, o‘zgarishlar navbatda kutadi.
- Markaz ro‘yxatdan o‘tadi va 14 kun bepul foydalanadi. Keyin sotuvchi obunani admin saytdan uzaytiradi.
- Markazlar ro‘yxati sotuvchining Google jadvalida (Apps Script server). Dastur har ochilganda va har 10 daqiqada markaz holatini so‘raydi: bloklangan yoki muddati tugagan markaz ishlay olmaydi. Internet kerak.
- Boshqa qurilmaga o‘tish: shu sahifani ochib, login va parol bilan kirish kifoya. «Bu mening qurilmam emas» belgilansa, chiqishda ma’lumot o‘sha brauzerdan o‘chiriladi.
- Zaxira (JSON) ham qoladi. Diqqat: zaxiradan tiklash markazning barcha qurilmalaridagi ma’lumotni almashtiradi.

**Admin sayt (faqat sotuvchi uchun):** https://xusniddin-del.github.io/oquv-markaz-crm/admin/ — parol bilan kiriladi.

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `src/*.js`, `src/*.css` | Manba kod (bo‘limlar bo‘yicha); `src/10-sinx.js` — bulutda saqlash va sinxronlash |
| `build.py` | Manbani bitta faylga yig‘adi → `index.html` |
| `index.html` | Saytning o‘zi (GitHub Pages shuni ko‘rsatadi) |
| `admin/index.html` | Sotuvchining admin sayti: markazlar, bloklash, uzaytirish, xabar |
| `server/Code.gs` | Google Apps Script server kodi |
| `server/SOZLASH.md` | Serverni sozlash qo‘llanmasi |
| `namuna/import-shablon.csv` | O‘quvchilarni import qilish uchun namuna |
| `CHANGELOG.md` | Versiyalar tarixi |

## Yangi versiya chiqarish

1. `src/` dagi fayllarni o‘zgartiring.
2. `src/1-asos.js` dagi `versiya` raqamini oshiring va `CHANGELOG.md` ga yozing.
3. `python3 build.py`
4. Commit va push: bir-ikki daqiqada sayt yangilanadi. Mijozlarning ma’lumotlari o‘chmaydi.

Ma’lumotlar sayt manziliga bog‘langan, shuning uchun sayt manzilini o‘zgartirmang.

## Server manzili

Server manzili ikki joyda yoziladi: `src/1-asos.js` dagi `server:` va `admin/index.html` dagi `const SERVER`.

## Avto-SMS yordamchi ilova (`android-sms/`)

«O‘quv Markaz SMS» — markaz telefoniga o‘rnatiladigan kichik Android ilova: CRM navbatga qo‘ygan SMS'larni markazning o‘z SIM kartasidan yuboradi.
- GitHub Actions yig‘adi (`.github/workflows/sms-apk.yml`), Android SDK kerak emas.
- Imzo kaliti repoda yo‘q: GitHub → Settings → Secrets → Actions'da `SMS_KEYSTORE_B64` va `SMS_KEYSTORE_PASS`.
- Yangi versiya: `Upd.kt` (CODE, NAME), `app/build.gradle.kts` (versionCode, versionName) va `sms-version.json` ni bir xil oshiring.
