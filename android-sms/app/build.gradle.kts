plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Imzo: CI'da GitHub Secrets'dan (SMS_KEYSTORE_B64 → keystore fayl, SMS_KEYSTORE_PASS). Kalit repoga QO'YILMAYDI.
val ksFile = System.getenv("SMS_KEYSTORE_FILE")
val ksPass = System.getenv("SMS_KEYSTORE_PASS")

android {
    namespace = "uz.oquvmarkaz.sms"
    compileSdk = 34
    defaultConfig {
        applicationId = "uz.oquvmarkaz.sms"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    signingConfigs {
        if (ksFile != null && ksPass != null) {
            create("release") {
                storeFile = file(ksFile)
                storePassword = ksPass
                keyAlias = "oquvmarkaz-sms"
                keyPassword = ksPass
            }
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (ksFile != null && ksPass != null) signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    lint { abortOnError = false; checkReleaseBuilds = false }
}
