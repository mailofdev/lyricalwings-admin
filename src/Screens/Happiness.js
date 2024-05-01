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
  const [poems, setPoems] = useState([]);
  const [updatedId, setUpdatedId] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setIsFormValid(formData.inputValue !== '' && formData.subtitleValue !== '' && formData.poemContent !== '');
  }, [formData]);

  useEffect(() => {
    fetchPoems();
  }, []);

  const fetchPoems = async () => {
    try {
      const happinessRef = ref(db, 'happiness');
      const snapshot = await get(happinessRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const poemsArray = Object.values(data).reverse(); // Latest poem on top
        setPoems(poemsArray);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const handlePost = async () => {
    try {
      const happinessRef = ref(db, 'happiness');
      const newId = push(happinessRef).key;
      const poemData = { ...formData, id: newId };
      await set(ref(db, `happiness/${newId}`), poemData);
      setFormData({
        inputValue: '',
        subtitleValue: '',
        poemContent: ''
      });
      fetchPoems();
    } catch (error) {
      console.error('Error posting poem:', error);
    }
  };

  const handleUpdate = async (poemId) => {
    try {
      const poemData = { ...updateData };
      await update(ref(db, `happiness/${poemId}`), poemData);
      setUpdatedId('');
      setEditMode(false);
      fetchPoems();
    } catch (error) {
      console.error('Error updating poem:', error);
    }
  };

  const handleDelete = async (poemId) => {
    try {
      const poemRef = ref(db, `happiness/${poemId}`);
      await remove(poemRef);
      // Remove the deleted poem from the poems array in the state
      setPoems(poems.filter(poem => poem.id !== poemId));
    } catch (error) {
      console.error('Error deleting poem:', error);
    }
  };

  const handleEdit = (poem) => {
    setUpdateData(poem);
    setUpdatedId(poem.id);
    setEditMode(true);
  };

  return (
    <div className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <div className="row">
        <div className="col-lg-6">
          <Card style={{ width: '100%', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
            <h3>Compose Poem</h3>
            <InputText
              title="Title"
              name="inputValue"
              type="text"
              placeholder="Enter title"
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
          </Card>
        </div>
        <div className="col-lg-6">
          {poems.length === 0 ? (
            <p>No poems yet... Add new poems</p>
          ) : (
            poems.map((poem) => (
              <Card key={poem.id} style={{ width: '100%', marginBottom: '20px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
                {editMode && updatedId === poem.id ? (
                  <>
                    <InputText
                      title="Title"
                      name="inputValue"
                      type="text"
                      placeholder="Enter title"
                      value={updateData.inputValue}
                      onChange={handleUpdateChange}
                    />
                    <InputText
                      title="Subtitle"
                      name="subtitleValue"
                      type="text"
                      placeholder="Enter subtitle"
                      value={updateData.subtitleValue}
                      onChange={handleUpdateChange}
                    />
                    <InputTextarea
                      title="Poem Content"
                      name="poemContent"
                      type="text"
                      placeholder="Enter poem content"
                      value={updateData.poemContent}
                      onChange={handleUpdateChange}
                    />
                    <Button onClick={() => handleUpdate(poem.id)}>Update</Button>
                  </>
                ) : (
                  <>
                    <h4>{poem.inputValue}</h4>
                    <h6>{poem.subtitleValue}</h6>
                    <p>{poem.poemContent}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button onClick={() => handleEdit(poem)}>Edit</Button>
                      <Button onClick={() => handleDelete(poem.id)}>Delete</Button>
                    </div>
                  </>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Happiness;
