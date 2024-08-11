import React, { useState } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import JoditEditor from 'jodit-react';

const DynamicForm = ({ formConfig, onSubmit, className = '', title = '', requiredFields = [] }) => {
  const [formData, setFormData] = useState({});

  const handleEditorChange = (content, name) => {
    setFormData({ ...formData, [name]: content });
  };

  const handleDropdownChange = (e, name) => {
    setFormData({ ...formData, [name]: e.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Collect missing required fields and convert to lowercase
    const missingFields = requiredFields
      .filter(field => !formData[field])
      .map(field => field.toLowerCase());
  
    if (missingFields.length > 0) {
      // Create a string of missing field names, separated by commas
      const missingFieldsString = missingFields.join(', ');
      alert(`The following fields are required: ${missingFieldsString}`);
      return;
    }
  
    const combinedFormData = new FormData();
  
    Object.keys(formData).forEach(key => {
      if (formData[key] instanceof File) {
        combinedFormData.append(key, formData[key], formData[key].name);
      } else {
        combinedFormData.append(key, formData[key]);
      }
    });
  
    await onSubmit(combinedFormData);
  };
  

  return (
    <Form onSubmit={handleSubmit} className={className}>
      {title && <h2 className='text-center'>{title}</h2>}
      {formConfig.map((field, fieldIndex) => (
        <React.Fragment key={fieldIndex}>
          {Array.isArray(field.fields)
            ? field.fields.map((subField, index) => (
              <Row key={index}>
                {subField.type === 'input' && (
                  <Form.Group controlId={`${subField.name}-${index}`} className="mb-3">
                    <Form.Label>{subField.label}</Form.Label>
                    <InputText
                      name={subField.name}
                      value={formData[subField.name] || ''}
                      onChange={handleChange}
                      className="w-100"
                    />
                  </Form.Group>
                )}
                {subField.type === 'dropdown' && (
                  <Form.Group controlId={`${subField.name}-${index}`} className="mb-3">
                    <Form.Label>{subField.label}</Form.Label>
                    <Dropdown
                      name={subField.name}
                      value={formData[subField.name] || ''}
                      options={subField.options}
                      onChange={(e) => handleDropdownChange(e, subField.name)}
                      optionLabel="label"
                      placeholder="Select an option"
                      className="w-100"
                    />
                  </Form.Group>
                )}
                {subField.type === 'textarea' && (
                  <Form.Group controlId={`${subField.name}-${index}`} className="mb-3">
                    <Form.Label>{subField.label}</Form.Label>
                    <Form.Control
                      as="textarea"
                      name={subField.name}
                      rows={subField.rows || 3}
                      value={formData[subField.name] || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                )}
                {subField.type === 'editor' && (
                  <Form.Group controlId={`${subField.name}-${index}`} className="mb-3">
                    <Form.Label>{subField.label}</Form.Label>
                    <JoditEditor
                      value={formData[subField.name] || ''}
                      config={subField.config}
                      onChange={(content) => handleEditorChange(content, subField.name)}
                    />
                  </Form.Group>
                )}
              </Row>
            ))
            : null}
        </React.Fragment>
      ))}
      <div className='text-center'>
      <Button type="submit" variant="primary">
        Save 
      </Button>
      </div>
    </Form>
  );
};

export default DynamicForm;