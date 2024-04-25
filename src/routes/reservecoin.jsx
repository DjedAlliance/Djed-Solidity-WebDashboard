import React, { useState } from "react";
import MetamaskConnectButton from "../components/molecules/MetamaskConnectButton/MetamaskConnectButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";
import OperationSelector from "../components/organisms/OperationSelector/OperationSelector";
import ModalTransaction from "../components/organisms/Modals/ModalTransaction";
import ModalPending from "../components/organisms/Modals/ModalPending";
import BuySellButton from "../components/molecules/BuySellButton/BuySellButton";

import "./_CoinSection.scss";
import { useAppProvider } from "../context/AppProvider";
import useBuyOrSell from "../utils/hooks/useBuyOrSell";
import { TRANSACTION_VALIDITY } from "../utils/constants";
import {
  calculateBcUsdEquivalent,
  calculateRcUsdEquivalent,
  getRcUsdEquivalent,
  stringToBigNumber,
  validatePositiveNumber
} from "../utils/helpers";
import {
  buyRcTx,
  promiseTx,
  sellRcTx,
  tradeDataPriceBuyRc,
  tradeDataPriceSellRc,
  checkBuyableRc,
  checkSellableRc,
  verifyTx,
  BC_DECIMALS,
  calculateTxFees,
  isTxLimitReached,
  DJED_ADDRESS,
  FEE_UI_UNSCALED,
  UI
} from "../utils/ethereum";
import { BigNumber, ethers } from "ethers";
import {
  ConnectWSCButton,
  TransactionConfigWSCProvider,
  useWSCProvider,
  useModal as useWSCModal
} from "milkomeda-wsc-ui-test-beta";
import djedArtifact from "../artifacts/Djed.json";
import { useAccount } from "wagmi";

