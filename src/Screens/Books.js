import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import DynamicForm from '../Components/DynamicForm';
import BookCard from '../Components/BookCard';
import { fetchBooks, addBooks, updateBooks, deleteBooks, clearError } from '../redux/booksSlice';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

const Books = () => {
    const dispatch = useDispatch();
    const { BookData, loading, error } = useSelector((state) => state.books);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const toast = useRef(null);

    useEffect(() => {
        dispatch(fetchBooks());
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
                { type: 'input', name: 'title', label: 'Enter name of book' },
                { type: 'input', name: 'subTitle', label: 'Book subtitle' },
                { type: 'textarea', name: 'content', label: 'Book description' },
                { type: 'input', name: 'authorName', label: 'Author name' },
                { type: 'input', name: 'link', label: 'Book link' },
                { type: 'file', name: 'bookCover', label: 'Upload book cover image' },
            ]
        }
    ];

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            if (formType === 'add') {
                await dispatch(addBooks(data)).unwrap();
                showToast('success', 'Success', 'Item added successfully');
            } else if (formType === 'edit' && itemId) {
                await dispatch(updateBooks({ id: itemId, itemData: data })).unwrap();
                showToast('success', 'Success', 'Item updated successfully');
                setEditingItem(null);
            }
            dispatch(fetchBooks());
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
            await dispatch(deleteBooks(itemToDelete)).unwrap();
            showToast('success', 'Success', 'Item deleted successfully');
            dispatch(fetchBooks());
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

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    return (
        <Container>
            <Toast ref={toast} />
            {loading && <Loader loadingMessage="Loading books" />}

            <Row className="mb-4">
                <Col>
                    <DynamicForm
                        formConfig={formConfig}
                        className='dynamic-form'
                        onSubmit={handleFormSubmit}
                        editingItem={editingItem}
                        title={editingItem ? "Edit book" : "Add book"}
                        requiredFields={['title', 'content', 'link']}
                        buttonLabel={editingItem ? 'Update' : 'Add'}
                        fileType="image/*"
                        onCancel={handleCancelEdit}
                    />
                </Col>
            </Row>
<div className='d-flex justify-content-center text-center'>
            <Row className="book-row ">
                <div className="book-scroll">
                    {BookData.map((book) => (
                        <div key={book.id} className="book-col">
                            <BookCard
                                book={book}
                                onEdit={setEditingItem}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            </Row>
            </div>
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
        </Container>
    );
};

export default Books;