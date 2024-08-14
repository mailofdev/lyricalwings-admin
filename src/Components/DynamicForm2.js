import React, { useState, useEffect } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';

const DynamicForm2 = ({ formConfig, onSubmit, className = '', title = '', requiredFields = [], fileName = '', initialValues = {}, buttonName }) => {
  const [formData, setFormData] = useState(initialValues || {});

  useEffect(() => {
    setFormData(initialValues || {});
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Collect missing required fields and convert to lowercase
    const missingFields = requiredFields
      .filter(field => !formData[field])
      .map(field => field.toLowerCase());

    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(', ');
      alert(`The following fields are required: ${missingFieldsString}`);
      return;
    }

    await onSubmit(formData);
    setFormData({});
  };

  return (
    <Form onSubmit={handleSubmit} className={className}>
      {title && <h2 className='text-center'>{title}</h2>}
      {formConfig && formConfig.map((field, fieldIndex) => (
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
                {subField.type === 'file' && (
                  <Form.Group controlId={`${subField.name}-${index}`} className="mb-3">
                    <Form.Label>{subField.label}</Form.Label>
                    <Form.Control
                      type="file"
                      name={subField.name}
                      onChange={handleChange}
                    />
                    {/* {formData[subField.name] && (
                      <div className="mt-2">
                        <strong>Selected File:</strong> {formData[subField.name].name}
                      </div>
                    )} */}
                  </Form.Group>
                )}
              </Row>
            ))
            : null}
        </React.Fragment>
      ))}
      <div className='text-center'>
        <Button type="submit" variant="primary">
          {buttonName}
        </Button>
      </div>
    </Form>
  );
};

export default DynamicForm2;
