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

## Keyinchalik
- Jadvalda barcha markazlar ko‘rinadi. Qatorlarni qo‘lda o‘zgartirmang: admin sayt orqali boshqaring.
- `token` ustuni markazning maxfiy kaliti. Uni hech kimga bermang.
- Server kodini yangilash kerak bo‘lsa: kodni almashtirib saqlang → **Deploy → Manage deployments → qalam belgisi → Version: New version → Deploy**. Manzil o‘zgarmaydi.
- Admin parolni almashtirish: 3-qadamni yangi parol bilan qaytaring.
