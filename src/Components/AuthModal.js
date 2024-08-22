import React, {  useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DynamicForm from '../Components/DynamicForm';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import {  Modal, Spinner } from 'react-bootstrap';
import { authConfig } from '../Common/commonFunction';

import { loginUser } from '../redux/userAuthSlice';

const AuthModal = ({ show, handleClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useRef(null);
    const { status, error } = useSelector(state => state.userAuth.auth);

    const handleFormSubmit = (data) => {
        const userData = { authEmail: data.email, authPassword: data.password };
    
        dispatch(loginUser(userData))
            .unwrap()
            .then(() => {
                showToast('success', 'Success', 'Signed in successfully');
                navigate('/dashboard');
                handleClose();
            })
            .catch((error) => showToast('error', 'Error', error));
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };



    return (
        <Modal show={show} onHide={handleClose} centered className='modal-gradient'>
            <div className='modal-body-gradient rounded'>
            <Modal.Header>
                <Modal.Title className="w-100 text-center bg-none">
                    Sign In
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Toast ref={toast} />
                {status === 'loading' ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status" />
                        <p>Signing in...</p>
                    </div>
                ) : (
                    <>
                        <DynamicForm
                            formConfig={authConfig['SignIn']}
                            onSubmit={handleFormSubmit}
                            buttonLabel='Sign In to lhyricalwings'
                            requiredFields={['email', 'password']}
                        />
                        <div className='text-center'> 
                        {error && <p className="text-danger">{error}</p>}
                        </div>
                    </>
                )}
            </Modal.Body>
            </div>
        </Modal>
    );
};

export default AuthModal;


// import React, { useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import DynamicForm from '../Components/DynamicForm';
// import { Toast } from 'primereact/toast';
// import { useNavigate } from 'react-router-dom';
// import { Button, Modal, Spinner } from 'react-bootstrap';
// import { authConfig } from '../Common/commonFunction';
// import { FaGoogle } from 'react-icons/fa';
// import { loginUser, signupUser, googleSignIn } from '../redux/userAuthSlice';

// const AuthModal = ({ show, handleClose }) => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const [authType, setAuthType] = useState('signin');
//     const toast = useRef(null);
//     const { status, error } = useSelector(state => state.userAuth.auth);

//     const handleFormSubmit = (data) => {
//         console.log(data);
//         const action = authType === 'signin' ? loginUser : signupUser;
//         const userData = authType === 'signin' ?
//             { authEmail: data.email, authPassword: data.password } :
//             {
//                 authEmail: data.email,
//                 authPassword: data.password,
//                 authUsername: data.username,
//                 authBirthday: data.birthdate, // This is already a Date object from the Calendar component
//                 authCity: data.city,
//                 authGender: data.gender,
//                 authCountry: data.country
//             };
    
//         dispatch(action(userData))
//             .unwrap()
//             .then(() => {
//                 showToast('success', 'Success', authType === 'signin' ? 'Signed in successfully' : 'Signed up successfully');
//                 navigate('/dashboard');
//                 handleClose();
//             })
//             .catch((error) => showToast('error', 'Error', error));
//     };

//     const showToast = (severity, summary, detail) => {
//         toast.current.show({ severity, summary, detail, life: 3000 });
//     };

//     const handleGoogleSignIn = () => {
//         dispatch(googleSignIn())
//             .unwrap()
//             .then(() => {
//                 showToast('success', 'Success', 'Signed in with Google successfully');
//                 navigate('/dashboard');
//                 handleClose();
//             })
//             .catch((error) => showToast('error', 'Error', error));
//     };

//     const getLoaderMessage = () => {
//         switch(authType) {
//             case 'signin': return 'Signing in...';
//             case 'signup': return 'Creating your account...';
//             default: return 'Processing...';
//         }
//     };

//     return (
//         <Modal show={show} onHide={handleClose} centered className='modal-gradient'>
//             <div className='modal-body-gradient rounded'>
//             <Modal.Header>
//                 <Modal.Title className="w-100 text-center bg-none">
//                     {authType === 'signup' ? 'Sign Up' : 'Sign In'}
//                 </Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <Toast ref={toast} />
//                 {status === 'loading' ? (
//                     <div className="text-center">
//                         <Spinner animation="border" role="status" />
//                         <p>{getLoaderMessage()}</p>
//                     </div>
//                 ) : (
//                     <>
//                         <DynamicForm
//                             formConfig={authConfig[authType === 'signin' ? 'SignIn' : 'SignUp']}
//                             onSubmit={handleFormSubmit}
//                             buttonLabel={authType === 'signup' ? 'Sign Up' : 'Sign In'}
//                             requiredFields={authType === 'signin' ? 
//                                 ['email', 'password'] : 
//                                 ['email', 'password', 'username', 'birthdate', 'city', 'gender']
//                             }
//                         />
//                         {error && <p className="text-danger">{error}</p>}
//                         <div className="text-center mt-3">
//                             <Button variant="link" onClick={() => setAuthType(authType === 'signin' ? 'signup' : 'signin')}>
//                                 {authType === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
//                             </Button>
//                         </div>
//                         <div className='text-center mt-3'>or</div>
//                         <div className="d-grid gap-2">
//                             <Button variant="outline-dark" onClick={handleGoogleSignIn} size="lg">
//                                 <FaGoogle className="me-2" /> Sign In with Google
//                             </Button>
//                         </div>
//                     </>
//                 )}
//             </Modal.Body>
//             </div>
//         </Modal>
//     );
// };

// export default AuthModal;