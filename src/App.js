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

export default function App() {
  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <AppProvider>
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
        </AppProvider>
      </WagmiConfig>
    </BrowserRouter>
  );
}
