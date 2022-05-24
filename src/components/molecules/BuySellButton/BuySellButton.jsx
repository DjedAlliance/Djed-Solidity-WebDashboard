import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";

const BuySellButton = ({ onClick, buyOrSell, coinName, coinAmount, value }) => {
  const text = buyOrSell[0].toUpperCase() + buyOrSell.slice(1) + ` ~${coinAmount} ${coinName} for ~${value} milkADA`;
  return <CustomButton type="submit" text={text} variant="primary" icon={<ArrowRightOutlined />} onClick={onClick} />;
};

export default BuySellButton;
