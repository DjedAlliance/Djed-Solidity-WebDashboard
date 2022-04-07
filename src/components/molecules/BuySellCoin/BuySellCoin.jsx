import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";

const BuySellCoin = ({
  coinName,
  priceAmount,
  feeAmount,
  totalAmount,
  payOrGet,
  buyOrSell,
}) => (
  <div className="BuySellCoin">
    <h3>
      {buyOrSell} {coinName}
    </h3>
    <div className="AmountInput">
      <Input size="large" placeholder="0.0" suffix={coinName} />
    </div>
    <p className="FeeInfo">
      <InfoCircleOutlined /> A fee is charged for currency conversion
    </p>
    <hr />
    <div className="AdditionalInfo">
      <p>
        {coinName} ≈ {priceAmount} milkADA
      </p>
      <p>Fee ≈ {feeAmount} milkADA</p>
      <p>
        {payOrGet} ≈ {totalAmount} milkADA
      </p>
    </div>
    <hr />
  </div>
);

export default BuySellCoin;
