import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";
import "./BuySellButton.scss";

const capitalizeString = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

const BuySellButton = ({ onClick, buyOrSell, currencyName, disabled }) => {
  return (
    <CustomButton
      variant="primary"
      icon={<ArrowRightOutlined />}
      onClick={onClick}
      disabled={disabled}
      text={`${capitalizeString(buyOrSell)} ${currencyName}`}
    />
  );
};

export default BuySellButton;
