import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import Stablecoin from "./routes/stablecoin";
import Protocol from "./routes/protocol";
import ReserveCoin from "./routes/reservecoin";
import MyBalance from "./routes/my-balance";
import { AppProvider } from "./context/AppProvider";

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* TODO: home page */}
            <Route path="/" element={<Protocol />} />
            <Route path="stablecoin" element={<Stablecoin />} />
            <Route path="protocol" element={<Protocol />} />
            <Route path="reservecoin" element={<ReserveCoin />} />
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
      </AppProvider>
    </BrowserRouter>
  );
}
