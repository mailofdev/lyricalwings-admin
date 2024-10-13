import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Button, Container, Row, Col, Card,  } from 'react-bootstrap';
import { loginUser, resetPassword } from '../redux/authSlice';
import Loader from '../components/Loader';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import '../css/auth.css';
import logo from '../images/logo.png';

const Login = ({ show, handleClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);


  const { error: authError, loading: authLoading } = useSelector(state => state.auth);

  // Component states
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');


  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Invalid email address');
      return;
    }

    switch (authMode) {
      case 'signin':
        dispatch(loginUser({ email, password }))
          .unwrap()
          .then(() => {
            showToast('success', 'Success', 'Signed in successfully');
            navigate('/Dashboard');
            handleClose();
          })
          .catch((error) => showToast('error', 'Error', error));
        break;
      case 'forgotPassword':
        dispatch(resetPassword(email))
          .unwrap()
          .then(() => {
            showToast('success', 'Success', 'Password reset email sent');
            setAuthMode('signin');
          })
          .catch((error) => showToast('error', 'Error', error));
        break;
      default:
        break;
    }
  };

  // Show toast messages
  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Render form
  const renderForm = () => {
    return (
      <Form onSubmit={handleSubmit} className="auth-form">
        <Form.Group className="mb-3">
          <Form.Control
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            required
            isInvalid={!!emailError}
          />
          {emailError && <Form.Text className="text-danger">{emailError}</Form.Text>}
        </Form.Group>
        {authMode === 'signin' && (
          <Form.Group className="mb-3 position-relative">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              variant="link"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </Form.Group>
        )}
        <Button variant="primary" type="submit" className="w-100 auth-submit-btn">
          {authMode === 'signin' ? 'Sign In' : 'Reset Password'}
        </Button>
      </Form>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="auth-modal" style={{background: 'linear-gradient(135deg, #babcf0, #9c9fd0)'}}>
      <Modal.Body className="p-0">
        <Container fluid>
          <Row className="h-100">
            <Col md={6} className="auth-banner d-flex align-items-center justify-content-center">
              <div className="text-center">
                        <div className="text-center mb-3">
                          <LazyLoadImage
                            src={logo}
                            alt="Login Logo"
                            effect="blur"
                            className="img-fluid"
                            style={{ maxHeight: '100px', width: 'auto' }}
                          />
                        </div>
                    </div>
            </Col>
            <Col md={6} className="auth-form-container p-5">
              <Toast ref={toast} />
              {authLoading ? (
                <Loader loadingMessage="Processing..." />
              ) : (
                <Card className="auth-card">
                  <Card.Body>
                    <div className="text-center mb-4 auth-title fs-3">
                      {authMode === 'signin' ? '' : 'Reset Password'}
                    </div>
                    {renderForm()}
                    {authError && <p className="text-danger mt-3">{authError}</p>}
                    <div className="mt-3 text-center auth-links">
                      {authMode === 'signin' && (
                        <Button variant="link" onClick={() => setAuthMode('forgotPassword')}>
                          Forgot password?
                        </Button>
                      )}
                      {authMode === 'forgotPassword' && (
                        <Button variant="link" onClick={() => setAuthMode('signin')}>
                          Back to Sign In
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
