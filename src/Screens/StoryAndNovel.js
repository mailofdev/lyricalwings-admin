import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import DynamicForm from '../Components/DynamicForm';
import { fetchStoryAndNovelsCounts, addStoryAndNovels, updateStoryAndNovels, clearError } from '../redux/storyAndNovelSlice';
import { Toast } from 'primereact/toast';
import ResponsiveCard from '../Components/ResponsiveCard';
import { FaBook, FaBookOpen, FaScroll } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';

const StoryAndNovel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalCount, storyCount, novelCount, loadingMessage, error } = useSelector((state) => state.storyAndNovels);
  const [editingItem, setEditingItem] = useState(null);
  const [count, setCount] = useState(''); // State to manage count input
  const toast = useRef(null);

  useEffect(() => {
    dispatch(fetchStoryAndNovelsCounts());
    if (error) {
      console.error('Redux error:', error);
      showToast('error', 'Error', error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [dispatch, error]);

  const formConfig = [
    {
      fields: [
        {
          type: 'input',
          name: 'title',
          label: 'Title'
        },
        {
          type: 'editor',
          name: 'htmlContent',
          label: 'Content',
          config: {
            readonly: false,
            placeholder: 'Start typing...',
            autofocus: true,
            uploader: {
              insertImageAsBase64URI: true,
            },
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
            { label: 'Novel', value: 'novel' }
          ]
        }
      ]
    }
  ];

  const handleFormSubmit = (data, formType) => {
    if (formType === 'add') {
      dispatch(addStoryAndNovels(data))
        .unwrap()
        .then(() => {
          showToast('success', 'Success', 'Item added successfully');
          dispatch(fetchStoryAndNovelsCounts()); // Fetch data again after adding
        })
        .catch((error) => showToast('error', 'Error', error.message));
    } else if (formType === 'edit' && editingItem) {
      dispatch(updateStoryAndNovels({ id: editingItem.id, itemData: data }))
        .unwrap()
        .then(() => {
          showToast('success', 'Success', 'Item updated successfully');
          setEditingItem(null);
          dispatch(fetchStoryAndNovelsCounts()); // Fetch data again after updating
        })
        .catch((error) => showToast('error', 'Error', error.message));
    }
  };

  const handleCreateMultiple = () => {
    const numberOfItems = parseInt(count, 10);

    if (isNaN(numberOfItems) || numberOfItems <= 0) {
      showToast('error', 'Error', 'Please enter a valid number greater than 0');
      return;
    }

    for (let i = 0; i < numberOfItems; i++) {
      const newItem = {
        title: faker.lorem.sentence(), 
        htmlContent: faker.lorem.paragraphs(), 
        type: i % 2 === 0 ? 'story' : 'novel' 
      };
      dispatch(addStoryAndNovels(newItem))
        .unwrap()
        .catch((error) => showToast('error', 'Error', error.message));
    }

    showToast('success', 'Success', `Created ${numberOfItems} items successfully`);
    dispatch(fetchStoryAndNovelsCounts()); // Fetch data again after adding
    setCount(''); // Clear the input field
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleClick = (type) => {
    navigate(`/StoryAndNovelItemList/${type}`);
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
        title={editingItem ? "Edit Story or Novel" : "Add Story or Novel"}
        buttonLabel={editingItem ? 'Update' : 'Add'}
        requiredFields={['type']}
      />

      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <ResponsiveCard xs={12} sm={12} md={3} lg={4} icon={FaBookOpen} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="All"
          count={totalCount} onClick={() => handleClick('showAllStoryAndNovel')}
        />

        <ResponsiveCard xs={12} sm={12} md={3} lg={4} icon={FaScroll} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Story"
          count={storyCount} onClick={() => handleClick('story')}
        />

        <ResponsiveCard xs={12} sm={12} md={3} lg={4} icon={FaBook} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Novel"
          count={novelCount} onClick={() => handleClick('novel')}
        />
      </div>

      {/* Input field and button to create multiple items */}
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

export default StoryAndNovel;
