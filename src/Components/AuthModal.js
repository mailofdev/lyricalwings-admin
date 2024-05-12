import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db, auth, ref, get, set } from '../Config/firebase';
import Loader from './Loader';
import "../css/loader.css"
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ show, handleClose }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    // const [selectedDate, setSelectedDate] = useState(null);
    // const [selectedGender, setSelectedGender] = useState(null);
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [signupError, setSignupError] = useState('');
    const [signinError, setSigninError] = useState('');
    const [updateInfoUsername, setUpdateInfoUsername] = useState('');
    // const [updateInfoSelectedDate, setUpdateInfoSelectedDate] = useState(null);
    // const [updateInfoSelectedGender, setUpdateInfoSelectedGender] = useState(null);
    const [toggleUpdateInfo, setToggleUpdateInfo] = useState(false);
    const [updateInfoError, setUpdateInfoError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const customSignupErrorMessages = {
        'auth/email-already-in-use': 'Email is already in use.',
        'auth/weak-password': 'Password should be at least 6 characters long.'
    };

    const customSigninErrorMessages = {
        'auth/user-not-found': 'User not found. Please check your email.',
        'auth/wrong-password': 'Invalid password. Please try again.',
        'auth/invalid-credential': 'Invalid credential'
    };
    const customGooglepopupErrorMessages = {
        'auth/user-not-found': 'User not found. Please check your email.',
        'auth/wrong-password': 'Invalid password. Please try again.',
        'auth/invalid-credential': 'Invalid credential'
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingMessage('Signing up...');
        if (!username || !email || !createPassword) {
            setSignupError('Please fill out all fields');
            setLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, createPassword);
            const user = userCredential.user;
            await set(ref(db, 'users/' + user.uid), {
                username,
                email,
                authMethod: 'signup',
                role:'admin'
            });
            setSignupError('');
            handleClose();
            navigate('/Dashboard');
            setUsername('');
            setEmail('');
            setCreatePassword('');
        } catch (error) {
            console.error("Error creating user:", error);
            if (customSignupErrorMessages[error.code]) {
                setSignupError(customSignupErrorMessages[error.code]);
            } else {
                setSignupError(error.message);
            }
        } finally {
            setLoading(false);
        }
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
        }
        finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        setLoading(true);
        setLoadingMessage('Signing in...');
        try {
            const result = await signInWithPopup(auth, provider);
            if (result && result.user) {
                const existingUserSnapshot = await get(ref(db, `users/${result.user.uid}`));
                if (existingUserSnapshot.exists()) {
                    setUpdateInfoError("Email already exists.");
                    return;
                }
                setEmail(result.user.email);
                setToggleUpdateInfo(true);
            }
        } catch (error) {
            console.error("Error signing in with Google:", error);
            // Handle sign-in errors
        }
        finally {
            setLoading(false);
        }

    };

    const handleUpdateUserInfo = async (e) => {
        e.preventDefault();
        if (!updateInfoUsername) {
            setUpdateInfoError('Please fill out all fields');
            return;
        }
        try {
            const user = auth.currentUser;
            if (user) {
                await set(ref(db, 'users/' + user.uid), {
                    username: updateInfoUsername,
                    email: email,
                    authMethod: 'google',
                    role:'admin'
                });
                handleClose();
                navigate('/Dashboard');
                setUpdateInfoUsername('');
                setEmail('');

            }
        } catch (error) {
            console.error("Error saving additional info:", error);
        }
    };

    const genders = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ];

    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    const cleanupState = () => {
        setUsername('');
        setEmail('');
        setCreatePassword('');
        setSignInEmail('');
        setSignInPassword('');
        setIsSignUp(true);
        setSignupError('');
        setSigninError('');
        setUpdateInfoUsername('');
        setToggleUpdateInfo(false);
        setUpdateInfoError('');
    };

    return (
        <Modal show={show}  onHide={handleClose()} centered>
            <Modal.Header >
                <Modal.Title>
                    {isSignUp && !toggleUpdateInfo ? 'Sign Up' : ''}
                    {!isSignUp && !toggleUpdateInfo ? 'Sign In' : ''}
                    {toggleUpdateInfo && 'Update Information'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <Loader loadingMessage={loadingMessage} />
                ) : (
                    <>
                        {toggleUpdateInfo ? (
                            <div className='d-flex gap-3 flex-column card shadow m-2 p-4'>
                                <form onSubmit={handleUpdateUserInfo}>
                                    <div className='d-flex gap-4 flex-column'>
                                        <div className="">
                                            <label htmlFor="updateInfoUsername" className="form-label">Username</label>
                                            <input type="text" className="form-control" id="updateInfoUsername" value={updateInfoUsername} onChange={(e) => setUpdateInfoUsername(e.target.value)} required />
                                        </div>
                                        <Button variant="primary" type="submit">Save additional Information</Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            isSignUp ? (
                                <div className='d-flex gap-3 flex-column card shadow m-2 p-4'>
                                    <form onSubmit={handleSignupSubmit}>
                                        <div className='d-flex gap-4 flex-column'>
                                            <div className="">
                                                <label htmlFor="username" className="form-label">Username</label>
                                                <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                            </div>
                                            <div className="">
                                                <label htmlFor="email" className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="">
                                                <label htmlFor="createpassword" className="form-label">Password</label>
                                                <input type="password" className="form-control" id="createpassword"
                                                    value={createPassword}
                                                    onChange={(e) => setCreatePassword(e.target.value)}
                                                    required />
                                            </div>

                                            <Button variant="primary" type="submit">Sign Up</Button>
                                        </div>
                                    </form>
                                    {signupError && (<div className='text-danger text-center'>{signupError}</div>)}
                                    <p className="mt-3 text-center">Already have an account? <span onClick={toggleForm} className="text-primary" style={{ cursor: 'pointer' }}>Sign in</span></p>
                                    <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
                                    {updateInfoError && (<div className='text-danger text-center'>{updateInfoError}</div>)}
                                </div>
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
                                        <div className='text-center align-items-center' >
                                            <Button variant="primary" type="submit">Sign In</Button>
                                        </div>
                                    </form>
                                    {signinError && (<div className='text-danger text-center'>{signinError}</div>)}
                                    <p className="mt-3 text-center">Don't have an account? <span onClick={toggleForm} className="text-primary" style={{ cursor: 'pointer' }}>Sign up</span></p>
                                </div>
                            )
                        )}
                    </>

                )}
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;
