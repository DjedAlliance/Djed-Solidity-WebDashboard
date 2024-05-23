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
  getScAdaEquivalent,
  stringToBigNumber,
  validatePositiveNumber
} from "../utils/helpers";
import {
  buyScTx,
  promiseTx,
  sellScTx,
  tradeDataPriceBuySc,
  tradeDataPriceSellSc,
  checkBuyableSc,
  checkSellableSc,
  verifyTx,
  BC_DECIMALS,
  calculateTxFees,
  isTxLimitReached,
  DJED_ADDRESS,
  FEE_UI_UNSCALED,
  UI
} from "../utils/ethereum";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import djedArtifact from "../artifacts/Djed.json";
import {
  ConnectWSCButton,
  TransactionConfigWSCProvider,
  useModal as useWSCModal,
  useWSCProvider
} from "milkomeda-wsc-ui-test-beta";

export default function Stablecoin() {
  const {
    web3,
    isWalletConnected,
    isWrongChain,
    coinsDetails,
    djedContract,
    decimals,
    accountDetails,
    coinBudgets,
    account,
    signer,
    systemParams,
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
        const data = await tradeDataPriceBuySc(
          djedContract,
          decimals.scDecimals,
          amountScaled
        );

        const futureSCPrice = await getFutureScPrice({
          amountBC: data.totalUnscaled,
          amountSC: data.amountUnscaled
        });
        const { f } = calculateTxFees(data.totalUnscaled, systemParams?.feeUnscaled, 0);
        const isRatioAboveMinimum = isRatioAboveMin({
          totalScSupply: BigNumber.from(coinsDetails?.unscaledNumberSc).add(
            BigNumber.from(data.amountUnscaled)
          ),
          scPrice: BigNumber.from(futureSCPrice),
          reserveBc: BigNumber.from(coinsDetails?.unscaledReserveBc).add(
            BigNumber.from(data.totalUnscaled).add(f)
          )
        });

        setTradeData(data);
        if (!isWalletConnected) {
          setBuyValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setBuyValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (
          isTxLimitReached(
            amountScaled,
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
        } else if (!isRatioAboveMinimum) {
          setBuyValidity(TRANSACTION_VALIDITY.RESERVE_RATIO_LOW);
        } else {
          checkBuyableSc(
            djedContract,
            data.amountUnscaled,
            coinBudgets?.unscaledBudgetSc
          ).then((res) => {
            setBuyValidity(res);
          });
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
        const data = await tradeDataPriceSellSc(
          djedContract,
          decimals.scDecimals,
          amountScaled
        );
        setTradeData(data);
        if (!isWalletConnected) {
          setSellValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setSellValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (
          isTxLimitReached(
            amountScaled,
            coinsDetails.unscaledNumberSc,
            systemParams.thresholdSupplySC
          )
        ) {
          setSellValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (
          stringToBigNumber(accountDetails.unscaledBalanceSc, decimals.scDecimals).lt(
            stringToBigNumber(data.amountUnscaled, decimals.scDecimals)
          )
        ) {
          setSellValidity(TRANSACTION_VALIDITY.INSUFFICIENT_SC);
        } else {
          checkSellableSc(data.amountUnscaled, accountDetails?.unscaledBalanceSc).then(
            (res) => setSellValidity(res)
          );
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

  const buySc = (total) => {
    console.log("Attempting to buy SC for", total);
    setTxStatus("pending");
    promiseTx(isWalletConnected, buyScTx(djedContract, account, total), signer)
      .then(({ hash }) => {
        verifyTx(web3, hash).then((res) => {
          if (res) {
            console.log("Buy SC success!");
            setTxStatus("success");
          } else {
            console.log("Buy SC reverted!");
            setTxError("The transaction reverted.");
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Buy SC error:", err.message);
        setTxStatus("rejected");
        setTxError("MetaMask error. See developer console for details.");
      });
  };

  const sellSc = (amount) => {
    console.log("Attempting to sell SC in amount", amount);
    setTxStatus("pending");
    promiseTx(isWalletConnected, sellScTx(djedContract, account, amount), signer)
      .then(({ hash }) => {
        verifyTx(web3, hash).then((res) => {
          if (res) {
            console.log("Sell SC success!");
            setTxStatus("success");
          } else {
            console.log("Sell SC reverted!");
            setTxError("The transaction reverted.");
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Sell SC error:", err.message);
        setTxStatus("rejected");
        setTxError("MetaMask error. See developer console for details.");
      });
  };

  const currentAmount = isBuyActive
    ? tradeData.totalBCUnscaled
    : tradeData.amountUnscaled;

  const tradeFxn = isBuyActive
    ? buySc.bind(null, tradeData.totalBCUnscaled)
    : sellSc.bind(null, tradeData.amountUnscaled);

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

  const buttonDisabled =
    isNaN(parseInt(value)) ||
    parseInt(value) === 0 ||
    isWrongChain ||
    !transactionValidated;

  const scFloat = parseFloat(coinsDetails?.scaledNumberSc.replaceAll(",", ""));
  const scConverted = getScAdaEquivalent(coinsDetails, scFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>StableCoin {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              The StableCoin of this Djed deployment is called{" "}
              <strong>{process.env.REACT_APP_SC_NAME}</strong>. It is pegged to the USD,
              similarly to various{" "}
              <a
                href="https://en.wikipedia.org/wiki/List_of_circulating_fixed_exchange_rate_currencies"
                target="_blank"
                rel="noreferrer"
              >
                fixed exchange rate national currencies
              </a>
              , at a ratio of 1 to 1. One Djed Stablecoin is nominally worth 1 USD. The
              peg is maintained through a reserve of {process.env.REACT_APP_CHAIN_COIN}.
              The Djed protocol aims to maintain a reserve ratio between{" "}
              {systemParams?.reserveRatioMin} and {systemParams?.reserveRatioMax}. This
              means that, when the reserve ratio is in this range, every StableCoin is
              backed by an amount of {process.env.REACT_APP_CHAIN_COIN} worth at least 4
              USD and is able to tolerate an instantaneous{" "}
              {process.env.REACT_APP_CHAIN_COIN} price crash of at least 75%.
            </p>
            <p>
              You are always allowed to sell back StableCoins to Djed. Djed pays 1 USD
              worth of {process.env.REACT_APP_CHAIN_COIN} per StableCoin if the reserve
              ratio is above 100% or R/S per StableCoin otherwise, where R is Djed's total{" "}
              {process.env.REACT_APP_CHAIN_COIN} reserve and S is the StableCoin supply.
            </p>
            <p>
              You are allowed to buy StableCoins from Djed for a price of 1 USD worth of
              {process.env.REACT_APP_CHAIN_COIN} per StableCoin, whenever the reserve
              ratio is above {systemParams?.reserveRatioMin}. When the reserve ratio is
              below {systemParams?.reserveRatioMin}, the purchase of StableCoins from Djed
              is disallowed, because it would reduce the reserve ratio further.
            </p>
            <p>
              There is a limit of {process.env.REACT_APP_LIMIT_PER_TXN} USD worth of{" "}
              {process.env.REACT_APP_CHAIN_COIN} per transaction.
            </p>
            <p>
              StableCoins are implemented as a standard ERC-20 token contract and the
              contract's address is{" "}
              <a
                href={`${process.env.REACT_APP_MILKOMEDA_C1_EXPLORER}address/${coinContracts?.stableCoin._address}`}
                target="_blank"
                rel="noreferrer"
              >
                {coinContracts?.stableCoin._address}
              </a>
              .
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-one.png"
            coinName={`${process.env.REACT_APP_SC_NAME}`}
            priceAmount={coinsDetails?.scaledPriceSc} //"0.31152640"
            circulatingAmount={coinsDetails?.scaledNumberSc} //"1,345,402.15"
            tokenName="SC"
            equivalence={scConverted}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>
              Buy <>&amp;</> Sell
            </strong>{" "}
            {process.env.REACT_APP_SC_NAME}
          </h2>
          <form onSubmit={onSubmit}>
            <div className="PurchaseContainer">
              <OperationSelector
                coinName={`${process.env.REACT_APP_SC_SYMBOL}`}
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
                scaledCoinBalance={accountDetails?.scaledBalanceSc}
                scaledBaseBalance={accountDetails?.scaledBalanceBc}
                fee={systemParams?.fee}
                treasuryFee={systemParams?.treasuryFee}
                buyValidity={buyValidity}
                sellValidity={sellValidity}
                isSellDisabled={Number(coinsDetails?.unscaledNumberSc) === 0}
              />
            </div>
            <input
              type="checkbox"
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
                      currencyName={`${process.env.REACT_APP_SC_NAME}`}
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
      amount: currentAmount // amountUnscaled
    },
    defaultUnwrapToken: {
      unit: process.env.REACT_APP_EVM_STABLECOIN_ADDRESS,
      amount: unwrapAmount // amountUnscaled
    },
    titleModal: "Buy SC with WSC",
    evmTokenAddress: process.env.REACT_APP_EVM_STABLECOIN_ADDRESS,
    evmContractRequest: {
      address: DJED_ADDRESS,
      abi: djedArtifact.abi,
      functionName: "buyStableCoins", //account, FEE_UI_UNSCALED, UI
      args: [account, FEE_UI_UNSCALED, UI],
      overrides: {
        value: ethers.BigNumber.from(currentAmount ?? "0")
      }
    }
  };

  const sellOptions = {
    defaultWrapToken: {
      unit: process.env.REACT_APP_CARDANO_STABLECOIN_ADDRESS,
      amount: currentAmount
    },
    defaultUnwrapToken: {
      unit: "",
      amount: unwrapAmount // totalBCUnscaled
    },
    titleModal: "Sell SC with WSC",
    evmTokenAddress: process.env.REACT_APP_EVM_STABLECOIN_ADDRESS,
    evmContractRequest: {
      address: DJED_ADDRESS,
      abi: djedArtifact.abi,
      functionName: "sellStableCoins", //amount, account, FEE_UI_UNSCALED, UI
      args: [currentAmount, account, FEE_UI_UNSCALED, UI],
      overrides: {
        value: ethers.BigNumber.from("0")
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
