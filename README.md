# AfgDown - React Native Media Downloader

<p align="center">
  <img src="assets/images/icon.png" alt="AfgDown Logo" width="120" height="120" />
</p>

A production-quality cross-platform mobile app for downloading direct media files. Built with React Native and Expo.

## 🎯 Features

- **URL Detection**: Automatic platform detection (YouTube, TikTok, Instagram, Facebook, Direct Files)
- **Compliant Downloads**: Only downloads direct media files (e.g., `.mp4`, `.webm`, `.mov`)
- **Progress Tracking**: Real-time download progress with cancellation support
- **Rewarded Ads**: AdMob integration with rewarded ads before downloads
- **Dark/Light Theme**: Afghan flag-inspired color palette
- **Bilingual**: English and Dari language support
- **Offline Storage**: SQLite database for download history

## 🔒 Compliance

This app strictly adheres to platform terms of service:

- ✅ Downloads direct media file URLs (e.g., `https://example.com/video.mp4`)
- ✅ "Open in App" for social platform content
- ❌ Does NOT scrape, reverse engineer, or bypass protections
- ❌ Does NOT download from YouTube, TikTok, Instagram, Facebook directly

## 📱 Screenshots

| Home Screen | Downloads | Settings |
|:-----------:|:---------:|:--------:|
| URL Detection | Download List | Theme Toggle |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio with SDK

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/AfgDown.git
cd AfgDown

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Devices

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Physical Device (scan QR code)
npx expo start
```

## ⚙️ Configuration

### AdMob Setup

The app uses test AdMob IDs by default. For production:

1. Create an AdMob account at [admob.google.com](https://admob.google.com)
2. Create an app and get your App ID
3. Create a Rewarded Ad unit
4. Update `app.json`:

```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-YOUR_ANDROID_APP_ID",
        "iosAppId": "ca-app-pub-YOUR_IOS_APP_ID"
      }
    ]
  ]
}
```

5. Update `src/services/adManager.ts`:

```typescript
const REWARDED_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-xxx/yyy',
  android: 'ca-app-pub-xxx/zzz',
});
```

### iOS Permissions

Already configured in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSPhotoLibraryUsageDescription": "Allow AfgDown to save videos",
      "NSPhotoLibraryAddUsageDescription": "Allow AfgDown to save videos",
      "UIFileSharingEnabled": true,
      "LSSupportsOpeningDocumentsInPlace": true
    }
  }
}
```

### Android Permissions

Already configured in `app.json`:

```json
{
  "android": {
    "permissions": [
      "android.permission.INTERNET",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_EXTERNAL_STORAGE"
    ]
  }
}
```

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

## 📁 Project Structure

```
AfgDown/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── downloads.tsx  # Downloads screen
│   │   └── settings.tsx   # Settings screen
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature modules
│   │   ├── detect/        # URL detection
│   │   └── downloads/     # Download management
│   ├── services/          # Core services
│   │   ├── urlDetect.ts   # URL detection
│   │   ├── headProbe.ts   # Content-Type probing
│   │   ├── downloadManager.ts
│   │   ├── adManager.ts   # AdMob integration
│   │   └── storage.ts     # SQLite database
│   ├── store/             # Zustand store
│   ├── theme/             # Colors & theme
│   ├── types/             # TypeScript types
│   └── utils/             # Translations
├── app.json               # Expo configuration
├── jest.config.js         # Test configuration
└── README.md
```

## 🎨 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| State | Zustand |
| Database | expo-sqlite |
| HTTP | Axios |
| Ads | react-native-google-mobile-ads |
| Secure Storage | expo-secure-store |

## 📋 MVP vs Hardening

### ✅ MVP (Completed)

- [x] URL detection for all major platforms
- [x] Direct file downloads with progress
- [x] "Open in App" for platform URLs
- [x] Rewarded ads integration
- [x] Downloads list with actions
- [x] Dark/light theme
- [x] English/Dari language toggle
- [x] Unit tests for URL detection

### 🔜 Hardening (Future)

- [ ] OAuth integration for platforms with official APIs
- [ ] Background download support (requires bare RN)
- [ ] Crash reporting (Sentry/Crashlytics)
- [ ] Analytics integration
- [ ] Rate limiting for HEAD requests
- [ ] Accessibility improvements (a11y)
- [ ] App Store / Play Store optimization

## 🔄 Expo vs Bare React Native

This app uses **Expo managed workflow** for simplicity. Note:

| Feature | Expo | Bare RN |
|---------|------|---------|
| Foreground Downloads | ✅ | ✅ |
| Background Downloads | ⚠️ Limited | ✅ Full |
| Push Notifications | ✅ | ✅ |
| AdMob | ✅ | ✅ |
| OTA Updates | ✅ | ⚠️ |

**To migrate to Bare RN** (if needed for background downloads):

```bash
npx expo prebuild
```

Then install a background download library:
```bash
npm install @nooncode/react-native-background-downloader
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Afghan flag colors used for app theming
- Expo team for the excellent framework
- React Native community
