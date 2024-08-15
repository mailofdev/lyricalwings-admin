import React, { useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStoryAndNovel, postStoryAndNovel } from '../redux/contentSlice';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';
import ResponsiveCard from '../Components/ResponsiveCard';
import { FaBook, FaBookOpen, FaScroll } from 'react-icons/fa';
import DynamicForm from '../Components/DynamicForm';

const StoryAndNovel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storyAndNovel = useSelector((state) => state.content.storyAndNovel || []);
  const loading = useSelector((state) => state.content.loading);
  const { storyLength, novelLength, } = useSelector((state) => state.dashboard);


  useEffect(() => {
    fetchStoryAndNovel();
  }, []);


  const handleFormSubmit = async (data) => {
    try {
      const storyAndNovelData = {
        title: data.get('title'),
        content: data.get('content'),
        type: data.get('type'),
      };
      await dispatch(postStoryAndNovel(storyAndNovelData));

      navigate(`/ItemList/${storyAndNovelData.type}`, { state: { storyAndNovel: [...storyAndNovel, storyAndNovelData] } });
    } catch (error) {
      console.error('Error posting story/novel:', error);
      alert(error.message);
    }
  };

  const handleClick = (type) => {
    const filteredStoryAndNovel = storyAndNovel.filter((item) => item.type === type);
    navigate(`/ItemList/${type}`, { state: { storyAndNovel: filteredStoryAndNovel } });
  };

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
          name: 'content',
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
          label: 'Select type',
          options: [
            { label: 'Story', value: 'story' },
            { label: 'Novel', value: 'novel' }
          ]
        }
      ]
    }
  ];



  return (
    <div className="container gap-4 d-flex flex-column">

      {loading ? <Loader loadingMessage="Loadding poem datta.." /> : (
        <DynamicForm
          formConfig={formConfig}
          onSubmit={handleFormSubmit}
          className="dynamic-form"
          title="Write story/novel"
          requiredFields={['title', 'content', 'type']} />
      )}


      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <ResponsiveCard xs={12} sm={12} md={3} lg={4} icon={FaBookOpen} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="All"
          count={(novelLength || 0) + (storyLength || 0)} onClick={() => handleClick('showAllStoryAndNovel')}
        />

        <ResponsiveCard xs={12} sm={12} md={3} lg={4} icon={FaScroll} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Story"
          count={storyLength || 0} onClick={() => handleClick('story')}
        />

        <ResponsiveCard xs={12} sm={12} md={3} lg={4} icon={FaBook} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Novel"
          count={novelLength || 0} onClick={() => handleClick('novel')}
        />
      </div>
    </div>
  );
};

export default StoryAndNovel;
