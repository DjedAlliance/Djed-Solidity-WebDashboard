import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
//import { WalletOutlined } from "@ant-design/icons";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";
import { truncateAddress } from "../../../utils/address";

const MetamaskConnectButton = () => {
  const { isWalletConnected, accounts, connectMetamask } = useAppProvider();
  const variant = isWalletConnected ? "secondary" : "primary";
  return (
    <CustomButton
      type="submit"
      text={isWalletConnected ? truncateAddress(accounts[0]) : "Connect with Metamask"}
      iconWallet={<Metamask />}
      variant={variant}
      icon={isWalletConnected ? null : <ArrowRightOutlined />}
      onClick={connectMetamask}
    />
  );
};

export default MetamaskConnectButton;
