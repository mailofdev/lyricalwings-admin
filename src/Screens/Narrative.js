import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import DynamicForm from '../Components/DynamicForm';
import { fetchNarrativeCounts, addNarrative, updateNarrative } from '../redux/NarrativeSlice';
import { Toast } from 'primereact/toast';
import ResponsiveCard from '../Components/ResponsiveCard';
import { FaBook, FaBookOpen, FaScroll } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';

const Narrative = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        totalNarrative,
        totalStory,
        totalNovel,
        loadingMessage,
        
    } = useSelector((state) => state.Narrative);

    const [editingItem, setEditingItem] = useState(null);
    const [count, setCount] = useState('');
    const toast = useRef(null);

    useEffect(() => {
        dispatch(fetchNarrativeCounts());
    });

    const formConfig = [
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
    ];

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(addNarrative(data))
                .unwrap()
                .then(() => {
                    showToast('success', 'Success', 'Item added successfully');
                    dispatch(fetchNarrativeCounts());
                })
                .catch((error) => showToast('error', 'Error', error.message));
        } else if (formType === 'edit' && editingItem) {
            dispatch(updateNarrative({ id: editingItem.id, itemData: data }))
                .unwrap()
                .then(() => {
                    showToast('success', 'Success', 'Item updated successfully');
                    setEditingItem(null);
                    dispatch(fetchNarrativeCounts());
                })
                .catch((error) => showToast('error', 'Error', error.message));
        }
    };

    const handleCreateMultiple = () => {
        const numberOfItems = parseInt(count, 10);
        const types = ['story', 'novel'];
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
                dispatch(addNarrative(createItem(type)))
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
        dispatch(fetchNarrativeCounts());
        setCount('');
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    const handleClick = (type) => {
        navigate(`/NarrativeList/${type}`);
    };

    const NarrativeTypes = [
        { title: 'All', count: totalNarrative, type: 'showAllNarrative', icon: FaBookOpen },
        { title: 'story', count: totalStory, type: 'story', icon: FaScroll },
        { title: 'novel', count: totalNovel, type: 'novel', icon: FaBook },
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
                title={editingItem ? "Edit Narrative" : "Add Narrative"}
                buttonLabel={editingItem ? 'Update' : 'Add'}
                requiredFields={['title', 'type']}
            />

            <div className="d-flex justify-content-center gap-2 flex-wrap">
                {NarrativeTypes.map((NarrativeType) => (
                    <ResponsiveCard
                        key={NarrativeType.type}
                        xs={12}
                        sm={12}
                        md={3}
                        lg={4}
                        icon={NarrativeType.icon}
                        iconSize={50}
                        customshadow="shadow-lg"
                        bgGradient="bg-gradient-primary"
                        textColor="text-light"
                        title={NarrativeType.title}
                        count={NarrativeType.count}
                        onClick={() => handleClick(NarrativeType.type)}
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

export default Narrative;