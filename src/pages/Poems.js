import React, { useEffect, useState, useMemo } from 'react';
import DynamicForm from '../components/DynamicForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPoem, fetchPoems, updatePoem, deletePoem } from '../redux/poemSlice';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog'; // Import your ConfirmDialog component
import { Container, Modal } from 'react-bootstrap'; // Import Modal and Button
import Loader from '../components/Loader';

const Poems = () => {
    const dispatch = useDispatch();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { poems, poemLoading: loading } = useSelector((state) => ({
        poems: state.poems.poems,
        poemLoading: state.poems.loading,
    }));
    const [hasFetched, setHasFetched] = useState(false);
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false); // State for ConfirmDialog
    const [itemToDelete, setItemToDelete] = useState(null); // State to hold the item to delete
    const [showModal, setShowModal] = useState(false); // State for modal
    const [selectedPoem, setSelectedPoem] = useState(null); // State to hold the selected poem data

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
    ];

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(addPoem(data));
            setShowForm(false);
        } else if (formType === 'edit' && editingItem) {
            dispatch(updatePoem({ id: editingItem.id, poemData: data }));
            setEditingItem(null);
            setShowModal(false); // Close modal after update
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item); // Set the item to delete
        setConfirmDialogVisible(true); // Show the ConfirmDialog
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            dispatch(deletePoem(itemToDelete.id));
            setItemToDelete(null); // Clear the item to delete
        }
        setConfirmDialogVisible(false); // Close the dialog
    };

    const cancelDelete = () => {
        setItemToDelete(null); // Clear the item to delete
        setConfirmDialogVisible(false); // Close the dialog
    };

    const cancelForm = () => {
        setEditingItem(null);
        setShowForm(false);
        setShowModal(false); // Also close modal on cancel
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    return (
        <Container>
             {showForm && (
                <div className='my-2'>
                    <DynamicForm
                        className="shadow-md bg-primary-subtle"
                        formConfig={formConfig}
                        onSubmit={handleFormSubmit}
                        editingItem={editingItem}
                        title={editingItem ? 'Edit poems' : 'Add poems'}
                        formType={editingItem ? 'edit' : 'add'}
                        cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
                    />
                </div>
            )}
            {loading ? (
                <Loader loadingMessage="Fetching poems..." /> // Show Loader while fetching
            ) : (
                <div className='my-2'>
                    <DynamicList
                        data={poems}
                        customHeadersAndKeys={customHeadersAndKeys}
                        onAddNew={handleAddNew}
                        onEdit={(item) => {
                            setSelectedPoem(item); // Set the selected poem data
                            setEditingItem(item); // Set editing item
                            setShowModal(true); // Show the modal
                        }}
                        onDelete={handleDelete}
                        noRecordMessage="No poems found."
                        className="shadow-md bg-primary-subtle"
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
        </Container>
    );
};

export default Poems;
