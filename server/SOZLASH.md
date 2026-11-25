# Markazlar serverini sozlash (Google Sheets)

Bir marta, taxminan 5 daqiqa. Kerak bo‘ladigan narsa: Google hisobi.

## 1. Jadval oching
1. https://sheets.new ni oching. Bo‘sh Google jadval ochiladi.
2. Nomini o‘zgartiring, masalan: **O‘quv Markaz CRM — markazlar**.

## 2. Server kodini qo‘ying
1. Jadval menyusida **Extensions (Kengaytmalar) → Apps Script** ni bosing.
2. Ochilgan oynada `Code.gs` ichidagi hamma narsani o‘chiring.
3. Shu papkadagi `Code.gs` faylining butun matnini nusxalab, o‘sha joyga qo‘ying.
4. Kod ichidan `const PAROL = "BU_YERGA_PAROL_YOZING";` qatorini toping va qo‘shtirnoq ichiga o‘z admin parolingizni yozing (kamida 8 belgi). Bu parol bilan admin saytga kirasiz.
5. **Save** (disket belgisi yoki Ctrl+S).

## 3. Bir marta ishga tushiring
1. Yuqoridagi funksiyalar ro‘yxatidan **sozlash** ni tanlang va **Run** ni bosing.
2. Google ruxsat so‘raydi: **Review permissions → hisobingizni tanlang → Advanced → Go to … (unsafe) → Allow**.
   «Unsafe» degani — bu kodni Google tekshirmagan, chunki uni o‘zingiz yozdingiz. Kod faqat shu jadval bilan ishlaydi.
3. Pastda «Tayyor» yozuvi chiqadi. Jadvalda **Markazlar** varag‘i paydo bo‘ladi.
4. Endi `PAROL` qatoridagi parolni `BU_YERGA_PAROL_YOZING` ga qaytarib, saqlab qo‘yishingiz mumkin. Parol Google’ning yashirin sozlamasida saqlanib qoladi.

## 4. Veb-ilova sifatida joylang
1. O‘ng yuqorida **Deploy → New deployment**.
2. Tishli g‘ildirak belgisi → **Web app**.
3. **Execute as:** Me (o‘zingiz). **Who has access:** Anyone (hamma).
4. **Deploy** → ruxsat so‘rasa, yana Allow.
5. **Web app URL** chiqadi (`https://script.google.com/macros/s/…/exec`). Shu manzilni nusxalab, Claude’ga yuboring.

## 5. Online to‘lov (TezCheck)
1. Apps Script’da `sozlash` funksiyasidagi `const TEZCHECK_KALIT = "";` qatoriga TezCheck kabinetidagi maxfiy API kalitni (`aps_…`) yozing. Kalitni chatga yoki GitHub’ga yozmang.
2. `sozlash` ni **Run** qiling. Google yana ruxsat so‘raydi (tashqi saytga so‘rov va taymer uchun) — Allow. Log’da «To‘lov tizimi ulangan» chiqadi.
3. Kalitni koddan o‘chirib, saqlab qo‘ying — u yashirin sozlamada qoldi.
4. TezCheck kassasida IP cheklovi (allowlist) yoqilgan bo‘lsa, o‘chiring: Google serverlarining IP manzili doimiy emas.
5. **Deploy → Manage deployments → qalam → Version: New version → Deploy.**

Tariflar narxi va chegaralari `Code.gs` dagi `TARIFLAR` ro‘yxatida. O‘zgartirsangiz, yangi versiya qilib Deploy qiling — CRM narxlarni serverdan oladi.

## 6. Bulutda saqlash (1.4.0 dan)
Markaz ma’lumotlari Google Drive'ingizdagi **«O‘quv Markaz CRM — ma’lumotlar»** papkasida saqlanadi (har markazga bitta `M0001.json` fayl). Xodimlar logini **Loginlar** varag‘ida.
1. Yangi `Code.gs` ni qo‘ying va saqlang.
2. **sozlash** ni **Run** qiling — Google Drive uchun yangi ruxsat so‘raydi: **Allow**. Drive'da papka paydo bo‘ladi.
3. **Deploy → Manage deployments → qalam → Version: New version → Deploy.**
4. Shundan keyingina saytni (index.html) yangilang. Mijozlar dasturni keyingi ochishda ma’lumotlari avtomatik serverga yuklanadi.

Papka va fayllarni o‘chirmang, nomini o‘zgartirmang. Papkani hech kimga ulashmang: unda markazlarning o‘quvchi va to‘lov ma’lumotlari bor.

## Keyinchalik
- Jadvalda barcha markazlar ko‘rinadi. Qatorlarni qo‘lda o‘zgartirmang: admin sayt orqali boshqaring.
- `token` ustuni markazning maxfiy kaliti. Uni hech kimga bermang.
- Server kodini yangilash kerak bo‘lsa: kodni almashtirib saqlang → **Deploy → Manage deployments → qalam belgisi → Version: New version → Deploy**. Manzil o‘zgarmaydi.
- Admin parolni almashtirish: 3-qadamni yangi parol bilan qaytaring.

## 7. Avto-SMS (1.5.0 dan)
Markaz o‘z telefonidagi SIM kartadan SMS yuboradi: CRM navbatga qo‘yadi, telefondagi «O‘quv Markaz SMS» ilovasi navbatni olib yuboradi. Pullik SMS-shlyuz kerak emas.
1. Yangi `Code.gs` ni qo‘ying va saqlang.
2. **sozlash** ni **Run** qiling. Jadvalda **SmsDevices**, **SmsQueue**, **SmsSnap** varaqlari paydo bo‘ladi va **smsAvto** taymeri (har soatda) yoqiladi. Yangi ruxsat so‘ramaydi.
3. **Deploy → Manage deployments → qalam → Version: New version → Deploy.**
4. Tekshirish: **Triggers** (soat belgisi) bo‘limida `tolovlarniTekshir` (10 daqiqa) va `smsAvto` (1 soat) turibdi.

Qoidalar (kodda o‘zgartiriladi):
- `SMS_AVTO_SOAT` — avtomatik eslatmalar har kuni shu vaqtdan keyin (standart 10:00, ish vaqti boshlanishi kechroq bo‘lsa — o‘sha vaqtdan).
- `SMS_KUNLAR` — CRM’da tanlash mumkin bo‘lgan kunlar (to‘lov muddati o‘tganiga 1, 3, 7, 14, 30 kun).
- Bir odamga 3 kunda ko‘pi bilan 1 ta SMS. «Avto-SMS yuborilmasin» belgilangan o‘quvchiga avtomatik SMS ketmaydi.
- CRM bir haftadan beri ochilmagan markazga avtomatik SMS yuborilmaydi (qarzlar ro‘yxati eskirgan bo‘ladi).

Admin saytdagi **Avto-SMS** bo‘limida: hamma uchun o‘chirish, standart kunlik limit, SMS oralig‘i (soniya) va qaysi tariflarda ishlashi.
Varaqlarni qo‘lda o‘zgartirmang. `SmsDevices` dagi `token` — telefonning maxfiy kaliti.
