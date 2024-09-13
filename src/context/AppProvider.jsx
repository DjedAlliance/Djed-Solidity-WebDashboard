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
  calculateFutureScPrice,
  getDjedShuContract,
  getShuOracleContract,
  getShuCoinDetails,
  calculateFutureMinScPrice,
  calculateFutureMaxScPrice
} from "../utils/ethereum";
import useInterval from "../utils/hooks/useInterval";
import {
  ACCOUNT_DETAILS_REQUEST_INTERVAL,
  COIN_DETAILS_REQUEST_INTERVAL
} from "../utils/constants";
import { BigNumber } from "ethers";

import {
  flintWalletConnector,
  metamaskConnector,
  supportedChain
} from "../utils/web3/wagmi";
import { useConnect, useAccount, useNetwork, useSigner } from "wagmi";

const AppContext = createContext();
export const CHAIN_ID = Number(process.env.REACT_APP_CHAIN_ID);

export const AppProvider = ({ children }) => {
  const { connect, connectors } = useConnect();
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
  const [isShu, setShu] = useState(process.env.REACT_APP_SHU_VERSION);
  const [decimals, setDecimals] = useState(null);
  const [coinsDetails, setCoinsDetails] = useState(null);
  const [systemParams, setSystemParams] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [coinBudgets, setCoinBudgets] = useState(null);
  const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  useEffect(() => {
    if (!account) return;
    const setUp = async () => {
      await setUpAccountSpecificValues();
    };
    setUp();
    // TODO: React Hook useEffect has a missing dependency: 'setUpAccountSpecificValues'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
    // eslint-disable-next-line
  }, [account]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const djed = isShu ? getDjedShuContract(web3) : getDjedContract(web3);
        const oracle = await getOracleAddress(djed).then((addr) =>
          isShu
            ? getShuOracleContract(web3, addr, djed._address)
            : getOracleContract(web3, addr, djed._address)
        );
        const coinContracts = await getCoinContracts(djed, web3);
        const decimals = await getDecimals(
          coinContracts.stableCoin,
          coinContracts.reserveCoin
        );
        const coinsDetails = isShu
          ? await getShuCoinDetails(
              coinContracts.stableCoin,
              coinContracts.reserveCoin,
              djed,
              decimals.scDecimals,
              decimals.rcDecimals
            )
          : await getCoinDetails(
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
  const redirectToEternl = () => {
    window.open("https://eternl.io/", "_blank");
  };
  const redirectToNami = () => {
    window.open("https://namiwallet.io/", "_blank");
  };
  const redirectToNufi = () => {
    window.open("https://nu.fi/", "_blank");
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
  const connectToEternlWSC = () => {
    const etrnalWSCConnector = connectors.find(
      (connector) => connector.id === "eternl-wsc"
    );
    if (!etrnalWSCConnector) return;
    connect({
      connector: etrnalWSCConnector
    });
  };

  const connectToNamiWSC = () => {
    const namiWSCConnector = connectors.find((connector) => connector.id === "nami-wsc");
    if (!namiWSCConnector) return;
    connect({
      connector: namiWSCConnector
    });
  };

  const connectToNufiWSC = () => {
    const nufiWSCConnector = connectors.find((connector) => connector.id === "nufi-wsc");
    if (!nufiWSCConnector) return;
    connect({
      connector: nufiWSCConnector
    });
  };

  const connectFlintWallet = () => {
    // flint doesn't support switchNetwork at the time being
    connect({
      connector: flintWalletConnector
    });
  };
  const connectToFlintWSC = async () => {
    const flintWSCConnector = connectors.find(
      (connector) => connector.id === "flint-wsc"
    );
    connect({
      connector: flintWSCConnector
    });
  };

  useInterval(
    async () => {
      if (coinContracts == null || !isVisible) return;
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
    isWalletConnected && isVisible ? ACCOUNT_DETAILS_REQUEST_INTERVAL : null
  );

  useInterval(
    async () => {
      if (coinContracts == null || !isVisible) return;
      const coinsDetails = isShu
        ? await getShuCoinDetails(
            coinContracts.stableCoin,
            coinContracts.reserveCoin,
            djedContract,
            decimals.scDecimals,
            decimals.rcDecimals
          )
        : await getCoinDetails(
            coinContracts.stableCoin,
            coinContracts.reserveCoin,
            djedContract,
            decimals.scDecimals,
            decimals.rcDecimals
          );
      setCoinsDetails(coinsDetails);
    },
    isWalletConnected && isVisible ? COIN_DETAILS_REQUEST_INTERVAL : null
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
  const getFuturePrice = async ({ amountBC, amountSC, method }) => {
    return method({
      amountBC,
      amountSC,
      djedContract,
      oracleContract,
      stableCoinContract: coinContracts.stableCoin,
      scDecimalScalingFactor: BigNumber.from(10).pow(decimals.scDecimals)
    });
  };

  const getFutureScPrice = async (params) =>
    getFuturePrice({ ...params, method: calculateFutureScPrice });
  const getFutureMinScPrice = async (params) =>
    getFuturePrice({ ...params, method: calculateFutureMinScPrice });
  const getFutureMaxScPrice = async (params) =>
    getFuturePrice({ ...params, method: calculateFutureMaxScPrice });

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
          isShu,
          isMetamaskWalletInstalled:
            typeof window !== "undefined" ? window?.ethereum?.isMetaMask : false,
          isFlintWalletInstalled:
            typeof window !== "undefined" ? window?.evmproviders?.flint?.isFlint : false,
          isEternlWalletInstalled:
            typeof window !== "undefined" ? window?.cardano?.eternl : false,
          isNamiWalletInstalled:
            typeof window !== "undefined" ? window?.cardano?.nami : false,
          isNufiWalletInstalled:
            typeof window !== "undefined" ? window?.cardano?.nufi : false,
          isWalletConnected,
          isWrongChain: isWalletConnected && chain?.id !== CHAIN_ID,
          connectMetamask,
          connectFlintWallet,
          connectToNamiWSC,
          connectToNufiWSC,
          connectToEternlWSC,
          connectToFlintWSC,
          redirectToMetamask,
          redirectToFlint,
          redirectToEternl,
          redirectToNami,
          redirectToNufi,
          activeConnector,
          account,
          signer,
          isRatioBelowMax,
          isRatioAboveMin,
          getFutureScPrice,
          getFutureMinScPrice,
          getFutureMaxScPrice
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
