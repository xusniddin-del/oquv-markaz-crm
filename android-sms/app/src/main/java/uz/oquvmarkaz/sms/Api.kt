package uz.oquvmarkaz.sms

import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

/** O‘quv Markaz CRM serveri (Google Apps Script). Javob 302 bilan boshqa manzilga yo'naltiriladi — o'zimiz kuzatamiz. */
object Api {
    const val URL_API = "https://script.google.com/macros/s/AKfycbxZshxNSq_BtBGPIpcSw9VXBvwhGCeLPrf4T0P6W2O8w_sPSbLNEAPHC2O91DiuXwAE/exec"

    class ApiError(msg: String) : Exception(msg)

    fun call(action: String, body: JSONObject = JSONObject()): JSONObject {
        body.put("action", action)
        var url = URL(URL_API)
        var c = url.openConnection() as HttpURLConnection
        c.instanceFollowRedirects = false
        c.connectTimeout = 20000; c.readTimeout = 40000
        c.requestMethod = "POST"; c.doOutput = true
        c.setRequestProperty("Content-Type", "text/plain;charset=utf-8")
        c.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
        var code = c.responseCode
        var hops = 0
        while ((code == 301 || code == 302 || code == 303 || code == 307 || code == 308) && hops < 5) {
            val loc = c.getHeaderField("Location") ?: break
            c.disconnect()
            url = URL(url, loc)
            c = url.openConnection() as HttpURLConnection
            c.instanceFollowRedirects = false
            c.connectTimeout = 20000; c.readTimeout = 40000
            code = c.responseCode; hops++
        }
        val stream = if (code in 200..299) c.inputStream else (c.errorStream ?: c.inputStream)
        val text = BufferedReader(InputStreamReader(stream, Charsets.UTF_8)).use { it.readText() }
        c.disconnect()
        val j = try { JSONObject(text) } catch (e: Exception) { throw java.io.IOException("Server javobi noto'g'ri ($code)") }
        if (j.has("error")) throw ApiError(j.optString("error"))
        return j
    }
}
