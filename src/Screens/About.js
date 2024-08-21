import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import DynamicForm from '../Components/DynamicForm';
import { fetchAbout, addAbout, updateAbout, deleteAbout, clearError } from '../redux/aboutSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FaEdit, FaTrash } from 'react-icons/fa';
import {aboutConfig, sanitizeHTML} from '../Common/commonFunction'

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

    useEffect(() => {
        dispatch(fetchAbout());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            console.error('Redux error:', error);
            showToast('error', 'Error', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    });

  

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            if (formType === 'add') {
                await dispatch(addAbout({ type: itemType, itemData: data })).unwrap();
                showToast('success', 'Success', 'Item added successfully');
            } else if (formType === 'edit' && itemId) {
                const updateData = { content: data.content };
                await dispatch(updateAbout({ id: itemId, type: itemType, itemData: updateData })).unwrap();
                showToast('success', 'Success', 'Item updated successfully');
                setEditingItem(null);
                setIsEditMode(false);
            }
            fetchAbout();
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
            await dispatch(deleteAbout({ id: itemToDelete, type: itemType })).unwrap();
            showToast('success', 'Success', 'Item deleted successfully');
            fetchAbout();
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

                <div className={isFormDisabled ? 'disabled-div' : ''}>
                    <DynamicForm
                        className='dynamic-form'
                        onSubmit={handleFormSubmit}
                        formConfig={aboutConfig[itemType]}
                        editingItem={editingItem}
                        isEditMode={isEditMode}
                    />
                </div>
                {items.length > 0 && (
                    <div className='text-center text-danger'>
                        {isFormDisabled
                            ? 'You have already added data. You can now edit the existing information.'
                            : 'You are currently editing the data. Feel free to make changes.'}
                    </div>
                )}

                {loading && <Loader loadingMessage="Loading about data." />}
                {!loading && items.length === 0 && <p>No data found.</p>}
                {!loading && items.length > 0 && (
                    <ul>
                        {items.map(item => (
                            <div key={item.id} className='dynamic-form'>

                                <div className="" dangerouslySetInnerHTML={sanitizeHTML(item.content)}></div>

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
                        <div className='text-center'>
                            <Button label="No" variant='danger' icon="pi pi-times" onClick={confirmDelete} > <FaTrash /> Delete </Button>
                        </div>
                    </>
                }
            >
                <p>Are you sure you want to delete this item?</p>
            </Dialog>
        </div>
    );
};

export default About;
