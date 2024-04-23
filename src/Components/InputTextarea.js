import React from 'react';

const InputTextarea = ({ type, value, onChange, placeholder, title, cssObject }) => {

  const inputStyle = {
    // Default styles, you can override or extend these with cssObject
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '8px',
    ...cssObject // Merging with the provided CSS object
  };


  return (
    <div>
    {title && 
    <div className='row'>
    <label>{title}</label>
    </div>}
    <textarea
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={inputStyle}
    />
  </div>
  );
};

export default InputTextarea;


