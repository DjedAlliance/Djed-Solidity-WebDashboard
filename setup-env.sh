#!/bin/bash

# Djed Dashboard Environment Switcher
# This script helps you quickly switch between different Djed deployment configurations

echo "🔧 Djed Dashboard - Environment Configuration"
echo "=============================================="
echo ""
echo "Available environments:"
echo "  1) Djed Tefnut - Sepolia Testnet (sepolia-tefnut.env)"
echo "  2) Djed Osiris - Sepolia Testnet (sepolia.env)"
echo "  3) Milkomeda C1 - Mainnet (milkomeda.env)"
echo "  4) Milkomeda C1 - Testnet (milkomeda-testnet.env)"
echo "  5) Ethereum Classic - Mainnet (ethereum-classic.env)"
echo "  6) Mordor - Testnet (mordor.env)"
echo ""
read -p "Select environment (1-6): " choice

case $choice in
  1)
    ENV_FILE="env/sepolia-tefnut.env"
    NAME="Djed Tefnut - Sepolia Testnet"
    ;;
  2)
    ENV_FILE="env/sepolia.env"
    NAME="Djed Osiris - Sepolia Testnet"
    ;;
  3)
    ENV_FILE="env/milkomeda.env"
    NAME="Milkomeda C1 - Mainnet"
    ;;
  4)
    ENV_FILE="env/milkomeda-testnet.env"
    NAME="Milkomeda C1 - Testnet"
    ;;
  5)
    ENV_FILE="env/ethereum-classic.env"
    NAME="Ethereum Classic - Mainnet"
    ;;
  6)
    ENV_FILE="env/mordor.env"
    NAME="Mordor - Testnet"
    ;;
  *)
    echo "❌ Invalid choice. Exiting."
    exit 1
    ;;
esac

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found!"
  exit 1
fi

cp "$ENV_FILE" .env
echo "✅ Environment configured: $NAME"
echo "📄 Configuration copied from: $ENV_FILE"
echo ""
echo "You can now start the development server with: npm start"
