# O‘quv Markaz CRM

Kichik va o‘rta o‘quv markazlari uchun boshqaruv tizimi: o‘quvchilar, guruhlar, davomat, to‘lovlar, qarzdorlar, lidlar, kassa, o‘qituvchilar oyligi, dars jadvali va statistika.

**Sayt:** https://xusniddin-del.github.io/oquv-markaz-crm/

## Qanday ishlaydi

- Bitta HTML sahifa, server yo‘q. Ma’lumotlar foydalanuvchining brauzerida saqlanadi (localStorage).
- Markaz ro‘yxatdan o‘tadi va 14 kun bepul foydalanadi. Keyin sotuvchi obunani admin saytdan uzaytiradi.
- Markazlar ro‘yxati sotuvchining Google jadvalida (Apps Script server). Dastur har ochilganda va har 10 daqiqada markaz holatini so‘raydi: bloklangan yoki muddati tugagan markaz ishlay olmaydi. Internet kerak.
- O‘quvchi, to‘lov va boshqa ma’lumotlar serverga yuborilmaydi, markazning o‘z qurilmasida qoladi. Serverga faqat markaz kartasi va umumiy sonlar (o‘quvchi, guruh, xodim soni) boradi.
- Boshqa qurilmaga o‘tish: Sozlamalar → Ma’lumotlar → Zaxira olish / Zaxiradan tiklash.

**Admin sayt (faqat sotuvchi uchun):** https://xusniddin-del.github.io/oquv-markaz-crm/admin/ — parol bilan kiriladi.

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `src/*.js`, `src/*.css` | Manba kod (bo‘limlar bo‘yicha) |
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
