import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../images/metamask.svg";
import CustomButton from "../components/atoms/CustomButton/CustomButton";
import CoinCard from "../components/molecules/CoinCard/CoinCard";
import OperationSelector from "../components/organisms/OperationSelector/OperationSelector";
import ModalTransaction from "../components/organisms/Modals/ModalTransaction";
import ModalPending from "../components/organisms/Modals/ModalPending";

import "./_CoinSection.scss";

export default function ReserveCoin() {
  return (
    <main style={{ padding: "1rem 0" }}>
      <div className="StablecoinSection">
        <div className="Left">
          <h1>
            Reservecoin <strong>Name</strong>
          </h1>
          <div className="DescriptionContainer">
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
            <p>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>
          <CoinCard
            coinIcon="/coin-icon-two.png"
            coinName="Reservecoin Name"
            priceAmount="0.31152640"
            circulatingAmount="1,345,402.15"
            ratioAmount="1 milkADA ≈ 3.21 Token"
          />
        </div>
        <div className="Right">
          <h2 className="SubtTitle">
            <strong>Buy & Sell</strong> Reservecoin
          </h2>
          <div className="PurchaseContainer">
            <OperationSelector coinName="Reservecoin" />
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
