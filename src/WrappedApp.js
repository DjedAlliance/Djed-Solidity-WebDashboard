import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Stablecoin from "./routes/stablecoin";
import Protocol from "./routes/protocol";
import ReserveCoin from "./routes/reservecoin";
import MyBalance from "./routes/my-balance";

export default function WrappedApp({ wrapper }) {
    const [accounts, setAccounts] = useState([]);
    //const [testFxn, setTestFxn] = useState(() => {});

    const connectMetamask = () => {
        console.log("Attempting connection, maybe? Status:", !!accounts.length);
        if (!accounts.length) {
            window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
              setAccounts(accounts);
              wrapper.setMetamask(window.ethereum, accounts);
              console.log("Set metamask stuff for wrapper!");
            });
        }
    };

    return (
      //<MetamaskStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App accounts={accounts} />}>
            <Route path="stablecoin" element={<Stablecoin data={wrapper.data} accounts={accounts} connectFxn={connectMetamask}/>} />
            <Route path="protocol" element={<Protocol data={wrapper.data} accounts={accounts} connectFxn={connectMetamask} />} />
            <Route path="reservecoin" element={<ReserveCoin data={wrapper.data} accounts={accounts} connectFxn={connectMetamask} wrapper={wrapper}/>} />
            <Route path="my-balance" element={<MyBalance />} />
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
      </BrowserRouter>
      //</MetamaskStateProvider>
    );
}