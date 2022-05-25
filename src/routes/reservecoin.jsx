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
  tradeDataPriceSellRc
} from "../utils/ethereum";

export default function ReserveCoin() {
  const { djedContract, coinsDetails, decimals, accounts } = useAppProvider();

  const { buyOrSell, isBuyActive, setBuyOrSell } = useBuyOrSell();
  const [tradeData, setTradeData] = useState({});

  const amountChangeCallback = (e) => {
    let amountScaled = e.target.value;
    let promise = isBuyActive
      ? tradeDataPriceBuyRc(djedContract, decimals.rcDecimals, amountScaled)
      : tradeDataPriceSellRc(djedContract, decimals.rcDecimals, amountScaled);
    promise.then((data) => setTradeData(data));
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
            circulatingAmount={coinsDetails?.scaledNumberRc} //"1,345,402.15"
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Buy & Sell</strong> Reservecoin
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector
              coinName="Reservecoin"
              selectionCallback={setBuyOrSell}
              changeCallback={amountChangeCallback}
              tradeData={tradeData}
            />
          </div>
          <div className="ConnectWallet">
            <p className="Disclaimer">
              In order to operate you need to connect your wallet
            </p>
            <MetamaskConnectButton />

            {/*<CustomButton
              type="submit"
              text="Connect with Metamask"
              variant="primary"
              iconWallet={<Metamask />}
              icon={<ArrowRightOutlined />}
            />*/}
            <br />
            {/* Buttons to open the 3 different modals post transaction */}
            <ModalPending
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
            />
            <BuySellButton
              onClick={tradeFxn}
              buyOrSell={buyOrSell}
              coinName="Reservecoin"
              coinAmount={tradeData.amountScaled}
              value={tradeData.totalScaled}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
