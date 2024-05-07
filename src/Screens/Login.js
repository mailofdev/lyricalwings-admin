import React, { useState } from "react";
import { emailPasswordLogin, googleLogin } from "../Config/firebase";
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa'; 
import Loader from "../Components/Loader"; 
import "../css/loader.css";
import "../css/login.css"; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false); 
  const navigate = useNavigate();

  const handleEmailPasswordLogin = () => {
    // Validate email and password
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoggingIn(true);
    emailPasswordLogin(email, password)
      .then(() => {
        navigate('/Dashboard');
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoggingIn(false); 
      });
  };

  const handleGoogleLogin = () => {
    setLoggingIn(true); 
    googleLogin()
      .then(() => {
        navigate('/Dashboard');
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoggingIn(false); 
      });
  };

  return (
    <div className="container mt-5" >
      <div className="row justify-content-center card-in-center">
        <div className="col-md-6">
          <div className="card p-4 shadow login-form">
            <div className="card-body">
              <h3 className="text-center mb-4">Lyricalwings admin</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button onClick={handleEmailPasswordLogin} className="btn btn-primary w-100 mb-3">Login with Email</button>
              <button onClick={handleGoogleLogin} className="btn btn-primary google-login w-100">
                <FaGoogle className="google-icon" /> Login with Google
              </button>
            </div>
          </div>
        </div>
      </div>
      {loggingIn && <Loader loadingMessage="Logging in..." />} 
    </div>
  );
}

export default Login;
