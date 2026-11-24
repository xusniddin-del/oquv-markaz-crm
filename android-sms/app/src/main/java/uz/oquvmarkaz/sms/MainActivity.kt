package uz.oquvmarkaz.sms

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.text.format.DateUtils
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject

/** 1-ekran: ulash (6 xonali kod). 2-ekran: asosiy — Avto-SMS tugmasi, bugungi son, oxirgi 10 ta SMS. */
class MainActivity : Activity() {
    override fun attachBaseContext(newBase: android.content.Context) { super.attachBaseContext(Lang.wrap(newBase)) }

    private lateinit var prefs: Prefs
    private var shownLang = ""
    private val ui = Handler(Looper.getMainLooper())
    private val refresh = object : Runnable { override fun run() { if (prefs.paired) drawMain(); ui.postDelayed(this, 4000) } }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = Prefs(this)
        setContentView(R.layout.activity_main)
        findViewById<Button>(R.id.btnPair).setOnClickListener { pair() }
        findViewById<Button>(R.id.btnToggle).setOnClickListener {
            prefs.enabled = !prefs.enabled
            if (prefs.enabled) { prefs.paused = false; prefs.fails = 0 }
            SmsService.kick(this); drawMain()
        }
        findViewById<Button>(R.id.btnResume).setOnClickListener { prefs.paused = false; prefs.fails = 0; SmsService.kick(this); drawMain() }
        findViewById<Button>(R.id.btnSettings).setOnClickListener { startActivity(Intent(this, SettingsActivity::class.java)) }
        findViewById<Button>(R.id.btnUpdate).setOnClickListener { Upd.open(this) }
        findViewById<Button>(R.id.btnLangPair).setOnClickListener { prefs.lang = if (prefs.lang == "ru") "uz" else "ru"; recreate() }
        shownLang = prefs.lang
    }

    override fun onResume() {
        super.onResume()
        if (shownLang != prefs.lang) { recreate(); return }
        show()
        drawUpdate()
        Thread { Upd.check(prefs, true); ui.post { drawUpdate() } }.start()
        ui.post(refresh)
    }

    override fun onPause() { super.onPause(); ui.removeCallbacks(refresh) }

    private fun show() {
        val paired = prefs.paired
        findViewById<View>(R.id.viewPair).visibility = if (paired) View.GONE else View.VISIBLE
        findViewById<View>(R.id.viewMain).visibility = if (paired) View.VISIBLE else View.GONE
        if (paired) {
            askPermissions()
            if (!SmsService.running) try { SmsService.start(this) } catch (e: Exception) { }
            drawMain()
            if (!prefs.batteryAsked) { prefs.batteryAsked = true; batteryDialog(this) }
        }
    }

    private fun pair() {
        val code = findViewById<EditText>(R.id.editCode).text.toString().filter { it.isDigit() }
        val err = findViewById<TextView>(R.id.pairErr); err.text = ""
        if (code.length != 6) { err.text = getString(R.string.pair_need6); return }
        val btn = findViewById<Button>(R.id.btnPair); btn.isEnabled = false; btn.text = getString(R.string.wait)
        Thread {
            try {
                val j = Api.call("smsPair", JSONObject().put("code", code).put("model", (Build.MANUFACTURER + " " + Build.MODEL).trim()).put("appVer", SmsService.APP_VER).put("sim", prefs.simName))
                prefs.token = j.getString("dt"); prefs.accName = j.optString("name"); prefs.shop = j.optString("shop")
                j.optJSONObject("cfg")?.let { prefs.from = it.optString("from", "09:00"); prefs.to = it.optString("to", "21:00"); prefs.gap = it.optInt("gap", 25) }
                prefs.enabled = true; prefs.paused = false
                ui.post { btn.isEnabled = true; btn.text = getString(R.string.pair_btn); show() }
            } catch (e: Api.ApiError) {
                ui.post { btn.isEnabled = true; btn.text = getString(R.string.pair_btn); err.text = e.message }
            } catch (e: Exception) {
                ui.post { btn.isEnabled = true; btn.text = getString(R.string.pair_btn); err.text = getString(R.string.no_internet) }
            }
        }.start()
    }

    private fun askPermissions() {
        if (Build.VERSION.SDK_INT < 23) return
        val need = ArrayList<String>()
        if (checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) need.add(Manifest.permission.SEND_SMS)
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) need.add(Manifest.permission.POST_NOTIFICATIONS)
        if (need.isNotEmpty()) requestPermissions(need.toTypedArray(), 7)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (prefs.paired) { SmsService.kick(this); drawMain() }
    }

    private fun smsAllowed() = Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED

    private fun drawMain() {
        findViewById<TextView>(R.id.txtAcc).text = if (prefs.shop.isNotEmpty()) prefs.shop else prefs.accName
        val btn = findViewById<Button>(R.id.btnToggle)
        val on = prefs.enabled
        btn.text = getString(if (on) R.string.st_on else R.string.st_off)
        btn.background = round(if (on) Color.parseColor("#16a34a") else Color.parseColor("#94a3b8"), 28f)
        val st = findViewById<TextView>(R.id.txtStatus)
        val sync = if (prefs.lastSync > 0) DateUtils.getRelativeTimeSpanString(prefs.lastSync, System.currentTimeMillis(), DateUtils.MINUTE_IN_MILLIS).toString() else "—"
        st.text = when {
            !smsAllowed() -> getString(R.string.need_sms_perm)
            prefs.offServer -> getString(R.string.n_server_off)
            !prefs.inWorkHours() && on -> getString(R.string.n_sleep, prefs.from, prefs.to)
            prefs.lastError.isNotEmpty() -> prefs.lastError
            else -> getString(R.string.synced, sync)
        }
        findViewById<View>(R.id.boxPaused).visibility = if (prefs.paused) View.VISIBLE else View.GONE
        findViewById<TextView>(R.id.txtToday).text = prefs.todayCount.toString()
        findViewById<TextView>(R.id.txtSim).text = if (prefs.simName.isNotEmpty()) prefs.simName else getString(R.string.sim_default)
        val list = findViewById<LinearLayout>(R.id.listLog); list.removeAllViews()
        val a = prefs.log()
        if (a.length() == 0) { list.addView(TextView(this).apply { text = getString(R.string.log_empty); setTextColor(Color.parseColor("#64748b")); setPadding(0, dp(8), 0, dp(8)) }) }
        for (i in 0 until a.length()) {
            val o = a.getJSONObject(i)
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; setPadding(0, dp(10), 0, dp(10)) }
            val left = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
            left.addView(TextView(this).apply { text = "+" + o.optString("ph"); textSize = 15f; setTextColor(Color.parseColor("#0f172a")) })
            left.addView(TextView(this).apply { text = o.optString("tx").ifEmpty { "…" }; textSize = 12.5f; setTextColor(Color.parseColor("#64748b")); maxLines = 1 })
            row.addView(left, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
            val s = o.optString("s")
            val (label, col) = when (s) {
                "delivered" -> getString(R.string.s_delivered) to "#16a34a"
                "sent" -> getString(R.string.s_sent) to "#16a34a"
                "failed" -> getString(R.string.s_failed) to "#c2401f"
                else -> getString(R.string.s_sending) to "#9a6b00"
            }
            row.addView(TextView(this).apply { text = label; textSize = 12.5f; setTextColor(Color.parseColor(col)); setPadding(dp(10), dp(4), dp(10), dp(4)); background = round(Color.parseColor("#eef2f9"), 40f) })
            list.addView(row)
        }
    }

    private fun drawUpdate() {
        val box = findViewById<View>(R.id.boxUpdate)
        if (!prefs.hasUpdate) { box.visibility = View.GONE; return }
        box.visibility = View.VISIBLE
        findViewById<TextView>(R.id.txtUpdate).text = getString(R.string.upd_text, prefs.newName) + (if (prefs.newNotes.isNotEmpty()) "\n" + prefs.newNotes else "")
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
    private fun round(c: Int, r: Float) = GradientDrawable().apply { setColor(c); cornerRadius = r * resources.displayMetrics.density }

    companion object {
        /** batareya tejash rejimidan chiqarish: umumiy tugma + Xiaomi/Samsung/Huawei uchun qisqa yo'riqnoma */
        fun batteryDialog(a: Activity) {
            val m = Build.MANUFACTURER.lowercase()
            val tip = when {
                m.contains("xiaomi") || m.contains("redmi") || m.contains("poco") -> a.getString(R.string.bat_xiaomi)
                m.contains("samsung") -> a.getString(R.string.bat_samsung)
                m.contains("huawei") || m.contains("honor") -> a.getString(R.string.bat_huawei)
                else -> a.getString(R.string.bat_other)
            }
            AlertDialog.Builder(a).setTitle(R.string.bat_title).setMessage(a.getString(R.string.bat_text) + "\n\n" + tip)
                .setPositiveButton(R.string.bat_open) { _, _ -> openBattery(a) }
                .setNegativeButton(R.string.later, null).show()
        }

        fun openBattery(a: Activity) {
            try {
                if (Build.VERSION.SDK_INT >= 23) {
                    val pm = a.getSystemService(android.content.Context.POWER_SERVICE) as PowerManager
                    if (!pm.isIgnoringBatteryOptimizations(a.packageName)) {
                        a.startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + a.packageName))); return
                    }
                }
                a.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + a.packageName)))
            } catch (e: Exception) {
                try { a.startActivity(Intent(Settings.ACTION_SETTINGS)) } catch (_: Exception) { }
            }
        }
    }
}
