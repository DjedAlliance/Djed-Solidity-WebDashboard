import React from "react";
import "./_CustomButton.scss";

const CustomButton = ({ text, theme, type, htmlType, icon, iconWallet, clickFxn }) => {
  const classname = `CustomButton ${theme}`;
  return (
    <button
      type={type ? type : "button"}
      htmlType={htmlType}
      className={classname}
      onClick={clickFxn ? clickFxn : () => (false)}
    >
      {iconWallet}
      <p className="ButtonText">{text}</p>
      {icon}
    </button>
  );
};

export default CustomButton;
