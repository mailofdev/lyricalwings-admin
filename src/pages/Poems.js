import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import DynamicForm from '../components/DynamicForm';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { addPoem, fetchPoems, updatePoem, deletePoem, addLike, removeLike, addComment } from '../redux/poemSlice';

const Poems = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPoem, setSelectedPoem] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});

    // Memoized selectors
    const selectPoems = useCallback((state) => state.poems.poems, []);
    const selectLoading = useCallback((state) => state.poems.loading, []);
    const selectUser = useCallback((state) => state.auth.user || 'Anonymous', []);

    const poems = useSelector(selectPoems);
    const loading = useSelector(selectLoading);
    const user = useSelector(selectUser);

    const reversedPoems = useMemo(() => [...poems].reverse(), [poems]);

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

    const poemTypes = useMemo(() => formConfig[0].fields[3].options, [formConfig]);

    const customHeadersAndKeys = useMemo(() => [
        { header: 'Title', key: 'title' },
        { header: 'Subtitle', key: 'htmlSubtitle' },
        { header: 'Content', key: 'htmlContent' },
        { header: 'Likes', key: 'likes', render: (likes) => likes ? Object.keys(likes).length : 0 },
        { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
    ], []);

    const handleFormSubmit = useCallback((data, formType) => {
        if (formType === 'add') {
            dispatch(addPoem(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updatePoem({ id: data.id, poemData: data }));
        }
    }, [dispatch]);

    const handleDelete = useCallback((item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (itemToDelete) {
            dispatch(deletePoem(itemToDelete.id));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    }, [itemToDelete, dispatch]);

    const cancelDelete = useCallback(() => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    }, []);

    const cancelForm = useCallback(() => {
        setSelectedPoem(null);
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    const handleLike = useCallback((poemId) => {
        if (user) {
            const poem = poems.find(p => p.id === poemId);
            if (poem && poem.likes && poem.likes[user.id]) {
                dispatch(removeLike({ poemId, userName: user.username }));
            } else {
                dispatch(addLike({ poemId, userName: user.username }));
            }
        }
    }, [user, poems, dispatch]);

    const handleCommentChange = useCallback((poemId, text) => {
        setCommentTexts(prev => ({ ...prev, [poemId]: text }));
    }, []);

    const handleComment = useCallback((poemId) => {
        const commentText = commentTexts[poemId];
        if (user && commentText && commentText.trim()) {
            dispatch(addComment({ poemId, userName: user.username, comment: commentText }));
            setCommentTexts(prev => ({ ...prev, [poemId]: '' }));
        }
    }, [commentTexts, user, dispatch]);

    const renderCommentForm = useCallback((poemId) => (
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
    ), [commentTexts, handleComment, handleCommentChange]);

    return (
        <div>
            {showForm && (
                <div className='my-2'>
                    <DynamicForm
                        className="shadow-md poem-list funky-card"
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
                        className="shadow-md poem-list funky-card"
                        formConfig={formConfig}
                        actionButtons={poemTypes}
                        isShowInfoCard={true}
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