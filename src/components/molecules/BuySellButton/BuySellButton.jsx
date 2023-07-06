import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";
import "./BuySellButton.scss";
import { useWSCTransactionConfig, ConnectWSCButton } from "milkomeda-wsc-ui";

const capitalizeString = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};
// TODO: this might be need to be passed on the config provider
const cardanoAddressTReserveCoin =
  "cc53696f7d40c96f2bca9e2e8fe31905d8207c4106f326f417ec36727452657365727665436f696e";
const cardanoAddressTStableCoin =
  "27f2e501c0fa1f9b7b79ae0f7faeb5ecbe4897d984406602a1afd8a874537461626c65436f696e";

const reserveCoinAddress = "0x66c34c454f8089820c44e0785ee9635c425c9128";

const BuySellButton = ({
  onClick,
  buyOrSell,
  currencyName,
  disabled,
  currentAmount,
  onWSCAction,
  stepTxDirection
}) => {
  useWSCTransactionConfig({
    defaultCardanoToken: {
      unit: stepTxDirection === "buy" ? "lovelace" : cardanoAddressTReserveCoin, //default lovelace
      amount: +currentAmount
    },
    cardanoTokenAddress: cardanoAddressTReserveCoin,
    evmTokenAddress: reserveCoinAddress,
    wscActionCallback: onWSCAction,
    stepTxDirection,
    titleModal: stepTxDirection === "buy" ? "Buy with WSC" : "Sell with WSC"
  });

  return (
    <>
      {/* TODO: remove later */}
      <CustomButton
        type="submit"
        variant="primary"
        icon={<ArrowRightOutlined />}
        onClick={onClick}
        disabled={disabled}
        text={`${capitalizeString(buyOrSell)} ${currencyName}`}
      />
      <ConnectWSCButton />
    </>
  );
};

export default BuySellButton;
