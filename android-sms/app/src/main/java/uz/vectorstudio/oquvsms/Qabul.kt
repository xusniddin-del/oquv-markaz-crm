package uz.vectorstudio.oquvsms

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** SIM karta natijasi: SMS yuborildimi (SENT) va yetkazildimi (DELIVERED) */
class SmsResultReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        val id = i.getStringExtra("id") ?: return
        when (i.action) {
            Yubor.SENT -> {
                val ok = resultCode == Activity.RESULT_OK
                when (Prefs.qism(c, id, ok, if (ok) "" else Yubor.xatoMatn(resultCode))) {
                    "sent" -> Holat.yuborildi(c, id)
                    "failed" -> Holat.xato(c, id, null, Yubor.xatoMatn(resultCode))
                }
            }
            Yubor.DELIVERED -> {
                if (!i.getBooleanExtra("last", false) || resultCode != Activity.RESULT_OK) return
                Prefs.tarixYoz(c, id, null, "delivered")
                Prefs.hisobotQosh(c, id, "delivered", "")
            }
            else -> return
        }
        Hisobot.yuborFonda(c)
    }
}

/** Telefon qayta yoqilganda yoki ilova yangilanganda xizmat o‘zi ishga tushadi */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        if (i.action != Intent.ACTION_BOOT_COMPLETED && i.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
        if (Prefs.token(c).isNotEmpty() && Prefs.bool(c, "enabled")) SmsService.ishgaTushir(c)
    }
}
