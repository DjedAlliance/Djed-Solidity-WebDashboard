import React from "react";
import { InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";
import { useAppProvider } from "../../../context/AppProvider";

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
  scaledCoinBalance,
  scaledBaseBalance
}) => {
  const { isWalletConnected, isWrongChain } = useAppProvider();
  return (
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
              {coinName}
              <button className="MaxButton" onClick={onMaxClick}>
                MAX
              </button>
            </div>
          }
          onChange={onChangeInput}
        />
      </div>
      <p className="FeeInfo">
        <InfoCircleOutlined />
        {isWalletConnected
          ? `Your current balance is ${scaledCoinBalance} ${coinName}.`
          : `Please connect your wallet to see your ${coinName} balance.`}
      </p>
      <p className="FeeInfo">
        <InfoCircleOutlined />
        {isWalletConnected
          ? `Your current balance is ${scaledBaseBalance} milkADA.`
          : `Please connect your wallet to see your milkADA balance.`}
      </p>
      {isWrongChain ? (
        <p className="Alert">
          <ExclamationCircleOutlined />
          Please change your MetaMask Milkomeda network to Tesnet and refresh the page.
        </p>
      ) : null}
      <hr />
      <div className="AdditionalInfo">
        {/*<p>
        {coinName} ≈ {priceAmount} milkADA
      </p>*/}
        <p>Fee = {fee}</p>
        <p>
          {totalAmount
            ? `You will ${payOrGet}  ~ ${totalAmount} milkADA`
            : "Enter an amount above to compute transaction price."}
        </p>
      </div>
      <hr />
    </div>
  );
};

export default BuySellCoin;
