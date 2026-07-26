@echo off
REM Djed Dashboard Environment Switcher (Windows)
REM This script helps you quickly switch between different Djed deployment configurations

echo.
echo Djed Dashboard - Environment Configuration
echo ==============================================
echo.
echo Available environments:
echo   1^) Djed Tefnut - Sepolia Testnet ^(sepolia-tefnut.env^)
echo   2^) Djed Osiris - Sepolia Testnet ^(sepolia.env^)
echo   3^) Milkomeda C1 - Mainnet ^(milkomeda.env^)
echo   4^) Milkomeda C1 - Testnet ^(milkomeda-testnet.env^)
echo   5^) Ethereum Classic - Mainnet ^(ethereum-classic.env^)
echo   6^) Mordor - Testnet ^(mordor.env^)
echo.
set /p choice="Select environment (1-6): "

if "%choice%"=="1" (
    set ENV_FILE=env\sepolia-tefnut.env
    set NAME=Djed Tefnut - Sepolia Testnet
) else if "%choice%"=="2" (
    set ENV_FILE=env\sepolia.env
    set NAME=Djed Osiris - Sepolia Testnet
) else if "%choice%"=="3" (
    set ENV_FILE=env\milkomeda.env
    set NAME=Milkomeda C1 - Mainnet
) else if "%choice%"=="4" (
    set ENV_FILE=env\milkomeda-testnet.env
    set NAME=Milkomeda C1 - Testnet
) else if "%choice%"=="5" (
    set ENV_FILE=env\ethereum-classic.env
    set NAME=Ethereum Classic - Mainnet
) else if "%choice%"=="6" (
    set ENV_FILE=env\mordor.env
    set NAME=Mordor - Testnet
) else (
    echo Invalid choice. Exiting.
    exit /b 1
)

if not exist "%ENV_FILE%" (
    echo Error: %ENV_FILE% not found!
    exit /b 1
)

copy "%ENV_FILE%" .env >nul
echo.
echo Environment configured: %NAME%
echo Configuration copied from: %ENV_FILE%
echo.
echo You can now start the development server with: npm start
