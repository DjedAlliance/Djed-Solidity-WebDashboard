import { createContext, useContext, useEffect, useState } from "react";
import {
  getWeb3,
  getDjedContract,
  getOracleContract,
  getCoinContracts,
  getDecimals,
  getCoinDetails,
  getAccountDetails
} from "../utils/ethereum";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // TODO: handle loading and error state
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [djedContract, setDjedContract] = useState(null);
  const [oracleContract, setOracleContract] = useState(null);
  const [coinContracts, setCoinContracts] = useState(null);
  const [decimals, setDecimals] = useState(null);
  const [coinsDetails, setCoinsDetails] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const djed = await getDjedContract(web3);
        const oracle = await getOracleContract(web3);
        const coinContracts = await getCoinContracts(djed, web3);
        const decimals = await getDecimals(
          coinContracts.stableCoin,
          coinContracts.reserveCoin
        );
        const coinsDetails = await getCoinDetails(
          coinContracts.stableCoin,
          coinContracts.reserveCoin,
          djed,
          oracle,
          decimals.scDecimals,
          decimals.rcDecimals
        );
        setWeb3(web3);
        setDjedContract(djed);
        setOracleContract(oracle);
        setCoinContracts(coinContracts);
        setDecimals(decimals);
        setCoinsDetails(coinsDetails);
      } catch (e) {
        console.error(e);
      }
    };

    init();
  }, []);

  const isWalletConnected =
    typeof web3 !== "undefined" &&
    typeof djedContract !== "undefined" &&
    typeof oracleContract !== "undefined" &&
    accounts.length > 0;

  const connectMetamask = async () => {
    try {
      if (!isWalletConnected) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        setAccounts(accounts);
        const accountDetails = await getAccountDetails(
          web3,
          accounts[0],
          coinContracts.stableCoin,
          coinContracts.reserveCoin,
          decimals.scDecimals,
          decimals.rcDecimals
        );
        setAccountDetails(accountDetails);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        web3,
        djedContract,
        oracleContract,
        coinContracts,
        decimals,
        coinsDetails,
        accountDetails,
        isWalletConnected,
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
