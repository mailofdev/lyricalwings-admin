
import React from 'react';
import { authData, provider } from "../config/firebase"
import { signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setIsAuth }) => {
    let navigate = useNavigate();

    // Flag to determine if it's a Firebase login
    const isFirebaseLogin = false;

    // Function to handle sign in with Google
    const signInWithGoogle = () => {
        signInWithPopup(authData, provider).then((result) => {
            localStorage.setItem("isAuth", true);
            // Set user authentication status
            setIsAuth(true); 
            // Navigate to the MainScreen page
            navigate('/MainScreen');
        })
    }

    return (
        // Container to center the login content vertically and horizontally
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            {/* Card to contain the login form */}
            <div className="card text-center">
                <div className="card-body">
                    {/* Title of the card */}
                    <h5 className="card-title">Login</h5>
                    {/* Conditional rendering based on isFirebaseLogin flag */}
                    {isFirebaseLogin ? (
                        // Button for signing in with Google
                        <button className="btn btn-primary btn-block mb-3" onClick={signInWithGoogle}>
                            Sign in with Google
                        </button>
                    ) : (
                        // Link to the MainScreen page (token login)
                        <Link to="/MainScreen" className="btn btn-success btn-block">Login</Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;