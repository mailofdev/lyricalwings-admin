import React, { useState } from 'react';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import Loader from '../Components/Loader';
import "../css/loader.css";
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../redux/userAuthSlice';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';

const AuthModal = ({ show, handleClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [birthday, setBirthday] = useState('');
    const [city, setCity] = useState('');
    const [gender, setGender] = useState('');
    const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const provider = new GoogleAuthProvider();
    const { status, error: authError } = useSelector(state => state.userAuth.auth);

    const customErrorMessages = {
        'auth/user-not-found': 'User not found. Please check your email.',
        'auth/wrong-password': 'Invalid password. Please try again.',
        'auth/invalid-credential': 'Invalid credential',
        'auth/email-already-in-use': 'Email is already in use. Please log in.',
        'auth/weak-password': 'Password should be at least 6 characters long.'
    };

    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingMessage('Signing in...');

        try {
            await dispatch(loginUser({ authEmail: email, authPassword: password })).unwrap();
            setError('');
            handleClose();
            navigate('/Dashboard');
        } catch (error) {
            console.error("Error signing in:", error);
            setError(customErrorMessages[error.code] || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingMessage('Signing up...');

        try {
            await dispatch(signupUser({
                authEmail: email,
                authPassword: password,
                authUsername: username,
                authBirthday: birthday,
                authCity: city,
                authGender: gender,
            })).unwrap();
            setError('');
            handleClose();
            navigate('/Dashboard');
        } catch (error) {
            console.error("Error signing up:", error);
            setError(customErrorMessages[error.code] || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setLoadingMessage('Signing in with Google...');
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await dispatch(signupUser({
                authEmail: user.email,
                authPassword: '', // Not needed for Google sign-in
                authUsername: user.displayName || ''
            })).unwrap();
            setError('');
            handleClose();
            navigate('/Dashboard');
        } catch (error) {
            console.error("Error signing in with Google:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" className='modal-gradient'>
            <Modal.Header className="bg-none shadow-lg">
                <Modal.Title className="w-100 text-center">
                    <h2>{authMode === 'signin' ? 'Welcome Back!' : 'Create an Account'}</h2>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 modal-body-gradient rounded">
                {loading ? (
                    <Loader loadingMessage={loadingMessage} />
                ) : (
                    <Container className='rounded'>
                        <Row className="justify-content-center">
                            <Col md={10} className='gap-4 d-flex flex-column'>
                                <Form onSubmit={authMode === 'signin' ? handleSignInSubmit : handleSignUpSubmit}
                                    className="p-4 rounded shadow-lg d-flex flex-column gap-4 form-gradient">
                                    
                                    <Form.Group>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required={authMode === 'signin'}
                                            placeholder="Enter your email"
                                            className="bg-transparent"
                                        />
                                    </Form.Group>

                                    {authMode === 'signup' && (
                                        <>
                                            <Form.Group>
                                                <Form.Label>Username</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                    placeholder="Choose a username"
                                                    className="bg-transparent"
                                                />
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label>Birthday</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={birthday}
                                                    onChange={(e) => setBirthday(e.target.value)}
                                                    required
                                                    className="bg-transparent"
                                                />
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label>City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    required
                                                    placeholder="Enter your city"
                                                    className="bg-transparent"
                                                />
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label>Gender</Form.Label>
                                                <Form.Select
                                                    value={gender}
                                                    onChange={(e) => setGender(e.target.value)}
                                                    required
                                                    className="bg-transparent"
                                                >
                                                    <option value="" disabled>Select your gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </>
                                    )}

                                    <Form.Group>
                                        <Form.Label>Password</Form.Label>
                                        <div className="input-group">
                                            <Form.Control
                                                type={passwordVisible ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="Enter your password"
                                                className="bg-transparent"
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setPasswordVisible(!passwordVisible)}
                                            >
                                                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </div>
                                    </Form.Group>

                                    <div className="d-grid gap-2 ">
                                        <Button variant="outline-success" type="submit" size="lg">
                                            {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center">
                                    <Button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
                                        {authMode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                                    </Button>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button variant="outline-dark" onClick={handleGoogleSignIn} size="lg">
                                        <FaGoogle className="me-2" /> Sign In with Google
                                    </Button>
                                </div>

                                {error && (
                                    <div className='alert alert-danger mt-4 text-center' role="alert">
                                        {error}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Container>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;
