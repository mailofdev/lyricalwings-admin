import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import DynamicForm from '../components/DynamicForm';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { addbook, fetchbook, updatebook, deletebook, addLike, removeLike, addComment } from '../redux/bookSlice';

const Books = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});

    // Memoized selectors
    const selectBooks = useCallback((state) => state.book.book, []);
    const selectLoading = useCallback((state) => state.book.loading, []);
    const selectUser = useCallback((state) => state.auth.user || 'Anonymous', []);

    const books = useSelector(selectBooks);
    const loading = useSelector(selectLoading);
    const user = useSelector(selectUser);

    const reversedBooks = useMemo(() => [...books].reverse(), [books]);

    useEffect(() => {
        if (!hasFetched) {
            dispatch(fetchbook());
            setHasFetched(true);
        }
    }, [dispatch, hasFetched]);

    const formConfig = useMemo(() => [
        {
            fields: [
                { type: 'input', name: 'title', label: 'Name of book' },
                {
                    type: 'editor',
                    name: 'htmlContent',
                    label: 'Book description',
                    config: {
                        readonly: false,
                        placeholder: 'Start typing...',
                        autofocus: true,
                        uploader: { insertImageAsBase64URI: true },
                        disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
                        buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview,align",
                        askBeforePasteHTML: false,
                        askBeforePasteFromWord: false,
                        defaultActionOnPaste: "insert_only_text",
                    }
                },
                { type: 'input', name: 'authorName', label: 'Author name' },
                { type: 'input', name: 'bookLink', label: 'Book link' },
                { type: 'image', name: 'bookImage', label: 'Book Image' },
            ]
        }
    ], []);

    const customHeadersAndKeys = useMemo(() => [
        { header: 'Title', key: 'title' },
        { header: 'Content', key: 'htmlContent' },
        { header: 'Image', key: 'bookImage' },
        { header: 'Author name', key: 'authorName' },
        { header: 'Book link', key: 'bookLink' },
        { header: 'Likes', key: 'likes', render: (likes) => likes ? Object.keys(likes).length : 0 },
        { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
    ], []);

    const handleFormSubmit = useCallback((data, formType) => {
        if (formType === 'add') {
            dispatch(addbook(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updatebook({ id: data.id, bookData: data }));
        }
    }, [dispatch]);

    const handleDelete = useCallback((item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (itemToDelete) {
            dispatch(deletebook(itemToDelete.id));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    }, [itemToDelete, dispatch]);

    const cancelDelete = useCallback(() => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    }, []);

    const cancelForm = useCallback(() => {
        setSelectedBook(null);
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    const handleLike = useCallback((bookId) => {
        if (user) {
            const book = books.find(p => p.id === bookId);
            if (book && book.likes && book.likes[user.id]) {
                dispatch(removeLike({ bookId, userName: user.username }));
            } else {
                dispatch(addLike({ bookId, userName: user.username }));
            }
        }
    }, [user, books, dispatch]);

    const handleCommentChange = useCallback((bookId, text) => {
        setCommentTexts(prev => ({ ...prev, [bookId]: text }));
    }, []);

    const handleComment = useCallback((bookId) => {
        const commentText = commentTexts[bookId];
        if (user && commentText && commentText.trim()) {
            dispatch(addComment({ bookId, userName: user.username, comment: commentText }));
            setCommentTexts(prev => ({ ...prev, [bookId]: '' }));
        }
    }, [commentTexts, user, dispatch]);

    const renderCommentForm = useCallback((bookId) => (
        <Form className='d-flex justify-content-between my-2 mt-4' onSubmit={(e) => { e.preventDefault(); handleComment(bookId); }}>
            <Form.Group>
                <Form.Control
                    type="text"
                    placeholder="Add a comment..."
                    value={commentTexts[bookId] || ''}
                    onChange={(e) => handleCommentChange(bookId, e.target.value)}
                />
            </Form.Group>
            <Button type="submit" variant="primary" size="sm">
                Post Comment
            </Button>
        </Form>
    ), [commentTexts, handleComment, handleCommentChange]);

    return (
        <div>
            {showForm && (
                <div className='my-2'>
                    <DynamicForm
                        className="shadow-md book-list funky-card"
                        formConfig={formConfig}
                        onSubmit={handleFormSubmit}
                        editingItem={editingItem}
                        title={editingItem ? 'Edit book' : 'Add book'}
                        formType={editingItem ? 'edit' : 'add'}
                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                    />
                </div>
            )}
            {loading ? (
                <Loader loadingMessage="Fetching books..." />
            ) : (
                <div className='my-2'>
                    <DynamicList
                        data={reversedBooks}
                        customHeadersAndKeys={customHeadersAndKeys}
                        onAddNew={handleAddNew}
                        onEdit={handleFormSubmit}
                        onDelete={handleDelete}
                        onLike={handleLike}
                        renderCommentForm={renderCommentForm}
                        noRecordMessage="No books found."
                        className="shadow-md book-list funky-card"
                        formConfig={formConfig}
                        isShowOnDashboard={true}
                        rowXS="1"
                        rowMD="1"
                        rowLG="1"
                    />
                </div>
            )}
            <ConfirmDialog
                visible={confirmDialogVisible}
                onHide={cancelDelete}
                message={`Are you sure you want to delete the book titled "${itemToDelete?.title}"?`}
                header="Confirm Deletion"
                accept={confirmDelete}
                reject={cancelDelete}
            />
            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <DynamicForm
                    className="shadow-md bg-primary-subtle"
                    formConfig={formConfig}
                    onSubmit={handleFormSubmit}
                    editingItem={selectedBook}
                    title="Edit book"
                    formType="edit"
                    buttonLabel="Update"
                    cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                />
            </Modal>
        </div>
    );
};

export default Books;