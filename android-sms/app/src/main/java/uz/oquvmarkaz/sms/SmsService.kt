package uz.oquvmarkaz.sms

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.PowerManager
import android.telephony.SmsManager
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicInteger

/**
 * Doimiy xizmat: ish vaqtida har 30 soniyada serverdan navbatni oladi va SIM kartadan yuboradi.
 * Ish vaqtidan tashqarida har 15 daqiqada faqat «tirikman» deydi. Internet bo'lmasa — navbat serverda kutadi.
 */
class SmsService : Service() {
    override fun attachBaseContext(newBase: android.content.Context) { super.attachBaseContext(Lang.wrap(newBase)) }

    companion object {
        const val CH_RUN = "run"; const val CH_ALERT = "alert"
        const val NOTIF_RUN = 1; const val NOTIF_ALERT = 2; const val NOTIF_UPD = 3
        const val ACT_SENT = "uz.oquvmarkaz.sms.SENT"; const val ACT_DELIV = "uz.oquvmarkaz.sms.DELIVERED"
        const val ACT_KICK = "uz.oquvmarkaz.sms.KICK"
        const val APP_VER = Upd.NAME
        @Volatile var running = false
        private val reqCode = AtomicInteger(1000)

        fun start(ctx: Context) {
            val i = Intent(ctx, SmsService::class.java)
            if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i) else ctx.startService(i)
        }
        fun kick(ctx: Context) { val i = Intent(ctx, SmsService::class.java).setAction(ACT_KICK); try { if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i) else ctx.startService(i) } catch (e: Exception) { } }
        fun stop(ctx: Context) { ctx.stopService(Intent(ctx, SmsService::class.java)) }
    }

    private lateinit var prefs: Prefs
    private lateinit var thread: HandlerThread
    private lateinit var h: Handler
    private var wake: PowerManager.WakeLock? = null
    /** id → [jami qismlar, yuborilgan qismlar, xato bormi] */
    private val parts = HashMap<String, IntArray>()

    private val tickR = Runnable { tick() }

    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) {
            val id = i.getStringExtra("id") ?: return
            val phone = i.getStringExtra("ph") ?: ""
            val ok = resultCode == Activity.RESULT_OK
            if (i.action == ACT_SENT) {
                val st = synchronized(parts) { parts[id] } ?: intArrayOf(1, 0, 0)
                st[1]++; if (!ok) st[2] = resultCode
                if (st[1] < st[0]) return
                synchronized(parts) { parts.remove(id) }
                if (st[2] == 0) { prefs.fails = 0; prefs.countSent(); prefs.putLog(id, phone, "", "sent"); report(id, "sent", "") }
                else { prefs.putLog(id, phone, "", "failed"); report(id, "failed", errText(st[2])); onFail() }
            } else if (i.action == ACT_DELIV) {
                prefs.putLog(id, phone, "", "delivered"); report(id, "delivered", "")
            }
            updateNotif()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        prefs = Prefs(this)
        channels()
        val n = runNotif()
        if (Build.VERSION.SDK_INT >= 34) startForeground(NOTIF_RUN, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(NOTIF_RUN, n)
        thread = HandlerThread("oquvmarkaz-sms"); thread.start(); h = Handler(thread.looper)
        val f = IntentFilter().apply { addAction(ACT_SENT); addAction(ACT_DELIV) }
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(receiver, f, Context.RECEIVER_NOT_EXPORTED) else registerReceiver(receiver, f)
        try { wake = (getSystemService(Context.POWER_SERVICE) as PowerManager).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "oquvmarkaz:sms").apply { setReferenceCounted(false) } } catch (e: Exception) { }
        running = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!prefs.paired) { stopSelf(); return START_NOT_STICKY }
        h.removeCallbacks(tickR); h.post(tickR)
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        try { unregisterReceiver(receiver) } catch (e: Exception) { }
        try { h.removeCallbacksAndMessages(null); thread.quitSafely() } catch (e: Exception) { }
        try { wake?.release() } catch (e: Exception) { }
        super.onDestroy()
    }

    private fun tick() {
        if (!prefs.paired) { stopSelf(); return }
        val work = prefs.enabled && !prefs.paused && prefs.inWorkHours()
        var next = if (work) 30_000L else 15 * 60_000L
        try {
            if (work) wake?.acquire(10 * 60_000L)
            val body = JSONObject().put("dt", prefs.token).put("appVer", APP_VER).put("sim", prefs.simName)
            if (!work) body.put("ping", true)
            val j = Api.call("smsPull", body)
            prefs.lastSync = System.currentTimeMillis(); prefs.lastError = ""
            j.optJSONObject("cfg")?.let { c ->
                if (!prefs.localHours) { prefs.from = c.optString("from", prefs.from); prefs.to = c.optString("to", prefs.to) }
                prefs.gap = c.optInt("gap", 25).coerceIn(5, 300)
                prefs.offServer = c.optBoolean("off", false) || !c.optBoolean("biz", true)
            }
            val items = j.optJSONArray("items")
            if (items != null && items.length() > 0 && work) {
                for (k in 0 until items.length()) {
                    if (!prefs.enabled || prefs.paused) break
                    val it = items.getJSONObject(k)
                    send(it.getString("id"), it.getString("phone"), it.getString("text"))
                    updateNotif()
                    Thread.sleep(prefs.gap * 1000L)
                }
                next = 2_000L   // navbatda yana bo'lishi mumkin
            }
        } catch (e: Api.ApiError) {
            prefs.lastError = e.message ?: ""
            if (e.message == "DEVICE") { prefs.clear(); alert(getString(R.string.n_unpaired)); stopSelf(); return }
        } catch (e: Exception) {
            prefs.lastError = getString(R.string.no_internet)
            next = if (work) 60_000L else 15 * 60_000L
        } finally {
            try { wake?.release() } catch (e: Exception) { }
        }
        try { if (Upd.check(prefs) && prefs.updNotified < prefs.newCode) { prefs.updNotified = prefs.newCode; updAlert() } } catch (e: Exception) { }
        updateNotif()
        h.postDelayed(tickR, next)
    }

    @Suppress("DEPRECATION")
    private fun smsManager(): SmsManager {
        val sub = prefs.subId
        return if (sub >= 0 && Build.VERSION.SDK_INT >= 22) {
            if (Build.VERSION.SDK_INT >= 31) getSystemService(SmsManager::class.java).createForSubscriptionId(sub)
            else SmsManager.getSmsManagerForSubscriptionId(sub)
        } else if (Build.VERSION.SDK_INT >= 31) getSystemService(SmsManager::class.java) else SmsManager.getDefault()
    }

    private fun pi(action: String, id: String, phone: String): PendingIntent {
        val i = Intent(action).setPackage(packageName).putExtra("id", id).putExtra("ph", phone)
        val fl = if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0
        return PendingIntent.getBroadcast(this, reqCode.incrementAndGet(), i, fl or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    private fun send(id: String, phone: String, text: String) {
        val to = if (phone.startsWith("+")) phone else "+$phone"
        prefs.putLog(id, phone, text, "sending")
        try {
            val sm = smsManager()
            val list = sm.divideMessage(text)
            synchronized(parts) { parts[id] = intArrayOf(list.size, 0, 0) }
            if (list.size <= 1) sm.sendTextMessage(to, null, text, pi(ACT_SENT, id, phone), pi(ACT_DELIV, id, phone))
            else {
                val sent = ArrayList<PendingIntent>(); val del = ArrayList<PendingIntent>()
                for (k in list.indices) { sent.add(pi(ACT_SENT, id, phone)); del.add(if (k == list.size - 1) pi(ACT_DELIV, id, phone) else pi(ACT_DELIV + ".x", id, phone)) }
                sm.sendMultipartTextMessage(to, null, list, sent, del)
            }
        } catch (e: SecurityException) {
            synchronized(parts) { parts.remove(id) }
            prefs.putLog(id, phone, text, "failed"); report(id, "failed", "SMS ruxsati yo'q")
            prefs.paused = true; alert(getString(R.string.n_no_perm))
        } catch (e: Exception) {
            synchronized(parts) { parts.remove(id) }
            prefs.putLog(id, phone, text, "failed"); report(id, "failed", e.message ?: "Xato"); onFail()
        }
    }

    private fun onFail() {
        val n = prefs.fails + 1; prefs.fails = n
        if (n >= 3) { prefs.paused = true; alert(getString(R.string.n_check_sim)) }
    }

    private fun errText(code: Int): String = when (code) {
        SmsManager.RESULT_ERROR_NO_SERVICE -> "Aloqa yo'q (no service)"
        SmsManager.RESULT_ERROR_RADIO_OFF -> "Telefon samolyot rejimida"
        SmsManager.RESULT_ERROR_NULL_PDU -> "Xato (PDU)"
        else -> "Operator rad etdi ($code) — balansni tekshiring"
    }

    /** holatni serverga — internet bo'lmasa bir necha marta qayta urinadi */
    private fun report(id: String, status: String, err: String, attempt: Int = 0) {
        h.post {
            try { Api.call("smsReport", JSONObject().put("dt", prefs.token).put("id", id).put("status", status).put("error", err)) }
            catch (e: Api.ApiError) { }
            catch (e: Exception) { if (attempt < 20) h.postDelayed({ report(id, status, err, attempt + 1) }, 60_000L) }
        }
    }

    private fun channels() {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(NotificationChannel(CH_RUN, getString(R.string.ch_run), NotificationManager.IMPORTANCE_LOW))
        nm.createNotificationChannel(NotificationChannel(CH_ALERT, getString(R.string.ch_alert), NotificationManager.IMPORTANCE_HIGH))
    }

    private fun openApp(): PendingIntent {
        val i = Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(this, 1, i, if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE else 0)
    }

    @Suppress("DEPRECATION")
    private fun builder(ch: String): Notification.Builder = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, ch) else Notification.Builder(this)

    private fun runNotif(): Notification {
        val sub = when {
            prefs.paused -> getString(R.string.n_paused)
            !prefs.enabled -> getString(R.string.st_off)
            prefs.offServer -> getString(R.string.n_server_off)
            !prefs.inWorkHours() -> getString(R.string.n_sleep, prefs.from, prefs.to)
            else -> getString(R.string.n_today, prefs.todayCount)
        }
        return builder(CH_RUN).setSmallIcon(R.drawable.ic_stat).setContentTitle(getString(R.string.n_running)).setContentText(sub)
            .setOngoing(true).setContentIntent(openApp()).build()
    }

    private fun updateNotif() { try { (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(NOTIF_RUN, runNotif()) } catch (e: Exception) { } }

    private fun updAlert() {
        try {
            val pi = PendingIntent.getActivity(this, 3, Intent(Intent.ACTION_VIEW, android.net.Uri.parse(Upd.URL_APP)), if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE else 0)
            val t = getString(R.string.upd_notif, prefs.newName)
            val n = builder(CH_ALERT).setSmallIcon(R.drawable.ic_stat).setContentTitle(getString(R.string.upd_title)).setContentText(t)
                .setStyle(Notification.BigTextStyle().bigText(t)).setAutoCancel(true).setContentIntent(pi).build()
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(NOTIF_UPD, n)
        } catch (e: Exception) { }
    }

    private fun alert(text: String) {
        try {
            val n = builder(CH_ALERT).setSmallIcon(R.drawable.ic_stat).setContentTitle(getString(R.string.app_name)).setContentText(text)
                .setStyle(Notification.BigTextStyle().bigText(text)).setAutoCancel(true).setContentIntent(openApp()).build()
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).notify(NOTIF_ALERT, n)
        } catch (e: Exception) { }
    }
}
