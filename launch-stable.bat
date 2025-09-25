@echo off
echo Starting Cannabis POS app with stable launch configuration...

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

REM Replace useHeaderConfigProps.js with our stub
echo Replacing useHeaderConfigProps.js with stub...
node replace-header-config.js

REM Fix React Native Paper theme
echo Fixing React Native Paper theme...
node fix-paper-theme.js

REM Clear cache completely
echo Clearing cache completely...
if exist "node_modules\.cache" rmdir /s /q node_modules\.cache
if exist ".expo" rmdir /s /q .expo
call npx expo start --clear

echo Press Ctrl+C when the QR code appears, then scan it on your device