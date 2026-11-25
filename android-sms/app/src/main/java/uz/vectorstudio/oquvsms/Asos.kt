package uz.vectorstudio.oquvsms

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.net.Uri
import android.os.Build
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Telefon xotirasidagi sozlamalar va holat (yangilanganda saqlanib qoladi). */
object Prefs {
    val LOCK = Any()

    fun p(c: Context): SharedPreferences = c.applicationContext.getSharedPreferences("sms", Context.MODE_PRIVATE)
    fun str(c: Context, k: String, d: String = ""): String = p(c).getString(k, d) ?: d
    fun int(c: Context, k: String, d: Int = 0): Int = p(c).getInt(k, d)
    fun long(c: Context, k: String, d: Long = 0L): Long = p(c).getLong(k, d)
    fun bool(c: Context, k: String, d: Boolean = false): Boolean = p(c).getBoolean(k, d)

    fun put(c: Context, vararg kv: Pair<String, Any?>) {
        val e = p(c).edit()
        for ((k, v) in kv) {
            when (v) {
                null -> e.remove(k)
                is String -> e.putString(k, v)
                is Int -> e.putInt(k, v)
                is Long -> e.putLong(k, v)
                is Boolean -> e.putBoolean(k, v)
                else -> e.putString(k, v.toString())
            }
        }
        e.apply()
    }

    fun token(c: Context): String = str(c, "token")

    fun bugun(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    fun bugunSoni(c: Context): Int = if (str(c, "kun") == bugun()) int(c, "kunSoni") else 0
    fun bugunQosh(c: Context) {
        synchronized(LOCK) { put(c, "kun" to bugun(), "kunSoni" to bugunSoni(c) + 1) }
    }

    /** Oxirgi 50 ta SMS: {id, phone, st, t, e} */
    fun tarix(c: Context): JSONArray = try { JSONArray(str(c, "tarix", "[]")) } catch (e: Exception) { JSONArray() }

    fun tarixYoz(c: Context, id: String, phone: String?, st: String, err: String = "") {
        synchronized(LOCK) {
            val a = tarix(c)
            for (i in 0 until a.length()) {
                val o = a.getJSONObject(i)
                if (o.optString("id") == id) {
                    // «Yetkazildi» dan keyin kech kelgan «Yuborildi» holatni orqaga qaytarmaydi
                    if (!(o.optString("st") == "delivered" && st == "sent")) o.put("st", st)
                    if (err.isNotEmpty()) o.put("e", err)
                    put(c, "tarix" to a.toString())
                    return
                }
            }
            if (phone == null) return
            val n = JSONArray()
            n.put(JSONObject().put("id", id).put("phone", phone).put("st", st).put("t", System.currentTimeMillis()).put("e", err))
            for (i in 0 until minOf(a.length(), 49)) n.put(a.get(i))
            put(c, "tarix" to n.toString())
        }
    }

    /** Serverga yuborilishi kutilayotgan hisobotlar (internet bo‘lmasa shu yerda kutadi) */
    fun hisobotQosh(c: Context, id: String, status: String, error: String) {
        synchronized(LOCK) {
            val a = try { JSONArray(str(c, "hisobot", "[]")) } catch (e: Exception) { JSONArray() }
            a.put(JSONObject().put("id", id).put("status", status).put("error", error).put("t", System.currentTimeMillis()))
            put(c, "hisobot" to a.toString())
        }
    }

    fun hisobotlar(c: Context): JSONArray = synchronized(LOCK) { try { JSONArray(str(c, "hisobot", "[]")) } catch (e: Exception) { JSONArray() } }

    fun hisobotOchir(c: Context, n: Int) {
        synchronized(LOCK) {
            val a = hisobotlar(c)
            val q = JSONArray()
            for (i in n until a.length()) q.put(a.get(i))
            put(c, "hisobot" to q.toString())
        }
    }

    /** Ko‘p qismli SMS: hamma qism natijasi kelguncha kutadi. Qaytaradi: null (kutilmoqda), "sent" yoki "failed" */
    fun kutish(c: Context, id: String, qism: Int) {
        synchronized(LOCK) {
            val m = try { JSONObject(str(c, "qismlar", "{}")) } catch (e: Exception) { JSONObject() }
            m.put(id, JSONObject().put("n", qism).put("ok", 0).put("f", 0).put("e", ""))
            // eski yozuvlar to‘planib qolmasin
            if (m.length() > 40) { val k = m.keys().next(); m.remove(k) }
            put(c, "qismlar" to m.toString())
        }
    }

    fun qism(c: Context, id: String, ok: Boolean, err: String): String? {
        synchronized(LOCK) {
            val m = try { JSONObject(str(c, "qismlar", "{}")) } catch (e: Exception) { JSONObject() }
            val o = m.optJSONObject(id) ?: JSONObject().put("n", 1).put("ok", 0).put("f", 0).put("e", "")
            if (ok) o.put("ok", o.optInt("ok") + 1) else { o.put("f", o.optInt("f") + 1); if (o.optString("e").isEmpty()) o.put("e", err) }
            val tugadi = o.optInt("ok") + o.optInt("f") >= o.optInt("n", 1)
            if (tugadi) m.remove(id) else m.put(id, o)
            put(c, "qismlar" to m.toString())
            if (!tugadi) return null
            return if (o.optInt("f") > 0) "failed" else "sent"
        }
    }

    /** Server telefonni tanimadi (CRM’dan uzilgan yoki boshqa telefon ulangan) */
    fun uzildi(c: Context) {
        put(c, "token" to null, "enabled" to false, "uzildi" to true)
    }
}

/** Ilova tili: o‘zbekcha asosiy, telefon tili ruscha bo‘lsa ham. Ruscha matnlar values-ru da. */
object Til {
    fun joriy(c: Context): String = c.getSharedPreferences("sms", Context.MODE_PRIVATE).getString("til", "uz") ?: "uz"

