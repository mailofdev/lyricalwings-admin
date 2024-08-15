import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import CourseForm from '../Components/CourseForm';
import { fetchItems, addItem, updateItem, deleteItem, clearError } from '../redux/courseSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

const Courses = () => {
    const dispatch = useDispatch();
    const { CourseData, loading, error } = useSelector((state) => state.courses);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const toast = useRef(null);

    const formConfig = [
        {
            fields: [
                { type: 'input', name: 'titleOfPoem', label: 'Title of poem' },
                { type: 'textarea', name: 'introductionOfPoem', label: 'Introduction of poem' },
                { type: 'textarea', name: 'structureOfPoem', label: 'Structure of poem' },
                { type: 'file', name: 'structureFileURL', label: 'Upload structure of poem' },
                { type: 'textarea', name: 'literatureOfPoem', label: 'Literature of poem' },
                { type: 'file', name: 'literatureFileURL', label: 'Upload literature of poem' },
                { type: 'textarea', name: 'methodologyOfPoem', label: 'Methodology of poem' },
                { type: 'file', name: 'methodologyFileURL', label: 'Upload methodology of poem' },
                { type: 'textarea', name: 'evalutionOfPoem', label: 'Evaluation of poem' },
                { type: 'file', name: 'evalutionFileURL', label: 'Upload evaluation of poem' },
                { type: 'textarea', name: 'conclusionOfPoem', label: 'Conclusion of poem' },
                { type: 'file', name: 'conclusionFileURL', label: 'Upload conclusion of poem' },
            ]
        }
    ];

    useEffect(() => {
        dispatch(fetchItems());
        if (error) {
            console.error('Redux error:', error);
            showToast('error', 'Error', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    }, [dispatch, error]);

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            console.log('Submitting form:', data, formType, itemId);
            const fileFields = formConfig[0].fields
                .filter(field => field.type === 'file')
                .map(field => field.name);
    
            // Process file fields
            const processedData = { ...data };
            fileFields.forEach(field => {
                if (processedData[field] && processedData[field].objectURL) {
                    processedData[field] = processedData[field].objectURL;
                }
            });
    
            if (formType === 'add') {
                await dispatch(addItem({ itemData: processedData, fileFields })).unwrap();
                showToast('success', 'Success', 'Item added successfully');
            } else if (formType === 'edit' && itemId) {
                await dispatch(updateItem({ id: itemId, itemData: processedData, fileFields })).unwrap();
                showToast('success', 'Success', 'Item updated successfully');
                setEditingItem(null);
            }
            dispatch(fetchItems());
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
            const fileFields = formConfig[0].fields
                .filter(field => field.type === 'file')
                .map(field => field.name);
            await dispatch(deleteItem({ id: itemToDelete, fileFields })).unwrap();
            showToast('success', 'Success', 'Item deleted successfully');
            dispatch(fetchItems());
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
            {loading && <Loader loadingMessage="Loading courses" />}

            <CourseForm
                formConfig={formConfig}
                className='dynamic-form'
                onSubmit={handleFormSubmit}
                editingItem={editingItem}
                title={editingItem ? "Edit course" : "Add course"}
                requiredFields={['titleOfPoem']}
                buttonLabel={editingItem ? 'Update' : 'Add'}
                maxFileSize={15000000} // 5MB max file size
            />

            {CourseData.length > 0 && (
                <div>
                    {CourseData.map((item) => (
                        <div key={item.id} className="card mb-3">
                            <div className="card-body">
                                <h3 className="card-title">{item.titleOfPoem}</h3>
                                {formConfig[0].fields.map((field) => (
                                    field.type !== 'file' && (
                                        <p key={field.name} className="card-text">
                                            <strong>{field.label}:</strong> {item[field.name]}
                                        </p>
                                    )
                                ))}
                                {formConfig[0].fields.map((field) => (
                                    field.type === 'file' && item[field.name] && (
                                        <p key={field.name}>
                                            <strong>{field.label}:</strong>{' '}
                                            <a href={item[field.name]} target="_blank" rel="noopener noreferrer">View File</a>
                                        </p>
                                    )
                                ))}
                                <div className="mt-3">
                                    <Button variant="primary" onClick={() => setEditingItem(item)} className="me-2">Edit</Button>
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

export default Courses;