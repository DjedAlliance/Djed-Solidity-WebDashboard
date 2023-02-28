import { createContext, useContext, useEffect, useState } from "react";
import { FullPageSpinner } from "../components/atoms/LoadingIcon/LoadingIcon";
import {
  getWeb3,
  getDjedContract,
  //ORACLE_ADDRESS,
  getOracleAddress,
  getOracleContract,
  getCoinContracts,
  getDecimals,
  getCoinDetails,
  getSystemParams,
  getAccountDetails,
  getCoinBudgets,
  calculateIsRatioBelowMax,
  calculateIsRatioAboveMin,
  calculateFutureScPrice
} from "../utils/ethereum";
import useInterval from "../utils/hooks/useInterval";
import {
  ACCOUNT_DETAILS_REQUEST_INTERVAL,
  COIN_DETAILS_REQUEST_INTERVAL
} from "../utils/constants";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import { BigNumber } from "ethers";
import { web3Promise } from "../utils/helpers";

const AppContext = createContext();
const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID);

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [storedAccounts, setStoredAccounts] = useLocalStorage("accounts", []);
  const [djedContract, setDjedContract] = useState(null);
  const [oracleContract, setOracleContract] = useState(null);
  const [coinContracts, setCoinContracts] = useState(null);
  const [decimals, setDecimals] = useState(null);
  const [coinsDetails, setCoinsDetails] = useState(null);
  const [systemParams, setSystemParams] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [coinBudgets, setCoinBudgets] = useState(null);
  const [isWrongChain, setIsWrongChain] = useState(false);

  useEffect(() => {
    const setUp = async () => {
      await setUpAccountSpecificValues();
    };
    setUp();
  }, [accounts]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const djed = getDjedContract(web3);
        const oracle = await getOracleAddress(djed).then((addr) =>
          getOracleContract(web3, addr, djed._address)
        );
        const coinContracts = await getCoinContracts(djed, web3);
        const decimals = await getDecimals(
          coinContracts.stableCoin,
          coinContracts.reserveCoin
        );
        const coinsDetails = await getCoinDetails(
          coinContracts.stableCoin,
          coinContracts.reserveCoin,
          djed,
          decimals.scDecimals,
          decimals.rcDecimals
        );
        const systemParams = await getSystemParams(djed);
        setWeb3(web3);
        setDjedContract(djed);
        setOracleContract(oracle);
        setCoinContracts(coinContracts);
        setDecimals(decimals);
        setCoinsDetails(coinsDetails);
        setSystemParams(systemParams);
        if (storedAccounts.length > 0) {
          const newAccounts = await window.ethereum.request({
            method: "eth_requestAccounts"
          });
          if (
            storedAccounts.length !== newAccounts.length ||
            storedAccounts[0] !== newAccounts[0]
          ) {
            setAccounts(accounts);
            setStoredAccounts(accounts);
          } else {
            setAccounts(storedAccounts);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
      //console.log("Accs:", accounts);
    };
    setIsLoading(true);
    init();
  }, []);

  const isWalletInstalled = web3 && djedContract && oracleContract;
  const isWalletConnected = isWalletInstalled && accounts.length > 0;

  const redirectToMetamask = () => {
    window.open("https://metamask.io/", "_blank");
  };

  const handleChain = (chainId) => {
    if (chainId !== CHAIN_ID) {
      setIsWrongChain(true);
      console.log("Wrong chain:", chainId, "rather than", CHAIN_ID);
    } else {
      setIsWrongChain(false);
      console.log("Correct chain:", chainId);
    }
  };

  const setUpAccountSpecificValues = async () => {
    if (accounts.length === 0) {
      return;
    }
    window.ethereum
      .request({ method: "eth_chainId" })
      .then((chainId) => handleChain(parseInt(chainId)));
    const accountDetails = await getAccountDetails(
      web3,
      accounts[0],
      coinContracts.stableCoin,
      coinContracts.reserveCoin,
      decimals.scDecimals,
      decimals.rcDecimals
    );
    setAccountDetails(accountDetails);
    const coinBudgets = await getCoinBudgets(
      djedContract,
      accountDetails.unscaledBalanceBc,
      decimals.scDecimals,
      decimals.rcDecimals
    );
    setCoinBudgets(coinBudgets);
  };

  const connectMetamask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setAccounts(accounts);
      setStoredAccounts(accounts);
    } catch (e) {
      console.error(e);
    }
  };

  useInterval(
    async () => {
      const accountDetails = await getAccountDetails(
        web3,
        accounts[0],
        coinContracts.stableCoin,
        coinContracts.reserveCoin,
        decimals.scDecimals,
        decimals.rcDecimals
      );
      setAccountDetails(accountDetails);
      const coinBudgets = await getCoinBudgets(
        djedContract,
        accountDetails.unscaledBalanceBc,
        decimals.scDecimals,
        decimals.rcDecimals
      );
      setCoinBudgets(coinBudgets);
    },
    isWalletConnected ? ACCOUNT_DETAILS_REQUEST_INTERVAL : null
  );

  useInterval(
    async () => {
      const coinsDetails = await getCoinDetails(
        coinContracts.stableCoin,
        coinContracts.reserveCoin,
        djedContract,
        decimals.scDecimals,
        decimals.rcDecimals,
        oracleContract
      );
      setCoinsDetails(coinsDetails);
    },
    isWalletConnected ? COIN_DETAILS_REQUEST_INTERVAL : null
  );

  const isRatioBelowMax = ({ scPrice, reserveBc }) => {
    const scDecimals = BigNumber.from(decimals.scDecimals);
    const totalScSupply = BigNumber.from(coinsDetails?.unscaledNumberSc);
    const reserveRatioMax = BigNumber.from(systemParams?.reserveRatioMaxUnscaled);
    const scDecimalScalingFactor = BigNumber.from(10).pow(scDecimals);
    const thresholdSupplySC = BigNumber.from(systemParams.thresholdSupplySC);
    return calculateIsRatioBelowMax({
      scPrice,
      reserveBc,
      totalScSupply,
      reserveRatioMax,
      scDecimalScalingFactor,
      thresholdSupplySC
    });
  };

  const isRatioAboveMin = ({ scPrice, totalScSupply, reserveBc }) => {
    const scDecimals = BigNumber.from(decimals.scDecimals);
    const reserveRatioMin = BigNumber.from(systemParams?.reserveRatioMinUnscaled);
    const scDecimalScalingFactor = BigNumber.from(10).pow(scDecimals);

    return calculateIsRatioAboveMin({
      scPrice,
      reserveBc,
      totalScSupply,
      reserveRatioMin,
      scDecimalScalingFactor
    });
  };

  /**
   * This function should prepare parameters for calculating future stableCoin price
   * @param {string} amountBC The unscaled amount of BC (e.g. for 1BC, value should be 1 * 10^BC_DECIMALS)
   * @param {string} amountSC The unscaled amount of StableCoin (e.g. for 1SC, value should be 1 * 10^SC_DECIMALS)
   * @returns future stablecoin price as result of calculateFutureScPrice function
   */
  const getFutureScPrice = async ({ amountBC, amountSC }) =>
    calculateFutureScPrice({
      amountBC,
      amountSC,
      djedContract,
      oracleContract,
      stableCoinContract: coinContracts.stableCoin,
      scDecimalScalingFactor: BigNumber.from(10).pow(decimals.scDecimals)
    });

  if (isLoading) {
    return <FullPageSpinner />;
  } else {
    return (
      <AppContext.Provider
        value={{
          web3,
          djedContract,
          oracleContract,
          coinContracts,
          decimals,
          coinsDetails,
          systemParams,
          accountDetails,
          coinBudgets,
          isWalletInstalled,
          isWalletConnected,
          isWrongChain,
          connectMetamask,
          redirectToMetamask,
          accounts,
          setAccounts,
          setStoredAccounts,
          isRatioBelowMax,
          isRatioAboveMin,
          getFutureScPrice
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }
};

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(`useAppProvider must be used within a AppProvider`);
  }
  return context;
};
