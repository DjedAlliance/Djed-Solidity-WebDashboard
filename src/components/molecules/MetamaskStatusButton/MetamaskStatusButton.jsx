import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { WalletOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";
import { truncateAddress } from "../../../utils/address";

const MetamaskStatusButton = () => {
  const { isWalletConnected, accounts, connectMetamask } = useAppProvider();
  return (
    <CustomButton
      text={isWalletConnected ? truncateAddress(accounts[0]) : "Connect Wallet"}
      onClick={connectMetamask}
      iconWallet={isWalletConnected ? <Metamask /> : <WalletOutlined />}
      variant={isWalletConnected ? "secondary" : "primary"}
    />
  );
};

export default MetamaskStatusButton;
