import { supportedChains } from "./networks";
import { createClient, createStorage } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { FlintWalletConnector } from "./connectors/flint";
import { getDefaultConfig, MilkomedaNetworkName } from "milkomeda-wsc-ui-test-beta";

const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID);

export const supportedChain =
  supportedChains.find((chain) => chain.id === CHAIN_ID) ?? supportedChains[0];

export const metamaskConnector = new MetaMaskConnector({
  chains: [supportedChain]
});

export const flintWalletConnector = new FlintWalletConnector({
  chains: [supportedChain]
});

export const client = createClient(
  getDefaultConfig({
    oracleUrl: "https://wsc-server-devnet.c1.milkomeda.com",
    blockfrostId: "preprodliMqEQ9cvQgAFuV7b6dhA4lkjTX1eBLb",
    chains: [supportedChain],
    network: MilkomedaNetworkName.C1Devnet,
    autoConnect: false,
    storage: createStorage({
      storage: window.localStorage,
      key: "djed.stablecoin"
    })
  })
);
