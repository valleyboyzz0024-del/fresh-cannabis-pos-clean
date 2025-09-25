# Windows Compatibility Fix for Cannabis POS App

## Problem
The previous launch script (`launch-stable.sh`) doesn't work on Windows because it uses Unix commands like `chmod` and `rm` that aren't available in Windows Command Prompt.

## Solution
This PR adds Windows compatibility by:

1. Creating a Windows batch file (`launch-stable.bat`) that works in Command Prompt
2. Removing Unix-specific commands and using Windows equivalents
3. Ensuring the app can be launched on Windows systems without errors

## Changes Made
1. **launch-stable.bat**: Created a Windows-compatible batch script that:
   - Checks if node_modules exists and installs dependencies if needed
   - Applies the useHeaderConfigProps.js patch
   - Clears the Expo cache and starts the app

## Testing
This fix has been tested on:
- Windows Command Prompt
- Fresh Expo Go installation (cold start)
- Real device testing (not simulator)

## How to Use
### On Windows:
1. Pull this branch
2. Run `launch-stable.bat` to apply the fixes and start the app
3. Scan the QR code on a real device
4. The app will launch without any crashes

### On Unix/Mac/Linux:
Continue using the existing `launch-stable.sh` script as before.