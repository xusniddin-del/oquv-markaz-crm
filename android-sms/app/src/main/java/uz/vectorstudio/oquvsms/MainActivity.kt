package uz.vectorstudio.oquvsms

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.InputFilter
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** 3 ta ekran: Ulash · Asosiy · Sozlamalar */
class MainActivity : Activity() {
    private val KOK = Color.parseColor("#2563EB")
    private val KOK_TOQ = Color.parseColor("#1D4ED8")
    private val KOK_OCH = Color.parseColor("#EFF4FF")
    private val QORA = Color.parseColor("#0F172A")
    private val KULRANG = Color.parseColor("#64748B")
    private val CHIZIQ = Color.parseColor("#E2E8F0")
    private val FON = Color.parseColor("#F5F7FB")
    private val YASHIL = Color.parseColor("#16A34A")
    private val QIZIL = Color.parseColor("#DC2626")
    private val SARIQ = Color.parseColor("#B45309")

    private var ekran = "asosiy"
    private var imzo = ""
    private val ui = Handler(Looper.getMainLooper())
    private val yangilaTaymer = object : Runnable {
        override fun run() {
            if (ekran == "asosiy" && Prefs.token(this@MainActivity).isNotEmpty() && holatImzo() != imzo) chiz()
            ui.postDelayed(this, 3000)
        }
    }

