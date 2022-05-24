import React from "react";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import { WalletOutlined } from "@ant-design/icons";
import { ReactComponent as Metamask } from "../../../images/metamask.svg";
import { useAppProvider } from "../../../context/AppProvider";
import { truncateAddress } from "../../../utils/address";

const MetamaskStatusButton = () => {
  const { accounts } = useAppProvider();
  return (
    <CustomButton
      text={accounts.length ? truncateAddress(accounts[0]) : "Wallet not connected"}
      iconWallet={accounts.length ? <Metamask /> : <WalletOutlined />}
      variant={accounts.length ? "secondary" : "primary"}
    />
  );
};

export default MetamaskStatusButton;
