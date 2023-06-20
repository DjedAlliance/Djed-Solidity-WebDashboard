import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { ArrowRightOutlined } from "@ant-design/icons";
import WSCButton from "../../wsc-ui/WSCButton/WSCButton";
import "./BuySellButton.scss";

const capitalizeString = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

const BuySellButton = ({
  onClick,
  buyOrSell,
  currencyName,
  disabled,
  currentAmountWei,
  onWSCAction,
  direction
}) => {
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
      <WSCButton
        type="button"
        disabled={disabled}
        className="wsc-button"
        onWSCAction={onWSCAction}
        currentAmountWei={currentAmountWei}
        direction={direction}
      >
        <span className="text">
          {capitalizeString(buyOrSell)} {currencyName}
        </span>
        <ArrowRightOutlined />{" "}
      </WSCButton>
    </>
  );
};

export default BuySellButton;
