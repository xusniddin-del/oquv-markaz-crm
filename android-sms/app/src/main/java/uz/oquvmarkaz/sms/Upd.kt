package uz.oquvmarkaz.sms

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

/** Yangilanish: sms-version.json da yangi versiya bo'lsa, ilova va bildirishnoma «Yangilash» tugmasini ko'rsatadi. */
object Upd {
    const val CODE = 1          // build.gradle versionCode bilan bir xil
    const val NAME = "1.0"      // build.gradle versionName bilan bir xil
    private const val BASE = "https://xusniddin-del.github.io/oquv-markaz-crm/"
    const val URL_APP = BASE + "Oquv-Markaz-SMS.apk"
    private const val URL_VER = BASE + "sms-version.json"

    /** tarmoqdan tekshiradi (fon oqimida chaqiring). force=false bo'lsa 6 soatda 1 marta */
    fun check(p: Prefs, force: Boolean = false): Boolean {
        if (!force && System.currentTimeMillis() - p.updChecked < 6 * 3600_000L) return p.hasUpdate
        try {
            val c = URL(URL_VER + "?t=" + System.currentTimeMillis()).openConnection() as HttpURLConnection
            c.connectTimeout = 15000; c.readTimeout = 15000; c.useCaches = false
            val j = JSONObject(c.inputStream.bufferedReader().use { it.readText() })
            p.newCode = j.optInt("code", 0); p.newName = j.optString("name", "")
            p.newNotes = j.optJSONObject("notes")?.optString(p.lang, "") ?: ""
            p.updChecked = System.currentTimeMillis()
        } catch (e: Exception) { }
        return p.hasUpdate
    }

    fun open(ctx: Context) {
        try { ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(URL_APP)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (e: Exception) { }
    }
}

/** Til: telefon tilidan qat'i nazar ilovada tanlangan til (asosiy — o'zbekcha) */
object Lang {
    fun wrap(base: Context): Context {
        val l = try { Prefs(base).lang } catch (e: Exception) { "uz" }
        val loc = Locale(if (l == "ru") "ru" else "uz")
        Locale.setDefault(loc)
        val c = Configuration(base.resources.configuration)
        c.setLocale(loc)
        return base.createConfigurationContext(c)
    }
}
