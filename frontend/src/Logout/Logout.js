// Desc: Logout component that handles the logout functionality
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Logout.css"

const Logout = ({ setToken, setIsLoggedIn, isLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        setTimeout(() => {
            setToken('');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            navigate('/login');
        }, 1000); // Simulated logout delay
    };

    return (
        <div className="logout-container">
            {isLoggedIn ? (
                <>
                    {/* Confirmation Modal */}
                    {(
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Are you sure you want to logout?</h3>
                                <div className="modal-buttons">
                                    <button
                                        onClick={handleLogout}
                                        className="confirm-button"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="cancel-button"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <h1>Not logged in</h1>
            )}
        </div>
    );
};

export default Logout;
