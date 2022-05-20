import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";

const BuySellButton = ({ testFxn, buyOrSell, coinName, coinAmount, value }) => {
  const text = buyOrSell[0].toUpperCase() + buyOrSell.slice(1) + ` ~${coinAmount} ${coinName} for ~${value} milkADA`;
  return (
    <CustomButton
      type="primary"
      htmlType="submit"
      text={text}
      theme="primary"
      icon={<ArrowRightOutlined />}
      clickFxn={testFxn}
    />
  );
};

export default BuySellButton;
