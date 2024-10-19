import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import DynamicForm from '../components/DynamicForm';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { addNewUser, deleteExistingUser, updateUserInfo, fetchUser } from '../redux/authSlice';

const UserList = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Memoized selectors
    const selectUsers = useCallback((state) => state.auth.users, []);
    const selectLoading = useCallback((state) => state.auth.loading, []);
    const selectCurrentUser = useCallback((state) => state.auth.user, []);

    const users = useSelector(selectUsers);
    const loading = useSelector(selectLoading);
    const currentUser = useSelector(selectCurrentUser);

    const formConfig = useMemo(() => [
        {
            fields: [
                { type: 'input', name: 'username', label: 'Username' },
                { type: 'email', name: 'email', label: 'Email' },
                { type: 'password', name: 'password', label: 'Password' },
             ]
        }
    ], []);

    const customHeadersAndKeys = useMemo(() => [
        { header: 'Username', key: 'username' },
        { header: 'Email', key: 'email' },
        { header: 'Created At', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() }
    ], []);

    useEffect(() => {
        if (!hasFetched && currentUser) {
            setHasFetched(true);
            dispatch(fetchUser());
        }
    }, [dispatch, hasFetched, currentUser]);

    const handleFormSubmit = useCallback((data, formType) => {
        console.log(data)
        if (formType === 'add') {
            dispatch(addNewUser(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updateUserInfo({ uid: data.uid, ...data }));
        }
    }, [dispatch]);

    const handleDelete = useCallback((item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (itemToDelete) {
            dispatch(deleteExistingUser(itemToDelete.uid));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    }, [itemToDelete, dispatch]);

    const cancelDelete = useCallback(() => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    }, []);

    const cancelForm = useCallback(() => {
        setSelectedUser(null);
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    return (
        <div>
            {showForm && (
                <div className='my-2'>
                    <DynamicForm
                        className="shadow-md form-list funky-card"
                        formConfig={formConfig}
                        onSubmit={handleFormSubmit}
                        editingItem={editingItem}
                        title={editingItem ? 'Edit User' : 'Add User'}
                        formType={editingItem ? 'edit' : 'add'}
                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                    />
                </div>
            )}
            {loading ? (
                <Loader loadingMessage="Fetching users..." />
            ) : (
                <div className='my-2'>
                    <DynamicList
                        data={users}
                        listType='grid'
                        customHeadersAndKeys={customHeadersAndKeys}
                        onAddNew={handleAddNew}
                        onEdit={handleFormSubmit}
                        onDelete={handleDelete}
                        noRecordMessage="No users found."
                        className="shadow-md form-list funky-card"
                        formConfig={formConfig}
                        isShowOnDashboard={true}
                        rowXS="1"
                        rowMD="2"
                        rowLG="3"
                    />
                </div>
            )}
            <ConfirmDialog
                visible={confirmDialogVisible}
                onHide={cancelDelete}
                message={`Are you sure you want to delete the user "${itemToDelete?.username}"?`}
                header="Confirm Deletion"
                accept={confirmDelete}
                reject={cancelDelete}
            />
            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <DynamicForm
                    className="shadow-md form-list funky-card"
                    formConfig={formConfig}
                    onSubmit={handleFormSubmit}
                    editingItem={selectedUser}
                    title="Edit User"
                    formType="edit"
                    buttonLabel="Update"
                    cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                />
            </Modal>
        </div>
    );
};

export default UserList;