import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";

const capitalizeString = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const BuySellButton = ({ onClick, buyOrSell, coinName, coinAmount, value }) => {
  const hasCoinAmount = coinAmount && value;
  const text = `~${coinAmount} ${coinName} for ~${value} milkADA`;
  return (
    <CustomButton
      type="submit"
      text={`${capitalizeString(buyOrSell)} ${hasCoinAmount ? text : "stablecoin"}`}
      variant="primary"
      icon={<ArrowRightOutlined />}
      onClick={onClick}
    />
  );
};

export default BuySellButton;
