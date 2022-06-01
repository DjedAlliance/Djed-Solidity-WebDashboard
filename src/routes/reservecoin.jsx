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
import {
  buyRcTx,
  promiseTx,
  sellRcTx,
  tradeDataPriceBuyRc,
  tradeDataPriceSellRc,
  getMaxBuyRc,
  getMaxSellRc,
  checkBuyableRc,
  checkSellableRc,
  verifyTx
} from "../utils/ethereum";

export default function ReserveCoin() {
  const {
    web3,
    isWalletConnected,
    djedContract,
    coinsDetails,
    decimals,
    accountDetails,
    accounts,
    systemParams
  } = useAppProvider();

  const { buyOrSell, isBuyActive, setBuyOrSell } = useBuyOrSell();
  const [tradeData, setTradeData] = useState({});
  const [value, setValue] = useState(null);
  const [txError, setTxError] = useState(null);
  const [txStatus, setTxStatus] = useState("idle");
  const [canBuy, setCanBuy] = useState(false);
  const [canSell, setCanSell] = useState(false);

  const txStatusPending = txStatus === "pending";
  const txStatusRejected = txStatus === "rejected";
  const txStatusSuccess = txStatus === "success";

  const updateBuyTradeData = (amountScaled) => {
    tradeDataPriceBuyRc(djedContract, decimals.rcDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (isWalletConnected) {
        checkBuyableRc(djedContract, data.amountUnscaled).then((res) => setCanBuy(res));
      } else {
        setCanBuy(false);
      }
    });
  };

  const updateSellTradeData = (amountScaled) => {
    tradeDataPriceSellRc(djedContract, decimals.rcDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (isWalletConnected) {
        checkSellableRc(
          djedContract,
          data.amountUnscaled,
          accountDetails.unscaledBalanceRc
        ).then((res) => setCanSell(res));
      } else {
        setCanSell(false);
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
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Error:", err);
        setTxStatus("rejected");
        setTxError(err.message);
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
            setTxStatus("rejected");
          }
        });
      })
      .catch((err) => {
        console.error("Error:", err);
        setTxStatus("rejected");
        setTxError(err.message);
      });
  };

  const maxBuyRc = (djed, rcDecimals, unscaledNumberSc, thresholdNumberSc) => {
    getMaxBuyRc(djed, rcDecimals, unscaledNumberSc, thresholdNumberSc)
      .then((maxAmountScaled) => {
        if (maxAmountScaled.length > 0) {
          setValue(maxAmountScaled);
          updateBuyTradeData(maxAmountScaled);
        } else {
          console.log("No limit on buying RCs right now!");
          // no limit -- do something special?
        }
      })
      .catch((err) => console.error("MAX Error:", err));
  };

  const maxSellRc = (djed, rcDecimals, unscaledBalanceRc) => {
    getMaxSellRc(djed, rcDecimals, unscaledBalanceRc)
      .then((maxAmountScaled) => {
        setValue(maxAmountScaled);
        updateSellTradeData(maxAmountScaled);
      })
      .catch((err) => console.error("MAX Error:", err));
  };

  const tradeFxn = isBuyActive
    ? buyRc.bind(null, tradeData.totalUnscaled)
    : sellRc.bind(null, tradeData.amountUnscaled);

  const transactionValidated = isBuyActive ? canBuy : canSell;

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>ReserveDjed {/*<strong>Name</strong>*/}</h1>
          <div className="DescriptionContainer">
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since the
              1500s, when an unknown printer took a galley of type and scrambled it to
              make a type specimen book.
            </p>
            <p>
              It has survived not only five centuries, but also the leap into electronic
              typesetting, remaining essentially unchanged.
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-two.png"
            coinName="ReserveDjed"
            priceAmount={coinsDetails?.scaledBuyPriceRc}
            sellPriceAmount={coinsDetails?.scaledSellPriceRc}
            circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
            tokenName="ReserveDjed"
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
              }}
              onChangeBuyInput={onChangeBuyInput}
              onChangeSellInput={onChangeSellInput}
              onMaxBuy={maxBuyRc.bind(
                null,
                djedContract,
                decimals?.rcDecimals,
                coinsDetails?.unscaledNumberSc,
                systemParams?.thresholdNumberSc
              )}
              onMaxSell={maxSellRc.bind(
                null,
                djedContract,
                decimals?.rcDecimals,
                accountDetails?.unscaledBalanceRc
              )}
              tradeData={tradeData}
              inputValue={value}
              scaledCoinBalance={accountDetails?.scaledBalanceRc}
              scaledBaseBalance={accountDetails?.scaledBalanceBc}
              fee={systemParams?.fee}
            />
          </div>
          <div className="ConnectWallet">
            <br />
            {isWalletConnected ? (
              <>
                <p className="Disclaimer">
                  This transaction is expected to{" "}
                  {transactionValidated ? (
                    <strong>succeed.</strong>
                  ) : (
                    <strong>fail!</strong>
                  )}
                </p>
                <BuySellButton
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
              statusDescription="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
