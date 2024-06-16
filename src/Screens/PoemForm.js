import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../Config/firebase';
import { get, ref, push, set } from 'firebase/database';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import { Panel } from 'primereact/panel';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from 'react-bootstrap';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const PoemForm = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [backgroundOfPoem, setBackgroundOfPoem] = useState('');
  const [poemContent, setPoemContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [fontColor, setFontColor] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [poems, setPoems] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const toast = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        navigate('/login'); // Redirect to login if not authenticated
      }
    });
  }, [navigate]);

  useEffect(() => {
    setIsFormValid(titleValue !== '' && backgroundOfPoem !== '' && poemContent !== '' && emotion !== '' && fontColor !== '');
  }, [titleValue, backgroundOfPoem, poemContent, emotion, fontColor]);

  const fetchPoems = async () => {
    try {
      const AllPoemsRef = ref(db, 'AllPoems');
      const snapshot = await get(AllPoemsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const poemsArray = Object.values(data).reverse();
        setPoems(poemsArray);
        updateLatestPoemOfEveryEmotion(poemsArray);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLatestPoemOfEveryEmotion = (poemsArray) => {
    const latestPoems = {};
    poemsArray.forEach(poem => {
      if (!latestPoems[poem.emotion]) {
        latestPoems[poem.emotion] = poem;
      }
    });
    saveLatestPoemOfEveryEmotion(latestPoems);
  };

  const saveLatestPoemOfEveryEmotion = async (latestPoems) => {
    try {
      const latestPoemsRef = ref(db, 'latestPoemOfEveryEmotion');
      await set(latestPoemsRef, latestPoems);
    } catch (error) {
      console.error('Error saving latest poems of every emotion:', error);
    }
  };

  const handleTitleChange = (event) => {
    const { value } = event.target;
    setTitleValue(value);
  };

  const handleBackgroundChange = (value) => {
    setBackgroundOfPoem(value);
  };

  const handlePoemContentChange = (value) => {
    setPoemContent(value);
  };

  const handleEmotionChange = (event) => {
    const { value } = event.target;
    setEmotion(value);
  };

  const handleFontColorChange = (event) => {
    const { value } = event.target;
    setFontColor(value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/jpeg' && file.size >= 20000 && file.size <= 500000) {
      setSelectedFile(file);
    } else {
      alert('Please select a JPG image between 20KB and 500KB.');
    }
  };

  const handlePost = async () => {
    try {
      const AllPoemsRef = ref(db, 'AllPoems');
      const newId = push(AllPoemsRef).key;
      const emotionToColorMap = {
        sadness: '#cce5ff',
        happiness: '#e2f0cb',
        anger: '#ffd6cc',
        fear: '#ffebcc',
        disgust: '#f0f0f0',
        surprise: '#f5e6ff'
      };
      const cardColor = emotionToColorMap[emotion];
      const poemData = {
        titleValue,
        backgroundOfPoem,
        poemContent,
        emotion,
        fontColor,
        id: newId,
        cardColor,
        likes: {},
        comments: {},
        timestamp: Date.now(),
        fileName: selectedFile ? selectedFile.name : null
      };

      if (selectedFile) {
        const fileRef = storageRef(storage, `poemImages/${newId}/${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        const downloadUrl = await getDownloadURL(fileRef); // Get download URL
        poemData.fileUrl = downloadUrl; // Add file URL to poemData
      }

      await set(ref(db, `AllPoems/${newId}`), poemData);

      fetchPoems();

      setTitleValue('');
      setBackgroundOfPoem('');
      setPoemContent('');
      setEmotion('');
      setFontColor('');
      setSelectedFile(null);
      navigate(`/PoemList/${emotion}`, { state: { poems: [...poems, poemData] } });

    } catch (error) {
      console.error('Error posting poem:', error);
      alert(error.message);
    }
  };

  const handleClick = (emotion) => {
    const filteredPoems = poems.filter(poem => poem.emotion === emotion);
    navigate(`/PoemList/${emotion}`, { state: { poems: filteredPoems } });
  };

  return (
    <div className="container gap-4 d-flex flex-column">
      <Panel header="Write a poem..">
        <div className="d-flex flex-column gap-3">
          <InputText
            className="form-control"
            type="text"
            id="title"
            value={titleValue}
            onChange={handleTitleChange}
            placeholder="Enter the Title"
            required
          />
          <div className="QuillEditor">
            <ReactQuill
              theme="snow"
              value={backgroundOfPoem}
              onChange={handleBackgroundChange}
              placeholder="Background of Poem"
            />
          </div>
          <div className="QuillEditor">
            <ReactQuill
              theme="snow"
              value={poemContent}
              onChange={handlePoemContentChange}
              placeholder="Write Your Poem Here"
            />
          </div>
          <select
            className="form-select"
            value={emotion}
            onChange={handleEmotionChange}
            required
          >
            <option value="" disabled>Select emotion</option>
            <option value="happiness">Happiness</option>
            <option value="sadness">Sadness</option>
            <option value="anger">Anger</option>
            <option value="fear">Fear</option>
            <option value="disgust">Disgust</option>
            <option value="surprise">Surprise</option>
          </select>

          <select
            className="form-select"
            value={fontColor}
            onChange={handleFontColorChange}
            required
          >
            <option value="" disabled>Select font color</option>
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
          </select>

          <InputText
            type="file"
            onChange={handleFileChange}
          />
          <Button
            className="w-50 align-self-center d-flex justify-content-center btn btn-light btn-outline-success border border-1 border-success"
            onClick={handlePost}
            disabled={!isFormValid}
          >
            Save
          </Button>
          <div className="d-flex justify-content-between flex-wrap px-2">
            <Button className="my-2 btn btn-light btn-outline-primary border border-1 border-primary" onClick={() => handleClick('happiness')}>Happiness</Button>
            <Button className="my-2 btn btn-light btn-outline-primary border border-1 border-primary" onClick={() => handleClick('anger')}>Anger</Button>
            <Button className="my-2 btn btn-light btn-outline-primary border border-1 border-primary" onClick={() => handleClick('disgust')}>Disgust</Button>
            <Button className="my-2 btn btn-light btn-outline-primary border border-1 border-primary" onClick={() => handleClick('fear')}>Fear</Button>
            <Button className="my-2 btn btn-light btn-outline-primary border border-1 border-primary" onClick={() => handleClick('surprise')}>Surprise</Button>
            <Button className="my-2 btn btn-light btn-outline-primary border border-1 border-primary" onClick={() => handleClick('sadness')}>Sadness</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default PoemForm;
