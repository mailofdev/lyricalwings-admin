// src/components/PoemForm.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPoems, postPoem } from '../redux/contentSlice';
import { useNavigate } from 'react-router-dom';
import Loader from '../Components/Loader';
import ResponsiveCard from '../Components/ResponsiveCard';
import DynamicForm from '../Components/DynamicForm';
import '../css/dynamicForm.css'

const PoemForm = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const poems = useSelector((state) => state.content.poems || []);
  const loading = useSelector((state) => state.content.loading);
  const { dashboardPoems } = useSelector((state) => state.dashboard);

  const happinessCount = dashboardPoems.emotionsCount.happiness;
  const sadnessCount = dashboardPoems.emotionsCount.sadness;
  const angerCount = dashboardPoems.emotionsCount.anger;
  const disgustCount = dashboardPoems.emotionsCount.disgust;
  const fearCount = dashboardPoems.emotionsCount.fear;
  const surpriseCount = dashboardPoems.emotionsCount.surprise;

  useEffect(() => {
    dispatch(fetchPoems());
  }, [dispatch]);


  const handleClick = (type) => {
    const filteredPoems = poems.filter((poem) => poem.type === type);
    navigate(`/ItemList/${type}`, { state: { poems: filteredPoems } });
  };

  const formConfig = [
    {
      fields: [
        {
          type: 'input',
          name: 'title',
          label: 'Enter title of poem'
        },
        {
          type: 'editor',
          name: 'subTitle',
          label: 'Background/subtitle',
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
          type: 'editor',
          name: 'content',
          label: 'content',
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
          label: 'Select emotion',
          options: [
            { label: 'Happiness', value: 'happiness' },
            { label: 'Sadness', value: 'sadness' },
            { label: 'Anger', value: 'anger' },
            { label: 'Fear', value: 'fear' },
            { label: 'Disgust', value: 'disgust' },
            { label: 'Surprise', value: 'surprise' }
          ]
        },
        {
          type: 'dropdown',
          name: 'fontColor',
          label: 'Select text color',
          options: [
            { label: 'Black', value: 'black' },
            { label: 'White', value: 'white' },
            { label: 'Blue', value: 'blue' },
            { label: 'Purple', value: 'purple' },
            { label: 'Red', value: 'red' },
            { label: 'Brown', value: 'brown' }
          ]
        }
      ]
    }
  ];


  const handleFormSubmit = async (data) => {
    try {
      const poemData = {
        title: data.get('title'),
        subTitle: data.get('subTitle'),
        content: data.get('content'),
        type: data.get('type'),
        fontColor: data.get('fontColor'),
      };
      await dispatch(postPoem(poemData));
      navigate(`/ItemList/${poemData.type}`, { state: { poems: [...poems, poemData] } });
    } catch (error) {
      console.error('Error posting poem:', error);
      alert(error.message);
    }
  };

  return (
    <div className="container gap-4 d-flex flex-column pb-4 mb-4">


      {loading ? <Loader loadingMessage="Loadding poem datta.." /> : (
        <DynamicForm formConfig={formConfig} onSubmit={handleFormSubmit} className="dynamic-form" title="Write a poem" />
      )}


      <div className="d-flex justify-content-center gap-2 flex-wrap">

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-all-poems" textColor="text-dark" title="All poems"
          count={dashboardPoems.totalPoems || 0} onClick={() => handleClick('showall')}
        />

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-happiness" textColor="text-dark" title="Happy"
          count={happinessCount || 0} onClick={() => handleClick('happiness')}
        />

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-sadness" textColor="text-dark" title="Sad"
          count={sadnessCount || 0} onClick={() => handleClick('sadness')}
        />

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-anger" textColor="text-dark" title="Angry"
          count={angerCount || 0} onClick={() => handleClick('anger')}
        />

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-disgust" textColor="text-dark" title="Disgust"
          count={disgustCount || 0} onClick={() => handleClick('disgust')}
        />

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-fear" textColor="text-light" title="Fear"
          count={fearCount || 0} onClick={() => handleClick('fear')}
        />

        <ResponsiveCard xs={12} sm={6} md={2} lg={2}
          customshadow="shadow-md" bgGradient="bg-gradient-surprise" textColor="text-dark" title="Surprise"
          count={surpriseCount || 0} onClick={() => handleClick('surprise')}
        />

      </div>
    </div>
  );
};

export default PoemForm;
