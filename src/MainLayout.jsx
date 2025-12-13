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

const LOGO_PATH = process.env.REACT_APP_LOGO_PATH || "Logo_symbol.png";

export default function MainLayout() {
  const { isWalletConnected } = useAppProvider();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>
      <Layout className="layout">
        <Header className="header-desktop" role="banner">
          <div className="logo">
            <Link to="/" aria-label="Djed Protocol Home">
              <img src={LOGO_PATH} alt="Djed Protocol Logo - Decentralized Stablecoin" />
            </Link>
          </div>
          <nav aria-label="Main navigation">
            <Menu mode="horizontal" selectedKeys={[location.pathname]}>
              <Menu.Item key="/audit">
                <Link
                  to={{
                    pathname:
                      "//github.com/DjedAlliance/Djed-Solidity/blob/main/audits/PeckShield-Audit-Report-Djed-2.pdf"
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View security audit report (opens in new tab)"
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
                  rel="noopener noreferrer"
                  aria-label="Read Djed whitepaper (opens in new tab)"
                >
                  Whitepaper
                </Link>
              </Menu.Item>
              <Menu.Item key="/">
                <Link to="/" aria-label="View protocol status and overview">Protocol</Link>
              </Menu.Item>
              <Menu.Item key="/sc">
                <Link to="/sc" aria-label="Buy and sell StableCoins">StableCoin</Link>
              </Menu.Item>
              <Menu.Item key="/rc">
                <Link to="/rc" aria-label="Buy and sell ReserveCoins">ReserveCoin</Link>
              </Menu.Item>
              <Menu.Item key="/docs">
                <Link
                  to={{
                    pathname: "//docs.stability.nexus/djed-stablecoin-protocols/djed-overview"
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View documentation (opens in new tab)"
                >
                  Docs
                </Link>
              </Menu.Item>
            </Menu>
          </nav>
          <div className="WalletConfig" role="complementary" aria-label="Wallet actions">
            <CustomButton
              text="Balance"
              onClick={() => navigate("/my-balance")}
              disabled={!isWalletConnected}
              iconWallet={
                isWalletConnected && <WalletOutlined style={{ color: "white" }} aria-hidden="true" />
              }
              variant="tertiary"
              aria-label="View your balance"
            />

            <WalletConnectButton />
          </div>
        </Header>
        <HeaderMobileMenu isWalletConnected={isWalletConnected} />
        <Content id="main-content" role="main" tabIndex="-1">
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
    <nav className="header-mobile" aria-label="Mobile navigation">
      <div className="logo">
        <Link to="/" aria-label="Djed Protocol Home">
          <img src={LOGO_PATH} alt="Djed Protocol Logo" />
        </Link>
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
            role="menubar"
          >
            <Menu.Item key="/audit" role="menuitem">
              <Link
                to={{
                  pathname:
                    "//github.com/DjedAlliance/Djed-Solidity/blob/main/audits/PeckShield-Audit-Report-Djed-2.pdf"
                }}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View security audit report (opens in new tab)"
              >
                Audit
              </Link>
            </Menu.Item>
            <Menu.Item key="/whitepaper" role="menuitem">
              <Link
                to={{
                  pathname: "//eprint.iacr.org/2021/1069"
                }}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Read Djed whitepaper (opens in new tab)"
              >
                Whitepaper
              </Link>
            </Menu.Item>
            <Menu.Item key="/" role="menuitem">
              <Link to="/" aria-label="View protocol status">Protocol</Link>
            </Menu.Item>
            <Menu.Item key="/sc" role="menuitem">
              <Link to="/sc" aria-label="Trade Djed StableCoins">Djed StableCoin</Link>
            </Menu.Item>
            <Menu.Item key="/rc" role="menuitem">
              <Link to="/rc" aria-label="Trade Djed ReserveCoins">Djed ReserveCoin</Link>
            </Menu.Item>
            <Menu.Item key="/my-balance" disabled={!isWalletConnected} role="menuitem">
              <Link to="/my-balance" aria-label="View your wallet balance">Balance</Link>
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
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          role="button"
          tabIndex="0"
        />
      </Dropdown>
    </nav>
  );
};

