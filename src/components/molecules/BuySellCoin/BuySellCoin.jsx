import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";

const BuySellCoin = ({
  coinName,
  //priceAmount,
  fee,
  totalAmount,
  payOrGet,
  buyOrSell,
  onChangeInput,
  onMaxClick,
  inputValue,
  isWalletConnected,
  scaledBalance
}) => (
  <div className="BuySellCoin">
    <h3>
      {buyOrSell} {coinName}
    </h3>
    <div className="AmountInput">
      <Input
        size="large"
        placeholder="0.0"
        value={inputValue}
        suffix={
          <div>
            <button className="MaxButton" onClick={onMaxClick}>
              MAX
            </button>
            {coinName}
          </div>
        }
        onChange={onChangeInput}
      />
    </div>
    <p className="FeeInfo">
      <InfoCircleOutlined />
      {isWalletConnected
        ? `Your current balance is ${scaledBalance} ${coinName}`
        : "Please connect your wallet to see your balance."}
    </p>
    <hr />
    <div className="AdditionalInfo">
      {/*<p>
        {coinName} ≈ {priceAmount} milkADA
      </p>*/}
      <p>Fee = {fee}</p>
      <p>
        {totalAmount
          ? `You will ${payOrGet}  ~${totalAmount} milkADA`
          : "Enter an amount above to compute transaction price."}
      </p>
    </div>
    <hr />
  </div>
);

export default BuySellCoin;
