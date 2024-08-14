import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DynamicForm2 from '../Components/DynamicForm2';
import { addItem, fetchItems, deleteItem, updateItem, clearError } from '../redux/courseSlice';
import { Button, Row, Col, Container, Modal } from 'react-bootstrap';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { MdCancel } from "react-icons/md";
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const sanitizeTitle = (title) => {
    if (typeof title !== 'string' || !title.trim()) {
        throw new Error('Title is required and must be a non-empty string');
    }
    return title.trim().replace(/[.#$[\]]/g, '_');
};

const CourseItem = React.memo(({ title, item, type, onEdit, onDelete, onFileView }) => (
    <div className='d-flex gap-2 flex-column mb-3'>
        <div className="fw-bold">{title}</div>
        {item.introductionOfPoem && <div>{item.introductionOfPoem}</div>}

        {item.structureOfPoem && <div>{item.structureOfPoem}</div>}
        {item.literatureOfPoem && <div>{item.literatureOfPoem}</div>}
        {item.methodologyOfPoem && <div>{item.methodologyOfPoem}</div>}
        {item.evalutionOfPoem && <div>{item.evalutionOfPoem}</div>}
        {item.conclusionOfPoem && <div>{item.conclusionOfPoem}</div>}
        
        <div className='d-flex justify-content-between flex-wrap'>
            <Button variant="warning" onClick={onEdit}><FaEdit /></Button>
            {['introFileURL', 'structureFileURL', 'literatureFileURL', 'methodologyFileURL', 'evalutionFileURL', 'conclusionFileURL'].map(field =>
                item[field] && (
                    <Button key={field} variant="outline-primary" onClick={() => onFileView(item[field], field)}>
                        <FaEye /> <span className='text-uppercase'>{field.replace('FileURL', '')}</span>
                    </Button>
                )
            )}
            <Button variant="danger" onClick={onDelete}><FaTrash /></Button>
        </div>
    </div>
));


const Courses = () => {
    const dispatch = useDispatch();
    const { intro, types, status, error } = useSelector((state) => state.courses);
    const [editing, setEditing] = useState({ type: null, item: null });
    const [formKey, setFormKey] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useRef(null);

    const [showFileModal, setShowFileModal] = useState(false);
    const [currentFileUrl, setCurrentFileUrl] = useState('');

    const openFileModal = (fileUrl) => {
        setCurrentFileUrl(fileUrl);
        setShowFileModal(true);
    };

    const formConfigs = {
        intro: [
            {
                fields: [
                    { type: 'textarea', name: 'introTitle', label: 'Title', required: true },
                    { type: 'file', name: 'introFileURL', label: 'Upload File' },
                ],
            },
        ],
        types: [
            {
                fields: [
                    { type: 'input', name: 'titleOfPoem', label: 'Title of poem', required: true },
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
                ],
            },
        ],
    };

    useEffect(() => {
        dispatch(fetchItems('intro'));
        dispatch(fetchItems('types'));
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const showToast = useCallback((severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    }, []);

    const validateForm = (formData, type) => {
        const errors = {};
        if (!formData[type === 'intro' ? 'introTitle' : 'titleOfPoem']) {
            errors.title = 'Title is required';
        }
        // Add more field-specific validations here
        return errors;
    };

    const handleSubmit = async (formData, type) => {
        const errors = validateForm(formData, type);
        if (Object.keys(errors).length > 0) {
            showToast('error', 'Validation Error', 'Please correct the form errors');
            return;
        }
        setIsSubmitting(true);
        try {
            let titleField = type === 'intro' ? 'introTitle' : 'titleOfPoem';
            const sanitizedTitle = sanitizeTitle(formData[titleField]);

            const serializableData = Object.keys(formData).reduce((acc, key) => {
                if (formData[key] instanceof File) {
                    acc[key] = {
                        name: formData[key].name,
                        file: formData[key]
                    };
                } else {
                    acc[key] = formData[key];
                }
                return acc;
            }, {});

            if (editing.type) {
                const updateData = Object.keys(serializableData).reduce((acc, key) => {
                    if (serializableData[key] !== undefined) {
                        acc[key] = serializableData[key];
                    }
                    return acc;
                }, {});

                const resultAction = await dispatch(updateItem({
                    type,
                    oldTitle: editing.item[titleField],
                    newTitle: sanitizedTitle,
                    ...updateData
                }));

                if (updateItem.fulfilled.match(resultAction)) {
                    setEditing({ type: null, item: null });
                    showToast('success', 'Updated', `${type} updated successfully`);
                } else if (updateItem.rejected.match(resultAction)) {
                    throw new Error(resultAction.payload || 'Failed to update item');
                }
            } else {
                const resultAction = await dispatch(addItem({ type, ...serializableData }));

                if (addItem.fulfilled.match(resultAction)) {
                    showToast('success', 'Added', `${type} added successfully`);
                } else if (addItem.rejected.match(resultAction)) {
                    throw new Error(resultAction.payload || 'Failed to add item');
                }
            }

            setFormKey(prevKey => prevKey + 1);
        } catch (err) {
            showToast('error', 'Error', `Failed to ${editing.type ? 'update' : 'add'} ${type}: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = useCallback((type, title) => {
        confirmDialog({
            message: `Are you sure you want to delete this ${type}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await dispatch(deleteItem({ type, title: sanitizeTitle(title) })).unwrap();
                    showToast('success', 'Deleted', `${type} deleted successfully`);
                } catch (err) {
                    showToast('error', 'Error', `Failed to delete ${type}: ${err.message}`);
                }
            }
        });
    }, [dispatch, showToast]);

    const handleEdit = useCallback((type, item) => {
        setEditing({ type, item });
    }, []);

    const renderItems = (items, type) => (
        <div className='dynamic-form mb-3'>
            {Object.keys(items).length > 0 ? (
                Object.entries(items).map(([title, item]) => (
                    <CourseItem
                        key={title}
                        title={title}
                        item={item}
                        type={type}
                        onEdit={() => handleEdit(type, item)}
                        onDelete={() => handleDelete(type, title)}
                        onFileView={openFileModal}
                    />
                ))
            ) : (
                <div>No data</div>
            )}
        </div>
    );

    const renderSection = (title, type, items) => (
        <div className='section-container'>
            <h4 className='section-title text-center'>{editing.type === type ? `Update ${title}` : title}</h4>
            <DynamicForm2
                key={`${type}-${formKey}`}
                formConfig={formConfigs[type]}
                className='dynamic-form'
                onSubmit={(formData) => handleSubmit(formData, type)}
                initialValues={editing.type === type ? editing.item : {}}
                buttonName={editing.type === type ? 'Update' : 'Save'}
                isSubmitting={isSubmitting}
            />
            <div>
                {status === 'loading' && <p className="text-center">Loading...</p>}
                {status === 'failed' && <p className="text-center text-danger">Error: {error}</p>}
                {status === 'succeeded' && renderItems(items, type)}
            </div>
        </div>
    );

    return (
        <Container>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Row>
                {renderSection('Introduction to Poetry', 'intro', intro)}
                {renderSection('Types of Poems', 'types', types)}
            </Row>
            <Modal show={showFileModal} onHide={() => setShowFileModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>File Viewer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe
                        src={currentFileUrl}
                        style={{ width: '100%', height: '600px' }}
                        title="File Viewer"
                    />
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Courses;