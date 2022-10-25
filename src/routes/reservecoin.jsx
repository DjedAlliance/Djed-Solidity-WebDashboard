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
import { getRcUsdEquivalent, validatePositiveNumber } from "../utils/helpers";
import {
  buyRcTx,
  promiseTx,
  sellRcTx,
  tradeDataPriceBuyRc,
  tradeDataPriceSellRc,
  checkBuyableRc,
  checkSellableRc,
  verifyTx
} from "../utils/ethereum";

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
    const getTradeData = async () => {
      try {
        const data = await tradeDataPriceBuyRc(
          djedContract,
          decimals.rcDecimals,
          amountScaled
        );

        setTradeData(data);
        if (!isWalletConnected) {
          setBuyValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
          setBuyValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
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
    tradeDataPriceSellRc(djedContract, decimals.rcDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (!isWalletConnected) {
        setSellValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
      } else if (isWrongChain) {
        setSellValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
      } else {
        checkSellableRc(
          djedContract,
          data.amountUnscaled,
          accountDetails?.unscaledBalanceRc
        ).then((res) => setSellValidity(res));
      }
    });
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
    promiseTx(accounts, buyRcTx(djedContract, accounts[0], total))
      .then((hash) => {
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
    promiseTx(accounts, sellRcTx(djedContract, accounts[0], amount))
      .then((hash) => {
        verifyTx(web3, hash).then((res) => {
          if (res) {
            console.log("Sell RC success!");
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
    ? buyRc.bind(null, tradeData.totalmtADAUnscaled)
    : sellRc.bind(null, tradeData.amountUnscaled);

  const transactionValidated = isBuyActive
    ? buyValidity === TRANSACTION_VALIDITY.OK
    : sellValidity === TRANSACTION_VALIDITY.OK;

  const buttonDisabled = value === null || isWrongChain || !transactionValidated;

  const rcFloat = parseFloat(coinsDetails?.scaledNumberRc.replaceAll(",", ""));
  const rcConverted = getRcUsdEquivalent(coinsDetails, rcFloat);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>ReserveDjed {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              ReserveDjed is the second token of the Djed protocol which is aimed at users
              who are looking to trade stability in value for potential upside gain. Every
              ReserveDjed bought from the protocol represents a portion of the underlying
              testnet milkADA which is held in the Djed protocol reserves. As such, if the
              price of ADA increases, then the outstanding liabilities to cover all
              existing StableDjed decreases, and thus the value of ReserveDjed increases.
            </p>
            <p>
              As such ReserveDjed is the riskier of the two assets (compared to
              StableDjed), yet offers users who have a stronger risk tolerance to have
              potential upside gain if the price of ADA increases.
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-two.png"
            coinName="ReserveDjed"
            priceAmount={coinsDetails?.scaledBuyPriceRc}
            sellPriceAmount={coinsDetails?.scaledSellPriceRc}
            circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
            tokenName="ReserveDjed"
            equivalence={rcConverted}
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>
              Buy <>&amp;</> Sell
            </strong>{" "}
            ReserveDjed
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector
              coinName="ReserveDjed"
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
                  currencyName="ReserveDjed"
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
