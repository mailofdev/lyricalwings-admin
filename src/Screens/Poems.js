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
        totalPoems,
        totalHappiness,
        totalSadness,
        totalAnger,
        totalFear,
        totalDisgust,
        totalSurprise,
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

        const createItem = (type) => ({
            title: faker.lorem.sentence(),
            htmlContent: faker.lorem.paragraphs(),
            type: type
        });

        const createAndDispatchItems = (type, count) => {
            Array.from({ length: count }).forEach(() => {
                dispatch(addPoem(createItem(type)))
                    .unwrap()
                    .catch((error) => showToast('error', 'Error', error.message));
            });
        };

        types.forEach(type => createAndDispatchItems(type, itemsPerType));

        Array.from({ length: leftoverItems }).forEach(() => {
            const randomType = types[Math.floor(Math.random() * numberOfTypes)];
            createAndDispatchItems(randomType, 1);
        });

        showToast('success', 'Success', `Created ${numberOfItems} items successfully`);
        dispatch(fetchPoemCounts());
        setCount('');
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const handleClick = (type) => {
        navigate(`/PoemList/${type}`);
    };

    const poemTypes = [
        { title: 'All', count: totalPoems, type: 'showAllPoems', icon: FaBookOpen },
        { title: 'Happiness', count: totalHappiness, type: 'happiness', icon: FaScroll },
        { title: 'Sadness', count: totalSadness, type: 'sadness', icon: FaBook },
        { title: 'Anger', count: totalAnger, type: 'anger', icon: FaBook },
        { title: 'Fear', count: totalFear, type: 'fear', icon: FaBook },
        { title: 'Disgust', count: totalDisgust, type: 'disgust', icon: FaBook },
        { title: 'Surprise', count: totalSurprise, type: 'surprise', icon: FaBook },
    ];

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
                {poemTypes.map((poemType) => (
                    <ResponsiveCard
                        key={poemType.type}
                        xs={12}
                        sm={12}
                        md={3}
                        lg={4}
                        icon={poemType.icon}
                        iconSize={50}
                        customshadow="shadow-lg"
                        bgGradient="bg-gradient-primary"
                        textColor="text-light"
                        title={poemType.title}
                        count={poemType.count}
                        onClick={() => handleClick(poemType.type)}
                    />
                ))}
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