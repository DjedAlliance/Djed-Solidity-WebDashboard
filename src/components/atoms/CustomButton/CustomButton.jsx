import React from "react";
import "./_CustomButton.scss";

const CustomButton = ({ text, variant, type, icon, iconWallet, onClick }) => {
  const classname = `CustomButton ${variant}`;
  return (
    <button type={type ?? "button"} className={classname} onClick={onClick}>
      {iconWallet}
      <p className="ButtonText">{text}</p>
      {icon}
    </button>
  );
};

export default CustomButton;
