import { supportedChains } from "./networks";
import { configureChains, createClient, createStorage } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { FlintWalletConnector } from "./connectors/flint";
import { CardanoWSCConnector } from "./connectors/cardano-wsc";

const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID);

export const supportedChain =
  supportedChains.find((chain) => chain.id === CHAIN_ID) ?? supportedChains[0];

const { provider, webSocketProvider } = configureChains(
  [supportedChain],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: process.env.REACT_APP_BLOCKCHAIN_URI ?? ""
      })
    })
  ]
);

export const metamaskConnector = new MetaMaskConnector({
  chains: [supportedChain]
});

export const flintWalletConnector = new FlintWalletConnector({
  chains: [supportedChain]
});
export const flintWSCConnector = new CardanoWSCConnector({
  chains: [supportedChain],
  walletName: "flint"
});

export const eternlWSCConnector = new CardanoWSCConnector({
  chains: [supportedChain],
  walletName: "eternl"
});

export const client = createClient({
  autoConnect: true,
  storage: createStorage({
    storage: window.localStorage,
    key: "djed.stablecoin"
  }),

  provider,
  webSocketProvider
});
