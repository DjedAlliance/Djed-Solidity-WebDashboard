export const supportedChains = [
  {
    id: 200101,
    name: "Milkomeda C1 Testnet",
    network: "Milkomeda C1 Testnet",
    nativeCurrency: {
      name: "milkTAda",
      symbol: "mTAda",
      decimals: 18
    },
    rpcUrls: {
      public: { http: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"] },
      default: { http: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"] }
    },
    blockExplorers: {
      etherscan: { name: "", url: "" },
      default: {
        name: "",
        url: "https://explorer-devnet-cardano-evm.c1.milkomeda.com"
      }
    }
  },
  {
    id: 2001,
    name: "Milkomeda C1 Mainnet",
    network: "Milkomeda C1 Mainnet",
    nativeCurrency: {
      name: "milkAda",
      symbol: "mADA",
      decimals: 18
    },
    rpcUrls: {
      public: { http: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"] },
      default: { http: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"] }
    },
    blockExplorers: {
      etherscan: { name: "", url: "" },
      default: {
        name: "",
        url: "https://explorer-mainnet-cardano-evm.c1.milkomeda.com"
      }
    }
  },
  {
    id: 11155111,
    name: "Sepolia Testnet",
    network: "Sepolia Testnet",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "SepoliaETH",
      decimals: 18
    },
    rpcUrls: {
      public: { http: ["https://sepolia.infura.io/v3/"] },
      default: { http: ["https://sepolia.infura.io/v3/"] }
    },
    blockExplorers: {
      etherscan: { name: "", url: "https://sepolia.etherscan.io/" }
    }
  },
  {
    id: 63,
    name: "Ethereum Classic Mordor",
    network: "Ethereum Classic Mordor",
    nativeCurrency: {
      name: "METC",
      symbol: "METC",
      decimals: 18
    },
    rpcUrls: {
      public: { http: ["https://rpc.mordor.etccooperative.org/"] },
      default: { http: ["https://rpc.mordor.etccooperative.org/"] }
    },
    blockExplorers: {
      etherscan: { name: "", url: "" },
      default: {
        name: "Blockscout",
        url: "https://etc-mordor.blockscout.com/"
      }
    }
  }
];