    fun wrap(base: Context): Context {
        val loc = Locale(joriy(base))
        Locale.setDefault(loc)
        val cfg = Configuration(base.resources.configuration)
        cfg.setLocale(loc)
        return base.createConfigurationContext(cfg)
    }
}

/** Server bilan aloqa (Google Apps Script). Faqat JSON matn, boshqa hech narsa yuborilmaydi. */
object Api {
    fun post(body: JSONObject): JSONObject? {
        var con: HttpURLConnection? = null
        return try {
            con = URL(BuildConfig.SERVER).openConnection() as HttpURLConnection
            con.connectTimeout = 15000
            con.readTimeout = 30000
            con.requestMethod = "POST"
            con.doOutput = true
            con.instanceFollowRedirects = true
            con.setRequestProperty("Content-Type", "text/plain;charset=utf-8")
            con.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            if (con.responseCode !in 200..299) null
            else JSONObject(con.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() })
        } catch (e: Exception) {
            null
        } finally {
            con?.disconnect()
        }
    }

    fun get(url: String): String? {
        var con: HttpURLConnection? = null
        return try {
            con = URL(url).openConnection() as HttpURLConnection
            con.connectTimeout = 15000
            con.readTimeout = 20000
            con.useCaches = false
            if (con.responseCode !in 200..299) null else con.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
        } catch (e: Exception) {
            null
        } finally {
            con?.disconnect()
        }
    }

    fun appVer(): String = BuildConfig.VERSION_NAME + " (" + BuildConfig.VERSION_CODE + ")"
    fun model(): String = (Build.MANUFACTURER + " " + Build.MODEL).trim()
}

/** SIM kartalar. Ro‘yxat faqat 2 SIM'dan tanlash uchun o‘qiladi (READ_PHONE_STATE). */
object Sim {
    fun ruxsat(c: Context): Boolean =
        Build.VERSION.SDK_INT < 23 || c.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED

