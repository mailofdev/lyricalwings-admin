import React, { useEffect, useState, useMemo } from 'react';
import DynamicForm from '../components/DynamicForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPoem, fetchPoems, updatePoem, deletePoem, addLike, removeLike, addComment } from '../redux/poemSlice';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import { Modal, Form, Button } from 'react-bootstrap';
import Loader from '../components/Loader';

const Poems = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { poems, poemLoading: loading } = useSelector((state) => ({
        poems: state.poems.poems,
        poemLoading: state.poems.loading,
    }));
    const reversedPoems = [...poems].reverse();
    const auth = useSelector((state) => state.auth);
    const user = auth.user || 'Anonymous';
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPoem, setSelectedPoem] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});

    useEffect(() => {
        if (!hasFetched) {
            dispatch(fetchPoems());
            setHasFetched(true);
        }
    }, [dispatch, hasFetched]);

    const formConfig = useMemo(() => [
        {
            fields: [
                { type: 'input', name: 'title', label: 'Title' },
                {
                    type: 'editor',
                    name: 'htmlSubtitle',
                    label: 'Subtitle',
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
                {
                    type: 'editor',
                    name: 'htmlContent',
                    label: 'Content',
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
                {
                    type: 'dropdown',
                    name: 'type',
                    label: 'Select Type',
                    options: [
                        { label: 'Happiness', value: 'Happiness' },
                        { label: 'Sadness', value: 'Sadness' },
                        { label: 'Anger', value: 'Anger' },
                        { label: 'Fear', value: 'Fear' },
                        { label: 'Disgust', value: 'Disgust' },
                        { label: 'Surprise', value: 'Surprise' }
                    ]
                }
            ]
        }
    ], []);

    const customHeadersAndKeys = [
        { header: 'Title', key: 'title' },
        { header: 'Subtitle', key: 'htmlSubtitle' },
        { header: 'Content', key: 'htmlContent' },
        { header: 'Likes', key: 'likes', render: (likes) => likes ? Object.keys(likes).length : 0 },
        { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
    ];

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(addPoem(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updatePoem({ id: data.id, poemData: data }));
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            dispatch(deletePoem(itemToDelete.id));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    };

    const cancelDelete = () => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    };

    const cancelForm = () => {
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const handleLike = (poemId) => {
        if (user) {
            const poem = poems.find(p => p.id === poemId);
            if (poem && poem.likes && poem.likes[user.id]) {
                dispatch(removeLike({ poemId, userName: user.username }));
            } else {
                dispatch(addLike({ poemId, userName: user.username }));
            }
        }
    };

    const handleCommentChange = (poemId, text) => {
        setCommentTexts(prev => ({ ...prev, [poemId]: text }));
    };

    const handleComment = (poemId) => {
        const commentText = commentTexts[poemId];
        if (user && commentText && commentText.trim()) {
            dispatch(addComment({ poemId, userName: user.username, comment: commentText }));
            setCommentTexts(prev => ({ ...prev, [poemId]: '' }));
        }
    };

    const renderCommentForm = (poemId) => (
        <Form className='d-flex justify-content-between my-2 mt-4' onSubmit={(e) => { e.preventDefault(); handleComment(poemId); }}>
            <Form.Group>
                <Form.Control
                    type="text"
                    placeholder="Add a comment..."
                    value={commentTexts[poemId] || ''}
                    onChange={(e) => handleCommentChange(poemId, e.target.value)}
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
                        title={editingItem ? 'Edit poem' : 'Add poem'}
                        formType={editingItem ? 'edit' : 'add'}
                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                    />
                </div>
            )}
            {loading ? (
                <Loader loadingMessage="Fetching poems..." />
            ) : (
                <div className='my-2'>
                    <DynamicList
                        data={reversedPoems}
                        customHeadersAndKeys={customHeadersAndKeys}
                        onAddNew={handleAddNew}
                        onEdit={handleFormSubmit}
                        onDelete={handleDelete}
                        onLike={handleLike}
                        renderCommentForm={renderCommentForm}
                        noRecordMessage="No poems found."
                        className="shadow-md"
                        formConfig={formConfig}  // Add this line
                    />
                </div>
            )}
            <ConfirmDialog
                visible={confirmDialogVisible}
                onHide={cancelDelete}
                message={`Are you sure you want to delete the poem titled "${itemToDelete?.title}"?`}
                header="Confirm Deletion"
                accept={confirmDelete}
                reject={cancelDelete}
            />
            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <DynamicForm
                    className="shadow-md bg-primary-subtle"
                    formConfig={formConfig}
                    onSubmit={handleFormSubmit}
                    editingItem={selectedPoem}
                    title="Edit Poem"
                    formType="edit"
                    buttonLabel="Update"
                    cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                />
            </Modal>
        </div>
    );
};

export default Poems;