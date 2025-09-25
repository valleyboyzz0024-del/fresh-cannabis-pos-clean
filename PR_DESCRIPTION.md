# Fix Header Crash in Cannabis POS App

## Problem
The app was crashing with the following error:
```
Render Error
Cannot read property 'regular' of undefined

Call Stack
useHeaderConfigProps
```

This was occurring because of an issue with the FontProcessor.js file in the @react-navigation/native-stack library, which was throwing an error when trying to process fonts.

## Solution
1. Modified the theme.js file to use a simpler font configuration that doesn't rely on complex font processing
2. Updated the AppNavigator.js file to ensure all screens have proper header configuration
3. Created a patch for the FontProcessor.js file in the node_modules directory
4. Created a fix-and-start.sh script that applies all the fixes and starts the app

## Changes Made
1. **theme.js**: Simplified the font configuration to avoid using configureFonts
2. **AppNavigator.js**: Updated to ensure all screens have proper header configuration
3. **fix-font-processor.js**: Created a script to patch the FontProcessor.js file
4. **fix-and-start.sh**: Created a script to apply all fixes and start the app

## Testing
To test this fix:
1. Pull this branch
2. Run `./fix-and-start.sh` to apply the fixes and start the app
3. Verify that the app launches without the header crash error

## Notes
- This fix addresses the specific error shown in the screenshot without modifying any core functionality
- The app is now using system default fonts as specified in the requirements
- No additional dependencies were added