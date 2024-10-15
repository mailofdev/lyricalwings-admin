import React, { useEffect, useState, useMemo } from 'react';
import DynamicForm from '../components/DynamicForm';
import { useDispatch, useSelector } from 'react-redux';
import { addbook, fetchbook, updatebook, deletebook, addLike, removeLike, addComment } from '../redux/bookSlice';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import { Modal, Form, Button } from 'react-bootstrap';
import Loader from '../components/Loader';

const Books = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { books, bookLoading: loading } = useSelector((state) => ({
        books: state.book.book,
        bookLoading: state.book.loading,
    }));
    const reversedBooks = [...books].reverse();
    const auth = useSelector((state) => state.auth);
    const user = auth.user || 'Anonymous';
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});

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

    const customHeadersAndKeys = [
        { header: 'Title', key: 'title' },
        // { header: 'Subtitle', key: 'htmlSubtitle' },
        { header: 'Content', key: 'htmlContent' },
        { header: 'Image', key: 'bookImage' },
        { header: 'Author name', key: 'authorName' },
        { header: 'Book link', key: 'bookLink' },
        { header: 'Likes', key: 'likes', render: (likes) => likes ? Object.keys(likes).length : 0 },
        { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
    ];

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(addbook(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updatebook({ id: data.id, bookData: data }));
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            dispatch(deletebook(itemToDelete.id));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    };

    const cancelDelete = () => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    };

    const cancelForm = () => {
        setSelectedBook(null);
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleLike = (bookId) => {
        if (user) {
            const book = books.find(p => p.id === bookId);
            if (book && book.likes && book.likes[user.id]) {
                dispatch(removeLike({ bookId, userName: user.username }));
            } else {
                dispatch(addLike({ bookId, userName: user.username }));
            }
        }
    };

    const handleCommentChange = (bookId, text) => {
        setCommentTexts(prev => ({ ...prev, [bookId]: text }));
    };

    const handleComment = (bookId) => {
        const commentText = commentTexts[bookId];
        if (user && commentText && commentText.trim()) {
            dispatch(addComment({ bookId, userName: user.username, comment: commentText }));
            setCommentTexts(prev => ({ ...prev, [bookId]: '' }));
        }
    };

    const renderCommentForm = (bookId) => (
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
    );

    return (
        <div>
            {showForm && (
                <div className='my-2'>
                    <DynamicForm
                        className="shadow-md funky-list funky-card"
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
                        className="shadow-md"
                        formConfig={formConfig}
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