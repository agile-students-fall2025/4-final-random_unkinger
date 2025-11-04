import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route goes straight to Home */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
