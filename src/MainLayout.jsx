import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown } from "antd";
import WalletConnectButton from "./components/molecules/MetamaskStatusButton/WalletConnectButton";

import "antd/dist/antd.css";
import "./App.scss";
import { useAppProvider } from "./context/AppProvider";
import { CloseOutlined, MenuOutlined, WalletOutlined } from "@ant-design/icons";
import CustomButton from "./components/atoms/CustomButton/CustomButton";

const { Header, Content } = Layout;

const LOGO_PATH = process.env.REACT_APP_LOGO_PATH || "Logo_symbol.png"

export default function MainLayout() {
  const { isWalletConnected } = useAppProvider();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <Layout className="layout">
        <Header className="header-desktop">
          <div className="logo">
            <img src={LOGO_PATH} alt="Logo" />
          </div>
          <Menu mode="horizontal" selectedKeys={[location.pathname]}>
            <Menu.Item key="/audit">
              <Link
                to={{
                  pathname:
                    "//github.com/DjedAlliance/Djed-Solidity/blob/main/audits/PeckShield-Audit-Report-Djed-2.pdf"
                }}
                target="_blank"
              >
                Audit
              </Link>
            </Menu.Item>
            <Menu.Item key="/whitepaper">
              <Link
                to={{
                  pathname: "//eprint.iacr.org/2021/1069"
                }}
                target="_blank"
              >
                Whitepaper
              </Link>
            </Menu.Item>
            <Menu.Item key="/">
              <Link to="/">Protocol</Link>
            </Menu.Item>
            <Menu.Item key="/sc">
              <Link to="/sc">StableCoin</Link>
            </Menu.Item>
            <Menu.Item key="/rc">
              <Link to="/rc">ReserveCoin</Link>
            </Menu.Item>
            <Menu.Item key="/docs">
              <Link
                to={{
                  pathname: "//docs.djed.one/alliance/the-djed-alliance"
                }}
                target="_blank"
              >
                Docs
              </Link>
            </Menu.Item>
          </Menu>
          <div className="WalletConfig">
            <CustomButton
              text="Balance"
              onClick={() => navigate("/my-balance")}
              disabled={!isWalletConnected}
              iconWallet={
                isWalletConnected && <WalletOutlined style={{ color: "white" }} />
              }
              variant="tertiary"
            />

            <WalletConnectButton />
          </div>
        </Header>
        <HeaderMobileMenu isWalletConnected={isWalletConnected} />
        <Content>
          <div className="site-layout-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </div>
  );
}

const HeaderMobileMenu = ({ isWalletConnected }) => {
  const location = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const MenuIcon = isMenuOpen ? CloseOutlined : MenuOutlined;
  const handleVisibleChange = (flag) => {
    setMenuOpen(flag);
  };

  return (
    <div className="header-mobile">
      <div className="logo">
        <img src={LOGO_PATH} alt="Logo" />
      </div>
      <Dropdown
        overlayClassName="menu-mobile-dropdown"
        visible={isMenuOpen}
        onVisibleChange={handleVisibleChange}
        overlay={
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            onClick={() => setMenuOpen(false)}
          >
            <Menu.Item key="/audit">
              <Link
                to={{
                  pathname:
                    "//github.com/DjedAlliance/Djed-Solidity/blob/main/audits/PeckShield-Audit-Report-Djed-2.pdf"
                }}
                target="_blank"
              >
                Audit
              </Link>
            </Menu.Item>
            <Menu.Item key="/whitepaper">
              <Link
                to={{
                  pathname: "//eprint.iacr.org/2021/1069"
                }}
                target="_blank"
              >
                Whitepaper
              </Link>
            </Menu.Item>
            <Menu.Item key="/">
              <Link to="/">Protocol</Link>
            </Menu.Item>
            <Menu.Item key="/sc">
              <Link to="/sc">Djed StableCoin</Link>
            </Menu.Item>
            <Menu.Item key="/rc">
              <Link to="/rc">Djed ReserveCoin</Link>
            </Menu.Item>
            <Menu.Item key="/my-balance" disabled={!isWalletConnected}>
              <Link to="/my-balance">Balance</Link>
            </Menu.Item>
            <div className="WalletConfig">
              <WalletConnectButton />
            </div>
          </Menu>
        }
        placement="topLeft"
      >
        <MenuIcon
          style={{ fontSize: 22 }}
          className="menu-mobile-icon"
          onClick={() => setMenuOpen(!isMenuOpen)}
        />
      </Dropdown>
    </div>
  );
};
