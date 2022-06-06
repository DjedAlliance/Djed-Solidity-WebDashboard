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
import { getScAdaEquivalent, validatePositiveNumber } from "../utils/helpers";
import {
  buyScTx,
  promiseTx,
  sellScTx,
  tradeDataPriceBuySc,
  tradeDataPriceSellSc,
  getMaxBuySc,
  getMaxSellSc,
  checkBuyableSc,
  checkSellableSc,
  verifyTx
} from "../utils/ethereum";

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
    accounts,
    systemParams
  } = useAppProvider();
  const { buyOrSell, isBuyActive, setBuyOrSell } = useBuyOrSell();
  const [tradeData, setTradeData] = useState({});
  const [value, setValue] = useState(null);
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
    tradeDataPriceBuySc(djedContract, decimals.scDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (!isWalletConnected) {
        setBuyValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
      } else if (isWrongChain) {
        setBuyValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
      } else {
        checkBuyableSc(
          djedContract,
          data.amountUnscaled,
          coinBudgets?.unscaledBudgetSc
        ).then((res) => {
          setBuyValidity(res);
        });
      }
    });
  };

  const updateSellTradeData = (amountScaled) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
      setSellValidity(inputSanity);
      return;
    }
    tradeDataPriceSellSc(djedContract, decimals.scDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (!isWalletConnected) {
        setSellValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
      } else if (isWrongChain) {
        setSellValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
      } else {
        checkSellableSc(data.amountUnscaled, accountDetails?.unscaledBalanceSc).then(
          (res) => setSellValidity(res)
        );
      }
    });
  };

  const onChangeBuyInput = (e) => {
    const amountScaled = e.target.value;
    setValue(amountScaled);
    updateBuyTradeData(amountScaled);
  };
  const onChangeSellInput = (e) => {
    const amountScaled = e.target.value;
    setValue(amountScaled);
    updateSellTradeData(amountScaled);
  };

  const buySc = (total) => {
    console.log("Attempting to buy SC for", total);
    setTxStatus("pending");
    promiseTx(accounts, buyScTx(djedContract, accounts[0], total))
      .then((hash) => {
        verifyTx(web3, hash).then((res) => {
          if (res) {
            console.log("Buy SC success!");
            setTxStatus("success");
          } else {
            console.log("Buy SC reverted!");
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Buy SC error:", err);
        setTxStatus("rejected");
        setTxError(err.message);
      });
  };

  const sellSc = (amount) => {
    console.log("Attempting to sell SC in amount", amount);
    setTxStatus("pending");
    promiseTx(accounts, sellScTx(djedContract, accounts[0], amount))
      .then((hash) => {
        verifyTx(web3, hash).then((res) => {
          if (res) {
            console.log("Sell SC success!");
            setTxStatus("success");
          } else {
            console.log("Sell SC reverted!");
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Sell SC error:", err);
        setTxStatus("rejected");
        setTxError(err.message);
      });
  };

  const maxBuySc = (djed, scDecimals, unscaledBudgetSc) => {
    getMaxBuySc(djed, scDecimals, unscaledBudgetSc)
      .then((maxAmountScaled) => {
        setValue(maxAmountScaled);
        updateBuyTradeData(maxAmountScaled);
      })
      .catch((err) => console.error("MAX Error:", err));
  };

  const maxSellSc = (scaledBalanceSc) => {
    getMaxSellSc(scaledBalanceSc)
      .then((maxAmountScaled) => {
        setValue(maxAmountScaled);
        updateSellTradeData(maxAmountScaled);
      })
      .catch((err) => console.error("MAX Error:", err));
  };

  const tradeFxn = isBuyActive
    ? buySc.bind(null, tradeData.totalUnscaled)
    : sellSc.bind(null, tradeData.amountUnscaled);

  const transactionValidated = isBuyActive
    ? buyValidity === TRANSACTION_VALIDITY.OK
    : sellValidity === TRANSACTION_VALIDITY.OK;

  const buttonDisabled = value === null || isWrongChain || !transactionValidated;

  const scFloat = parseFloat(coinsDetails?.scaledNumberSc.replaceAll(",", ""));
  const scConverted = getScAdaEquivalent(coinsDetails, scFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>StableDjed {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              StableDjed is the USD-pegged stablecoin which is part of the Djed protocol.
              Each StableDjed is backed by 400-600% collateral of testnet milkADA. As
              such, each StableDjed is able to maintain this peg without a centralized
              monetary policy based on the collateral requirements. This peg is
              automatically maintained with price fluctuations up and until the price of
              ADA dips so low that the collateral value decreases to under 100%.
            </p>
            <p>
              The Djed protocol allows users who own StableDjed to always sell their
              tokens back to the protocol in order to withdraw an equivalent value of
              testnet milkADA. As such, StableDjed is aimed for users who want to maintain
              stability of value in their assets.
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-one.png"
            coinName="StableDjed"
            priceAmount={coinsDetails?.scaledPriceSc} //"0.31152640"
            circulatingAmount={coinsDetails?.scaledNumberSc} //"1,345,402.15"
            tokenName="StableDjed"
            equivalence={scConverted}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>
              Buy <>&amp;</> Sell
            </strong>{" "}
            StableDjed
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector
              coinName="StableDjed"
              selectionCallback={() => {
                setBuyOrSell();
                setValue(null);
                setBuyValidity(TRANSACTION_VALIDITY.ZERO_INPUT);
                setSellValidity(TRANSACTION_VALIDITY.ZERO_INPUT);
              }}
              onChangeBuyInput={onChangeBuyInput}
              onChangeSellInput={onChangeSellInput}
              onMaxBuy={maxBuySc.bind(
                null,
                djedContract,
                decimals?.scDecimals,
                coinBudgets?.unscaledBudgetSc
              )}
              onMaxSell={maxSellSc.bind(null, accountDetails?.scaledBalanceSc)}
              tradeData={tradeData}
              inputValue={value}
              scaledCoinBalance={accountDetails?.scaledBalanceSc}
              scaledBaseBalance={accountDetails?.scaledBalanceBc}
              fee={systemParams?.fee}
              buyValidity={buyValidity}
              sellValidity={sellValidity}
            />
          </div>
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
                <BuySellButton
                  disabled={buttonDisabled}
                  onClick={tradeFxn}
                  buyOrSell={buyOrSell}
                  currencyName="StableDjed"
                />
              </>
            ) : (
              <>
                <p className="Disclaimer">
                  In order to operate you need to connect your wallet
                </p>
                <MetamaskConnectButton />
              </>
            )}
          </div>
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
