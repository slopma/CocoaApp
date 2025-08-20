import React from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Metrics from "./pages/Metrics";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/metrics" element={<Metrics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
