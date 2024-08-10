// src/components/PoemForm.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPoems, postPoem } from '../redux/contentSlice';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import { Panel } from 'primereact/panel';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import JoditEditor from 'jodit-react';
import ResponsiveCard from '../Components/ResponsiveCard';


const PoemForm = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [fontColor, setFontColor] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const poems = useSelector((state) => state.content.poems || []);
  const loading = useSelector((state) => state.content.loading);
  const { dashboardPoems, status, error } = useSelector((state) => state.dashboard);

  const happinessCount = dashboardPoems.emotionsCount.happiness;
  const sadnessCount = dashboardPoems.emotionsCount.sadness;
  const angerCount = dashboardPoems.emotionsCount.anger;
  const disgustCount = dashboardPoems.emotionsCount.disgust;
  const fearCount = dashboardPoems.emotionsCount.fear;
  const surpriseCount = dashboardPoems.emotionsCount.surprise;
  const typeOptions = [
    { label: 'Happiness', value: 'happiness' },
    { label: 'Sadness', value: 'sadness' },
    { label: 'Anger', value: 'anger' },
    { label: 'Fear', value: 'fear' },
    { label: 'Disgust', value: 'disgust' },
    { label: 'Surprise', value: 'surprise' }
  ];

  const fontColorOptions = [
    { label: 'Black', value: 'black' },
    { label: 'White', value: 'white' },
    { label: 'Blue', value: 'blue' },
    { label: 'Purple', value: 'purple' },
    { label: 'Red', value: 'red' },
    { label: 'Brown', value: 'brown' }
  ];

  const config = useMemo(() => ({
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
  }), []);

  useEffect(() => {
    setIsFormValid(title !== '' && subTitle !== '' && content !== '' && type !== '' && fontColor !== '');
  }, [title, subTitle, content, type, fontColor]);

  useEffect(() => {
    dispatch(fetchPoems());
  }, [dispatch]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };


  const handleSubTitleChange = useCallback((newContent) => {
    setSubTitle(newContent);
  }, []);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  const handleTypeChange = (e) => {
    setType(e.value);
  };

  const handleFontColorChange = (e) => {
    setFontColor(e.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/jpeg' && file.size >= 0 && file.size <= 1000000) {
      setSelectedFile(file);
    } else {
      alert('Please select a JPG image between 0KB and 1000KB.');
    }
  };

  const handlePost = async () => {
    try {
      const poemData = {
        title,
        subTitle,
        content,
        type,
        fontColor,
        selectedFile,
      };
      await dispatch(postPoem(poemData));
      setTitle('');
      setSubTitle('');
      setContent('');
      setType('');
      setFontColor('');
      setSelectedFile(null);
      navigate(`/ItemList/${type}`, { state: { poems: [...poems, poemData] } });
    } catch (error) {
      console.error('Error posting poem:', error);
      alert(error.message);
    }
  };

  const handleClick = (type) => {
    const filteredPoems = poems.filter((poem) => poem.type === type);
    navigate(`/ItemList/${type}`, { state: { poems: filteredPoems } });
  };

  return (
    <div className="container gap-4 d-flex flex-column pb-4 mb-4">
      <Panel header="Write a poem..">
        {loading && <Loader loadingMessage={'Loading...'} />}
        <div className="d-flex flex-column gap-3">
          <InputText
            className="form-control"
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter the Title"
            required
          />
          <div className="">
            <JoditEditor
              value={subTitle}
              config={config}
              tabIndex={1}
              onBlur={handleSubTitleChange}
              onChange={handleSubTitleChange}
            />
          </div>
          <div className="">
            <JoditEditor
              value={content}
              config={config}
              tabIndex={1}
              onBlur={handleContentChange}
              onChange={handleContentChange}
            />
          </div>
          <Dropdown
            value={type}
            options={typeOptions}
            onChange={handleTypeChange}
            placeholder="Select emotion"
            className="form-select"
          />
          <Dropdown
            value={fontColor}
            options={fontColorOptions}
            onChange={handleFontColorChange}
            placeholder="Select font color"
            className="form-select"
          />
          {/* <input type="file" className="form-control-file form-control" accept="image/jpeg" onChange={handleFileChange} /> */}
          <div className='text-center'>
            <Button
              className="btn btn-primary"
              onClick={handlePost}
              disabled={!isFormValid}
            >
              Save {type} poem
            </Button>
          </div>
        </div>
      </Panel>

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
