# Android Build Issues and Solutions

This document explains the issues encountered when building the Fresh Cannabis POS app for Android and provides solutions to fix them.

## Issues Identified

### 1. Barcode Scanner Module Compatibility

The most critical errors are related to the `expo-barcode-scanner` module. The build logs show numerous errors like:

```
error: unresolved reference 'barcodescanner'
import expo.modules.interfaces.barcodescanner.BarCodeScannerSettings
```

This indicates that the `expo-barcode-scanner` module is looking for interfaces in `expo.modules.interfaces.barcodescanner` which don't exist in the current Expo SDK version (54.0.10).

### 2. Kotlin Daemon Compilation Failures

The Kotlin compiler daemon is timing out during compilation:

```
Caused by: java.rmi.ConnectIOException: error during JRMP connection establishment; nested exception is:
java.net.SocketTimeoutException: Read timed out
```

This is a common issue with large React Native projects and can be fixed by adjusting the Kotlin daemon settings.

### 3. Deprecated API Warnings

There are various deprecation warnings in the build logs, but these are less critical than the compilation errors.

## Solutions

### Fix Script Overview

The `fix-android-build.sh` script addresses these issues through several targeted fixes:

1. **Barcode Scanner Module Fix**:
   - Disables the problematic `expo-barcode-scanner` module in `app.json`
   - Removes it from `package.json` dependencies
   - Creates a JavaScript stub that mimics the module's API
   - Updates imports in your code to use the stub instead

2. **Kotlin Daemon Fix**:
   - Adds memory and configuration settings to `gradle.properties`
   - Prevents the Kotlin daemon timeouts

3. **Web-Only Configuration** (optional):
   - Creates a separate script (`web-config.js`) that you can run if you want to focus on web development
   - Disables problematic native modules
   - Configures web-specific settings

### How to Apply the Fixes

1. **Run the fix script**:
   ```bash
   cd fresh-cannabis-pos-clean
   ./fix-android-build.sh
   ```

2. **After running the script**:
   - For web development: `npm run web`
   - For Android (if you want to try again): `npx react-native run-android`

3. **If Android still fails**:
   ```bash
   node web-config.js
   npm run web
   ```

### Restoring Original Configuration

If you need to restore the original configuration after using the web-only setup:

```bash
cp app.json.backup app.json
npm install
```

## Long-Term Solutions

1. **Update Dependencies**: When you're ready to use the barcode scanner again, you might need to:
   - Update to a compatible version of `expo-barcode-scanner`
   - Or downgrade your Expo SDK to a version compatible with your current barcode scanner

2. **Separate Native and Web Development**: Consider maintaining separate configurations for web and native development to avoid these conflicts.

3. **Use Expo Go**: For development, consider using Expo Go which handles many of these native module issues for you.

4. **Increase Build Resources**: If you continue to experience Kotlin daemon timeouts, consider:
   - Increasing the memory allocated to Gradle
   - Using a more powerful development machine
   - Using a CI/CD service with more resources for builds

## Technical Details

### Barcode Scanner Stub

The fix creates a JavaScript stub for the barcode scanner module that provides the same API surface but doesn't actually scan barcodes. This allows your code to compile and run without errors, though the barcode scanning functionality will be disabled.

### Gradle Properties

The following properties are added to `gradle.properties` to fix the Kotlin daemon issues:

```properties
kotlin.daemon.jvm.options=-Xmx2048m
kotlin.daemon.jvmargs=-Xmx2048m
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=4096m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

These settings increase the memory available to the Kotlin daemon and enable parallel builds to improve performance.

## Troubleshooting

If you still encounter issues after applying these fixes:

1. **Check for other incompatible modules**: Look for other native modules that might be causing similar issues.

2. **Examine the build logs**: Look for specific error messages that might indicate other issues.

3. **Try a clean build**: Delete the `android/build` directory and the `.gradle` cache, then try building again.

4. **Update React Native**: Consider updating to the latest version of React Native, which might have better compatibility with your dependencies.

5. **Contact Expo support**: If the issues persist, consider reaching out to Expo support or checking their GitHub issues for similar problems.