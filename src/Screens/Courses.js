import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import CourseForm from '../Components/CourseForm';
import { fetchItems, addItem, updateItem, deleteItem, clearError } from '../redux/courseSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FaEdit, FaTrash } from 'react-icons/fa';

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
                { type: 'input', name: 'titleOfType', label: 'Title of type' },
                { type: 'textarea', name: 'introductionOfType', label: 'Introduction of type' },
                { type: 'textarea', name: 'structureOfType', label: 'Structure of type' },
                { type: 'file', name: 'structureFileURL', label: 'Upload file of structure' },
                { type: 'textarea', name: 'literatureOfType', label: 'Literature of type' },
                { type: 'file', name: 'literatureFileURL', label: 'Upload file of literature' },
                { type: 'textarea', name: 'methodologyOfType', label: 'Methodology of type' },
                { type: 'file', name: 'methodologyFileURL', label: 'Upload file of methodology' },
                { type: 'textarea', name: 'evalutionOfType', label: 'Evaluation of type' },
                { type: 'file', name: 'evalutionFileURL', label: 'Upload file of evalution' },
                { type: 'textarea', name: 'conclusionOfType', label: 'Conclusion of type' },
                { type: 'file', name: 'conclusionFileURL', label: 'Upload file of conclusion' },
            ]
        }
    ];

    useEffect(() => {
        dispatch(fetchItems());
    }, [dispatch]);

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            const fileFields = formConfig[0].fields
                .filter(field => field.type === 'file')
                .map(field => field.name);

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
            fetchItems()
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
            fetchItems()
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
        <div className='container d-flex flex-column gap-3'>
            <Toast ref={toast} />
            {loading && <Loader loadingMessage="Loading courses" />}

            <CourseForm
                formConfig={formConfig}
                className='dynamic-form'
                onSubmit={handleFormSubmit}
                editingItem={editingItem}
                title={editingItem ? "Edit course" : "Add course"}
                requiredFields={['titleOfType']}
                buttonLabel={editingItem ? "Update course" : "Add course"}
                maxFileSize={15000000}
            />

            {CourseData.length > 0 && (
                <div>
                    {CourseData.map((item) => (
                        <div key={item.id} className="dynamic-form card shadow-sm mb-4">
                            <div className='gap-2 d-flex flex-column'>
                                {formConfig[0].fields.map((field) => (
                                    field.type !== 'file' && (
                                        <div className='card p-2'>
                                            <p key={field.name} className="">
                                               <strong>{field.label}:</strong> {item[field.name]}
                                            </p>
                                        </div>
                                    )
                                ))}


                                <div className='d-flex gap-1 justify-content-center flex-wrap'>
                                    {formConfig[0].fields.map((field) => (
                                        field.type === 'file' && item[field.name] && (

                                            <Button key={field.name} variant="outline-secondary">
                                                <a href={item[field.name]} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary">
                                                    {field.name.replace(/[.#$[\]]/g, '_').replace('FileURL', '')}
                                                </a>
                                            </Button>
                                        )
                                    ))}
                                </div>

                                <div className='d-flex gap-2 justify-content-center flex-wrap'>
                                    <Button variant="primary" onClick={() => setEditingItem(item)}> <FaEdit/> </Button>
                                    <Button variant="danger" onClick={() => handleDelete(item.id)}> <FaTrash/> </Button>
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