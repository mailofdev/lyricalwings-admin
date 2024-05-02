import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebase';
import { get, ref, push, set, remove, update } from "firebase/database";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Loader from '../Components/Loader'; // Import Loader component

const PoemForm = () => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [poems, setPoems] = useState([]);
  const [updatedId, setUpdatedId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState({
    titleValue: '',
    authorValue: '',
    poemContent: ''
  });
  const [updateData, setUpdateData] = useState({
    titleValue: '',
    authorValue: '',
    poemContent: ''
  });

  useEffect(() => {
    setIsFormValid(formData.titleValue !== '' && formData.authorValue !== '' && formData.poemContent !== '');
  }, [formData]);

  useEffect(() => {
    fetchPoems();
  }, []); // Fetch poems only once when the component mounts

  const fetchPoems = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Fetching poems...');
      const happinessRef = ref(db, 'happiness');
      const snapshot = await get(happinessRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const poemsArray = Object.values(data).reverse(); // Latest poem on top
        setPoems(poemsArray);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
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
      setLoading(true);
      setLoadingMessage('Posting poem...');
      const happinessRef = ref(db, 'happiness');
      const newId = push(happinessRef).key;
      const poemData = { ...formData, id: newId };
      await set(ref(db, `happiness/${newId}`), poemData);
      setFormData({
        titleValue: '',
        authorValue: '',
        poemContent: ''
      });
      fetchPoems();
      setLoading(false);
    } catch (error) {
      console.error('Error posting poem:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async (poemId) => {
    try {
      setLoading(true);
      setLoadingMessage('Updating poem...');
      const poemData = { ...updateData };
      await update(ref(db, `happiness/${poemId}`), poemData);
      setUpdatedId('');
      setEditMode(false);
      fetchPoems();
      setLoading(false);
    } catch (error) {
      console.error('Error updating poem:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (poemId) => {
    try {
      setLoading(true);
      setLoadingMessage('Deleting poem...');
      const poemRef = ref(db, `happiness/${poemId}`);
      await remove(poemRef);
      const updatedPoems = poems.filter(poem => poem.id !== poemId);
      setPoems(updatedPoems);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting poem:', error);
      setLoading(false);
    }
  };

  const handleEdit = (poem) => {
    setUpdateData(poem);
    setUpdatedId(poem.id);
    setEditMode(true);
  };

  return (
    <div className="container-fluid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="row">
        <div className="col-lg-6">
          <div className='form-padding'>
            <div className='form-height'>
              <Card className='w-100 p-4 gap-4'>
                <h3>Write a poem..</h3>
                <InputText
                  title="Title"
                  name="titleValue"
                  type="text"
                  placeholder="Enter title"
                  value={formData.titleValue}
                  onChange={handleInputChange}
                />
                <InputText
                  title="Author"
                  name="authorValue"
                  type="text"
                  placeholder="Enter author name"
                  value={formData.authorValue}
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
                <Button className='w-50 align-self-center d-flex justify-content-center btn btn-light btn-outline-success border border-1 border-success' onClick={handlePost} disabled={!isFormValid}>
                  Save
                </Button>
              </Card>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="poems-container">
            {loading ? (
              <Loader loadingMessage={loadingMessage} />
            ) : (
              poems.length === 0 ? (
                <div className="form-height align-self-center d-flex justify-content-center">
                  <p className="">No poems yet.. Write a poem.!</p>
                </div>
              ) : (
                poems.map((poem) => (
                  <>
                    <Card key={poem.id} className='p-2 gap-2 mb-3'>
                      {editMode && updatedId === poem.id ? (
                        <>
                          <InputText
                            title="Title"
                            name="titleValue"
                            type="text"
                            placeholder="Enter title"
                            value={updateData.titleValue}
                            onChange={handleUpdateChange}
                          />
                          <InputText
                            title="Author"
                            name="authorValue"
                            type="text"
                            placeholder="Enter author name"
                            value={updateData.authorValue}
                            onChange={handleUpdateChange}
                          />
                          <InputTextarea
                            title="Poem Content"
                            name="poemContent"
                            type="text"
                            placeholder="Enter poem content"
                            value={updateData.poemContent}
                            onChange={handleUpdateChange}
                            className='custom-textarea'
                          />
                          <Button className='w-50 align-self-center d-flex justify-content-center btn btn-light btn-outline-success border border-1 border-success' onClick={() => handleUpdate(poem.id)}>Update</Button>
                        </>
                      ) : (
                        <>
                          <p>{poem.titleValue}</p>
                          <h6>{poem.authorValue}</h6>
                          <p>{poem.poemContent}</p>
                          <div className='d-flex justify-content-evenly'>
                            <Button className='btn btn-light btn-outline-primary border border-1 border-primary' onClick={() => handleEdit(poem)}>Edit</Button>
                            <Button className='btn btn-light btn-outline-danger border border-1 border-danger' onClick={() => handleDelete(poem.id)}>Delete</Button>
                          </div>
                        </>
                      )}
                    </Card>
                  </>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoemForm;
