import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown } from "antd";
import MetamaskStatusButton, {
  DisconnectButton
} from "./components/molecules/MetamaskStatusButton/MetamaskStatusButton";

import "antd/dist/antd.css";
import "./App.scss";
import { useAppProvider } from "./context/AppProvider";
import { CloseOutlined, MenuOutlined, WalletOutlined } from "@ant-design/icons";
import CustomButton from "./components/atoms/CustomButton/CustomButton";

const { Header, Content } = Layout;

export default function MainLayout() {
  const { isWalletConnected } = useAppProvider();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <Layout className="layout">
        <Header className="header-desktop">
          <div className="logo">
            <img src="/Logo_symbol.png" />
          </div>
          <Menu mode="horizontal" selectedKeys={[location.pathname]}>
            <Menu.Item key="/audit">
              <Link
                to={{
                  /**TODO link to the audit, when it becomes available */
                  pathname: "#"
                }}
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
            <Menu.Item key="/stabledjed">
              <Link to="/stabledjed">StableCoin</Link>
            </Menu.Item>
            <Menu.Item key="/reservedjed">
              <Link to="/reservedjed">ReserveCoin</Link>
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
            {isWalletConnected ? <DisconnectButton /> : null}
            <MetamaskStatusButton />
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
        <img src="/Logo_symbol.png" />
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
                  /**TODO link to the audit, when it becomes available */
                  pathname: "#"
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
            <Menu.Item key="/stabledjed">
              <Link to="/stabledjed">Djed StableCoin</Link>
            </Menu.Item>
            <Menu.Item key="/reservedjed">
              <Link to="/reservedjed">Djed ReserveCoin</Link>
            </Menu.Item>
            <Menu.Item key="/my-balance" disabled={!isWalletConnected}>
              <Link to="/my-balance">Balance</Link>
            </Menu.Item>
            <div className="WalletConfig">
              {isWalletConnected ? <DisconnectButton /> : null}
              <MetamaskStatusButton />
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
