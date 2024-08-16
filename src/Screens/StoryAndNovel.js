import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../Components/Loader';
import AdvancedForm from '../Components/AdvancedForm';
import { fetchStoryAndNovels, addStoryAndNovels, updateStoryAndNovels, clearError } from '../redux/storyAndNovelSlice';
import { Toast } from 'primereact/toast';
import ResponsiveCard from '../Components/ResponsiveCard';
import { FaBook, FaBookOpen, FaScroll } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StoryAndNovel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storyAndNovelData, loading, error } = useSelector((state) => state.storyAndNovels);
  
  const [editingItem, setEditingItem] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    dispatch(fetchStoryAndNovels()); // Ensure this action is correctly dispatched

    if (error) {
      console.error('Redux error:', error);
      showToast('error', 'Error', error);
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [dispatch, error]); // Added dispatch and error to the dependency array

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
          dispatch(fetchStoryAndNovels()); // Fetch data again after adding
        })
        .catch((error) => showToast('error', 'Error', error.message));
    } else if (formType === 'edit' && editingItem) {
      dispatch(updateStoryAndNovels({ id: editingItem.id, itemData: data }))
        .unwrap()
        .then(() => {
          showToast('success', 'Success', 'Item updated successfully');
          setEditingItem(null);
          dispatch(fetchStoryAndNovels()); // Fetch data again after updating
        })
        .catch((error) => showToast('error', 'Error', error.message));
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleClick = (type) => {
    navigate(`/StoryAndNovelItemList/${type}`);
  };

  const storyCount = (storyAndNovelData || []).filter(item => item.type === 'story').length;
  const novelCount = (storyAndNovelData || []).filter(item => item.type === 'novel').length;
  const totalCount = storyCount + novelCount;

  return (
    <div className='container'>
      <Toast ref={toast} />
      {loading && <Loader loadingMessage="Loading stories and novels" />}

      <AdvancedForm
        formConfig={formConfig}
        className='dynamic-form'
        onSubmit={(data) => handleFormSubmit(data, editingItem ? 'edit' : 'add')}
        editingItem={editingItem}
        title={editingItem ? "Edit Story or Novel" : "Add Story or Novel"}
        buttonLabel={editingItem ? 'Update' : 'Add'}
        requiredFields={['title', 'htmlContent', 'type']}
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

    </div>
  );
};

export default StoryAndNovel;
