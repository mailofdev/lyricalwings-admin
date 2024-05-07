import React, { useState } from 'react';
import { emailPasswordSignUp, emailPasswordLogin } from '../Config/firebase';
import Loader from '../Components/Loader';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await emailPasswordSignUp(email, password);
      // You can add additional logic here, such as redirecting the user to another page after successful sign-up
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await emailPasswordLogin(email, password);
      // You can add additional logic here, such as redirecting the user to another page after successful sign-in
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow gap-4">
        <h2 className="text-center mb-4">Add new admin</h2>
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleSignUp} className="btn btn-primary w-100 mb-2">
          Sign Up
        </button>
        {/* <button onClick={handleSignIn} className="btn btn-primary w-100">
          Sign In
        </button> */}
        {loading && <Loader loadingMessage="Processing..." />}
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default Settings;
