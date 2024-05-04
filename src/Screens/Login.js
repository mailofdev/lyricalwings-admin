import React, { useState } from "react";
import { googleLogin } from "../Config/firebase";
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa'; 
import Loader from "../Components/Loader"; 
import "../css/loader.css";
import "../css/login.css"; 

function Login() {
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false); 
  const navigate = useNavigate();

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

  const login = () => {
    setLoggingIn(true);
    setTimeout(() => {
      navigate('/Dashboard');
      setLoggingIn(false); 
    }, 1000); 
  };

  return (
    <div className="container mt-5" >
      <div className="row justify-content-center card-in-center">
        <div className="col-md-6">
          <div className="card p-4 shadow login-form">
            <div className="card-body">
              <h3 className="text-center mb-4">Lyricalwings admin</h3>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="d-flex flex-column gap-3 align-items-center">
                <button onClick={login} className="btn btn-primary w-75">Login without auth</button>
                <button onClick={handleGoogleLogin} className="btn btn-primary google-login w-75">
                  <FaGoogle className="google-icon" /> Login with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loggingIn && <Loader loadingMessage="Logging in..." />} 
    </div>
  );
}

export default Login;
