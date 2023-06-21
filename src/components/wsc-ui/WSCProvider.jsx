// create a react context
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppProvider } from "../../context/AppProvider";

const WSCContext = createContext({});

export const WSCProvider = ({ children }) => {
  const { activeConnector } = useAppProvider();
  const [wscProvider, setWscProvider] = React.useState(null);

  const [originTokens, setOriginTokens] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [destinationBalance, setDestinationBalance] = useState(null);

  const [originAddress, setOriginAddress] = useState(null);
  const [pendingTxs, setPendingTxs] = useState([]);
  const [address, setAddress] = useState(null);
  const [originBalance, setOriginBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [algorandConnected, setAlgorandConnected] = useState(false);
  const [cardanoConnected, setCardanoConnected] = useState(false);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    if (!activeConnector?.id?.includes("wsc")) return;

    const loadWscProvider = async () => {
      try {
        const provider = await activeConnector.getProvider();
        if (!provider) return;
        const originTokens = await provider.origin_getTokenBalances();
        const tokenBalances = await provider.getTokenBalances();
        const destinationBalance = await provider.eth_getBalance();
        console.log("destinationBalance", destinationBalance);
        setWscProvider(provider);
        setOriginTokens(originTokens);
        setTokens(tokenBalances ?? []);
        setDestinationBalance(destinationBalance);
      } catch (e) {
        console.log(e);
      }
    };
    loadWscProvider();
  }, [activeConnector, wscProvider]);

  return (
    <WSCContext.Provider
      value={{
        wscProvider,
        originAddress,
        setOriginAddress,
        pendingTxs,

        address,
        setAddress,
        destinationBalance,
        setDestinationBalance,
        originBalance,
        setOriginBalance,
        originTokens,
        setOriginTokens,
        tokens,
        setTokens,
        transactions,
        setTransactions,

        algorandConnected,
        setAlgorandConnected,
        cardanoConnected,
        setCardanoConnected,
        network,
        setNetwork
      }}
    >
      {children}
    </WSCContext.Provider>
  );
};

export const useWSCProvider = () => {
  const context = useContext(WSCContext);
  if (!context) {
    throw new Error("useWSCProvider must be used within a WSCProvider");
  }
  return context;
};
