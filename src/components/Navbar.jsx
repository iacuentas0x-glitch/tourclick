import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img 
          src="/images/logo.png" 
          alt="TourClick Logo" 
          className="brand-logo"
        />
        <span>TourClick</span>
      </Link>
      <nav className="nav-links" aria-label="Principal">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/tours">Tours</NavLink>
        <NavLink to="/budget">Presupuesto</NavLink>
        {user?.role === 'client' && <NavLink to="/mis-reservas">Mis reservas</NavLink>}
        {user?.role === 'company' && <NavLink to="/empresa">Empresa</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {!user && <NavLink to="/login">Ingresar</NavLink>}
        {user && (
          <button className="nav-user" onClick={logout} type="button">
            {user.name}
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
