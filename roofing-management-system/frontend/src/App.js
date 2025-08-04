import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import TimeClock from './pages/TimeClock';
import Navbar from './components/Navbar';
import Customers from './pages/Customers';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') ? true : false
  );

  return (
    <div className="App">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/jobs" 
          element={
            isAuthenticated ? 
            <Jobs /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/time-clock" 
          element={
            isAuthenticated ? 
            <TimeClock /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
  path="/customers" 
  element={
    isAuthenticated ? 
    <Customers /> : 
    <Navigate to="/login" replace />
  } 
/>
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;