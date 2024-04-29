import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebase';
import { get, ref, push, set } from "firebase/database";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

const Happiness = () => {
  const [formData, setFormData] = useState({
    inputValue: '',
    subtitleValue: '',
    poemContent: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [latestPoem, setLatestPoem] = useState(null);
  const [showPoemCard, setShowPoemCard] = useState(false);

  useEffect(() => {
    setIsFormValid(formData.inputValue !== '' && formData.subtitleValue !== '' && formData.poemContent !== '');
    console.log('Latest Poem:', latestPoem);
  }, [formData]);
  
  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };



  const handleGet = async () => {
    try {
      const happinessRef = ref(db, 'happiness');
      const snapshot = await get(happinessRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const poemsArray = Object.values(data).filter(poem => Object.keys(poem).length !== 0); 
        const latestPoem = poemsArray[poemsArray.length - 1];
        setLatestPoem(latestPoem);
        setShowPoemCard(true);
        console.log('Poems Array:', poemsArray);
        console.log('Latest Poem:', latestPoem);
        console.log('Show Poem Card:', showPoemCard);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  
  
  const handlePost = () => {
    try {
      const happinessRef = ref(db, 'happiness');
      const newPostRef = push(happinessRef);
      set(newPostRef, formData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <Card style={{ width: '18rem', margin: '0 10px' }}>
        <Card.Body>
          <InputText
            title="Title"
            name="inputValue"
            type="text"
            placeholder="Enter your name"
            value={formData.inputValue}
            onChange={handleInputChange}
          />
          <InputText
            title="Subtitle"
            name="subtitleValue"
            type="text"
            placeholder="Enter subtitle"
            value={formData.subtitleValue}
            onChange={handleInputChange}
          />
          <InputTextarea
            title="Poem Content"
            name="poemContent"
            type="text"
            placeholder="Enter poem content"
            value={formData.poemContent}
            onChange={handleInputChange}
          />
          <Button variant="primary" onClick={handlePost} disabled={!isFormValid}>
            Save
          </Button>
          <Button variant="primary" onClick={handleGet} style={{ marginLeft: '10px' }}>
            Get Latest Poem
          </Button>
        </Card.Body>
      </Card>
      {showPoemCard && latestPoem && (
        <div style={{ margin: '0 10px' }}>
          <Card style={{ width: '18rem', marginBottom: '20px' }}>
            <Card.Body>
              <Card.Title>{latestPoem.inputValue}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{latestPoem.subtitleValue}</Card.Subtitle>
              <Card.Text>{latestPoem.poemContent}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Happiness;
