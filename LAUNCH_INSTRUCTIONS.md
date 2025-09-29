# CannaFlow Launch Instructions

This document provides step-by-step instructions for launching the CannaFlow cannabis point-of-sale application on all supported platforms.

## 🧰 Prerequisites

Before launching CannaFlow, ensure you have the following installed:

- **Node.js** (latest LTS version)
- **Git**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** with SDK (for Android development)
- **Xcode** (for iOS development, Mac only)

## 🛠️ Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/valleyboyzz0024-del/fresh-cannabis-pos-clean.git
   cd fresh-cannabis-pos-clean
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## ▶️ Launching the App

### Expo Go (Quickest for Testing)

For rapid testing and development preview:

```bash
npm start
# or
expo start
```

Then:
- On iOS: Scan the QR code with your Camera app
- On Android: Scan the QR code with the Expo Go app

### Web Browser

To launch in a web browser:

```bash
npm run web
```

### Android

To launch on Android device or emulator:

```bash
npm run android
# or
npx react-native run-android
```

**Requirements:**
- Android emulator running, or
- Android device connected with USB debugging enabled

### iOS (Mac Only)

To launch on iOS simulator or device:

```bash
npm run ios
```

**Requirements:**
- Xcode installed
- iOS simulator running, or
- iOS device connected

## 📱 Building for Distribution

### Android APK

To build an Android APK:

```bash
npm run build:android
```

### iOS App

To build an iOS app (Mac only):

```bash
npm run build:ios
```

## 🔄 Updating the Application

To pull the latest changes from the repository:

```bash
git pull origin main
```

To update dependencies after pulling changes:

```bash
npm install
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   - Clear cache: `npm start -- --reset-cache`
   - Kill existing processes: `killall node`

2. **Android build issues**
   - Run the Android build fix script: `./fix-android-build.sh`
   - Check the ANDROID_BUILD_FIXES.md documentation

3. **Deprecation warnings**
   - Run the deprecation warnings fix script: `./fix-all-deprecation-warnings.sh`
   - Check the DEPRECATION_FIXES.md documentation

4. **Theme issues**
   - Check the theme documentation in THEME_DOCUMENTATION.md
   - Use the safe theme utilities in src/utils/safeTheme.js

### Development Tools

- **Run app with fixes**: `./run-cannaflow.sh`
- **Update run scripts**: `./update-run-app-new.sh`
- **Generate icons**: `node generate-icons.js`

## 📁 Project Structure

```
fresh-cannabis-pos-clean/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── database/       # Database configuration
│   ├── fixes/         # Legacy fix files (archived)
│   ├── navigation/    # App navigation structure
│   ├── screens/       # Application screens
│   ├── services/      # Business logic services
│   ├── theme/         # Application theme configuration
│   └── utils/         # Utility functions
├── assets/            # Application assets
│   └── new/           # New CannaFlow branding assets
├── archive/           # Archived legacy files
├── docs/              # Documentation files
└── scripts/           # Utility scripts
```

## 🤖 AI Assistant & Compliance Engine

The CannaFlow application includes an AI Assistant and Canada-wide Compliance Engine:

### Starting the AI Assistant
1. Launch the app normally
2. The AI Assistant will appear as a floating button in the bottom-right corner
3. Tap the button to access AI features

### Setting Up Compliance Engine
1. Go to Settings > Compliance
2. Select your province
3. Enter your license information
4. Configure reporting preferences

### Compliance Features
- **Sales Reporting**: Automatic sales logging with tax calculations
- **Inventory Tracking**: Real-time inventory monitoring
- **Cash Float Management**: Cash drawer activity logging
- **Employee Activity**: Staff action tracking
- **Waste Management**: Cannabis waste disposal logging
- **Export Options**: CSV, JSON, XML, PDF, Excel, HTML formats

## 📝 Additional Documentation

- **README.md**: General project information
- **README_CANNAFLOW.md**: CannaFlow transformation documentation
- **README_AI_COMPLIANCE.md**: AI Assistant and Compliance Engine documentation
- **README_ANDROID_FIXES.md**: Android build fixes documentation
- **THEME_DOCUMENTATION.md**: Theme structure and customization documentation
- **DEPRECATION_FIXES.md**: Deprecation warnings fixes documentation
- **ANDROID_BUILD_FIXES.md**: Android build issues fixes documentation
- **MOBILE_GUIDE.md**: Mobile development guide

## 🆘 Support

For issues not covered in this documentation:
1. Check the archived files in the `archive/` directory
2. Review the detailed documentation files
3. Create an issue on GitHub
4. Contact support at support@canna-flow.com