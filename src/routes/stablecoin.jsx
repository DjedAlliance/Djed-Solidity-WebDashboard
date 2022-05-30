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
    coinsDetails,
    djedContract,
    decimals,
    accountDetails,
    accounts
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
    tradeDataPriceBuySc(djedContract, decimals.scDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (isWalletConnected) {
        checkBuyableSc(djedContract, data.amountUnscaled).then((res) => {
          console.log("Validation result received:", res);
          setCanBuy(res);
        });
      } else {
        setCanBuy(false);
      }
    });
  };

  const updateSellTradeData = (amountScaled) => {
    tradeDataPriceSellSc(djedContract, decimals.scDecimals, amountScaled).then((data) => {
      setTradeData(data);
      if (isWalletConnected) {
        checkSellableSc(data.amountUnscaled, accountDetails.unscaledBalanceSc).then(
          (res) => setCanSell(res)
        );
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

  const maxBuySc = (djed, scDecimals) => {
    getMaxBuySc(djed, scDecimals)
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

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>
            Stablecoin <strong>Name</strong>
          </h1>
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
            coinIcon="/coin-icon-one.png"
            coinName="Stablecoin Name"
            priceAmount={coinsDetails?.scaledPriceSc} //"0.31152640"
            circulatingAmount={coinsDetails?.scaledNumberSc} //"1,345,402.15"
            tokenName="StableDjed"
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Buy & Sell</strong> Stablecoin
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector
              coinName="Stablecoin"
              selectionCallback={() => {
                setBuyOrSell();
                setValue(null);
              }}
              onChangeBuyInput={onChangeBuyInput}
              onChangeSellInput={onChangeSellInput}
              onMaxBuy={maxBuySc.bind(null, djedContract, coinsDetails?.scDecimals)}
              onMaxSell={maxSellSc.bind(null, accountDetails?.scaledBalanceSc)}
              tradeData={tradeData}
              inputValue={value}
              canBuy={canBuy}
              canSell={canSell}
            />
          </div>
          <div className="ConnectWallet">
            <br />
            {isWalletConnected ? (
              <BuySellButton onClick={tradeFxn} buyOrSell={buyOrSell} />
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
