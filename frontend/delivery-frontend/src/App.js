import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateDeliveryPage from "./pages/CreateDeliveryPage";
import DeliveryDetailsPage from "./pages/DeliveryDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";


const App = () => {
  return (
    <Router>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateDeliveryPage />} />
          <Route path="/delivery/:orderId" element={<DeliveryDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
