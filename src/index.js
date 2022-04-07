import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Stablecoin from "./routes/stablecoin";
import Protocol from "./routes/protocol";
import ReserveCoin from "./routes/reservecoin";
import MyBalance from "./routes/my-balance";

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
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
  </BrowserRouter>,
  rootElement
);
