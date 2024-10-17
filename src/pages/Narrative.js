import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button } from 'react-bootstrap';
import DynamicForm from '../components/DynamicForm';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import { addNarrative, fetchNarratives, updateNarrative, deleteNarrative, addLike, removeLike, addComment } from '../redux/narrativeSlice';

const Narrative = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedNarrative, setSelectedNarrative] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});

    // Memoized selectors
    const selectNarratives = useCallback((state) => state.narratives.narratives, []);
    const selectLoading = useCallback((state) => state.narratives.loading, []);
    const selectUser = useCallback((state) => state.auth.user || 'Anonymous', []);

    const narratives = useSelector(selectNarratives);
    const loading = useSelector(selectLoading);
    const user = useSelector(selectUser);

    const reversedNarratives = useMemo(() => [...narratives].reverse(), [narratives]);

    useEffect(() => {
        if (!hasFetched) {
            dispatch(fetchNarratives());
            setHasFetched(true);
        }
    }, [dispatch, hasFetched]);

    const formConfig = useMemo(() => [
        {
            fields: [
                { type: 'input', name: 'title', label: 'Title' },
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
                        { label: 'Story', value: 'Story' },
                        { label: 'Novel', value: 'Novel' },
                    ]
                }
            ]
        }
    ], []);

    const narrativeTypes = useMemo(() => formConfig[0].fields[2].options, [formConfig]);

    const customHeadersAndKeys = useMemo(() => [
        { header: 'Title', key: 'title' },
        { header: 'Content', key: 'htmlContent' },
        { header: 'Likes', key: 'likes', render: (likes) => likes ? Object.keys(likes).length : 0 },
        { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
    ], []);

    const handleFormSubmit = useCallback((data, formType) => {
        if (formType === 'add') {
            dispatch(addNarrative(data));
            setShowForm(false);
        } else if (formType === 'edit') {
            dispatch(updateNarrative({ id: data.id, narrativeData: data }));
        }
    }, [dispatch]);

    const handleDelete = useCallback((item) => {
        setItemToDelete(item);
        setConfirmDialogVisible(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (itemToDelete) {
            dispatch(deleteNarrative(itemToDelete.id));
            setItemToDelete(null);
        }
        setConfirmDialogVisible(false);
    }, [itemToDelete, dispatch]);

    const cancelDelete = useCallback(() => {
        setItemToDelete(null);
        setConfirmDialogVisible(false);
    }, []);

    const cancelForm = useCallback(() => {
        setSelectedNarrative(null);
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    const handleLike = useCallback((narrativeId) => {
        if (user) {
            const narrative = narratives.find(p => p.id === narrativeId);
            if (narrative && narrative.likes && narrative.likes[user.id]) {
                dispatch(removeLike({ narrativeId, userName: user.username }));
            } else {
                dispatch(addLike({ narrativeId, userName: user.username }));
            }
        }
    }, [user, narratives, dispatch]);

    const handleCommentChange = useCallback((narrativeId, text) => {
        setCommentTexts(prev => ({ ...prev, [narrativeId]: text }));
    }, []);

    const handleComment = useCallback((narrativeId) => {
        const commentText = commentTexts[narrativeId];
        if (user && commentText && commentText.trim()) {
            dispatch(addComment({ narrativeId, userName: user.username, comment: commentText }));
            setCommentTexts(prev => ({ ...prev, [narrativeId]: '' }));
        }
    }, [commentTexts, user, dispatch]);

    const renderCommentForm = useCallback((narrativeId) => (
        <Form className='d-flex justify-content-between my-2 mt-4' onSubmit={(e) => { e.preventDefault(); handleComment(narrativeId); }}>
            <Form.Group>
                <Form.Control
                    type="text"
                    placeholder="Add a comment..."
                    value={commentTexts[narrativeId] || ''}
                    onChange={(e) => handleCommentChange(narrativeId, e.target.value)}
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
                        className="shadow-md narrative-list funky-card"
                        formConfig={formConfig}
                        onSubmit={handleFormSubmit}
                        editingItem={editingItem}
                        title={editingItem ? 'Edit narrative' : 'Add narrative'}
                        formType={editingItem ? 'edit' : 'add'}
                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                    />
                </div>
            )}
            {loading ? (
                <Loader loadingMessage="Fetching narratives..." />
            ) : (
                <div className='my-2'>
                    <DynamicList
                        data={reversedNarratives}
                        customHeadersAndKeys={customHeadersAndKeys}
                        onAddNew={handleAddNew}
                        onEdit={handleFormSubmit}
                        onDelete={handleDelete}
                        onLike={handleLike}
                        renderCommentForm={renderCommentForm}
                        noRecordMessage="No narratives found."
                        className="shadow-md narrative-list funky-card"
                        formConfig={formConfig}
                        actionButtons={narrativeTypes}
                        isShowOnDashboard={true}
                    />
                </div>
            )}
            <ConfirmDialog
                visible={confirmDialogVisible}
                onHide={cancelDelete}
                message={`Are you sure you want to delete the narrative titled "${itemToDelete?.title}"?`}
                header="Confirm Deletion"
                accept={confirmDelete}
                reject={cancelDelete}
            />
            <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
                <DynamicForm
                    className="shadow-md bg-primary-subtle"
                    formConfig={formConfig}
                    onSubmit={handleFormSubmit}
                    editingItem={selectedNarrative}
                    title="Edit Narrative"
                    formType="edit"
                    buttonLabel="Update"
                    cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                />
            </Modal>
        </div>
    );
};

export default Narrative;