import React from "react";
import { InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";
import { useAppProvider } from "../../../context/AppProvider";
import { TRANSACTION_VALIDITY } from "../../../utils/constants";

const BuySellCoin = ({
  coinName,
  //priceAmount,
  fee,
  treasuryFee,
  totalAmount,
  payOrReceive,
  payOrGet,
  buyOrSell,
  onChangeInput,
  inputValue,
  scaledCoinBalance,
  scaledBaseBalance,
  validity
}) => {
  const FEE_UI = process.env.REACT_APP_FEE_UI;
  const { isWalletConnected, isWrongChain } = useAppProvider();
  const inputValid = validity === TRANSACTION_VALIDITY.OK;
  const inputBarNotMarked =
    !inputValue || !isWalletConnected || isWrongChain || inputValid;

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
          suffix={<div>{coinName}</div>}
          status={inputBarNotMarked ? null : "error"}
          onChange={(e) => {
            const reg = /^-?\d*(\.\d*)?$/;
            const inputValue = e.target.value;
            if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
              onChangeInput(inputValue);
            }
          }}
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
          ? `Your current balance is ${scaledBaseBalance} mADA.`
          : `Please connect your wallet to see your mADA balance.`}
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
        {coinName} ≈ {priceAmount} mADA
      </p>*/}
        <p>Fee = {fee}</p>
        <p>Treasury Fee = {treasuryFee}</p>
        <p>UI Fee = {FEE_UI}%</p>
        {inputValue ? (
          <>
            <p>{`You will ${payOrReceive}  ~ ${inputValue} ${coinName}`}</p>
            <p>{`You will ${payOrGet}  ~ ${totalAmount} mADA`}</p>
            <p>{inputValid ? null : `Transaction is invalid: ${validity}.`}</p>
          </>
        ) : (
          <p>Enter an amount above to compute transaction price.</p>
        )}
        <hr />
        <p>
          Djed is an experiment in self-sovereign self-driving monetary policy. Understand
          how the protocol works and use it carefully at your own risk
        </p>
      </div>
    </div>
  );
};

export default BuySellCoin;
