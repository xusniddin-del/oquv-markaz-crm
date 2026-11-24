package uz.oquvmarkaz.sms

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/** Barcha sozlamalar telefonda (SharedPreferences). */
class Prefs(ctx: Context) {
    private val p: SharedPreferences = ctx.getSharedPreferences("oquvmarkaz_sms", Context.MODE_PRIVATE)

    var token: String get() = p.getString("dt", "") ?: ""; set(v) = p.edit().putString("dt", v).apply()
    var accName: String get() = p.getString("name", "") ?: ""; set(v) = p.edit().putString("name", v).apply()
    var shop: String get() = p.getString("shop", "") ?: ""; set(v) = p.edit().putString("shop", v).apply()
    var enabled: Boolean get() = p.getBoolean("enabled", true); set(v) = p.edit().putBoolean("enabled", v).apply()
    var paused: Boolean get() = p.getBoolean("paused", false); set(v) = p.edit().putBoolean("paused", v).apply()
    var subId: Int get() = p.getInt("subId", -1); set(v) = p.edit().putInt("subId", v).apply()
    var simName: String get() = p.getString("simName", "") ?: ""; set(v) = p.edit().putString("simName", v).apply()
    var from: String get() = p.getString("from", "09:00") ?: "09:00"; set(v) = p.edit().putString("from", v).apply()
    var to: String get() = p.getString("to", "21:00") ?: "21:00"; set(v) = p.edit().putString("to", v).apply()
    /** server bergan ish vaqti (CRM'da o'zgartirilsa) — telefonda qo'lda o'zgartirilmagan bo'lsa ishlatiladi */
    var localHours: Boolean get() = p.getBoolean("localHours", false); set(v) = p.edit().putBoolean("localHours", v).apply()
    var gap: Int get() = p.getInt("gap", 25); set(v) = p.edit().putInt("gap", v).apply()
    var lastSync: Long get() = p.getLong("lastSync", 0); set(v) = p.edit().putLong("lastSync", v).apply()
    var lastError: String get() = p.getString("lastError", "") ?: ""; set(v) = p.edit().putString("lastError", v).apply()
    var fails: Int get() = p.getInt("fails", 0); set(v) = p.edit().putInt("fails", v).apply()
    var batteryAsked: Boolean get() = p.getBoolean("batteryAsked", false); set(v) = p.edit().putBoolean("batteryAsked", v).apply()
    var offServer: Boolean get() = p.getBoolean("offServer", false); set(v) = p.edit().putBoolean("offServer", v).apply()
    /** ilova tili: "uz" (asosiy) yoki "ru" — telefon tilidan qat'i nazar */
    var lang: String get() = p.getString("lang", "uz") ?: "uz"; set(v) = p.edit().putString("lang", v).apply()
    /** serverdagi eng yangi versiya (sms-version.json) */
    var newCode: Int get() = p.getInt("newCode", 0); set(v) = p.edit().putInt("newCode", v).apply()
    var newName: String get() = p.getString("newName", "") ?: ""; set(v) = p.edit().putString("newName", v).apply()
    var newNotes: String get() = p.getString("newNotes", "") ?: ""; set(v) = p.edit().putString("newNotes", v).apply()
    var updChecked: Long get() = p.getLong("updChecked", 0); set(v) = p.edit().putLong("updChecked", v).apply()
    var updNotified: Int get() = p.getInt("updNotified", 0); set(v) = p.edit().putInt("updNotified", v).apply()
    val hasUpdate get() = newCode > Upd.CODE

    val paired get() = token.isNotEmpty()

    fun clear() { val l = lang; p.edit().clear().putString("lang", l).apply() }

    private fun mins(hm: String): Int { val a = hm.split(":"); return (a.getOrNull(0)?.toIntOrNull() ?: 0) * 60 + (a.getOrNull(1)?.toIntOrNull() ?: 0) }
    fun inWorkHours(): Boolean {
        val c = Calendar.getInstance(); val now = c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)
        val f = mins(from); val t = mins(to)
        return if (f <= t) now in f until t else now >= f || now < t
    }

    private fun day(): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    val todayCount: Int get() = if (p.getString("cntDay", "") == day()) p.getInt("cnt", 0) else 0
    fun countSent() { val d = day(); val n = if (p.getString("cntDay", "") == d) p.getInt("cnt", 0) else 0; p.edit().putString("cntDay", d).putInt("cnt", n + 1).apply() }

    /** oxirgi 10 ta SMS: id, telefon, matn boshi, holat, vaqt */
    fun log(): JSONArray = try { JSONArray(p.getString("log", "[]")) } catch (e: Exception) { JSONArray() }
    fun putLog(id: String, phone: String, text: String, status: String) {
        val a = log(); var found = false
        for (i in 0 until a.length()) { val o = a.getJSONObject(i); if (o.optString("id") == id) { o.put("s", status); o.put("t", System.currentTimeMillis()); found = true } }
        val out = JSONArray()
        if (!found) out.put(JSONObject().put("id", id).put("ph", phone).put("tx", text.replace("\n", " ").take(60)).put("s", status).put("t", System.currentTimeMillis()))
        for (i in 0 until a.length()) if (out.length() < 10) out.put(a.get(i))
        p.edit().putString("log", out.toString()).apply()
    }
}
