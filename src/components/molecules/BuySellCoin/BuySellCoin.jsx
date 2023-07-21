import React from "react";
import { InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";
import { useAppProvider } from "../../../context/AppProvider";
import { TRANSACTION_VALIDITY } from "../../../utils/constants";
import { useWSCProvider } from "milkomeda-wsc-ui-test-beta";
import { stringToBigNumber } from "../../../utils/helpers";
import { ethers } from "ethers";

const cardanoReservecoinAddress =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";

const cardanoStablecoinAddress =
  "27f2e501c0fa1f9b7b79ae0f7faeb5ecbe4897d984406602a1afd8a874537461626c65436f696e";

export const useSellCardanoToken = () => {
  const { wscProvider, originTokens, isWSCConnected } = useWSCProvider();
  const cardanoReservecoinAsset = React.useMemo(
    () => originTokens.find((token) => token.unit === cardanoReservecoinAddress),
    [originTokens]
  );
  const adaToken = React.useMemo(
    () => originTokens.find((token) => token.unit === "lovelace"),
    [originTokens]
  );

  return {
    wscProvider,
    isWSCConnected,
    cardanoReservecoinAsset,
    destinationBalanceADA: adaToken ?? {
      quantity: "0",
      decimals: 6,
      assetName: "ADA"
    }
  };
};

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
  const { isWSCConnected, cardanoReservecoinAsset, destinationBalanceADA } =
    useSellCardanoToken();
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
      {!isWSCConnected && (
        <>
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
        </>
      )}
      {isWrongChain ? (
        <p className="Alert">
          <ExclamationCircleOutlined />
          Your wallet is connected to the wrong blockchain network. Please connect it to{" "}
          {process.env.REACT_APP_BC} and refresh the page.
        </p>
      ) : null}
      {isWSCConnected && cardanoReservecoinAsset ? (
        <p className="FeeInfo">
          <InfoCircleOutlined />
          Your current balance is{" "}
          {ethers.utils.formatUnits(cardanoReservecoinAsset.quantity, 0)}{" "}
          {cardanoReservecoinAsset.assetName}
        </p>
      ) : null}
      {isWSCConnected && destinationBalanceADA ? (
        <p className="FeeInfo">
          <InfoCircleOutlined />
          Your current balance is{" "}
          {ethers.utils.formatUnits(
            destinationBalanceADA.quantity,
            destinationBalanceADA.decimals
          )}{" "}
          {destinationBalanceADA.assetName}
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
      </div>
    </div>
  );
};

export default BuySellCoin;
