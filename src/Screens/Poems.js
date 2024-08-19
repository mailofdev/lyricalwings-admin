import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import DynamicForm from '../Components/DynamicForm';
import { fetchPoemCounts, addPoem, updatePoem, clearError } from '../redux/poemSlice';
import { Toast } from 'primereact/toast';
import ResponsiveCard from '../Components/ResponsiveCard';
import { FaBook, FaBookOpen, FaScroll } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';

const Poems = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        totalCount,
        typeCounts,
        loadingMessage,
        error
    } = useSelector((state) => state.poem);

    const [editingItem, setEditingItem] = useState(null);
    const [count, setCount] = useState('');
    const toast = useRef(null);

    useEffect(() => {
        dispatch(fetchPoemCounts());
        if (error) {
            console.error('Redux error:', error);
            showToast('error', 'Error', error);
            setTimeout(() => dispatch(clearError()), 5000);
        }
    }, [dispatch, error]);

    const formConfig = [
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
                        { label: 'Happiness', value: 'happiness' },
                        { label: 'Sadness', value: 'sadness' },
                        { label: 'Anger', value: 'anger' },
                        { label: 'Fear', value: 'fear' },
                        { label: 'Disgust', value: 'disgust' },
                        { label: 'Surprise', value: 'surprise' }
                    ]
                }
            ]
        }
    ];

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(addPoem(data))
                .unwrap()
                .then(() => {
                    showToast('success', 'Success', 'Item added successfully');
                    dispatch(fetchPoemCounts());
                })
                .catch((error) => showToast('error', 'Error', error.message));
        } else if (formType === 'edit' && editingItem) {
            dispatch(updatePoem({ id: editingItem.id, itemData: data }))
                .unwrap()
                .then(() => {
                    showToast('success', 'Success', 'Item updated successfully');
                    setEditingItem(null);
                    dispatch(fetchPoemCounts());
                })
                .catch((error) => showToast('error', 'Error', error.message));
        }
    };

    const handleCreateMultiple = () => {
        const numberOfItems = parseInt(count, 10);
        const types = ['happiness', 'sadness', 'anger', 'fear', 'disgust', 'surprise'];
        const numberOfTypes = types.length;
    
        if (isNaN(numberOfItems) || numberOfItems <= 0) {
            showToast('error', 'Error', 'Please enter a valid number greater than 0');
            return;
        }
    
        const itemsPerType = Math.floor(numberOfItems / numberOfTypes);
        const leftoverItems = numberOfItems % numberOfTypes;
    
        // Function to create a new item
        const createItem = (type) => ({
            title: faker.lorem.sentence(),
            htmlContent: faker.lorem.paragraphs(),
            type: type
        });
    
        // Dispatch items for each type
        types.forEach(type => {
            for (let i = 0; i < itemsPerType; i++) {
                dispatch(addPoem(createItem(type)))
                    .unwrap()
                    .catch((error) => showToast('error', 'Error', error.message));
            }
        });
    
        // Distribute leftover items randomly
        for (let i = 0; i < leftoverItems; i++) {
            const randomType = types[Math.floor(Math.random() * numberOfTypes)];
            dispatch(addPoem(createItem(randomType)))
                .unwrap()
                .catch((error) => showToast('error', 'Error', error.message));
        }
    
        showToast('success', 'Success', `Created ${numberOfItems} items successfully`);
        dispatch(fetchPoemCounts());
        setCount('');
    };
    
    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const handleClick = (type) => {
        navigate(`/ItemList/${type}`);
    };

    return (
        <div className='container'>
            <Toast ref={toast} />
            {loadingMessage && <Loader loadingMessage={loadingMessage} />}
            <DynamicForm
                formConfig={formConfig}
                className='dynamic-form'
                onSubmit={(data) => handleFormSubmit(data, editingItem ? 'edit' : 'add')}
                editingItem={editingItem}
                title={editingItem ? "Edit Poems" : "Add Poems"}
                buttonLabel={editingItem ? 'Update' : 'Add'}
                requiredFields={['title', 'type']}
            />


            <div className="d-flex justify-content-center gap-2 flex-wrap">

                 <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaBookOpen}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="All"
                    count={totalCount}
                    onClick={() => handleClick('showAllPoems')}
                />

                <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaScroll}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="Happiness"
                    count={typeCounts.happiness}
                    onClick={() => handleClick('happiness')}
                />

                <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaBook}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="Sadness"
                    count={typeCounts.sadness}
                    onClick={() => handleClick('sadness')}
                />

                <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaBook}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="Anger"
                    count={typeCounts.anger}
                    onClick={() => handleClick('anger')}
                />

                <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaBook}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="Fear"
                    count={typeCounts.fear}
                    onClick={() => handleClick('fear')}
                />

                <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaBook}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="Disgust"
                    count={typeCounts.disgust}
                    onClick={() => handleClick('disgust')}
                />

                <ResponsiveCard
                    xs={12}
                    sm={12}
                    md={3}
                    lg={4}
                    icon={FaBook}
                    iconSize={50}
                    customshadow="shadow-lg"
                    bgGradient="bg-gradient-primary"
                    textColor="text-light"
                    title="Surprise"
                    count={typeCounts.surprise}
                    onClick={() => handleClick('surprise')}
                /> 
            </div>

            <div className="mt-4">
                <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    min="1"
                    className="form-control"
                    placeholder="Enter number of items"
                />
                <button
                    type="button"
                    onClick={handleCreateMultiple}
                    className="btn btn-primary mt-2"
                >
                    Create Multiple
                </button>
            </div>
        </div>
    );
};

export default Poems;
