// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage/MainPage';
import Register from './Register/Register';
import Login from './Login/Login';
import Logout from './Logout';
import Navbar from './NavBar/Navbar'; 
import ForgotPassword from './ForgotPassword/ForgotPassword'; 
import ResetPassword from './ResetPassword/ResetPassword';
import Calendar from './MainPage/Calendar'; // Import the Calendar component

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <Router>
            <Navbar isLoggedIn={isLoggedIn}/> 
            <Routes>
                <Route path="/register" element={<Register setToken={setToken} setIsLoggedIn={setIsLoggedIn}/>} />
                <Route path="/login" element={<Login setToken={setToken} setIsLoggedIn={setIsLoggedIn}/>} />
                <Route path="/" element={<MainPage token={token} isLoggedIn={isLoggedIn} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/logout" element={<Logout isLoggedIn={isLoggedIn} setToken={setToken} setIsLoggedIn={setIsLoggedIn}/>} />
                <Route path="/calendar" element={<Calendar />} /> {/* Add route for Calendar */}
            </Routes>
        </Router>
    );
};

export default App;
