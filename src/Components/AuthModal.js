import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, orderByChild, equalTo, query, get } from "firebase/database";
import { auth } from '../Config/firebase';
import Loader from './Loader';
import "../css/loader.css"
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ show, handleClose }) => {
    const [signInIdentifier, setSignInIdentifier] = useState('');
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
            let email = signInIdentifier;
            // If the identifier is not an email, assume it's a username and fetch the email
            if (!signInIdentifier.includes('@')) {
                const db = getDatabase();
                const usersRef = ref(db, 'users');
                const queryRef = query(usersRef, orderByChild('username'), equalTo(signInIdentifier));
                const snapshot = await get(queryRef);

                if (snapshot.exists()) {
                    const userData = Object.values(snapshot.val())[0];
                    email = userData.email;
                } else {
                    throw new Error('auth/user-not-found');
                }
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, signInPassword);
            setSigninError('');
            handleClose();
            navigate('/Dashboard');
            setSignInIdentifier('');
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
        <Modal show={show} onHide={handleClose} centered>
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
                                <label htmlFor="signInIdentifier" className="form-label">Email or Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="signInIdentifier"
                                    value={signInIdentifier}
                                    onChange={(e) => setSignInIdentifier(e.target.value)}
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
