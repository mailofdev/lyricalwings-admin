import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../Config/firebase';
import Loader from './Loader';
import "../css/loader.css"
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ show, handleClose }) => {
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [signinError, setSigninError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const customSigninErrorMessages = {
        'auth/user-not-found': 'User not found. Please check your email.',
        'auth/wrong-password': 'Invalid password. Please try again.',
        'auth/invalid-credential': 'Invalid credential'
    };

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingMessage('Signing in...');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
            setSigninError('');
            handleClose();
            navigate('/Dashboard');
            setSignInEmail('');
            setSignInPassword('');
        } catch (error) {
            console.error("Error signing in:", error);
            if (customSigninErrorMessages[error.code]) {
                setSigninError(customSigninErrorMessages[error.code]);
            } else {
                setSigninError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose()} centered>
            <Modal.Header>
                <Modal.Title>Sign In</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <Loader loadingMessage={loadingMessage} />
                ) : (
                    <div className='d-flex gap-3 flex-column card shadow m-2 p-4'>
                        <form onSubmit={handleSignInSubmit}>
                            <div className="mb-3">
                                <label htmlFor="signInEmail" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="signInEmail"
                                    value={signInEmail}
                                    onChange={(e) => setSignInEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="signInPassword" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="signInPassword"
                                    value={signInPassword}
                                    onChange={(e) => setSignInPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className='text-center align-items-center'>
                                <Button variant="primary" type="submit">Sign In</Button>
                            </div>
                        </form>
                        {signinError && (<div className='text-danger text-center'>{signinError}</div>)}
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;
