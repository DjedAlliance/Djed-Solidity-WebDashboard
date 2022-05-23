import { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { MinimalDjedWrapper } from "../wrapper/wrapper";

const BLOCKCHAIN_URI = "https://rpc-devnet-cardano-evm.c1.milkomeda.com/";
//const CHAIN_ID = 200101;
const DJED_ADDRESS = "0xa5D1ae7052785801f4681De9a9aA13294F1e8D3d";
const ORACLE_ADDRESS = "0xf1E16aC91dC04a9583E45Dc95ef1C41d485eBd84";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [wrapper, setWrapper] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const wrapFn = async () => {
      try {
        const web3 = new Web3(BLOCKCHAIN_URI);
        let minimalDjedWrapper = new MinimalDjedWrapper(
          web3,
          //CHAIN_ID,
          DJED_ADDRESS,
          ORACLE_ADDRESS
        );
        await minimalDjedWrapper.initialize();
        await minimalDjedWrapper.getData();
        setWrapper(minimalDjedWrapper);
      } catch (e) {
        console.error(e);
      }
    };

    wrapFn();
  }, []);

  const connectMetamask = () => {
    console.log("Attempting connection, maybe? Status:", !!accounts.length);
    if (!accounts.length) {
      window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        setAccounts(accounts);
        wrapper.setMetamask(window.ethereum, accounts);
        console.log("Set metamask stuff for wrapper!");
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        wrapper,
        connectMetamask,
        accounts,
        setAccounts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(`useAppProvider must be used within a AppProvider`);
  }
  return context;
};
