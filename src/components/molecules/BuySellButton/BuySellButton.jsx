import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";

const capitalizeString = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const BuySellButton = ({ onClick, buyOrSell, currencyName, disabled }) => {
  return (
    <CustomButton
      type="submit"
      text={`${capitalizeString(buyOrSell)} ${currencyName}`}
      variant="primary"
      icon={<ArrowRightOutlined />}
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export default BuySellButton;
