import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../common/firebase';
import NoDataMessage from '../components/NoDataMessage';
import { addNewUser, deleteExistingUser, updateUserInfo } from '../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Alert, Button } from 'react-bootstrap';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { InputText } from 'primereact/inputtext';
import { FaPlus, FaPencilAlt, FaTrash, FaSearch } from 'react-icons/fa';
import Loader from '../components/Loader';
import AuthForm from '../components/AuthForm';

const Userlist = () => {
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { error } = useSelector(state => state.auth);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    const formConfig = [
        {
            fields: [
                { type: 'input', name: 'username', label: 'Username' },
                { type: 'email', name: 'email', label: 'Email' },
                { type: 'password', name: 'password', label: 'Password' },
            ],
        },
    ];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const usersList = Object.entries(usersData).map(([key, value]) => ({
                    uid: key,
                    ...value,
                }));
                setUsers(usersList);
                setFilteredList(usersList);
            } else {
                setUsers([]);
                setFilteredList([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter((user) =>
            Object.values(user).some(val =>
                val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredList(filtered);
        setCurrentPage(0);
    }, [searchTerm, users]);

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(addNewUser(data));
        } else if (formType === 'edit') {
            dispatch(updateUserInfo({ uid: editingItem.uid, ...data }));
        }
        setShowForm(false);
        fetchUsers();
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = (item) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            dispatch(deleteExistingUser(item.uid));
            fetchUsers();
        }
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const onPageChange = (e) => {
        setCurrentPage(e.page);
    };

    const actionTemplate = (rowData) => {
        return (
            <div className="d-flex justify-content-center">
                <Button variant="outline-primary" className="me-2" onClick={() => handleEdit(rowData)}>
                    <FaPencilAlt />
                </Button>
                {/* <Button variant="outline-danger" onClick={() => handleDelete(rowData)}>
                    <FaTrash />
                </Button> */}
            </div>
        );
    };

    const renderHeader = () => {
        return (
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="primary" onClick={handleAddNew}>
                    <FaPlus className="me-2" /> Add New User
                </Button>
                <div className="position-relative">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-2" />
                    <InputText
                        type="text"
                        className="form-control ps-4"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="py-4">
            <Card className="shadow-sm">
                <Card.Body>
                    {showForm && (
                        <AuthForm
                            formConfig={formConfig}
                            onSubmit={handleFormSubmit}
                            editingItem={editingItem}
                            buttonLabel={editingItem ? 'Update User' : 'Add User'}
                            cancelConfig={{ label: 'Cancel', onCancel: () => setShowForm(false) }}
                        />
                    )}

                    {loading && <Loader loadingMessage="Fetching users..." />}

                    {!loading && error && (
                        <Alert variant="danger" className="mt-3">
                            {error}
                        </Alert>
                    )}

                    {!loading && !error && users.length === 0 && (
                        <NoDataMessage message="No users found" onActionClick={handleAddNew} />
                    )}

                    {!loading && !error && users.length > 0 && (
                        <>
                            <h4 className='py-2'>Total users: {users.length}</h4>
                            {renderHeader()}

                            <DataTable
                                value={filteredList.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)}
                                responsiveLayout="scroll"
                                className="mb-3"
                                stripedRows
                            >
                                <Column field="username" header="Username" sortable />
                                <Column field="email" header="Email" sortable />
                                <Column body={actionTemplate} header="Actions" />
                            </DataTable>

                            <Paginator
                                first={currentPage * itemsPerPage}
                                rows={itemsPerPage}
                                totalRecords={filteredList.length}
                                onPageChange={onPageChange}
                            />
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Userlist;