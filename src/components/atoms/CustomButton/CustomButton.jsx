import React from "react";
import "./_CustomButton.scss";

const CustomButton = ({ text, variant, type, icon, iconWallet, onClick, disabled }) => {
  const classname = `CustomButton ${variant}`;
  return (
    <button
      type={type ?? "button"}
      className={classname}
      onClick={onClick}
      disabled={disabled}
    >
      {iconWallet}
      <p className="ButtonText">{text}</p>
      {icon}
    </button>
  );
};

export default CustomButton;
