// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn }) => {
    const links = isLoggedIn
        ? [
            { to: "/", label: "Home" },
            { to: "/logout", label: "Logout" }    // not going to /logout
          ] : [];

    return (
        <>
            {isLoggedIn && (
                <nav>
                {links.map(link => (
                    <NavLink 
                        key={link.to} 
                        to={link.to} 
                        activeClassName="active-link"
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            )}
        
    </>
    );
};

export default Navbar;

