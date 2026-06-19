import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import Notfound from './Components/Notfound';
import Home from './Components/Home';
import Users from './Components/Admin/Users';
import Product from './Components/Admin/Product';
import Categories from './Components/Admin/Categories';
import Singleprod from './Components/Singleprod';
import Cart from './Components/Cart';
import Payment from './Components/Payment';
import PaymentA from './Components/Admin/PaymentA';

function App() {
  // Regular protected routes for authenticated users
  const ProtectedRoutes = ({ children }) => {
    const login = !!localStorage.getItem('token');
    if (!login) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Admin protected routes for admin users only
  const AdminProtectedRoutes = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    // Get user data from localStorage or decode from token
    const userData = localStorage.getItem('user');
    let roleId = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        roleId = user.role_id;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return <Navigate to="/login" replace />;
      }
    }

    // Check if user is admin (role_id = 1)
    if (roleId !== 1) {
      // Redirect to home if not admin
      return <Navigate to="/home" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Singleprod/:id" element={<Singleprod />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        
        {/* Regular user protected routes */}
        <Route path="/Payment" element={
          <ProtectedRoutes>
            <Payment />
          </ProtectedRoutes>
        } />
        <Route path="/Cart" element={
          <ProtectedRoutes>
            <Cart />
          </ProtectedRoutes>
        } />

        {/* Admin only routes */}
        <Route path="/Users" element={
          <AdminProtectedRoutes>
            <Users />
          </AdminProtectedRoutes>
        } />
        <Route path="/PaymentA" element={
          <AdminProtectedRoutes>
            <PaymentA />
          </AdminProtectedRoutes>
        } />
        <Route path="/Product" element={
          <AdminProtectedRoutes>
            <Product />
          </AdminProtectedRoutes>
        } />
        <Route path="/Categories" element={
          <AdminProtectedRoutes>
            <Categories />
          </AdminProtectedRoutes>
        } />

        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;