// import React, { useState } from 'react';
// import './ForgotPassword.css'; // Import the CSS file

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleForgotPassword = async () => {
//     setLoading(true);
//     setMessage('');
//     try {
//       const response = await fetch('http://localhost:2000/forgot-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setMessage('Password reset email sent');
//       } else {
//         setMessage(data.error);
//       }
//     } catch (error) {
//       setMessage('Failed to send password reset email');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Forgot Password</h2>
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         disabled={loading}
//       />
//       <button onClick={handleForgotPassword} disabled={loading}>
//         {loading ? 'Sending...' : 'Send Reset Email'}
//       </button>
//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default ForgotPassword;


// import React, { useState } from 'react';
// import './ForgotPassword.css'; // Import the CSS file

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleForgotPassword = async () => {
//     setLoading(true);
//     setMessage('');
//     try {
//       const response = await fetch('http://localhost:2000/forgot-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         setMessage('Password reset email sent');
//       } else {
//         setMessage(data.error);
//       }
//     } catch (error) {
//       setMessage('Failed to send password reset email');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="forgot-password-container">
//       <div className="forgot-password-content">
//         <h2>Forgot Password</h2>
//         <div className="form-group">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             disabled={loading}
//             required
//           />
//         </div>
//         <button
//           className="forgot-password-btn"
//           onClick={handleForgotPassword}
//           disabled={loading}
//         >
//           {loading ? 'Sending...' : 'Send Reset Email'}
//         </button>
//         {message && <p className={`message ${message.includes('error') ? 'error' : 'success'}`}>{message}</p>}
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'; // Import the CSS file

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:2000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset email sent');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <h2>Forgot Password</h2>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <button
          className="forgot-password-btn"
          onClick={handleForgotPassword}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
        {message && <p className={`message ${message.includes('error') ? 'error' : 'success'}`}>{message}</p>}

        <div className="extra-links">
          <p>
            Remember your password? <Link to="/login" className="link">Login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register" className="link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
