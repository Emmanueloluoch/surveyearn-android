# SurveyEarn — Native Android App

Native Android app built with Kotlin + Jetpack Compose.

**Target APK size:** ~6–10 MB (arm64-only, release build with R8/ProGuard)

## Stack

- Kotlin + Jetpack Compose (UI)
- Retrofit + OkHttp (API calls)
- DataStore (local session persistence)
- Navigation Compose (routing)
- Material 3 (design system)

## API

Points to: `https://survey-creator-surveypesa-ke.replit.app/`

## Building (No Android Studio needed)

### Step 1 — Push to GitHub

```bash
cd artifacts/surveypesa-native
git init
git add .
git commit -m "Initial SurveyEarn native app"
git remote add origin https://github.com/YOUR_USERNAME/surveypesa-native.git
git push -u origin main
```

### Step 2 — GitHub Actions builds the APK automatically

Once pushed, go to:
- GitHub → your repo → **Actions** tab
- Find the **Build APK** workflow — it runs automatically
- Download the APK from the **Artifacts** section when done

### Step 3 (Optional) — Sign the release APK

Run the **Generate Keystore** workflow once, then add these secrets to your GitHub repo:
- `KEYSTORE_BASE64` — base64 of your keystore file
- `KEYSTORE_PASSWORD` — keystore password
- `KEY_ALIAS` — key alias
- `KEY_PASSWORD` — key password

## Screens

- **Auth** — Login / Sign Up with referral code
- **Home** — Survey list + balance card
- **Survey** — Multi-step survey with rating, text, radio, and checkbox questions
- **Wallet** — Balance + M-Pesa withdrawal
- **Refer** — Referral code copy + share
- **Account** — Profile, activation info, VIP upgrade, logout
