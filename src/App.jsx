// src/App.jsx - Example integration

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
// Import other pages as needed

function App() {
  return (
    <Router>
      <Routes>
        {/* Signup route */}
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Default redirect to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
