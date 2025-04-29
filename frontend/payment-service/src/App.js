// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CartPage from './components/Cart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CartPage />} />
      </Routes>
    </Router>
  );
}

export default App;
