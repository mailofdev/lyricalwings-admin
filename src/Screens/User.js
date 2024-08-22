import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DynamicForm from '../Components/DynamicForm';
import { Toast } from 'primereact/toast';
import { Button, Container } from 'react-bootstrap';
import { authConfig } from '../Common/commonFunction';
import { signupUser, fetchUsers, deleteUser } from '../redux/userAuthSlice';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaTrash } from 'react-icons/fa';
import Loader from '../Components/Loader';
import { ConfirmDialog } from 'primereact/confirmdialog'; // Import the ConfirmDialog component from PrimeReact

const User = () => {
    const dispatch = useDispatch();
    const toast = useRef(null);
    const usersState = useSelector(state => state.userAuth.users);
    const { data: users = [], status: usersStatus, error: usersError } = usersState || {};
    const { status: authStatus, error: authError, loadingMessage } = useSelector(state => state.userAuth.auth);
    const [showForm, setShowForm] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const adminList = users.filter(user => user.role === 'admin');
    const userList = users.filter(user => user.role === 'user');

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleFormSubmit = (data) => {
        const userData = {
            authEmail: data.email,
            authPassword: data.password,
            authUsername: data.username,
            authBirthday: data.birthdate,
            authCity: data.city,
            authGender: data.gender,
            authCountry: data.country
        };
        dispatch(signupUser(userData))
            .unwrap()
            .then(() => {
                setShowForm(false);
                showToast('success', 'Success', `User ${data.username} created successfully.`);
                dispatch(fetchUsers());
            })
            .catch((error) => showToast('error', 'Error', error));
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            setDeletingUserId(userToDelete.uid);
            dispatch(deleteUser(userToDelete.uid))
                .unwrap()
                .then(() => {
                    showToast('success', 'Success', `User ${userToDelete.email} deleted successfully.`);
                    dispatch(fetchUsers()); // Refresh the user list
                })
                .catch((error) => showToast('error', 'Error', error))
                .finally(() => {
                    setDeletingUserId(null);
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                });
        }
    };

    const renderUserTable = (userList, title) => (
        <div className="card shadow-sm p-2">
            <h4 className="mb-3">{title} ({userList.length})</h4>
            <DataTable value={userList} paginator rows={5} className="p-datatable-customers">
                <Column field="email" header="Email" />
                <Column field="displayName" header="Username" />
                <Column field="birthday" header="Birth date" />
                <Column field="city" header="City" />
                <Column field="country" header="Country" />
                {/* <Column
                    body={(rowData) => (
                        <Button variant='danger' onClick={() => confirmDelete(rowData)} disabled={deletingUserId === rowData.uid}>
                            <FaTrash /> {deletingUserId === rowData.uid ? 'Deleting...' : ''}
                        </Button>
                    )}
                    header="Actions"
                /> */}
            </DataTable>
        </div>
    );

    return (
        <Container>
            <Toast ref={toast} />
            {loadingMessage ? (
                <Loader loadingMessage={loadingMessage} />
            ) : (
                <>
                    <div className="gap-3 d-flex flex-column py-4">
                        {usersStatus === 'loading' ? (
                            <Loader loadingMessage="Loading users..." />
                        ) : usersStatus === 'failed' ? (
                            <p className="text-danger">{usersError}</p>
                        ) : (
                            <>
                                <div className="gap-3 d-flex flex-column">
                                    {renderUserTable(userList, "User list")}
                                    {renderUserTable(adminList, "Admin list")}
                                </div>
                            </>
                        )}

                        <ConfirmDialog
                            visible={showDeleteConfirm}
                            onHide={() => setShowDeleteConfirm(false)}
                            message={`Are you sure you want to delete user ${userToDelete?.email}? This action cannot be undone.`}
                            header="Confirm Delete"
                            icon="pi pi-exclamation-triangle"
                            accept={handleDeleteUser}
                            reject={() => setShowDeleteConfirm(false)}
                            acceptLabel="Delete"
                            rejectLabel="Cancel"
                        />

                        {showForm ? (
                            <div className="gap-3 d-flex flex-column">
                                <DynamicForm
                                    formConfig={authConfig.SignUp}
                                    onSubmit={handleFormSubmit}
                                    buttonLabel="Sign Up"
                                    className="dynamic-form"
                                    title="Create new user"
                                    requiredFields={['email', 'password', 'username', 'birthdate', 'city', 'country', 'gender']}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        ) : (
                            <div className="text-center">
                                <Button onClick={() => setShowForm(true)}>Add new admin</Button>
                            </div>
                        )}

                        {authError && <p className="text-danger">{authError}</p>}
                    </div>
                </>
            )}
        </Container>
    );
};

export default User;
