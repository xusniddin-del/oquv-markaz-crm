package uz.oquvmarkaz.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Telefon qayta yoqilganda (yoki ilova yangilanganda) xizmat o'zi ishga tushadi. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        val p = Prefs(ctx)
        if (p.paired) try { SmsService.start(ctx) } catch (e: Exception) { }
    }
}
