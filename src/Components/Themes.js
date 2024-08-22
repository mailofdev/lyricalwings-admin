import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import ThemeForm from '../Components/ThemeForm';
import { fetchThemes, addThemes, updateThemes, deleteThemes, fetchAppliedTheme, saveAppliedTheme, clearError } from '../redux/themeSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import ConfirmDialog from './ConfirmDialog';

const Themes = () => {
    const dispatch = useDispatch();
    const { ThemeData, appliedTheme, loading, error } = useSelector((state) => state.Themes);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const toast = useRef(null);

    useEffect(() => {
        dispatch(fetchThemes());
        dispatch(fetchAppliedTheme());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            console.error('Redux error:', error);
            showToast('error', 'Error', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    }, [error, dispatch]);

    const formConfig = [
        {
            fields: [
                { type: 'input', name: 'themeName', label: 'Theme Name' },
                { type: 'colorInput', name: 'themeBgColor', label: 'Theme Background color' },
                { type: 'colorInput', name: 'buttonColor', label: 'Button color' },
                { type: 'colorInput', name: 'textColor', label: 'Text color' },
                { type: 'colorInput', name: 'cardColor', label: 'Card color' },
            ]
        }
    ];

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            if (formType === 'add') {
                await dispatch(addThemes(data)).unwrap();
                showToast('success', 'Success', 'Theme added successfully');
            } else if (formType === 'edit' && itemId) {
                await dispatch(updateThemes({ id: itemId, itemData: data })).unwrap();
                showToast('success', 'Success', 'Theme updated successfully');
                setEditingItem(null);
            }
            dispatch(fetchThemes());
        } catch (error) {
            console.error("Error submitting form:", error);
            showToast('error', 'Error', error.message);
        }
    };

    const handleDelete = async (id) => {
        setItemToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteThemes(itemToDelete)).unwrap();
            showToast('success', 'Success', 'Theme deleted successfully');
            dispatch(fetchThemes());
        } catch (error) {
            console.error("Error deleting theme:", error);
            showToast('error', 'Error', error.message);
        }
        setShowDeleteDialog(false);
        setItemToDelete(null);
    };

    const handleApplyTheme = async (themeData) => {
        try {
            await dispatch(saveAppliedTheme(themeData)).unwrap();
            showToast('success', 'Success', 'Theme applied successfully');
        } catch (error) {
            console.error("Error applying theme:", error);
            showToast('error', 'Error', error.message);
        }
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
    };

    return (
        <Container>
            <Toast ref={toast} />
            <ThemeForm
                formConfig={formConfig}
                className='dynamic-form'
                onSubmit={(data) => handleFormSubmit(data, editingItem ? 'edit' : 'add', editingItem?.id)}
                editingItem={editingItem}
                title={editingItem ? "Edit theme" : "Add theme"}
                buttonLabel={editingItem ? 'Update' : 'Add'}
                requiredFields={['themeName', 'themeBgColor', 'buttonColor', 'textColor']}
            />
            {loading && <Loader />}
            {!loading && ThemeData.length === 0 && <p>No themes found.</p>}
            {!loading && ThemeData.length > 0 && (
                <Row className="mt-4">
                    {ThemeData.map((theme) => (
                        <Col key={theme.id} md={4} className="p-3  border card w-100 my-2 rounded">
                            <div className='d-flex justify-content-between'>
                                <div className='d-flex align-items-center form-label fs-5'>{theme.themeName}</div>
                                <div className='d-flex gap-3'>
                                    <Button variant="primary" onClick={() => handleEdit(theme)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDelete(theme.id)}>Delete</Button>
                                    <Button variant="outline-dark" onClick={() => handleApplyTheme(theme)}>
                                        {appliedTheme && appliedTheme.id === theme.id ? <FaCheckCircle color='black' /> : <FaRegCircle color='black' />}
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            )}
            <ConfirmDialog
                visible={showDeleteDialog}
                onHide={() => setShowDeleteDialog(false)}
                message="Are you sure you want to delete this theme?"
                header="Confirm Delete"
                acceptClassName="btn-danger"
                rejectClassName="btn-secondary"
                acceptLabel="Delete"
                rejectLabel="Cancel"
                accept={confirmDelete}
                reject={() => setShowDeleteDialog(false)}
            />
        </Container>
    );
};

export default Themes;