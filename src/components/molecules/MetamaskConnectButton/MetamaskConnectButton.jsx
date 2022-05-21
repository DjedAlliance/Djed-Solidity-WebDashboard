import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
//import { WalletOutlined } from "@ant-design/icons";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";

const MetamaskConnectButton = () => {
  const { accounts, connectMetamask } = useAppProvider();
  const type = accounts.length ? "secondary" : "primary";
  return (
    <CustomButton
      type={type}
      htmlType="submit"
      text={accounts.length ? accounts[0] : "Connect with Metamask"}
      iconWallet={<Metamask />}
      theme={type}
      icon={accounts.length ? null : <ArrowRightOutlined />}
      clickFxn={connectMetamask}
    />
  );
};

export default MetamaskConnectButton;
