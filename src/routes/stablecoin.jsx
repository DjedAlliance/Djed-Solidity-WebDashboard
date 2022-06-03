import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../images/metamask.svg";
import CustomButton from "../components/atoms/CustomButton/CustomButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";
import OperationSelector from "../components/organisms/OperationSelector/OperationSelector";
import ModalTransaction from "../components/organisms/Modals/ModalTransaction";
import ModalPending from "../components/organisms/Modals/ModalPending";

import "./_CoinSection.scss";

export default function Stablecoin() {
  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>
            Stablecoin <strong>Name</strong>
          </h1>
          <div className="DescriptionContainer">
            <p>
              StableDjed is the USD-pegged stablecoin which is part of the Djed protocol. Each StableDjed is backed by 400-600% collateral
              of testnet milkADA. As such, each StableDjed is able to maintain this peg without a centralized monetary policy based on the collateral requirements.
              This peg is automatically maintained with price fluctuations up and until the price of ADA dips so low that the collateral value decreases to under 100%.
            </p>
            <p>
              The Djed protocol allows users who own StableDjed to always sell their tokens back to the protocol in order to withdraw an equivalent value of 
              testnet milkADA. As such, StableDjed is aimed for users who want to maintain stability of value in their assets.
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-one.png"
            coinName="Stablecoin Name"
            priceAmount="0.31152640"
            circulatingAmount="1,345,402.15"
            ratioAmount="1 milkADA ≈ 3.21 Token"
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Buy & Sell</strong> Stablecoin
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector coinName="Stablecoin" />
          </div>
          <div className="ConnectWallet">
            <p className="Disclaimer">
              In order to operate you need to connect your wallet
            </p>

            <CustomButton
              type="primary"
              htmlType="submit"
              text="Connect with Metamask"
              theme="primary"
              iconWallet={<Metamask />}
              icon={<ArrowRightOutlined />}
            />
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
          </div>
        </div>
      </div>
    </main>
  );
}
