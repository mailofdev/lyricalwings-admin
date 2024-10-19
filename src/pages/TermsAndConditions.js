import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ListGroup, Modal } from 'react-bootstrap';
import DynamicForm from '../components/DynamicForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { addTermsAndConditions, fetchTermsAndConditions, updateTermsAndConditions, deleteTermsAndConditions } from '../redux/termsAndConditionsSlice';
import { FaCheckCircle } from 'react-icons/fa';

const TermsAndConditions = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTermsAndConditions, setSelectedTermsAndConditions] = useState(null);

    const selectTermsAndConditions = useCallback((state) => state.termsAndConditions.termsAndConditions, []);
    const selectLoading = useCallback((state) => state.termsAndConditions.loading, []);

    const termsAndConditions = useSelector(selectTermsAndConditions);
    const loading = useSelector(selectLoading);

    useEffect(() => {
        if (!hasFetched) {
            dispatch(fetchTermsAndConditions());
            setHasFetched(true);
        }
    }, [dispatch, hasFetched]);

    const formConfig = useMemo(() => [
        {
            fields: [
                {
                    type: 'arrayList',
                    name: 'TermsAndConditions',
                    label: '',
                    subFields: [
                        { type: 'input', name: 'TermsAndConditionsList', label: '' },
                    ]
                },
            ]
        }
    ], []);

    const handleFormSubmit = useCallback((data, formType) => {
        if (formType === 'add') {
            dispatch(addTermsAndConditions(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updateTermsAndConditions({ id: data.id, termsAndConditionsData: data }));
            setShowModal(false);
        }
    }, [dispatch]);

    const handleDelete = useCallback((item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (itemToDelete) {
            dispatch(deleteTermsAndConditions(itemToDelete.id));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    }, [itemToDelete, dispatch]);

    const cancelDelete = useCallback(() => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    }, []);

    const cancelForm = useCallback(() => {
        setSelectedTermsAndConditions(null);
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    const handleEdit = useCallback((item) => {
        setSelectedTermsAndConditions(item);
        setShowModal(true);
    }, []);

    const isAddButtonDisabled = termsAndConditions.length > 0;

    const ValueProposition = ({ children }) => (
        <div className="d-flex align-items-center mb-2">
            <FaCheckCircle className="text-primary me-2 icon-size" />
            <span>{children}</span>
        </div>
    );

    return (
        <div className="">
            <div className="row justify-content-center">
                <div>
                    <div>
                        <div>
                            {showForm && (
                                <div>
                                    <DynamicForm
                                        formConfig={formConfig}
                                        onSubmit={handleFormSubmit}
                                        editingItem={editingItem}
                                        className="shadow-md poem-list funky-card"
                                        title={editingItem ? 'Edit Terms and Conditions' : 'Add Terms and Conditions'}
                                        formType={editingItem ? 'edit' : 'add'}
                                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                                    />
                                </div>
                            )}

                            {loading ? (
                                <Loader loadingMessage="Fetching Terms and Conditions..." />
                            ) : (
                                <div>
                                    {!showForm && termsAndConditions.length === 0 ? (
                                        <div className="text-center">
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleAddNew}
                                                disabled={isAddButtonDisabled}>
                                                Add New Terms and Conditions
                                            </button>
                                            </div>
                                    ) : (
                                        <div>
                                            {termsAndConditions.map((item, index) => (
                                                <div key={item.id} className="p-4 border-0 shadow-sm">
                                                    <div className="card-body">
                                                        <h5 className="card-title border-bottom pb-2">Terms and Conditions</h5>
                                                        <div className="card-text">
                                                            {item.TermsAndConditions.map((term, termIndex) => (
                                                                <ListGroup key={termIndex} className="m-2">
                                                                    <ValueProposition>{term.TermsAndConditionsList}</ValueProposition>
                                                                </ListGroup>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3">
                                                            <button className="btn btn-outline-primary me-2" onClick={() => handleEdit(item)}>
                                                                <i className="bi bi-pencil me-1"></i> Edit
                                                            </button>
                                                            <button className="btn btn-outline-danger" onClick={() => handleDelete(item)}>
                                                                <i className="bi bi-trash me-1"></i> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                visible={confirmDialogVisible}
                onHide={cancelDelete}
                message={`Are you sure you want to delete these Terms and Conditions?`}
                header="Confirm Deletion"
                accept={confirmDelete}
                reject={cancelDelete}
            />

            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Terms and Conditions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DynamicForm
                        className="bg-white p-4 rounded"
                        formConfig={formConfig}
                        onSubmit={handleFormSubmit}
                        editingItem={selectedTermsAndConditions}
                        formType="edit"
                        buttonLabel="Update"
                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TermsAndConditions;