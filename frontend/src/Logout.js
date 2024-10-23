// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Logout = ( {setToken, setIsLoggedIn, isLoggedIn} ) => {
//     const navigate = useNavigate();

//     const handleLogout = () => {
//         setToken('');
//         localStorage.removeItem('token');
//         setIsLoggedIn(false);
//         navigate('/login');
//     };

//     return (
//         <div className="logout-container">
//             {isLoggedIn ? (
//                 <form onSubmit={handleLogout}>
//                     <label><h1>Do you want to logout?</h1></label>
//                     <button type="submit">Logout</button>
//                 </form>
//             )   :  (
//                 <h1>Not logged in</h1>
//             )}
//          </div>
//     )
// };
    
// export default Logout


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Logout.css"

const Logout = ({ setToken, setIsLoggedIn, isLoggedIn }) => {
    const [showModal, setShowModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLoggingOut(true);

        setTimeout(() => {
            setToken('');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setIsLoggingOut(false);
            navigate('/login');
        }, 1000); // Simulated logout delay
    };

    return (
        <div className="logout-container">
            {isLoggedIn ? (
                <>
                    <button
                        onClick={() => setShowModal(true)}
                        className="logout-button"
                    >
                        Logout
                    </button>

                    {/* Confirmation Modal */}
                    {showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Are you sure you want to logout?</h3>
                                <div className="modal-buttons">
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="confirm-button"
                                    >
                                        {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
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
