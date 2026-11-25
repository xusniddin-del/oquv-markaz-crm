package uz.vectorstudio.oquvsms

import android.app.Notification
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.PowerManager
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * Doimiy xizmat (foreground service):
 *  - ish vaqtida har 30 soniyada navbatni oladi va SMS'larni orasida pauza bilan yuboradi;
 *  - ish vaqtidan tashqari har 15 daqiqada faqat «tirikman» (ping) deydi;
 *  - telefon qayta yoqilganda o‘zi ishga tushadi (BootReceiver).
 */
class SmsService : Service() {
    private lateinit var ish: HandlerThread
    private lateinit var h: Handler
    private var wl: PowerManager.WakeLock? = null
    private var oxirgiPing = 0L
    private var oxirgiYuborish = 0L
    private var keyingi = 30_000L

    override fun attachBaseContext(base: Context) = super.attachBaseContext(Til.wrap(base))
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Bildir.kanallar(this)
        oldingi()
        ish = HandlerThread("avto-sms").apply { start() }
        h = Handler(ish.looper)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        oldingi()
        if (Prefs.token(this).isEmpty() || !Prefs.bool(this, "enabled")) {
            stopSelf()
            return START_NOT_STICKY
        }
        h.removeCallbacks(tick)
        h.post(tick)
        return START_STICKY
    }

    override fun onDestroy() {
        h.removeCallbacksAndMessages(null)
        ish.quitSafely()
        uyqu()
        super.onDestroy()
    }

    private val tick: Runnable = object : Runnable {
        override fun run() {
            keyingi = 30_000L
            try { aylan() } catch (e: Exception) { }
            if (keyingi > 0) h.postDelayed(this, keyingi)
        }
    }

    private fun aylan() {
        val c = this
        val token = Prefs.token(c)
        if (token.isEmpty() || !Prefs.bool(c, "enabled")) { keyingi = -1; stopSelf(); return }
        Hisobot.yubor(c)
        try { Yangilanish.tekshir(c) } catch (e: Exception) { }
        val ichida = ishVaqtida(c)
        if (ichida) uygoq() else uyqu()
        val hozir = System.currentTimeMillis()
        if (!ichida && hozir - oxirgiPing < 15 * 60_000L) { keyingi = tashqaridaKut(c); return }

        val j = Api.post(
            JSONObject().put("amal", "smsPull").put("dt", token).put("ping", !ichida)
                .put("sim", Sim.nomi(c)).put("appVer", Api.appVer()).put("model", Api.model())
        )
        oxirgiPing = hozir
        if (j == null) { keyingi = if (ichida) 30_000L else tashqaridaKut(c); yangila(); return }
        if (!j.optBoolean("ok")) {
            if (j.optString("kod") == "uzilgan") {
                Prefs.uzildi(c)
                val t = Til.wrap(c)
                Bildir.ogoh(c, Bildir.ID_UZILDI, t.getString(R.string.app_name), t.getString(R.string.unpaired_msg))
                keyingi = -1; stopSelf(); return
            }
            keyingi = 60_000L; return
        }
        Prefs.put(c, "nomi" to j.optString("nomi", Prefs.str(c, "nomi")), "from" to j.optString("from", "09:00"), "to" to j.optString("to", "21:00"),
            "limit" to j.optInt("limit", 50), "gap" to j.optInt("gap", 25), "off" to j.optBoolean("off"), "sabab" to j.optString("sabab"),
            "limitTugadi" to j.optBoolean("limitTugadi"))

        val items = j.optJSONArray("items")
        val oraliq = maxOf(5, j.optInt("gap", 25)) * 1000L
        if (items != null) {
            for (i in 0 until items.length()) {
                if (!Prefs.bool(c, "enabled")) break
                val it = items.optJSONObject(i) ?: continue
                val id = it.optString("id")
                val phone = it.optString("phone")
                val text = it.optString("text")
                if (id.isEmpty()) continue
                val kut = oraliq - (System.currentTimeMillis() - oxirgiYuborish)
                if (kut > 0) Thread.sleep(kut)   // SMS orasida pauza (standart 25 soniya)
                if (!Prefs.bool(c, "enabled")) break
                val xato = Yubor.yubor(c, id, phone, text)
                oxirgiYuborish = System.currentTimeMillis()
                if (xato != null) Holat.xato(c, id, phone, xato)
                yangila()
            }
            if (items.length() > 0) Hisobot.yubor(c)
        }
        keyingi = if (ichida) 30_000L else tashqaridaKut(c)
        yangila()
    }

    /** Ish vaqtidan tashqarida: 15 daqiqa yoki ish vaqti boshlanguncha (qaysi biri oldin bo‘lsa) */
    private fun tashqaridaKut(c: Context): Long {
        val p = Prefs.str(c, "from", "09:00").split(":")
        val cal = Calendar.getInstance()
        val hozir = cal.timeInMillis
        cal.set(Calendar.HOUR_OF_DAY, p.getOrNull(0)?.toIntOrNull() ?: 9)
        cal.set(Calendar.MINUTE, p.getOrNull(1)?.toIntOrNull() ?: 0)
        cal.set(Calendar.SECOND, 5)
        if (cal.timeInMillis <= hozir) cal.add(Calendar.DAY_OF_MONTH, 1)
        return minOf(15 * 60_000L, maxOf(30_000L, cal.timeInMillis - hozir))
    }

    private fun oldingi() {
        val n = xabarnoma()
        if (Build.VERSION.SDK_INT >= 34) startForeground(Bildir.ID_XIZMAT, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(Bildir.ID_XIZMAT, n)
    }

    private fun xabarnoma(): Notification {
        val c = this
        val matn = getString(if (ishVaqtida(c)) R.string.notif_running else R.string.notif_outside, Prefs.bugunSoni(c))
        return Bildir.builder(c, Bildir.XIZMAT).setSmallIcon(R.drawable.ic_stat).setContentTitle(getString(R.string.app_name))
            .setContentText(matn).setOngoing(true).setContentIntent(Bildir.ilovaniOch(c)).build()
    }

    private fun yangila() {
        try { (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(Bildir.ID_XIZMAT, xabarnoma()) } catch (e: Exception) { }
    }

    private fun uygoq() {
        if (wl == null) wl = (getSystemService(Context.POWER_SERVICE) as PowerManager).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "oquvsms:ish").apply { setReferenceCounted(false) }
        try { wl?.acquire(10 * 60_000L) } catch (e: Exception) { }
    }

    private fun uyqu() {
        try { if (wl?.isHeld == true) wl?.release() } catch (e: Exception) { }
    }

    companion object {
        fun ishVaqtida(c: Context): Boolean {
            val h = SimpleDateFormat("HH:mm", Locale.US).format(Date())
            return h >= Prefs.str(c, "from", "09:00") && h < Prefs.str(c, "to", "21:00")
        }

        fun ishgaTushir(c: Context) {
            val i = Intent(c, SmsService::class.java)
            try {
                if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i) else c.startService(i)
            } catch (e: Exception) { }
        }

        fun toxtat(c: Context) {
            try { c.stopService(Intent(c, SmsService::class.java)) } catch (e: Exception) { }
        }
    }
}
