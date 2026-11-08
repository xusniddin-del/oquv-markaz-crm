# O‘quv Markaz CRM

Kichik va o‘rta o‘quv markazlari uchun boshqaruv tizimi: o‘quvchilar, guruhlar, davomat, to‘lovlar, qarzdorlar, lidlar, kassa, o‘qituvchilar oyligi, dars jadvali va statistika.

**Sayt:** https://xusniddin-del.github.io/oquv-markaz-crm/

## Qanday ishlaydi

- Bitta HTML sahifa, server yo‘q. Ma’lumotlar foydalanuvchining brauzerida saqlanadi (localStorage).
- Markaz ro‘yxatdan o‘tadi va 14 kun bepul foydalanadi. Keyin sotuvchidan faollashtirish kodi oladi.
- Boshqa qurilmaga o‘tish: Sozlamalar → Ma’lumotlar → Zaxira olish / Zaxiradan tiklash.
- Faollashtirish kodi markazning ro‘yxatdagi telefon raqamiga bog‘langan va raqamli imzo (ECDSA P-256) bilan tasdiqlanadi. Dasturda faqat ochiq kalit bor.

## Tuzilishi

| Fayl | Vazifasi |
|---|---|
| `src/*.js`, `src/*.css` | Manba kod (bo‘limlar bo‘yicha) |
| `build.py` | Manbani bitta faylga yig‘adi → `index.html` |
| `index.html` | Saytning o‘zi (GitHub Pages shuni ko‘rsatadi) |
| `namuna/import-shablon.csv` | O‘quvchilarni import qilish uchun namuna |
| `CHANGELOG.md` | Versiyalar tarixi |

## Yangi versiya chiqarish

1. `src/` dagi fayllarni o‘zgartiring.
2. `src/1-asos.js` dagi `versiya` raqamini oshiring va `CHANGELOG.md` ga yozing.
3. `python3 build.py`
4. Commit va push: bir-ikki daqiqada sayt yangilanadi. Mijozlarning ma’lumotlari o‘chmaydi.

Ma’lumotlar sayt manziliga bog‘langan, shuning uchun sayt manzilini o‘zgartirmang.

## Litsenziya generatori

Kod yaratuvchi fayl va maxfiy kalit bu repoda **yo‘q** va bo‘lmasligi kerak. Ular faqat sotuvchida saqlanadi.
