import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStoryAndNovel, postStoryAndNovel } from '../redux/contentSlice'; // Updated action import
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import { Panel } from 'primereact/panel';
import JoditEditor from 'jodit-react';
import { Button } from 'react-bootstrap';
import Loader from '../Components/Loader';
import ResponsiveCard from '../Components/ResponsiveCard';
import { FaBook, FaBookOpen, FaScroll } from 'react-icons/fa';

const StoryAndNovel = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [title, setTitle] = useState('');
  // const [subTitle, setSubTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storyAndNovel = useSelector((state) => state.content.storyAndNovel || []);
  const loading = useSelector((state) => state.content.loading);
  const { storyLength, novelLength, status, error } = useSelector((state) => state.dashboard);

  const typeOptions = [
    { label: 'Story', value: 'story' },
    { label: 'Novel', value: 'novel' },
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
    setIsFormValid(title !== '' && content !== '' && type !== '');
  }, [title, content, type]);

  useEffect(() => {
    dispatch(fetchStoryAndNovel());
  }, [dispatch]);

  const handleBlur = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTypeChange = (e) => {
    setType(e.value);
  };

  const handlePost = async () => {
    try {
      const storyAndNovelData = {
        title,
        // subTitle,
        content,
        type,
      };
      await dispatch(postStoryAndNovel(storyAndNovelData));
      setTitle('');
      // setSubTitle('');
      setContent('');
      setType('');
      navigate(`/ItemList/${type}`, { state: { storyAndNovel: [...storyAndNovel, storyAndNovelData] } });
    } catch (error) {
      console.error('Error posting story/novel:', error);
      alert(error.message);
    }
  };

  const handleClick = (type) => {
    const filteredStoryAndNovel = storyAndNovel.filter((item) => item.type === type);
    navigate(`/ItemList/${type}`, { state: { storyAndNovel: filteredStoryAndNovel } });
  };

  return (
    <div className="container gap-4 d-flex flex-column">
      {loading && <Loader loadingMessage={'Loading...'} />}
      <Panel header="Write a story/novel..">
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

          {/* <InputText
            className="form-control"
            type="text"
            id="subTitle"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="Enter the Subtitle"
            required
          /> */}

          <JoditEditor
            value={content}
            config={config}
            tabIndex={1}
            onBlur={handleBlur}
            onChange={handleBlur}
          />

          <Dropdown
            value={type}
            options={typeOptions}
            onChange={handleTypeChange}
            placeholder="Select type"
            className="form-select"
          />
          <div className='text-center'>
            <Button
              className="btn btn-primary"
              onClick={handlePost}
              disabled={!isFormValid}
            >
              Save {type}
            </Button>
          </div>
        </div>
      </Panel>

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
