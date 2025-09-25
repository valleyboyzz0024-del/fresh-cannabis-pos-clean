# Fix Header Crash in Cannabis POS App

## Problem
The app was crashing with the following error:
```
Render Error
Cannot read property 'regular' of undefined

Call Stack
useHeaderConfigProps
```

This was occurring because useHeaderConfigProps.js was trying to read a navigation prop that doesn't exist.

## Solution
1. Patched useHeaderConfigProps.js to check for undefined navigation and route props and return early with a safe default
2. Set headerShown: false for ALL screens in AppNavigator.js to prevent the header from being rendered
3. Created a script to apply the patch and start the app

## Changes Made
1. **src/fixes/useHeaderConfigProps.js**: Created a patched version that checks for undefined props
2. **fix-header-config.js**: Created a script to patch the useHeaderConfigProps.js file in node_modules
3. **src/navigation/AppNavigator.js**: Set headerShown: false for all screens
4. **start-fixed-app.sh**: Created a script to apply the fixes and start the app

## Testing
To test this fix:
1. Pull this branch
2. Run `./start-fixed-app.sh` to apply the fixes and start the app
3. Scan the QR code on a real device (not simulator)
4. Verify that the app launches without the header crash error

## Notes
- This fix addresses the specific error shown in the screenshot
- The app is now using system default fonts as specified in the requirements
- No additional dependencies were added
- All screens have headerShown: false to prevent any header-related crashes