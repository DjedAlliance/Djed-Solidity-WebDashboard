import React, { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
//import { ReactComponent as Metamask } from "../images/metamask.svg";
//import CustomButton from "../components/atoms/CustomButton/CustomButton";
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
  checkBuyableRc,
  checkSellableRc,
  getMaxBuyRc,
  getMaxSellRc
} from "../utils/ethereum";

export default function ReserveCoin() {
  const {
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

  const onChangeBuyInput = (e) => {
    const amountScaled = e.target.value;
    setValue(amountScaled);
    tradeDataPriceBuyRc(djedContract, decimals.rcDecimals, amountScaled).then((data) =>
      setTradeData(data)
    );
  };

  const onChangeSellInput = (e) => {
    const amountScaled = e.target.value;
    setValue(amountScaled);
    tradeDataPriceSellRc(djedContract, decimals.rcDecimals, amountScaled).then((data) =>
      setTradeData(data)
    );
  };

  const buyRc = (total) => {
    console.log("Attempting to buy RC for", total);
    promiseTx(accounts, buyRcTx(djedContract, accounts[0], total))
      .then((res) => console.log("Success:", res))
      .catch((err) => console.err("Error:", err));
  };

  const sellRc = (amount) => {
    console.log("Attempting to sell RC in amount", amount);
    promiseTx(accounts, sellRcTx(djedContract, accounts[0], amount))
      .then((res) => console.log("Success:", res))
      .catch((err) => console.err("Error:", err));
  };

  const maxBuyRc = (djed, rcDecimals, unscaledNumberSc, thresholdNumberSc) => {
    getMaxBuyRc(djed, rcDecimals, unscaledNumberSc, thresholdNumberSc)
      .then((res) => {
        const maxAmount = parseFloat(res);
        setValue(maxAmount);
      })
      .catch((err) => console.err("MAX Error:", err));
  };

  const maxSellRc = (djed, rcDecimals, unscaledBalanceRc) => {
    getMaxSellRc(djed, rcDecimals, unscaledBalanceRc)
      .then((res) => {
        const maxAmount = parseFloat(res);
        setValue(maxAmount);
      })
      .catch((err) => console.err("MAX Error:", err));
  };

  const tradeFxn = isBuyActive
    ? buyRc.bind(null, tradeData.totalUnscaled)
    : sellRc.bind(null, tradeData.amountUnscaled);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>
            Reservecoin <strong>Name</strong>
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
            coinIcon="/coin-icon-two.png"
            coinName="Reservecoin Name"
            priceAmount={coinsDetails?.scaledBuyPriceRc}
            sellPriceAmount={coinsDetails?.scaledSellPriceRc}
            circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
            tokenName="ReserveDjed"
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Buy & Sell</strong> Reservecoin
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector
              coinName="Reservecoin"
              selectionCallback={() => {
                setBuyOrSell();
                setValue(null);
              }}
              onChangeBuyInput={onChangeBuyInput}
              onChangeSellInput={onChangeSellInput}
              onMaxBuy={maxBuyRc.bind(
                null,
                djedContract,
                coinsDetails?.rcDecimals,
                coinsDetails?.unscaledNumberSc,
                systemParams?.thresholdNumberSc
              )}
              onMaxSell={maxSellRc.bind(
                null,
                djedContract,
                coinsDetails?.rcDecimals,
                accountDetails?.unscaledBalanceRc
              )}
              tradeData={tradeData}
              inputValue={value}
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
        </div>
      </div>
    </main>
  );
}

{
  /* <ModalPending
  transactionType="Confirmation"
  transactionStatus="/transaction-success.svg"
  statusText="Pending for confirmation"
  statusDescription="This transaction can take a while, once the process finish you will see the transaction reflected in your wallet."
/>
<ModalTransaction
  transactionType="Success Transaction"
  transactionStatus="/transaction-success.svg"
  statusText="Succesful transaction!"
  statusDescription="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
/>
<ModalTransaction
  transactionType="Failed Transaction"
  transactionStatus="/transaction-failed.svg"
  statusText="Failed transaction!"
  statusDescription="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
/> */
}
