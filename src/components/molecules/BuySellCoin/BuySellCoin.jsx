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
  totalAmount,
  payOrReceive,
  payOrGet,
  buyOrSell,
  onChangeInput,
  onMaxClick,
  inputValue,
  scaledCoinBalance,
  scaledBaseBalance,
  validity
}) => {
  const { isWalletConnected, isWrongChain } = useAppProvider();
  const maxButton = (
    <button className="MaxButton" onClick={onMaxClick}>
      MAX
    </button>
  );
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
          suffix={
            <div>
              {coinName}
              {isWalletConnected ? maxButton : null}
            </div>
          }
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
          ? `Your current balance is ${scaledBaseBalance} milktALGO.`
          : `Please connect your wallet to see your milktALGO balance.`}
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
        {coinName} ≈ {priceAmount} milktALGO
      </p>*/}
        <p>Fee = {fee}</p>
        {inputValue ? (
          <>
            <p>{`You will ${payOrReceive}  ~ ${inputValue} ${coinName}`}</p>
            <p>{`You will ${payOrGet}  ~ ${totalAmount} milktALGO`}</p>
            <p>{inputValid ? null : `Transaction is invalid: ${validity}.`}</p>
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
