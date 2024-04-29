import React from 'react';

const Textinput = ({ type, placeholder, value, onChange, title, cssObject }) => {
  const inputStyle = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '8px',
    ...cssObject 
  };

  return (
    <div>
      {title && 
      <div className='row'>
      <label>{title}</label>
      </div>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
};

export default Textinput;
