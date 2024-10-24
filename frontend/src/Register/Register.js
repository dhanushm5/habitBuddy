import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Assuming you have styling for the register page

const Register = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Use the correct API endpoint
    const response = await fetch('http://localhost:2000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess('Registration successful! You can now log in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      navigate('/login');
    } else {
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      {/* Left side: Image section */}
      <div className="register-left">
        <img src={process.env.PUBLIC_URL + '/register-pic-blue.png'} alt="Register visual" className="register-image" />
      </div>

      {/* Right side: Registration form */}
      <div className="register-right">
        <div className="register-logo">
          <h2>Register</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
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
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Error and Success messages */}
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {/* Register button */}
          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        {/* Login link */}
        <div className="login-link">
          <span>Already have an account? </span>
          <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
