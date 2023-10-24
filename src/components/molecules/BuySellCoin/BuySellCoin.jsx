import React from "react";
import { InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Input } from "antd";
import "./_BuySellCoin.scss";
import { useAppProvider } from "../../../context/AppProvider";
import { TRANSACTION_VALIDITY } from "../../../utils/constants";
import {
  useWSCProvider,
  useGetOriginTokens,
  useGetOriginBalance
} from "milkomeda-wsc-ui-test-beta";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

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
  const { isWSCConnected } = useWSCProvider();
  const { originTokens } = useGetOriginTokens();
  const { originBalance } = useGetOriginBalance();

  const inputValid = isWSCConnected ? true : validity === TRANSACTION_VALIDITY.OK;
  const inputBarNotMarked =
    !inputValue || !isWalletConnected || isWrongChain || inputValid;

  const selectedCardanoAddress =
    coinName === process.env.REACT_APP_SC_SYMBOL
      ? process.env.REACT_APP_CARDANO_STABLECOIN_ADDRESS
      : process.env.REACT_APP_CARDANO_RESERVECOIN_ADDRESS;

  const selectedToken = originTokens.find(
    (t) => t.unit.toLowerCase() === selectedCardanoAddress.toLowerCase()
  ) ?? {
    unit: "",
    quantity: "0",
    assetName: "-"
  };

  const renderInformation = () => {
    const isBuying = buyOrSell === "Buy";
    if (!isWSCConnected) {
      return (
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
      );
    }

    const isValidAmountWSC = (() => {
      if (!isWSCConnected) return true;
      if (!inputValue) return true;
      if (!isBuying) return true;
      return new BigNumber(totalAmount).lte(originBalance);
    })();

    return (
      <>
        <p className="FeeInfo">
          <InfoCircleOutlined />
          {isBuying ? (
            <>Your current balance is {originBalance} ADA on Cardano wallet </>
          ) : (
            <>
              Your current balance is{" "}
              {ethers.utils
                .formatUnits(selectedToken.quantity, selectedToken.decimals || 6)
                .toString() ?? "-"}{" "}
              {selectedToken.assetName} on Cardano wallet
            </>
          )}
        </p>
        {!isValidAmountWSC ? (
          <p className="Alert">
            <ExclamationCircleOutlined />
            You don't have enough ADA to complete the transaction
          </p>
        ) : null}
      </>
    );
  };

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
      {renderInformation()}
      {isWrongChain ? (
        <p className="Alert">
          <ExclamationCircleOutlined />
          Your wallet is connected to the wrong blockchain network. Please connect it to{" "}
          {process.env.REACT_APP_BC} and refresh the page.
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
