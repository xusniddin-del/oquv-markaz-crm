package uz.oquvmarkaz.sms

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.app.TimePickerDialog
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.telephony.SubscriptionManager
import android.widget.Button
import android.widget.TextView
import org.json.JSONObject

/** 3-ekran: SIM, ish vaqti, batareya, uzish. */
class SettingsActivity : Activity() {
    override fun attachBaseContext(newBase: android.content.Context) { super.attachBaseContext(Lang.wrap(newBase)) }

    private lateinit var prefs: Prefs

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = Prefs(this)
        setContentView(R.layout.activity_settings)
        findViewById<Button>(R.id.btnBack).setOnClickListener { finish() }
        findViewById<Button>(R.id.btnSim).setOnClickListener { pickSim() }
        findViewById<Button>(R.id.btnFrom).setOnClickListener { pickTime(true) }
        findViewById<Button>(R.id.btnTo).setOnClickListener { pickTime(false) }
        findViewById<Button>(R.id.btnBattery).setOnClickListener { MainActivity.batteryDialog(this) }
        findViewById<Button>(R.id.btnUnpair).setOnClickListener { unpair() }
        findViewById<Button>(R.id.btnLangUz).setOnClickListener { setLang("uz") }
        findViewById<Button>(R.id.btnLangRu).setOnClickListener { setLang("ru") }
        draw()
    }

    private fun draw() {
        findViewById<Button>(R.id.btnSim).text = if (prefs.simName.isNotEmpty()) prefs.simName else getString(R.string.sim_default)
        findViewById<Button>(R.id.btnFrom).text = prefs.from
        findViewById<Button>(R.id.btnTo).text = prefs.to
        findViewById<TextView>(R.id.txtVer).text = getString(R.string.version, SmsService.APP_VER)
        val uz = prefs.lang != "ru"
        findViewById<Button>(R.id.btnLangUz).setBackgroundResource(if (uz) R.drawable.btn else R.drawable.btn_ghost)
        findViewById<Button>(R.id.btnLangUz).setTextColor(if (uz) 0xFFFFFFFF.toInt() else 0xFF0F172A.toInt())
        findViewById<Button>(R.id.btnLangRu).setBackgroundResource(if (!uz) R.drawable.btn else R.drawable.btn_ghost)
        findViewById<Button>(R.id.btnLangRu).setTextColor(if (!uz) 0xFFFFFFFF.toInt() else 0xFF0F172A.toInt())
    }

    private fun setLang(l: String) {
        if (prefs.lang == l) return
        prefs.lang = l; SmsService.kick(this); recreate()
    }

    private fun pickTime(from: Boolean) {
        val cur = (if (from) prefs.from else prefs.to).split(":")
        TimePickerDialog(this, { _, h, m ->
            val v = String.format("%02d:%02d", h, m)
            if (from) prefs.from = v else prefs.to = v
            prefs.localHours = true; draw(); SmsService.kick(this)
        }, cur.getOrNull(0)?.toIntOrNull() ?: 9, cur.getOrNull(1)?.toIntOrNull() ?: 0, true).show()
    }

    private fun pickSim() {
        if (Build.VERSION.SDK_INT < 22) { AlertDialog.Builder(this).setMessage(R.string.sim_one).setPositiveButton("OK", null).show(); return }
        if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.READ_PHONE_STATE), 8); return
        }
        val subs = try { (getSystemService(android.content.Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager).activeSubscriptionInfoList ?: emptyList() } catch (e: SecurityException) { emptyList() }
        if (subs.size <= 1) { prefs.subId = -1; prefs.simName = subs.firstOrNull()?.let { simLabel(it.simSlotIndex, it.carrierName?.toString()) } ?: ""; draw(); AlertDialog.Builder(this).setMessage(R.string.sim_one).setPositiveButton("OK", null).show(); return }
        val names = subs.map { simLabel(it.simSlotIndex, it.carrierName?.toString()) }.toTypedArray()
        AlertDialog.Builder(this).setTitle(R.string.sim_pick).setItems(names) { _, i ->
            prefs.subId = subs[i].subscriptionId; prefs.simName = names[i]; draw(); SmsService.kick(this)
        }.show()
    }

    private fun simLabel(slot: Int, carrier: String?) = "SIM " + (slot + 1) + (if (!carrier.isNullOrBlank()) " · $carrier" else "")

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 8 && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) pickSim()
    }

    private fun unpair() {
        AlertDialog.Builder(this).setTitle(R.string.unpair_q).setMessage(R.string.unpair_text)
            .setPositiveButton(R.string.unpair) { _, _ ->
                val tok = prefs.token
                Thread { try { Api.call("smsUnpair", JSONObject().put("dt", tok)) } catch (e: Exception) { } }.start()
                SmsService.stop(this); prefs.clear(); finish()
            }.setNegativeButton(R.string.cancel, null).show()
    }
}
