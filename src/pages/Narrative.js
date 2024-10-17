import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import DynamicForm from '../components/DynamicForm';
import {
    fetchNarratives, addNarrative, updateNarrative, deleteNarrative,
    addLike, addComment,
    removeLike,
} from '../redux/narrativeSlice';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import { Modal, Form, Button } from 'react-bootstrap';
import Loader from '../components/Loader';

// Create memoized selector
const selectNarrativeData = createSelector(
    (state) => state.narratives.narratives,  // Fix the key 'narratives'
    (state) => state.narratives.loading,     // Fix the key 'narratives'
    (narratives, loading) => ({
        narratives,   // Key must match with useSelector in the component
        poemLoading: loading,
    })
);

const Narrative = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Use memoized selector
    const { narratives, poemLoading: loading } = useSelector(selectNarrativeData);  // Use 'narratives' here

    const reversedNarrative = useMemo(() => [...narratives].reverse(), [narratives]);
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
                        { label: 'Story', value: 'story' },
                        { label: 'Novel', value: 'novel' },
                    ]
                }
            ]
        }
    ], []);

    const poemTypes = useMemo(() => formConfig[0].fields[2].options, [formConfig]);

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
            dispatch(updateNarrative({ id: data.id, poemData: data }));
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
            const poem = narratives.find(p => p.id === poemId);
            if (poem) {
                const userLikesPoem = poem.likes && poem.likes[user.id];    
                if (userLikesPoem) {
                    dispatch(removeLike({ narrativeId: poemId, userName: user.username }));
                } else {
                    dispatch(addLike({ narrativeId: poemId, userName: user.username }));
                }
            } else {
                console.error('Poem not found');
            }
        } else {
            console.warn('User not logged in');
        }
    }, [user, narratives, dispatch]);
    

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
                        className="shadow-md narrative-list funky-card"
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
                <Loader loadingMessage="Fetching narrative..." />
            ) : (
                <div className='my-2'>
                    <DynamicList
                        data={reversedNarrative}
                        customHeadersAndKeys={customHeadersAndKeys}
                        onAddNew={handleAddNew}
                        onEdit={handleFormSubmit}
                        onDelete={handleDelete}
                        onLike={handleLike}
                        renderCommentForm={renderCommentForm}
                        noRecordMessage="No narrative found."
                        className="shadow-md narrative-list funky-card"
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

export default Narrative;
