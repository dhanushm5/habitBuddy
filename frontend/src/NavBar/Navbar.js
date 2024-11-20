// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn }) => {
    const links1 = isLoggedIn
        ? [
            { to: "/", label: "Habit Buddy" },
          ] : [];

    const links2 = isLoggedIn
    ? [
        { to: "/logout", label: "Logout" }    // not going to /logout
    ] : [];

    return (
        <>
            {isLoggedIn && (
                <nav>
                {links1.map(link => (
                    <NavLink 
                        key={link.to} 
                        to={link.to} 
                        activeClassName="active-link"
                        className = "title"
                    >
                        {link.label}
                    </NavLink>
                ))}
                {links2.map(link => (
                    <NavLink 
                        key={link.to} 
                        to={link.to} 
                        activeClassName="active-link"
                        className = "logout"
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

