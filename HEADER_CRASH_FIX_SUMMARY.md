# Cannabis POS App Header Crash Fix

## Issue Identified
After analyzing the error screenshot, I identified that the app was crashing due to a font-related issue in the useHeaderConfigProps.js file. The specific error was:

```
Render Error
Cannot read property 'regular' of undefined

Call Stack
useHeaderConfigProps
```

## Root Cause
The root cause was an issue with the FontProcessor.js file in the @react-navigation/native-stack library. This file was throwing an error when trying to process fonts, causing the app to crash.

## Solution Applied
1. Created a new branch called `fix-header-crash`
2. Modified the theme.js file to use a simpler font configuration that doesn't rely on complex font processing
3. Updated the AppNavigator.js file to ensure all screens have proper header configuration
4. Created a patch for the FontProcessor.js file in the node_modules directory
5. Created a fix-and-start.sh script that applies all the fixes and starts the app

## How to Apply This Fix
1. Make sure you're in the project directory
2. Run `chmod +x fix-and-start.sh` to make the script executable (if needed)
3. Run `./fix-and-start.sh` to apply the fixes and start the app

## What This Fix Does
1. **Simplifies Font Configuration**: The theme.js file now uses a simpler font configuration that doesn't rely on complex font processing
2. **Updates Navigation**: The AppNavigator.js file now ensures all screens have proper header configuration
3. **Patches FontProcessor**: The fix-font-processor.js script patches the FontProcessor.js file in the node_modules directory
4. **Provides Easy Start**: The fix-and-start.sh script applies all fixes and starts the app

## Additional Notes
- This fix addresses the specific error shown in the screenshot without modifying any core functionality
- The app is now using system default fonts as specified in the requirements
- No additional dependencies were added
- If you encounter any other issues, please let me know