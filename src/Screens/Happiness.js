import React, { useState, useEffect } from 'react';
import Textinput from '../Components/TextInput';
import InputTextarea from '../Components/InputTextarea'; // Import InputTextarea component
import Editor from '../Components/Editor';
const Happiness = () => {

  const [formData, setFormData] = useState({
    inputValue: '',
    subtitleValue: '',
    poemContent: ''
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(formData.inputValue !== '' && formData.subtitleValue !== '' && formData.poemContent !== '');
  }, [formData]);

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      inputValue: event.target.value
    });
  };

  const handleSubtitleChange = (event) => {
    setFormData({
      ...formData,
      subtitleValue: event.target.value
    });
  };

  const handlePoemContentChange = (event) => {
    setFormData({
      ...formData,
      poemContent: event.target.value
    });
  };

  const handleSave = () => {
    alert(`Title: ${formData.inputValue}\nSubtitle: ${formData.subtitleValue}\nPoem Content: ${formData.poemContent}`);
  };

  return (
    <>
      <div className='centered-content border-gray br-sm d-flex justify-content-center'>
        <div className='container align-self-center'>

          <div className="row">
            <div className="col-lg-6">
              <Textinput
                title="Title"
                type="text"
                placeholder="Enter your name"
                value={formData.inputValue}
                onChange={handleInputChange}
                cssObject={{
                  backgroundColor: '#f7f7f7',
                  color: '#333',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <Textinput
                title="Subtitle"
                type="text"
                placeholder="Enter subtitle"
                value={formData.subtitleValue}
                onChange={handleSubtitleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <InputTextarea
                 title="Title"
                 type="text"
                 placeholder="Enter your name"
                value={formData.poemContent}
                onChange={handlePoemContentChange}
                cssObject={{
                  backgroundColor: '#f7f7f7',
                  color: 'black',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>



          <div className="row">
            <div className="col-lg-6">
              <button className="btn btn-primary" onClick={handleSave} disabled={!isFormValid}>Save</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Happiness;
