# Download BD & World News APK via GitHub Actions

This repository includes an automated GitHub Actions workflow (`.github/workflows/build-android-apk.yml`) that compiles a ready-to-install Android `.apk` (`BD-World-News.apk`) in the cloud using Capacitor + Gradle — no Android Studio required.

## Steps to Get the APK on Your OnePlus Nord CE 5

1. **Push / Export to GitHub**:
   - Click the **GitHub** export button in AI Studio (or push this repository to your GitHub account).
2. **Wait ~2–3 Minutes for GitHub Actions**:
   - Open your repository on GitHub and click the **Actions** tab.
   - The **Build Android APK** workflow starts automatically on push to `main` (or click **Run workflow** manually anytime).
3. **Download `BD-World-News.apk` Directly on Your Phone**:
   - **Easiest (Direct APK link)**: Open your GitHub repository on your OnePlus Nord CE 5 → tap **Releases** → tap **`BD-World-News.apk`** to download.
   - **Alternative**: Open **Actions → Build Android APK → latest run → Artifacts → `BD-World-News-APK`** (downloads a zip containing `BD-World-News.apk`).
4. **Install on OnePlus Nord CE 5**:
   - Tap the downloaded `BD-World-News.apk`.
   - If OxygenOS asks, tap **Settings → Allow from this source** (Install unknown apps), then tap **Install**.
