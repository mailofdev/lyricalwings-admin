import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, signoutUser } from '../redux/userAuthSlice';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

const User = () => {
    const dispatch = useDispatch();
    const usersState = useSelector(state => state.userAuth.users);
    const authState = useSelector(state => state.userAuth.auth);
    const { data: users = [], status, error } = usersState || {}; 
    const { user: loggedInUser } = authState || {}; 
    const [userToDelete, setUserToDelete] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [displayDialog, setDisplayDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchUsers());
        }
    }, [dispatch, status]);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDisplayDialog(true);
    };

    const handleSignout = async () => {
        try {
            await dispatch(signoutUser());
            navigate('/');
        } catch (error) {
            setLocalError(error.message);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            if (auth.currentUser.uid === userToDelete.uid) {
                dispatch(deleteUser(userToDelete.uid));
                setUserToDelete(null);
                setDisplayDialog(false);
            } else {
                alert("Logged in user does not match the user to be deleted.");
            }
        } catch (error) {
            setLocalError(error.message);
        }
    };

    const renderFooter = () => (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text" />
            <Button label="Confirm" icon="pi pi-check" onClick={handleLogin} autoFocus />
        </div>
    );

    return (
        <div className="container mt-5">
            <div className="text-center">
                <Button onClick={handleSignout} className="p-button-secondary mt-3">
                    <FaSignOutAlt /> {loggedInUser?.displayName || 'Anonymous user'}
                </Button>
            </div>
            <div className="col-md-12">
                <h2 className="mb-4">Users List</h2>
                {status === 'loading' && <p>Loading...</p>}
                {status === 'failed' && <p className="text-danger">Error: {error}</p>}
                {status === 'succeeded' && (
                    <DataTable value={users} paginator rows={10} className="p-datatable-customers">
                        <Column field="email" header="Email" />
                        <Column field="username" header="Username" />
                        <Column field="role" header="Role" />
                        <Column field="birthdate" header="Birth date" />
                        <Column field="city" header="City" />
                        <Column
                            body={(rowData) => (
                                <Button
                                    icon={<FaTrash />}
                                    className="p-button-danger p-button-rounded"
                                    onClick={() => handleDeleteClick(rowData)}
                                />
                            )}
                            header="Actions"
                        />
                    </DataTable>
                )}
            </div>

            <Dialog
                header="Confirm Deletion"
                visible={displayDialog}
                footer={renderFooter}
                onHide={() => setDisplayDialog(false)}
            >
                <p>Please log in again to confirm deletion of user: {userToDelete?.email}</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="loginEmail">Email</label>
                        <input
                            id="loginEmail"
                            type="email"
                            className="form-control"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label htmlFor="loginPassword">Password</label>
                        <input
                            id="loginPassword"
                            type="password"
                            className="form-control"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                </form>
                {localError && <div className="alert alert-danger mt-3">{localError}</div>}
            </Dialog>
        </div>
    );
};

export default User;
