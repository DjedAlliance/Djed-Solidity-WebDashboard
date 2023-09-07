import React from "react";
import { InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";
import { useAppProvider } from "../../../context/AppProvider";
import { TRANSACTION_VALIDITY } from "../../../utils/constants";
import { useWSCProvider } from "milkomeda-wsc-ui-test-beta";
import { ethers } from "ethers";

export const useSellCardanoToken = () => {
  const { wscProvider, originTokens, isWSCConnected } = useWSCProvider();
  const cardanoReservecoinAddress = process.env.REACT_APP_CARDANO_RESERVECOIN_ADDRESS;
  const cardanoStablecoinAddress = process.env.REACT_APP_CARDANO_STABLECOIN_ADDRESS;
  const cardanoReservecoinAsset = React.useMemo(
    () => originTokens.find((token) => token.unit === cardanoReservecoinAddress),
    [cardanoReservecoinAddress, originTokens]
  );
  const cardanoStablecoinAsset = React.useMemo(
    () => originTokens.find((token) => token.unit === cardanoStablecoinAddress),
    [cardanoStablecoinAddress, originTokens]
  );
  const adaToken = React.useMemo(
    () => originTokens.find((token) => token.unit === "lovelace"),
    [originTokens]
  );

  return {
    wscProvider,
    isWSCConnected,
    cardanoReservecoinAsset,
    cardanoStablecoinAsset,
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
  const {
    isWSCConnected,
    cardanoReservecoinAsset,
    cardanoStablecoinAsset,
    destinationBalanceADA
  } = useSellCardanoToken();
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
      {isWSCConnected && cardanoStablecoinAsset ? (
        <p className="FeeInfo">
          <InfoCircleOutlined />
          Your current balance is{" "}
          {ethers.utils.formatUnits(cardanoStablecoinAsset.quantity, 0)}{" "}
          {cardanoStablecoinAsset.assetName}
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
