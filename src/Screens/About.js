import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import AdvancedForm from '../Components/AdvancedForm';
import { fetchItems, addItem, updateItem, deleteItem, clearError } from '../redux/aboutSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const About = () => {
    const dispatch = useDispatch();
    const { BookData, loading, error } = useSelector((state) => state.about);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const toast = useRef(null);

    const fetchData = useCallback(() => {
        dispatch(fetchItems()).catch((error) => {
            console.error('Error fetching items:', error);
            showToast('error', 'Error', 'Failed to fetch items');
        });
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                { type: 'input', name: 'title', label: 'Enter name of book' },
                { type: 'textarea', name: 'content', label: 'Book description' },
                { type: 'input', name: 'link', label: 'Book link' },
                { type: 'file', name: 'bookFile', label: 'Cover Image (PNG, JPG, or PDF)' }
            ]
        }
    ];

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            console.log('Submitting form:', data, formType, itemId);
            if (formType === 'add') {
                const result = await dispatch(addItem(data)).unwrap();
                console.log('Item added successfully:', result);
                showToast('success', 'Success', 'Item added successfully');
            } else if (formType === 'edit' && itemId) {
                const result = await dispatch(updateItem({ id: itemId, itemData: data })).unwrap();
                console.log('Item updated successfully:', result);
                showToast('success', 'Success', 'Item updated successfully');
                setEditingItem(null);
            }
            fetchData();
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
            await dispatch(deleteItem(itemToDelete)).unwrap();
            console.log('Item deleted successfully');
            showToast('success', 'Success', 'Item deleted successfully');
            fetchData();
        } catch (error) {
            console.error("Error deleting item:", error);
            showToast('error', 'Error', error.message);
        }
        setShowDeleteDialog(false);
        setItemToDelete(null);
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    return (
        <div className='container'>
            <Toast ref={toast} />
            {loading && <Loader />}

                <AdvancedForm
                    formConfig={formConfig}
                    className='dynamic-form'
                    onSubmit={handleFormSubmit}
                    editingItem={editingItem}
                    title={editingItem ? "Edit book" : "Add book"}
                    requiredFields={['title', 'content']}
                    buttonLabel={editingItem ? 'Update' : 'Add'}
                />


            {BookData.length > 0 && (
                <div>
                    {BookData.map((item) => (
                        <div key={item.id} className="card mb-3">
                            <div className="card-body">
                                <h3 className="card-title">{item.title}</h3>
                                <p className="card-text">{item.content}</p>
                                {item.link && (
                                    <a href={item.link} className="card-link" target="_blank" rel="noopener noreferrer">Book Link</a>
                                )}
                                {item.bookFileUrl && (
                                    <div className="mt-2">
                                        {item.bookFileUrl.toLowerCase().endsWith('.pdf') ? (
                                            <a href={item.bookFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                                                View PDF Cover
                                            </a>
                                        ) : (
                                            <a href={item.bookFileUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={item.bookFileUrl} alt="Book cover" style={{ maxWidth: '100px', maxHeight: '100px' }} className="img-thumbnail" />
                                            </a>
                                        )}
                                    </div>
                                )}
                                <div className="mt-3">
                                    <Button variant="primary" onClick={() => {
                                        setEditingItem(item);
                                    }} className="me-2">Edit</Button>
                                    <Button variant="danger" onClick={() => handleDelete(item.id)}>Delete</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog
                header="Confirm Delete"
                visible={showDeleteDialog}
                onHide={() => setShowDeleteDialog(false)}
                footer={(
                    <div>
                        <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </div>
                )}
            >
                <p>Are you sure you want to delete this item?</p>
            </Dialog>
        </div>
    );
};

export default About;