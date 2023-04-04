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
  }
];
