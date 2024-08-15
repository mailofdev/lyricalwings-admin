import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import AdvancedForm from '../Components/AdvancedForm';
import { fetchItems, addItem, updateItem, deleteItem, clearError } from '../redux/aboutSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FaEdit, FaTrash } from 'react-icons/fa';

const About = () => {
    const dispatch = useDispatch();
    const { aboutMeData, aboutUsData, loading, error } = useSelector((state) => state.about);
    const [editingItem, setEditingItem] = useState(null);
    const [itemType, setItemType] = useState('aboutMe');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const toast = useRef(null);

    const isFormDisabled = !isEditMode && (itemType === 'aboutMe' ? aboutMeData.length > 0 : aboutUsData.length > 0);

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

    const formConfig = {
        aboutMe: [
            { fields: [{ type: 'textarea', name: 'content', label: '' }] }
        ],
        aboutUs: [
            { fields: [{ type: 'textarea', name: 'content', label: '' }] }
        ]
    };

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            if (formType === 'add') {
                await dispatch(addItem({ type: itemType, itemData: data })).unwrap();
                showToast('success', 'Success', 'Item added successfully');
            } else if (formType === 'edit' && itemId) {
                const updateData = { content: data.content };
                await dispatch(updateItem({ id: itemId, type: itemType, itemData: updateData })).unwrap();
                showToast('success', 'Success', 'Item updated successfully');
                setEditingItem(null);
                setIsEditMode(false);
            }
            fetchData();
        } catch (error) {
            console.error("Error submitting form:", error);
            showToast('error', 'Error', error.message);
        }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await dispatch(deleteItem({ id: itemToDelete, type: itemType })).unwrap();
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

    const handleTypeChange = (type) => {
        setItemType(type);
        setIsEditMode(false);
        setEditingItem(null);
    };

    const items = itemType === 'aboutMe' ? aboutMeData : aboutUsData;

    return (
        <div className="container">
            <Toast ref={toast} />
            <div className='d-flex gap-4 flex-column'>
                <div className="d-flex justify-content-center align-items-center gap-2">
                    <Button
                        className={`btn ${itemType === 'aboutMe' ? 'active' : 'inactive'}`}
                        onClick={() => handleTypeChange('aboutMe')}
                    >
                        About Me
                    </Button>
                    <Button
                        className={`btn ${itemType === 'aboutUs' ? 'active' : 'inactive'}`}
                        onClick={() => handleTypeChange('aboutUs')}
                    >
                        About Us
                    </Button>
                </div>
                <AdvancedForm
                    className='dynamic-form'
                    onSubmit={handleFormSubmit}
                    formConfig={formConfig[itemType]}
                    editingItem={editingItem}
                    isEditMode={isEditMode}
                    isFormDisabled={isFormDisabled}
                />
                {loading && <Loader loadingMessage="Loading about data." />}
                {!loading && items.length === 0 && <p>No items found.</p>}
                {!loading && items.length > 0 && (
                    <ul>
                        {items.map(item => (
                            <div key={item.id} className='dynamic-form'>
                                <div>{item.content}</div>
                                <div className="d-flex justify-content-center align-items-center gap-2">
                                    <Button variant="warning" onClick={() => { setEditingItem(item); setIsEditMode(true); }}> <FaEdit /> </Button>
                                    <Button variant="danger" onClick={() => handleDelete(item.id)}> <FaTrash /> </Button>
                                </div>
                            </div>
                        ))}
                    </ul>
                )}
            </div>
            <Dialog
                visible={showDeleteDialog}
                onHide={() => setShowDeleteDialog(false)}
                header="Confirm Deletion"
                footer={
                    <>
                        <Button label="Yes" icon="pi pi-check" onClick={confirmDelete} />
                        <Button label="No" icon="pi pi-times" onClick={() => setShowDeleteDialog(false)} />
                    </>
                }
            >
                <p>Are you sure you want to delete this item?</p>
            </Dialog>
        </div>
    );
};

export default About;
