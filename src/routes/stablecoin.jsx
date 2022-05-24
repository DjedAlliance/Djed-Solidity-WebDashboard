import React, { useState } from "react";
//import { ArrowRightOutlined } from "@ant-design/icons";
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
//import MetamaskConnectButton from "../components/molecules/MetamaskConnectButton/MetamaskConnectButton";

export default function Stablecoin() {
  const { wrapper } = useAppProvider();

  const [buyOrSell, setBuyOrSell] = useState("buy");
  const [tradeData, setTradeData] = useState({});

  const selectorCallback = (key) => {
    if (key === "1") {
      setBuyOrSell("buy");
    } else if (key === "2") {
      setBuyOrSell("sell");
    }
  };

  const amountChangeCallback = (e) => {
    let text = e.target.value;
    let promise =
      buyOrSell === "buy" ? wrapper.promiseTradeDataPriceBuySc(text) : wrapper.promiseTradeDataPriceSellSc(text);
    promise.then((data) => setTradeData(data));
  };

  const tradeFxn =
    buyOrSell === "buy"
      ? wrapper.buySc.bind(wrapper, tradeData.totalInt)
      : wrapper.sellSc.bind(wrapper, tradeData.amountInt);

  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>
            Stablecoin <strong>Name</strong>
          </h1>
          <div className="DescriptionContainer">
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
            <p>
              It has survived not only five centuries, but also the leap into electronic typesetting, remaining
              essentially unchanged.
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-one.png"
            coinName="Stablecoin Name"
            priceAmount={wrapper?.data.scaledPriceSc} //"0.31152640"
            circulatingAmount={wrapper?.data.scaledNumberSc} //"1,345,402.15"
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Buy & Sell</strong> Stablecoin
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector
              coinName="Stablecoin"
              selectionCallback={selectorCallback}
              changeCallback={amountChangeCallback}
              tradeData={tradeData}
            />
          </div>
          <div className="ConnectWallet">
            <p className="Disclaimer">In order to operate you need to connect your wallet</p>
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
              coinName="Stablecoin"
              coinAmount={tradeData.amountText}
              value={tradeData.totalText}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
