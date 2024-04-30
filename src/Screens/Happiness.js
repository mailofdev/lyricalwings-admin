import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebase';
import { get, ref, push, set, remove, update } from "firebase/database";
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

  const [updateData, setUpdateData] = useState({
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

  const handleUpdateChange = (event) => {
    setUpdateData({
      ...updateData,
      [event.target.name]: event.target.value
    });
  };

const [poemFinal, setpoemFinal] = useState();

  const handleGet = async () => {
    try {
      const happinessRef = ref(db, 'happiness');
      const snapshot = await get(happinessRef);
      if (snapshot.exists()) {
        const data = await snapshot.val();
        const poemsArray = await Object.values(data); 
        await setpoemFinal(poemsArray)
        setShowPoemCard(true);
        console.log('Latest Poem:', poemFinal);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // useEffect(() => {
  //   const happinessRef = ref(db, 'happiness');
  //   if (happinessRef) {
      
  //     try {
  //       remove(happinessRef)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  // }, []);
  
  
  
  const handlePost = async () => {
    try {
      const happinessRef = ref(db, 'happiness');
      const newId = push(happinessRef).key;
      const poemData = { ...formData, id: newId };
      await set(ref(db, `happiness/${newId}`), poemData);
      setFormData({
        inputValue: '',
        subtitleValue: '',
        poemContent: '',
        id:""
      });
    } catch (error) {
      console.error('Error posting poem:', error);}
  };

  const [updatedId, setupdatedId] = useState('');

  const handleUpdate = async (poemId) => {
    setupdatedId(poemId)
    try {
if (updatedId == poemId) {
  
  const poemData = { ...formData };
  await update(ref(db, `happiness/${poemId}`), poemData);
  setUpdateData({
    inputValue: '',
    subtitleValue: '',
    poemContent: ''
  });
}
    } catch (error) {
      console.error('Error posting poem:', error);}
  };


  const handleDelete = async (poemId) => {
    try {
      const poemRef = ref(db, `happiness/${poemId}`);
      await remove(poemRef);
      setShowPoemCard(false); // Hide the poem card after deletion
    } catch (error) {
      console.error('Error deleting poem:', error);
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
      <div>

      {poemFinal && poemFinal.map((item) => (
        <div style={{ margin: '0 10px' }} key={item.id}>
          <Card style={{ width: '18rem', marginBottom: '20px' }}>
            <Card.Body>
              <Card.Title>{item.id == updatedId ? <>
                <InputText
            title="Title"
            name="inputValue"
            type="text"
            placeholder="Enter your name"
            value={updateData.inputValue}
            onChange={handleUpdateChange}
          />
              </>: item.inputValue}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{item.id == updatedId ? 
              <>
              <InputText
            title="Subtitle"
            name="subtitleValue"
            type="text"
            placeholder="Enter subtitle"
            value={updateData.subtitleValue}
            onChange={handleUpdateChange}
          />
              </>
              :item.subtitleValue}</Card.Subtitle>
              <Card.Text>{item.id == updatedId ? <>

                <InputTextarea
            title="Poem Content"
            name="poemContent"
            type="text"
            placeholder="Enter poem content"
            value={updateData.poemContent}
            onChange={handleUpdateChange}
          />
              </>: item.poemContent}</Card.Text>
              <Button onClick={() => handleUpdate(item.id)}>Update</Button>
              <Button onClick={() => handleDelete(item.id)}>Delete</Button>
            </Card.Body>
          </Card>
        </div>
      ))}
      </div>
    </div>
  );
}

export default Happiness;
