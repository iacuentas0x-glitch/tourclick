import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Tours from './pages/Tours.jsx';
import TourDetail from './pages/TourDetail.jsx';
import BudgetPlanner from './pages/BudgetPlanner.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Login from './pages/Login.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import MyBookings from './pages/MyBookings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/budget" element={<BudgetPlanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mis-reservas" element={<ProtectedRoute roles={['client']}><MyBookings /></ProtectedRoute>} />
          <Route path="/empresa" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
