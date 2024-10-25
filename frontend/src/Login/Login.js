import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 

const Login = ({ setToken, setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Make sure to match this with your backend's login API
    const response = await fetch('http://localhost:2000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setToken(data.token); // Save the token in state
      localStorage.setItem('token', data.token); // Save token in local storage
      setIsLoggedIn(true); // Set user as logged in
      navigate("/"); // Redirect to home page
    } else {
      setError(data.error || 'Invalid email or password'); // Show error if login fails
    }
  };

  return (
    <div className="login-container">
      {/* Left side: Image section */}
      <div className="login-left">
        <img src={process.env.PUBLIC_URL + '/login-pic-green.png'} alt="Login visual" className="login-image" />
      </div>

      {/* Right side: Login form */}
      <div className="login-right">
        <div className="login-logo">
          <h2>Login</h2>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error message */}
          {error && <div className="error">{error}</div>}

          {/* Login button */}
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {/* Forgot password link */}
        <div className="forgot-password">
          <a href="/forgot-password">Forgot Password?</a>
        </div>

        {/* Register link */}
        <div className="register">
          <span>Don't have an account? </span>
          <a href="/register">Register here</a>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