export default function ReserveCoin() {
  const {
    web3,
    isWalletConnected,
    isWrongChain,
    djedContract,
    coinsDetails,
    decimals,
    accountDetails,
    coinBudgets,
    account,
    signer,
    systemParams,
    isRatioBelowMax,
    isRatioAboveMin,
    coinContracts,
    getFutureScPrice
  } = useAppProvider();
  const { isWSCConnected } = useWSCProvider();
  const { setOpen } = useWSCModal();
  const { buyOrSell, isBuyActive, setBuyOrSell } = useBuyOrSell();
  const [tradeData, setTradeData] = useState({});
  const [value, setValue] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txStatus, setTxStatus] = useState("idle");
  const [buyValidity, setBuyValidity] = useState(
    TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED
  );
  const [sellValidity, setSellValidity] = useState(
    TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED
  );

  const txStatusPending = txStatus === "pending";
  const txStatusRejected = txStatus === "rejected";
  const txStatusSuccess = txStatus === "success";

  const updateBuyTradeData = (amountScaled) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
      setBuyValidity(inputSanity);
      return;
    }
    const getTradeData = async () => {
      try {
        const data = await tradeDataPriceBuyRc(
          djedContract,
          decimals.rcDecimals,
          amountScaled
        );
        const futureSCPrice = await getFutureScPrice({
          amountBC: data.totalUnscaled,
          amountSC: 0
        });

        const { f } = calculateTxFees(data.totalUnscaled, systemParams?.feeUnscaled, 0);
        const isRatioBelowMaximum = isRatioBelowMax({
          scPrice: BigNumber.from(futureSCPrice),
          reserveBc: BigNumber.from(coinsDetails?.unscaledReserveBc).add(
            BigNumber.from(data.totalUnscaled).add(f)
          )
        });
        const bcUsdEquivalent = calculateBcUsdEquivalent(
          coinsDetails,
          parseFloat(data.totalScaled.replaceAll(",", ""))
        ).replaceAll(",", "");

        setTradeData(data);
        if (!isWalletConnected) {
          setBuyValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setBuyValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (
          isTxLimitReached(
            bcUsdEquivalent,
            coinsDetails.unscaledNumberSc,
            systemParams.thresholdSupplySC
          )
        ) {
          setBuyValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (
          stringToBigNumber(accountDetails.unscaledBalanceBc, BC_DECIMALS).lt(
            stringToBigNumber(data.totalBCUnscaled, BC_DECIMALS)
          )
        ) {
          setBuyValidity(TRANSACTION_VALIDITY.INSUFFICIENT_BC);
        } else if (!isRatioBelowMaximum) {
          setBuyValidity(TRANSACTION_VALIDITY.RESERVE_RATIO_HIGH);
        } else {
          checkBuyableRc(
            djedContract,
            data.amountUnscaled,
            coinBudgets?.unscaledBudgetRc
          ).then((res) => setBuyValidity(res));
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    getTradeData();
  };

  const updateSellTradeData = (amountScaled) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
      setSellValidity(inputSanity);
      return;
    }
    const getTradeData = async () => {
      try {
        const data = await tradeDataPriceSellRc(
          djedContract,
          decimals.rcDecimals,
          amountScaled
        );
        const rcUsdEquivalent = calculateRcUsdEquivalent(
          coinsDetails,
          parseFloat(data.amountScaled.replaceAll(",", ""))
        ).replaceAll(",", "");
        const futureSCPrice = await getFutureScPrice({
          amountBC: data.totalUnscaled,
          amountSC: 0
        });
        const { f } = calculateTxFees(data.totalUnscaled, systemParams?.feeUnscaled, 0);
        const isRatioAboveMinimum = isRatioAboveMin({
          totalScSupply: BigNumber.from(coinsDetails?.unscaledNumberSc),
          scPrice: BigNumber.from(futureSCPrice),
          reserveBc: BigNumber.from(coinsDetails?.unscaledReserveBc).sub(
            BigNumber.from(data.totalUnscaled).sub(f)
          )
        });

        setTradeData(data);
        if (!isWalletConnected) {
          setSellValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setSellValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (
          isTxLimitReached(
            rcUsdEquivalent,
            coinsDetails.unscaledNumberSc,
            systemParams.thresholdSupplySC
          )
        ) {
          setSellValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (
          stringToBigNumber(accountDetails.unscaledBalanceRc, decimals.rcDecimals).lt(
            stringToBigNumber(data.amountUnscaled, decimals.rcDecimals)
          )
        ) {
          setSellValidity(TRANSACTION_VALIDITY.INSUFFICIENT_RC);
        } else if (!isRatioAboveMinimum) {
          setSellValidity(TRANSACTION_VALIDITY.RESERVE_RATIO_LOW);
        } else {
          checkSellableRc(
            djedContract,
            data.amountUnscaled,
            accountDetails?.unscaledBalanceRc
          ).then((res) => setSellValidity(res));
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    getTradeData();
  };

  const onChangeBuyInput = (amountScaled) => {
    setValue(amountScaled);
    updateBuyTradeData(amountScaled);
  };

  const onChangeSellInput = (amountScaled) => {
    setValue(amountScaled);
    updateSellTradeData(amountScaled);
  };

  const buyRc = (total) => {
    console.log("Attempting to buy RC for", total);
    setTxStatus("pending");
    // TODO: pass to buyRcTx a parameter to enforce gasLimit if we are using WSC
    promiseTx(isWalletConnected, buyRcTx(djedContract, account, total), signer)
      .then(({ hash }) => {
        verifyTx(web3, hash).then((res) => {
          if (res) {
            console.log("Buy RC success!");
            setTxStatus("success");
          } else {
            console.log("Buy RC reverted!");
            setTxError("The transaction reverted.");
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Error:", err.message);
        setTxStatus("rejected");
        setTxError("MetaMask error. See developer console for details.");
      });
  };

  const sellRc = (amount) => {
    console.log("Attempting to sell RC in amount", amount);
    setTxStatus("pending");
    promiseTx(isWalletConnected, sellRcTx(djedContract, account, amount), signer)
      .then(({ hash }) => {
        verifyTx(web3, hash).then((res) => {
          console.log(hash, "hash");
          if (res) {
            console.log("Sell RC success!", hash);
            setTxStatus("success");
          } else {
            console.log("Sell RC reverted!");
            setTxError("The transaction reverted.");
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Error:", err.message);
        setTxStatus("rejected");
        setTxError("MetaMask error. See developer console for details.");
      });
  };

  const tradeFxn = isBuyActive
    ? buyRc.bind(null, tradeData.totalBCUnscaled)
    : sellRc.bind(null, tradeData.amountUnscaled);

  const currentAmount = isBuyActive
    ? tradeData.totalBCUnscaled
    : tradeData.amountUnscaled;

  const onSubmit = (e) => {
    if (!isWalletConnected) return;
    if (!termsAccepted) return;
    e.preventDefault();
    if (isWSCConnected) {
      setOpen(true);
      return;
    }
    tradeFxn();
  };

  const transactionValidated = isBuyActive
    ? buyValidity === TRANSACTION_VALIDITY.OK
    : sellValidity === TRANSACTION_VALIDITY.OK;

  const buttonDisabled = isNaN(parseInt(value)) || parseInt(value) === 0 || isWrongChain || !transactionValidated;

  const rcFloat = parseFloat(coinsDetails?.scaledNumberRc.replaceAll(",", ""));
  const rcConverted = getRcUsdEquivalent(coinsDetails, rcFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>ReserveCoin {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              A ReserveCoin represents a portion of the surplus of the underlying reserves
              of {process.env.REACT_APP_CHAIN_COIN} in the Djed protocol. As such,
              ReserveCoins have a leveraged volatile price that increases when the price
              of {process.env.REACT_APP_CHAIN_COIN} increases and decreases when the price
              of {process.env.REACT_APP_CHAIN_COIN} decreases. Furthermore, ReserveCoin
              holders ultimately benefit from fees paid to the Djed protocol, since most
              fees are accumulated into the reserve and hence contribute to the reserve
              surplus.
            </p>
            <p>
              You are allowed to buy ReserveCoins, as long as the reserve ratio remains
              below the maximum of {systemParams?.reserveRatioMax}. This prevents
              excessive dilution of previous ReserveCoin holders. This restriction only
              applies when the StableCoin supply is above 500000.
            </p>
            <p>
              You are allowed to sell ReserveCoins, as long as the reserve ratio remains
              above the minimum of {systemParams?.reserveRatioMin}. This aims to ensure
              that all StableCoins remain sufficiently backed.
            </p>
            <p>
              There is a limit of {process.env.REACT_APP_LIMIT_PER_TXN} USD worth of{" "}
              {process.env.REACT_APP_CHAIN_COIN} per transaction.
            </p>
            <p>
              ReserveCoins are implemented as a standard ERC-20 token contract and the
              contract's address is{" "}
              <a
                href={`${process.env.REACT_APP_MILKOMEDA_C1_EXPLORER}address/${coinContracts?.reserveCoin._address}`}
                target="_blank"
                rel="noreferrer"
              >
                {coinContracts?.reserveCoin._address}
              </a>
              .
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-two.png"
            coinName={`${process.env.REACT_APP_RC_NAME}`}
            priceAmount={coinsDetails?.scaledBuyPriceRc}
            sellPriceAmount={coinsDetails?.scaledSellPriceRc}
            circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
            tokenName={`${process.env.REACT_APP_RC_SYMBOL}`}
            equivalence={rcConverted}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>
              Buy <>&amp;</> Sell
            </strong>{" "}
            {process.env.REACT_APP_RC_NAME}
          </h2>
          <form onSubmit={onSubmit}>
            <div className="PurchaseContainer">
              <OperationSelector
                coinName={`${process.env.REACT_APP_RC_SYMBOL}`}
                selectionCallback={() => {
                  setBuyOrSell();
                  setValue(null);
                  setBuyValidity(TRANSACTION_VALIDITY.ZERO_INPUT);
                  setSellValidity(TRANSACTION_VALIDITY.ZERO_INPUT);
                }}
                onChangeBuyInput={onChangeBuyInput}
                onChangeSellInput={onChangeSellInput}
                tradeData={tradeData}
                inputValue={value}
                inputValid={transactionValidated}
                scaledCoinBalance={accountDetails?.scaledBalanceRc}
                scaledBaseBalance={accountDetails?.scaledBalanceBc}
                fee={systemParams?.fee}
                treasuryFee={systemParams?.treasuryFee}
                buyValidity={buyValidity}
                sellValidity={sellValidity}
                isSellDisabled={Number(coinsDetails?.scaledNumberRc) === 0}
              />
            </div>
            <input
              type="checkbox"
              id="accept-terms"
              name="accept-terms"
              onChange={() => setTermsAccepted(!termsAccepted)}
              checked={termsAccepted}
              required
            />
            <label htmlFor="accept-terms" className="accept-terms">
              I agree to the{" "}
              <a href="/terms-of-use" target="_blank" rel="noreferrer">
                Terms of Use
              </a>
              .
            </label>

            <div className="ConnectWallet">
              <br />
              {isWalletConnected ? (
                <>
                  {/*value != null ? (
                  <p className="Disclaimer">
                    This transaction is expected to{" "}
                    {transactionValidated ? (
                      <strong>succeed.</strong>
                    ) : (
                      <strong>fail!</strong>
                    )}
                  </p>
                    ) : null*/}
                  {isWSCConnected ? (
                    <WSCButton
                      disabled={value === null || isWrongChain || !termsAccepted}
                      currentAmount={currentAmount}
                      stepTxDirection={isBuyActive ? "buy" : "sell"}
                      unwrapAmount={
                        isBuyActive ? tradeData.amountUnscaled : tradeData.totalBCUnscaled
                      }
                    />
                  ) : (
                    <BuySellButton
                      disabled={buttonDisabled}
                      buyOrSell={buyOrSell}
                      currencyName={`${process.env.REACT_APP_RC_SYMBOL}`}
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="Disclaimer">
                    In order to interact, you need to connect your wallet.
                  </p>
                  <MetamaskConnectButton />
                </>
              )}
            </div>
          </form>

          {txStatusRejected && (
            <ModalTransaction
              transactionType="Failed Transaction"
              transactionStatus="/transaction-failed.svg"
              statusText="Failed transaction!"
              statusDescription={txError}
            />
          )}
          {txStatusPending ? (
            <ModalPending
              transactionType="Confirmation"
              transactionStatus="/transaction-success.svg"
              statusText="Pending for confirmation"
              statusDescription="This transaction can take a while, once the process finish you will see the transaction reflected in your wallet."
            />
          ) : txStatusSuccess ? (
            <ModalTransaction
              transactionType="Success Transaction"
              transactionStatus="/transaction-success.svg"
              statusText="Succesful transaction!"
              statusDescription=""
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

const WSCButton = ({ disabled, currentAmount, unwrapAmount, stepTxDirection }) => {
  const { address: account } = useAccount();

  const buyOptions = {
    defaultWrapToken: {
      unit: "lovelace",
      amount: currentAmount
    },
    defaultUnwrapToken: {
      unit: process.env.REACT_APP_EVM_RESERVECOIN_ADDRESS,
      amount: unwrapAmount // amountUnscaled
    },
    titleModal: "Buy RC with WSC",
    evmTokenAddress: process.env.REACT_APP_EVM_RESERVECOIN_ADDRESS,
    evmContractRequest: {
      address: DJED_ADDRESS,
      abi: djedArtifact.abi,
      functionName: "buyReserveCoins", //account, FEE_UI_UNSCALED, UI
      args: [account, FEE_UI_UNSCALED, UI],
      overrides: {
        value: ethers.BigNumber.from(currentAmount ?? "0")
      }
    }
  };

  const sellOptions = {
    defaultWrapToken: {
      unit: process.env.REACT_APP_CARDANO_RESERVECOIN_ADDRESS,
      amount: currentAmount
    },
    defaultUnwrapToken: {
      unit: "",
      amount: unwrapAmount // totalBCUnscaled
    },
    titleModal: "Sell RC with WSC",
    evmTokenAddress: process.env.REACT_APP_EVM_RESERVECOIN_ADDRESS,
    evmContractRequest: {
      address: DJED_ADDRESS,
      abi: djedArtifact.abi,
      functionName: "sellReserveCoins", //amount, account, FEE_UI_UNSCALED, UI
      args: [currentAmount, account, FEE_UI_UNSCALED, UI],
      overrides: {
        value: "0"
      }
    }
  };

  return (
    <TransactionConfigWSCProvider
      options={stepTxDirection === "buy" ? buyOptions : sellOptions}
    >
      <ConnectWSCButton disabled={disabled} />
    </TransactionConfigWSCProvider>
  );
};
