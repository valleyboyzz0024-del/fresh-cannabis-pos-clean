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

REM Clear cache
echo Clearing cache...
call npx expo start --clear

echo Press Ctrl+C when the QR code appears, then scan it on your device