    fun royxat(c: Context): List<Pair<Int, String>> {
        if (Build.VERSION.SDK_INT < 22 || !ruxsat(c)) return emptyList()
        return try {
            val sm = c.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            (sm.activeSubscriptionInfoList ?: emptyList()).map {
                val nom = (it.carrierName ?: it.displayName ?: "").toString()
                it.subscriptionId to ("SIM " + (it.simSlotIndex + 1) + if (nom.isNotBlank()) " · $nom" else "")
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun nomi(c: Context): String {
        val id = Prefs.int(c, "subId", -1)
        if (id >= 0) royxat(c).firstOrNull { it.first == id }?.let { return it.second }
        val tm = c.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
        val op = try { tm?.simOperatorName } catch (e: Exception) { null }
        return if (op.isNullOrBlank()) Til.wrap(c).getString(R.string.sim_default) else op
    }

    @Suppress("DEPRECATION")
    fun manager(c: Context): SmsManager {
        val id = Prefs.int(c, "subId", -1)
        if (Build.VERSION.SDK_INT >= 31) {
            val m = c.getSystemService(SmsManager::class.java)
            return if (id >= 0) m.createForSubscriptionId(id) else m
        }
        if (Build.VERSION.SDK_INT >= 22 && id >= 0) return SmsManager.getSmsManagerForSubscriptionId(id)
        return SmsManager.getDefault()
    }
}

/** Bildirishnomalar */
object Bildir {
    const val XIZMAT = "xizmat"
    const val OGOH = "ogoh"
    const val ID_XIZMAT = 1
    const val ID_TOXTADI = 2
    const val ID_YANGI = 3
    const val ID_UZILDI = 4

    fun flag(): Int = if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT else PendingIntent.FLAG_UPDATE_CURRENT

    fun kanallar(c: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val t = Til.wrap(c)
        val nm = c.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(XIZMAT, t.getString(R.string.ch_service), NotificationManager.IMPORTANCE_LOW))
        nm.createNotificationChannel(NotificationChannel(OGOH, t.getString(R.string.ch_alerts), NotificationManager.IMPORTANCE_HIGH))
    }

    @Suppress("DEPRECATION")
    fun builder(c: Context, kanal: String): Notification.Builder =
        if (Build.VERSION.SDK_INT >= 26) Notification.Builder(c, kanal) else Notification.Builder(c)

    fun ilovaniOch(c: Context): PendingIntent =
        PendingIntent.getActivity(c, 0, Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK), flag())

    fun ogoh(c: Context, id: Int, sarlavha: String, matn: String, bosilsa: PendingIntent = ilovaniOch(c)) {
        kanallar(c)
        @Suppress("DEPRECATION")
        val n = builder(c, OGOH).setSmallIcon(R.drawable.ic_stat).setContentTitle(sarlavha).setContentText(matn)
            .setStyle(Notification.BigTextStyle().bigText(matn)).setContentIntent(bosilsa).setAutoCancel(true)
            .setPriority(Notification.PRIORITY_HIGH).build()
        try { (c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(id, n) } catch (e: Exception) { }
    }
}

/** Ketma-ket xatolar: 3 ta bo‘lsa yuborish to‘xtaydi */
object Holat {
    fun yuborildi(c: Context, id: String) {
        Prefs.tarixYoz(c, id, null, "sent")
        Prefs.hisobotQosh(c, id, "sent", "")
        Prefs.bugunQosh(c)
        Prefs.put(c, "xatoKetma" to 0)
    }

    fun xato(c: Context, id: String, phone: String?, err: String) {
        Prefs.tarixYoz(c, id, phone, "failed", err)
        Prefs.hisobotQosh(c, id, "failed", err)
        val k = synchronized(Prefs.LOCK) { val n = Prefs.int(c, "xatoKetma") + 1; Prefs.put(c, "xatoKetma" to n); n }
        if (k >= 3 && Prefs.bool(c, "enabled")) {
            Prefs.put(c, "enabled" to false, "toxtadi" to true, "xatoKetma" to 0)
            val t = Til.wrap(c)
            Bildir.ogoh(c, Bildir.ID_TOXTADI, t.getString(R.string.notif_stop_title), t.getString(R.string.notif_stop_text))
            SmsService.toxtat(c)
        }
    }
}

/** SMS yuborish: tanlangan SIM'dan, uzun matn qismlarga bo‘linadi */
object Yubor {
    const val SENT = "uz.vectorstudio.oquvsms.SENT"
    const val DELIVERED = "uz.vectorstudio.oquvsms.DELIVERED"

    /** Xato bo‘lsa — xato matni, aks holda null (natija SmsResultReceiver'ga keladi) */
    fun yubor(c: Context, id: String, phone: String, text: String): String? {
        return try {
            val m = Sim.manager(c)
            val parts = m.divideMessage(text)
            val n = parts.size
            if (n == 0) return "Matn bo‘sh"
            Prefs.kutish(c, id, n)
            val sent = ArrayList<PendingIntent>()
            val del = ArrayList<PendingIntent>()
            for (i in 0 until n) {
                // data — har bir SMS qismi uchun alohida PendingIntent bo‘lishi uchun
                val s = Intent(c, SmsResultReceiver::class.java).setAction(SENT).setData(Uri.parse("sms-natija://$id/$i")).putExtra("id", id)
                val d = Intent(c, SmsResultReceiver::class.java).setAction(DELIVERED).setData(Uri.parse("sms-yetdi://$id/$i")).putExtra("id", id).putExtra("last", i == n - 1)
                sent.add(PendingIntent.getBroadcast(c, 0, s, Bildir.flag()))
                del.add(PendingIntent.getBroadcast(c, 0, d, Bildir.flag()))
            }
            Prefs.tarixYoz(c, id, phone, "sending")
            if (n == 1) m.sendTextMessage(phone, null, parts[0], sent[0], del[0])
            else m.sendMultipartTextMessage(phone, null, parts, sent, del)
            null
        } catch (e: SecurityException) {
            "SMS yuborishga ruxsat berilmagan"
        } catch (e: Exception) {
            "Yuborib bo‘lmadi: " + (e.message ?: e.javaClass.simpleName)
        }
    }

    fun xatoMatn(kod: Int): String = when (kod) {
        SmsManager.RESULT_ERROR_GENERIC_FAILURE -> "Operator rad etdi (balans yoki SIM)"
        SmsManager.RESULT_ERROR_RADIO_OFF -> "Aloqa o‘chiq (parvoz rejimi yoki SIM)"
        SmsManager.RESULT_ERROR_NULL_PDU -> "SMS tuzilmadi"
        SmsManager.RESULT_ERROR_NO_SERVICE -> "Tarmoq yo‘q"
        5 -> "Telefon SMS chegarasi: «Har doim ruxsat berish»ni tanlang"
        else -> "Xato kodi $kod"
    }
}

/** Hisobotlarni serverga yuborish (internet bo‘lmasa keyinroq qayta urinadi) */
object Hisobot {
    private val qulf = Any()

    fun yubor(c: Context) {
        synchronized(qulf) {
            val token = Prefs.token(c)
            if (token.isEmpty()) return
            var a = Prefs.hisobotlar(c)
            while (a.length() > 0) {
                val n = minOf(a.length(), 50)
                val items = JSONArray()
                for (i in 0 until n) items.put(a.get(i))
                val j = Api.post(JSONObject().put("amal", "smsReport").put("dt", token).put("items", items)) ?: return
                if (!j.optBoolean("ok")) {
                    if (j.optString("kod") == "uzilgan") { Prefs.uzildi(c); Prefs.hisobotOchir(c, a.length()) }
                    return
                }
                Prefs.hisobotOchir(c, n)
                a = Prefs.hisobotlar(c)
            }
        }
    }

    fun yuborFonda(c: Context) {
        val app = c.applicationContext
        Thread { try { yubor(app) } catch (e: Exception) { } }.start()
    }
}

/** Ilova ichida yangilanish: repo ildizidagi sms-version.json 6 soatda bir tekshiriladi */
object Yangilanish {
    private const val OLTI_SOAT = 6 * 3600 * 1000L

    fun bor(c: Context): Boolean = Prefs.int(c, "upCode") > BuildConfig.VERSION_CODE

    fun tekshir(c: Context, majburiy: Boolean = false): Boolean {
        if (!majburiy && System.currentTimeMillis() - Prefs.long(c, "upT") < OLTI_SOAT) return bor(c)
        val t = Api.get(BuildConfig.VERSION_URL + "?t=" + System.currentTimeMillis()) ?: return bor(c)
        try {
            val j = JSONObject(t)
            val notes = j.optJSONObject("notes") ?: JSONObject()
            Prefs.put(c, "upT" to System.currentTimeMillis(), "upCode" to j.optInt("code"), "upName" to j.optString("name"),
                "upUz" to notes.optString("uz"), "upRu" to notes.optString("ru"))
        } catch (e: Exception) {
            return bor(c)
        }
        if (bor(c) && Prefs.int(c, "upEslatildi") != Prefs.int(c, "upCode")) {
            Prefs.put(c, "upEslatildi" to Prefs.int(c, "upCode"))
            val w = Til.wrap(c)
            Bildir.ogoh(c, Bildir.ID_YANGI, w.getString(R.string.update_title), w.getString(R.string.update_text, Prefs.str(c, "upName")), yuklashIntent(c))
        }
        return bor(c)
    }

    fun izoh(c: Context): String = Prefs.str(c, if (Til.joriy(c) == "ru") "upRu" else "upUz")

    private fun yuklash(c: Context): Intent =
        Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.DOWNLOAD_URL + "?v=" + Prefs.int(c, "upCode"))).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    fun yuklashIntent(c: Context): PendingIntent = PendingIntent.getActivity(c, 7, yuklash(c), Bildir.flag())

    /** Brauzerda yangi faylni ochadi (yuklab olinadi va o‘rnatiladi) */
    fun och(c: Context) {
        try { c.startActivity(yuklash(c)) } catch (e: Exception) { }
    }
}
