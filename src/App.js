import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import Stablecoin from "./routes/stablecoin";
import Protocol from "./routes/protocol";
import ReserveCoin from "./routes/reservecoin";
import MyBalance from "./routes/my-balance";
import TermsOfService from "./routes/terms-of-service";
import { AppProvider } from "./context/AppProvider";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="" element={<Protocol />} />
            <Route path="sc" element={<Stablecoin />} />
            <Route path="rc" element={<ReserveCoin />} />
            <Route path="my-balance" element={<MyBalance />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
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
    </BrowserRouter>
  );
}
