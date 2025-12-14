# Djed Tefnut - Sepolia Deployment Guide

This document provides instructions for connecting the Djed Dashboard frontend to the **Djed Tefnut** protocol deployed on the Sepolia testnet.

## What is Djed Tefnut?

Djed Tefnut is the latest version of the Djed protocol, a formally verified crypto-backed algorithmic stablecoin. The Tefnut specification includes improvements and updates to the original Djed protocol.

## Quick Start

### 1. Configure Environment

Copy the Tefnut configuration file to use the Sepolia deployment:

```bash
# Linux/Mac
cp env/sepolia-tefnut.env .env

# Windows (PowerShell)
Copy-Item env\sepolia-tefnut.env .env

# Or use the setup script
./setup-env.sh  # Linux/Mac
setup-env.bat   # Windows
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

The dashboard will be available at http://localhost:3000

## Configuration Details

The Tefnut Sepolia configuration (`env/sepolia-tefnut.env`) includes:

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **Stablecoin**: Djed Tefnut Dollar (DJED)
- **Reserve Coin**: Shen Reserve Coin (SHEN)
- **Djed Contract Address**: `0x624FcD0a1F9B5820c950FefD48087531d38387f4`
- **Stablecoin Address**: `0x6b930182787F346F18666D167e8d32166dC5eFBD`
- **Reserve Coin Address**: `0xc61ac381F4F585fd194D3C5cE20B76826b960e5E`

## Wallet Setup

### Connect to Sepolia Testnet

1. Open MetaMask (or your preferred Web3 wallet)
2. Add Sepolia network if not already added:
   - **Network Name**: Sepolia Testnet
   - **RPC URL**: `https://ethereum-sepolia.publicnode.com/`
   - **Chain ID**: 11155111
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://sepolia.etherscan.io/

### Get Test ETH

To interact with the protocol, you'll need Sepolia ETH:

1. Visit a Sepolia faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://faucet.quicknode.com/ethereum/sepolia

2. Enter your wallet address and request test ETH

## Features

The Djed Tefnut dashboard allows you to:

- **View Protocol Health**: Monitor reserve ratio, stability status, and system parameters
- **Mint Stablecoins (DJED)**: Exchange ETH for DJED stablecoins
- **Redeem Stablecoins**: Convert DJED back to ETH
- **Mint Reserve Coins (SHEN)**: Participate in the reserve mechanism
- **Redeem Reserve Coins**: Exchange SHEN for ETH

## Differences from Djed Osiris

Djed Tefnut includes several improvements over the previous Osiris implementation:

- Updated tokenomics and fee structure
- Enhanced reserve ratio management
- Improved oracle integration
- Optimized gas efficiency

## Troubleshooting

### Connection Issues

If you can't connect to the protocol:

1. Verify you're on the Sepolia testnet
2. Check that your wallet has sufficient Sepolia ETH
3. Clear your browser cache and reload the page
4. Ensure the `.env` file is correctly configured

### Transaction Failures

Common reasons for transaction failures:

- **Insufficient Balance**: Ensure you have enough Sepolia ETH
- **Reserve Ratio Out of Range**: The protocol may temporarily restrict certain operations
- **Slippage**: Price movements between transaction submission and execution
- **Gas Price Too Low**: Increase gas settings in your wallet

## Resources

- **Djed Protocol Documentation**: https://docs.djed.one
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Discord Community**: https://discord.gg/9SXM4jka
- **Twitter/X**: https://x.com/DjedStablecoin

## Support

For issues or questions:

1. Check the main [README](../README.md) for general setup instructions
2. Open an issue on GitHub: https://github.com/DjedAlliance/Djed-Solidity-WebDashboard/issues
3. Join our Discord: https://discord.gg/9SXM4jka

## Contract Verification

All Djed Tefnut contracts are verified on Sepolia Etherscan:

- [Djed Contract](https://sepolia.etherscan.io/address/0x624FcD0a1F9B5820c950FefD48087531d38387f4)
- [DJED Token](https://sepolia.etherscan.io/address/0x6b930182787F346F18666D167e8d32166dC5eFBD)
- [SHEN Token](https://sepolia.etherscan.io/address/0xc61ac381F4F585fd194D3C5cE20B76826b960e5E)
