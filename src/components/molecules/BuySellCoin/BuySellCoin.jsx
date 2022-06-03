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
  payOrReceive,
  payOrGet,
  buyOrSell,
  onChangeInput,
  onMaxClick,
  inputValue,
  inputValid,
  scaledCoinBalance,
  scaledBaseBalance
}) => {
  const { isWalletConnected, isWrongChain } = useAppProvider();
  const maxButton = (
    <button className="MaxButton" onClick={onMaxClick}>
      MAX
    </button>
  );

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
              {isWalletConnected ? maxButton : null}
            </div>
          }
          status={!inputValue || inputValid ? null : "error"}
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
          ? `Your current balance is ${scaledBaseBalance} milktADA.`
          : `Please connect your wallet to see your milktADA balance.`}
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
        {coinName} ≈ {priceAmount} milktADA
      </p>*/}
        <p>Fee = {fee}</p>
        {inputValue ? (
          <>
            <p>{`You will ${payOrReceive}  ~ ${inputValue} ${coinName}`}</p>
            <p>{`You will ${payOrGet}  ~ ${totalAmount} milktADA`}</p>
          </>
        ) : (
          <p>Enter an amount above to compute transaction price.</p>
        )}
      </div>
      <hr />
    </div>
  );
};

export default BuySellCoin;