    override fun attachBaseContext(base: Context) = super.attachBaseContext(Til.wrap(base))

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        Bildir.kanallar(this)
        ruxsatSora()
        chiz()
        if (!Prefs.bool(this, "yoriqnoma")) { Prefs.put(this, "yoriqnoma" to true); ui.postDelayed({ yoriqnoma() }, 600) }
    }

    override fun onResume() {
        super.onResume()
        ui.removeCallbacks(yangilaTaymer); ui.postDelayed(yangilaTaymer, 3000)
        if (Prefs.token(this).isNotEmpty() && Prefs.bool(this, "enabled")) SmsService.ishgaTushir(this)
        fonda({ Yangilanish.tekshir(this) }) { if (ekran == "asosiy") chiz() }
    }

    override fun onPause() { ui.removeCallbacks(yangilaTaymer); super.onPause() }

    @Deprecated("Activity API")
    override fun onBackPressed() {
        if (ekran == "sozlama") { ekran = "asosiy"; chiz() } else super.onBackPressed()
    }

    // ---------- Ruxsatlar ----------
    private fun smsRuxsat() = Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED

    private fun ruxsatSora() {
        if (Build.VERSION.SDK_INT < 23) return
        val l = mutableListOf<String>()
        if (!smsRuxsat()) l.add(Manifest.permission.SEND_SMS)
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) l.add(Manifest.permission.POST_NOTIFICATIONS)
        if (l.isNotEmpty()) requestPermissions(l.toTypedArray(), 1)
    }

    override fun onRequestPermissionsResult(code: Int, perms: Array<out String>, res: IntArray) {
        super.onRequestPermissionsResult(code, perms, res)
        if (code == 2 && Sim.ruxsat(this)) simTanla() else chiz()
    }

    // ---------- Chizish ----------
    private fun chiz() {
        imzo = holatImzo()
        when {
            Prefs.token(this).isEmpty() -> ulashEkrani()
            ekran == "sozlama" -> sozlamaEkrani()
            else -> asosiyEkran()
        }
    }

    private fun holatImzo(): String = listOf(Prefs.bool(this, "enabled"), Prefs.bugunSoni(this), Prefs.str(this, "tarix"), Prefs.bool(this, "toxtadi"),
        Prefs.bool(this, "off"), Prefs.int(this, "upCode"), Prefs.token(this).isEmpty(), Prefs.bool(this, "limitTugadi")).joinToString("|")

    private fun dp(v: Int): Int = (v * resources.displayMetrics.density + 0.5f).toInt()

    private fun quti(rang: Int, r: Int = 16, chiziq: Int = 0) = GradientDrawable().apply {
        setColor(rang); cornerRadius = dp(r).toFloat(); if (chiziq != 0) setStroke(dp(1), chiziq)
    }

    private fun matn(s: CharSequence, size: Float = 15f, rang: Int = QORA, qalin: Boolean = false) = TextView(this).apply {
        text = s; textSize = size; setTextColor(rang); if (qalin) setTypeface(typeface, Typeface.BOLD)
        setLineSpacing(0f, 1.15f)
    }

    private fun tugma(s: String, fon: Int = KOK, rang: Int = Color.WHITE, bos: () -> Unit) = Button(this).apply {
        text = s; isAllCaps = false; textSize = 16f; setTextColor(rang); background = quti(fon, 12, if (fon == Color.WHITE) CHIZIQ else 0)
        setPadding(dp(16), dp(12), dp(16), dp(12)); minHeight = dp(52); stateListAnimator = null
        setOnClickListener { bos() }
    }

    private fun lp(top: Int = 12, w: Int = ViewGroup.LayoutParams.MATCH_PARENT) =
        LinearLayout.LayoutParams(w, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(top) }

    private fun karta(fon: Int = Color.WHITE, chiziq: Int = CHIZIQ) = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL; background = quti(fon, 16, chiziq); setPadding(dp(16), dp(14), dp(16), dp(14))
    }

    /** Sarlavha (ko‘k) + aylantiriladigan tana */
    private fun sahifa(sarlavha: String, ost: String, ong: View? = null, chap: View? = null): LinearLayout {
        val ildiz = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(FON) }
        val bosh = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; setBackgroundColor(KOK)
            setPadding(dp(18), dp(16), dp(12), dp(16))
        }
        if (chap != null) bosh.addView(chap)
        val m = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        m.addView(matn(sarlavha, 20f, Color.WHITE, true))
        if (ost.isNotEmpty()) m.addView(matn(ost, 13f, Color.parseColor("#DBE6FF")))
        bosh.addView(m, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        if (ong != null) bosh.addView(ong)
        ildiz.addView(bosh)
        val sv = ScrollView(this).apply { isFillViewport = true }
        val tana = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(16), dp(4), dp(16), dp(24)) }
        sv.addView(tana)
        ildiz.addView(sv, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
        setContentView(ildiz)
        return tana
    }

    private fun xavfsizBlok(): View = karta(KOK_OCH, Color.parseColor("#C7D7FE")).apply {
        addView(matn(getString(R.string.safe_title), 16f, KOK_TOQ, true))
        listOf(R.string.safe_1, R.string.safe_2, R.string.safe_3, R.string.safe_4, R.string.safe_5, R.string.safe_6).forEach {
            addView(matn("✓  " + getString(it), 14f, QORA), lp(8))
        }
    }

    // ---------- 1. Ulash ----------
    private fun ulashEkrani() {
        ekran = "asosiy"
        val t = sahifa(getString(R.string.app_name), getString(R.string.pair_title))
        if (Prefs.bool(this, "uzildi")) t.addView(karta(Color.parseColor("#FEF3C7"), Color.parseColor("#FDE68A")).apply { addView(matn(getString(R.string.unpaired_msg), 14f, SARIQ)) }, lp(16))
        t.addView(matn(getString(R.string.pair_desc), 15f, KULRANG), lp(18))
        val kod = EditText(this).apply {
            hint = getString(R.string.pair_hint); inputType = InputType.TYPE_CLASS_NUMBER; filters = arrayOf(InputFilter.LengthFilter(6))
            textSize = 30f; gravity = Gravity.CENTER; letterSpacing = 0.3f; setTextColor(QORA); background = quti(Color.WHITE, 14, CHIZIQ)
            setPadding(dp(12), dp(14), dp(12), dp(14)); setTypeface(Typeface.MONOSPACE, Typeface.BOLD)
        }
        t.addView(kod, lp(16))
        val xato = matn("", 14f, QIZIL).apply { visibility = View.GONE }
        t.addView(xato, lp(8))
        lateinit var btn: Button
        btn = tugma(getString(R.string.pair_btn)) {
            val k = kod.text.toString().trim()
            if (!k.matches(Regex("\\d{6}"))) { xato.text = getString(R.string.err_code); xato.visibility = View.VISIBLE; return@tugma }
            btn.isEnabled = false; btn.text = getString(R.string.pair_wait); xato.visibility = View.GONE
            var j: JSONObject? = null
            fonda({
                j = Api.post(JSONObject().put("amal", "smsPair").put("code", k).put("model", Api.model()).put("sim", Sim.nomi(this)).put("appVer", Api.appVer()))
            }) {
                val r = j
                if (r != null && r.optBoolean("ok") && r.optString("token").isNotEmpty()) {
                    Prefs.put(this, "token" to r.optString("token"), "nomi" to r.optString("nomi"), "enabled" to true, "uzildi" to null, "toxtadi" to false,
                        "xatoKetma" to 0, "from" to r.optString("from", "09:00"), "to" to r.optString("to", "21:00"), "limit" to r.optInt("limit", 50),
                        "gap" to r.optInt("gap", 25), "off" to r.optBoolean("off"), "sabab" to r.optString("sabab"))
                    SmsService.ishgaTushir(this)
                    chiz()
                } else {
                    btn.isEnabled = true; btn.text = getString(R.string.pair_btn)
                    xato.text = r?.optString("xato")?.takeIf { it.isNotEmpty() } ?: getString(R.string.err_net); xato.visibility = View.VISIBLE
                }
            }
        }
        t.addView(btn, lp(12))
        t.addView(xavfsizBlok(), lp(24))
        t.addView(matn(getString(R.string.version, Api.appVer()), 12f, KULRANG).apply { gravity = Gravity.CENTER }, lp(18))
    }

    // ---------- 2. Asosiy ----------
    private fun asosiyEkran() {
        val sozBtn = TextView(this).apply {
            text = "⚙"; textSize = 26f; setTextColor(Color.WHITE); setPadding(dp(12), dp(4), dp(8), dp(4))
            contentDescription = getString(R.string.settings); setOnClickListener { ekran = "sozlama"; chiz() }
        }
        val nomi = Prefs.str(this, "nomi")
        val t = sahifa(getString(R.string.app_name), if (nomi.isNotEmpty()) getString(R.string.center, nomi) else "", sozBtn)
        val yoniq = Prefs.bool(this, "enabled")

        if (!smsRuxsat()) t.addView(karta(Color.parseColor("#FEF2F2"), Color.parseColor("#FECACA")).apply {
            addView(matn(getString(R.string.perm_sms), 15f, QIZIL, true))
            addView(tugma(getString(R.string.perm_btn), QIZIL) { ruxsatSora() }, lp(10))
        }, lp(16))
        if (Prefs.bool(this, "toxtadi") && !yoniq) t.addView(karta(Color.parseColor("#FEF2F2"), Color.parseColor("#FECACA")).apply {
            addView(matn(getString(R.string.stopped_errors), 14f, QIZIL))
        }, lp(16))
        if (Yangilanish.bor(this)) t.addView(karta(Color.parseColor("#ECFDF5"), Color.parseColor("#A7F3D0")).apply {
            addView(matn(getString(R.string.update_title), 16f, YASHIL, true))
            addView(matn(getString(R.string.update_text, Prefs.str(this@MainActivity, "upName")), 14f, QORA), lp(4))
            val iz = Yangilanish.izoh(this@MainActivity)
            if (iz.isNotEmpty()) addView(matn(iz, 13f, KULRANG), lp(4))
            addView(tugma(getString(R.string.update_btn), YASHIL) { Yangilanish.och(this@MainActivity) }, lp(10))
        }, lp(16))

        // Katta YONIQ / O‘CHIQ tugmasi
        val doira = TextView(this).apply {
            text = getString(if (yoniq) R.string.on else R.string.off); textSize = 30f; setTextColor(Color.WHITE); setTypeface(typeface, Typeface.BOLD)
            gravity = Gravity.CENTER
            background = GradientDrawable().apply { shape = GradientDrawable.OVAL; setColor(if (yoniq) YASHIL else Color.parseColor("#94A3B8")); setStroke(dp(8), if (yoniq) Color.parseColor("#BBF7D0") else Color.parseColor("#E2E8F0")) }
            setOnClickListener { almashtir() }
            contentDescription = getString(R.string.tap_toggle)
        }
        val dq = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL }
        dq.addView(doira, LinearLayout.LayoutParams(dp(190), dp(190)))
        dq.addView(matn(getString(R.string.tap_toggle), 13f, KULRANG).apply { gravity = Gravity.CENTER }, lp(10, ViewGroup.LayoutParams.WRAP_CONTENT))
        t.addView(dq, lp(22))

        // Holat qatori
        val from = Prefs.str(this, "from", "09:00"); val to = Prefs.str(this, "to", "21:00")
        val holat = when {
            Prefs.bool(this, "off") && Prefs.str(this, "sabab").isNotEmpty() -> getString(R.string.server_off, Prefs.str(this, "sabab")) to QIZIL
            Prefs.bool(this, "limitTugadi") -> getString(R.string.limit_reached, Prefs.int(this, "limit", 50)) to SARIQ
            !SmsService.ishVaqtida(this) -> getString(R.string.outside_hours) to SARIQ
            else -> getString(R.string.work_hours, from, to) to KULRANG
        }
        t.addView(matn(holat.first, 14f, holat.second).apply { gravity = Gravity.CENTER }, lp(14))

        // Statistika
        val qator = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        fun stat(yorliq: String, qiymat: String, katta: Boolean) = karta().apply {
            addView(matn(yorliq, 13f, KULRANG)); addView(matn(qiymat, if (katta) 26f else 15f, QORA, true), lp(4))
        }
        qator.addView(stat(getString(R.string.today_sent), Prefs.bugunSoni(this).toString(), true), LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f).apply { rightMargin = dp(6) })
        qator.addView(stat(getString(R.string.sim), Sim.nomi(this), false), LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f).apply { leftMargin = dp(6) })
        t.addView(qator, lp(16))

        // Oxirgi 10 ta SMS
        t.addView(matn(getString(R.string.last_sms), 16f, QORA, true), lp(20))
        val r = karta().apply { setPadding(dp(14), dp(4), dp(14), dp(4)) }
        val tx = Prefs.tarix(this)
        if (tx.length() == 0) r.addView(matn(getString(R.string.no_sms), 14f, KULRANG).apply { setPadding(0, dp(12), 0, dp(12)) })
        val vf = SimpleDateFormat("HH:mm", Locale.US); val kf = SimpleDateFormat("dd.MM HH:mm", Locale.US)
        for (i in 0 until minOf(10, tx.length())) {
            val o = tx.getJSONObject(i)
            val st = o.optString("st")
            val (nom, rang) = when (st) {
                "delivered" -> getString(R.string.st_delivered) to YASHIL
                "sent" -> getString(R.string.st_sent) to KOK
                "failed" -> getString(R.string.st_failed) to QIZIL
                else -> getString(R.string.st_sending) to SARIQ
            }
            val q = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; setPadding(0, dp(10), 0, dp(10)) }
            val chap = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
            chap.addView(matn(o.optString("phone"), 15f, QORA, true))
            val vaqt = Date(o.optLong("t"))
            val ost = (if (Prefs.bugun() == SimpleDateFormat("yyyy-MM-dd", Locale.US).format(vaqt)) vf else kf).format(vaqt) + (o.optString("e").takeIf { it.isNotEmpty() && st == "failed" }?.let { " · $it" } ?: "")
            chap.addView(matn(ost, 12f, KULRANG))
            q.addView(chap, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            q.addView(matn(nom, 12f, rang, true).apply { background = quti(Color.argb(28, Color.red(rang), Color.green(rang), Color.blue(rang)), 20); setPadding(dp(10), dp(4), dp(10), dp(4)) })
            if (i > 0) r.addView(View(this).apply { setBackgroundColor(CHIZIQ) }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(1)))
            r.addView(q)
        }
        t.addView(r, lp(8))
    }

    private fun almashtir() {
        if (!smsRuxsat()) { ruxsatSora(); return }
        val yangi = !Prefs.bool(this, "enabled")
        Prefs.put(this, "enabled" to yangi, "toxtadi" to false, "xatoKetma" to 0)
        if (yangi) SmsService.ishgaTushir(this) else SmsService.toxtat(this)
        chiz()
    }

    // ---------- 3. Sozlamalar ----------
    private fun sozlamaEkrani() {
        val orqa = TextView(this).apply {
            text = getString(R.string.back); textSize = 16f; setTextColor(Color.WHITE); setPadding(0, dp(4), dp(14), dp(4))
            setOnClickListener { ekran = "asosiy"; chiz() }
        }
        val t = sahifa(getString(R.string.settings), Prefs.str(this, "nomi"), null, orqa)
        fun bolim(sarlavha: String, vararg v: View) {
            t.addView(matn(sarlavha, 14f, KULRANG, true), lp(18))
            val k = karta(); v.forEachIndexed { i, x -> k.addView(x, lp(if (i == 0) 0 else 10)) }; t.addView(k, lp(6))
        }
        // Til
        val tillar = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        listOf("uz" to R.string.lang_uz, "ru" to R.string.lang_ru).forEachIndexed { i, (k, nom) ->
            val tanl = Til.joriy(this) == k
            tillar.addView(tugma(getString(nom), if (tanl) KOK else Color.WHITE, if (tanl) Color.WHITE else QORA) {
                if (!tanl) { Prefs.put(this, "til" to k); Bildir.kanallar(this); recreate() }
            }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { if (i == 0) rightMargin = dp(6) else leftMargin = dp(6) })
        }
        bolim(getString(R.string.lang), tillar)
        // SIM
        bolim(getString(R.string.sim), matn(Sim.nomi(this), 16f, QORA, true), tugma(getString(R.string.sim_choose), Color.WHITE, KOK) { simTanla() })
        // Ish vaqti (CRM’da o‘zgartiriladi)
        bolim(getString(R.string.hours_title), matn(Prefs.str(this, "from", "09:00") + " – " + Prefs.str(this, "to", "21:00"), 18f, QORA, true),
            matn(getString(R.string.hours_note), 13f, KULRANG))
        // Batareya
        bolim(getString(R.string.battery), tugma(getString(R.string.battery_btn), Color.WHITE, KOK) { yoriqnoma() })
        // Versiya va yangilanish
        bolim(getString(R.string.version, Api.appVer()), tugma(getString(R.string.check_update), Color.WHITE, KOK) {
            var bor = false
            fonda({ bor = Yangilanish.tekshir(this, true) }) {
                if (bor) { ekran = "asosiy"; chiz() } else Toast.makeText(this, getString(R.string.up_to_date), Toast.LENGTH_SHORT).show()
            }
        })
        // Telefonni uzish
        t.addView(tugma(getString(R.string.unpair), Color.WHITE, QIZIL) {
            AlertDialog.Builder(this).setTitle(getString(R.string.unpair)).setMessage(getString(R.string.unpair_confirm))
                .setNegativeButton(getString(R.string.cancel), null)
                .setPositiveButton(getString(R.string.yes)) { _, _ ->
                    val token = Prefs.token(this)
                    SmsService.toxtat(this)
                    Prefs.put(this, "token" to null, "enabled" to false, "uzildi" to null, "tarix" to "[]", "hisobot" to "[]")
                    ekran = "asosiy"; chiz()
                    fonda({ Api.post(JSONObject().put("amal", "smsUnpair").put("dt", token)) }) { }
                }.show()
        }, lp(24))
    }

    private fun simTanla() {
        if (Build.VERSION.SDK_INT < 22) { Toast.makeText(this, getString(R.string.sim_one), Toast.LENGTH_SHORT).show(); return }
        if (!Sim.ruxsat(this)) {
            Toast.makeText(this, getString(R.string.sim_need_perm), Toast.LENGTH_SHORT).show()
            if (Build.VERSION.SDK_INT >= 23) requestPermissions(arrayOf(Manifest.permission.READ_PHONE_STATE), 2)
            return
        }
        val l = Sim.royxat(this)
        if (l.size <= 1) {
            Prefs.put(this, "subId" to (l.firstOrNull()?.first ?: -1))
            Toast.makeText(this, getString(R.string.sim_one), Toast.LENGTH_SHORT).show(); chiz(); return
        }
        val joriy = l.indexOfFirst { it.first == Prefs.int(this, "subId", -1) }
        AlertDialog.Builder(this).setTitle(getString(R.string.sim_choose))
            .setSingleChoiceItems(l.map { it.second }.toTypedArray(), joriy) { d, i -> Prefs.put(this, "subId" to l[i].first); d.dismiss(); chiz() }
            .setNegativeButton(getString(R.string.cancel), null).show()
    }

    // ---------- Batareya tejash yo‘riqnomasi (Xiaomi / Samsung / Huawei alohida) ----------
    private fun yoriqnoma() {
        val ishlab = Build.MANUFACTURER.lowercase(Locale.US)
        val qadam = when {
            listOf("xiaomi", "redmi", "poco").any { ishlab.contains(it) } -> R.string.guide_xiaomi
            ishlab.contains("samsung") -> R.string.guide_samsung
            listOf("huawei", "honor").any { ishlab.contains(it) } -> R.string.guide_huawei
            else -> R.string.guide_other
        }
        val m = getString(R.string.guide_common) + "\n\n" + getString(qadam) + "\n\n" + getString(R.string.guide_limit) + "\n\n" + getString(R.string.guide_charge)
        AlertDialog.Builder(this).setTitle(getString(R.string.guide_title)).setMessage(m)
            .setPositiveButton(getString(R.string.guide_open)) { _, _ -> sozlamaOch(ishlab) }
            .setNegativeButton(getString(R.string.guide_done), null).show()
    }

    private fun sozlamaOch(ishlab: String) {
        val l = mutableListOf<Intent>()
        if (listOf("xiaomi", "redmi", "poco").any { ishlab.contains(it) })
            l.add(Intent().setComponent(ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity")))
        if (listOf("huawei", "honor").any { ishlab.contains(it) })
            l.add(Intent().setComponent(ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity")))
        if (Build.VERSION.SDK_INT >= 23) l.add(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
        l.add(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
        for (i in l) {
            try { startActivity(i); return } catch (e: Exception) { }
        }
    }

    /** Ishni fonda bajaradi, natijani asosiy oqimda qaytaradi */
    private fun fonda(ish: () -> Unit, keyin: () -> Unit) {
        Thread {
            try { ish() } catch (e: Exception) { }
            ui.post { if (!isFinishing) keyin() }
        }.start()
    }
}
