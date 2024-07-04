import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import Stablecoin from "./routes/stablecoin";
import Protocol from "./routes/protocol";
import ReserveCoin from "./routes/reservecoin";
import MyBalance from "./routes/my-balance";
import TermsOfUse from "./routes/terms-of-use";
import { AppProvider } from "./context/AppProvider";
import { client } from "./utils/web3/wagmi";
import { WagmiConfig } from "wagmi";
import { useEffect } from "react";
import { ConnectWSCProvider } from "milkomeda-wsc-ui-test-beta";

const wscCustomTheme = {
  "--wsc-body-background": "#100901",
  "--wsc-body-color-muted": "rgb(255 255 255 / 60%)",
  "--wsc-body-color": "white",
  "--wsc-body-divider": "#3f3d40",
  "--wsc-stepper-separator": "#3f3d40",
  "--wsc-overlay-backdrop-filter": "blur(6px)",
  "--wsc-alert-background": "#212433",

  // primary buttons
  "--wsc-primary-button-color": "white",
  "--wsc-primary-button-background": "#41455c",
  "--wsc-primary-button-box-shadow": "none",
  "--wsc-primary-button-hover-background": "#2c2f3e",
  // secondary button
  "--wsc-secondary-button-color": "white",
  "--wsc-secondary-button-background": "transparent",
  "--wsc-secondary-button-box-shadow": "inset 0 0 0 1px #41455c",
  "--wsc-secondary-button-hover-background": "rgba(0,0,0,0.4)",
  // connect main button
  "--wsc-connectbutton-background": "#41455c",
  "--wsc-connectbutton-text": "#fff",
  "--wsc-connectbutton-hover-background": "#2c2f3e",
  "--wsc-connectbutton-active-box-shadow": "none",
  "--wsc-connectbutton-box-shadow": "none",
  "--wsc-connectbutton-color": "#fff",
  "--wsc-connectbutton-hover-color": "#fff",
  "--wsc-connectbutton-active-background": "#2c2f3e",
  "--wsc-connectbutton-active-color": "white"
};
export default function App() {
  useEffect(() => {
    document.title = `Djed on ${process.env.REACT_APP_BC}`;

    const gradientTheme = process.env.REACT_APP_GRADIENT_THEME || 'gradient-theme-5'; 
    const colorTheme = process.env.REACT_APP_COLOR_THEME || 'gold-dark';

    const root = document.documentElement;

    // Update gradient
    const gradient = getComputedStyle(root).getPropertyValue(`--${gradientTheme}`);
    root.style.setProperty('--gradient-theme-5', gradient); 

    // Update color
    const color = getComputedStyle(root).getPropertyValue(`--${colorTheme}`);
    root.style.setProperty('--gold-dark', color);
  }, []);

  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <AppProvider>
          <ConnectWSCProvider customTheme={wscCustomTheme}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route path="" element={<Protocol />} />
                <Route path="sc" element={<Stablecoin />} />
                <Route path="rc" element={<ReserveCoin />} />
                <Route path="my-balance" element={<MyBalance />} />
                <Route path="terms-of-use" element={<TermsOfUse />} />
                <Route
                  path="*"
                  element={
                    <main style={{ padding: "1rem" }}>
                      <p>There's nothing here!</p>
                    </main>
                  }
                />
              </Route>
            </Routes>
          </ConnectWSCProvider>
        </AppProvider>
      </WagmiConfig>
    </BrowserRouter>
  );
}
