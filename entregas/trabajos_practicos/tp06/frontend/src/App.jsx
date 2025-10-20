import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CompraEntradas from "./components/CompraEntradas";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CompraEntradas />} />
      </Routes>
    </Router>
  );
}

export default App;
