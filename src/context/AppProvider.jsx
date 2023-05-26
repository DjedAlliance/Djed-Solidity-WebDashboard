// TODO: Hot reload doesn't automatically reload the page

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
import { BigNumber } from "ethers";

import {
  flintWalletConnector,
  flintWSCConnector,
  metamaskConnector,
  supportedChain
} from "../utils/web3/wagmi";
import { useConnect, useAccount, useNetwork, useSigner, useProvider } from "wagmi";

const AppContext = createContext();
const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID);

export const AppProvider = ({ children }) => {
  const { connect } = useConnect();
  const {
    connector: activeConnector,
    isConnected: isWalletConnected,
    address: account
  } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const [isLoading, setIsLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [djedContract, setDjedContract] = useState(null);
  const [oracleContract, setOracleContract] = useState(null);
  const [coinContracts, setCoinContracts] = useState(null);
  const [decimals, setDecimals] = useState(null);
  const [coinsDetails, setCoinsDetails] = useState(null);
  const [systemParams, setSystemParams] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [coinBudgets, setCoinBudgets] = useState(null);
  useEffect(() => {
    if (!account) return;
    const setUp = async () => {
      await setUpAccountSpecificValues();
    };
    setUp();
  }, [account]);

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
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    init();
  }, []);

  const redirectToMetamask = () => {
    window.open("https://metamask.io/", "_blank");
  };
  const redirectToFlint = () => {
    window.open("https://flint-wallet.com/", "_blank");
  };

  const setUpAccountSpecificValues = async () => {
    if (coinContracts == null) return;
    const accountDetails = await getAccountDetails(
      web3,
      account,
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

  const connectMetamask = () => {
    connect({
      connector: metamaskConnector,
      chainId: supportedChain.id
    });
  };
  const connectFlintWallet = () => {
    // flint doesn't support switchNetwork at the time being
    connect({
      connector: flintWalletConnector
    });
  };
  const connectWSC = async () => {
    connect({
      connector: flintWSCConnector
    });
  };

  useInterval(
    async () => {
      const accountDetails = await getAccountDetails(
        web3,
        account,
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
          isMetamaskWalletInstalled:
            typeof window !== "undefined" ? window?.ethereum?.isMetaMask : false,
          isFlintWalletInstalled:
            typeof window !== "undefined" ? window?.evmproviders?.flint?.isFlint : false,
          isWalletConnected,
          isWrongChain: isWalletConnected && chain?.id !== CHAIN_ID,
          connectMetamask,
          connectFlintWallet,
          connectWSC,
          redirectToMetamask,
          redirectToFlint,
          activeConnector,
          account,
          signer,
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
