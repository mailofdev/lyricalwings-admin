import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Chips } from 'primereact/chips';
import JoditEditor from 'jodit-react';

const CourseForm = ({ formConfig, onSubmit, className = '', title = '', requiredFields = [], buttonLabel = 'Submit', editingItem = null, maxFileSize }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const fileUploadRefs = useRef({});
  const [uploadTypes, setUploadTypes] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      const initialUploadTypes = {};
      formConfig[0].fields.forEach(field => {
        if (field.type === 'fileOrVideo') {
          const content = editingItem[field.name];
          initialUploadTypes[field.name] = content && content.toLowerCase().endsWith('.mp4') ? 'video' : 'file';
        }
      });
      setUploadTypes(initialUploadTypes);
    } else {
      const initialFormData = formConfig.reduce((acc, fieldConfig) => {
        fieldConfig.fields.forEach(field => {
          acc[field.name] = field.type === 'chips' ? [] : '';
        });
        return acc;
      }, {});
      setFormData(initialFormData);
      const initialUploadTypes = {};
      formConfig[0].fields.forEach(field => {
        if (field.type === 'fileOrVideo') {
          initialUploadTypes[field.name] = 'file';
        }
      });
      setUploadTypes(initialUploadTypes);
    }
  }, [formConfig, editingItem]);

  const handleEditorChange = (content, name) => {
    setFormData(prevData => ({ ...prevData, [name]: content }));
    validateField(name, content);
  };

  const handleDropdownChange = (e, name) => {
    setFormData(prevData => ({ ...prevData, [name]: e.value }));
    validateField(name, e.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value);
  };

  const handleFileUpload = (e, name) => {
    const file = e.files[0];
    setFormData(prevData => ({ ...prevData, [name]: file }));
    validateField(name, file);
  };

  const handleUploadTypeChange = (e, name) => {
    setUploadTypes(prevTypes => ({ ...prevTypes, [name]: e.value }));
    setFormData(prevData => ({ ...prevData, [name]: null }));
    if (fileUploadRefs.current[name]) {
      fileUploadRefs.current[name].clear();
    }
  };

  const handleNumberChange = (e, name) => {
    setFormData(prevData => ({ ...prevData, [name]: e.value }));
    validateField(name, e.value);
  };

  const handleChipsChange = (e, name) => {
    setFormData(prevData => ({ ...prevData, [name]: e.value }));
    validateField(name, e.value);
  };

  const validateField = (name, value) => {
    if (requiredFields.includes(name) && (!value || (Array.isArray(value) && value.length === 0))) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: 'This field is required' }));
    } else {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData, editingItem ? 'edit' : 'add', editingItem?.id);
      setFormData({});
      setErrors({});

      // Clear file inputs
      Object.keys(fileUploadRefs.current).forEach(refName => {
        if (fileUploadRefs.current[refName]) {
          fileUploadRefs.current[refName].clear();
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message });
    }
  };

  const renderField = (subField, index) => {
    switch (subField.type) {
      case 'input':
        return (
          <InputText
            name={subField.name}
            value={formData[subField.name] || ''}
            onChange={handleChange}
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
          />
        );
      case 'dropdown':
        return (
          <Dropdown
            name={subField.name}
            value={formData[subField.name] || ''}
            options={subField.options}
            onChange={(e) => handleDropdownChange(e, subField.name)}
            optionLabel="label"
            placeholder="Select an option"
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
          />
        );
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            name={subField.name}
            rows={subField.rows || 3}
            value={formData[subField.name] || ''}
            onChange={handleChange}
            className={errors[subField.name] ? 'is-invalid' : ''}
          />
        );
      case 'editor':
        return (
          <JoditEditor
            value={formData[subField.name] || ''}
            config={subField.config}
            onChange={(content) => handleEditorChange(content, subField.name)}
          />
        );
      case 'fileOrVideo':
        return (
          <div>
            <div className="my-2 gap-2 d-flex flex-row align-items-center">
              <RadioButton 
                inputId={`${subField.name}-file`}
                name={`${subField.name}-type`}
                value="file"
                onChange={(e) => handleUploadTypeChange(e, subField.name)}
                checked={uploadTypes[subField.name] === 'file'}
              />
              <label htmlFor={`${subField.name}-file`} className="ml-2">File</label>
              
              <RadioButton 
                inputId={`${subField.name}-video`}
                name={`${subField.name}-type`}
                value="video"
                onChange={(e) => handleUploadTypeChange(e, subField.name)}
                checked={uploadTypes[subField.name] === 'video'}
                className="ml-4"
              />
              <label htmlFor={`${subField.name}-video`} className="ml-2">Video</label>
            </div>
            <FileUpload
              ref={(el) => (fileUploadRefs.current[subField.name] = el)}
              name={subField.name}
              accept={uploadTypes[subField.name] === 'video' ? "video/*" : "image/*,application/pdf"}
              maxFileSize={maxFileSize}
              onSelect={(e) => handleFileUpload(e, subField.name)}
              className={errors[subField.name] ? 'is-invalid' : ''}
            />
          </div>
        );
      case 'number':
        return (
          <InputNumber
            name={subField.name}
            value={formData[subField.name] || null}
            onValueChange={(e) => handleNumberChange(e, subField.name)}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
          />
        );
      case 'chips':
        return (
          <Chips
            name={subField.name}
            value={formData[subField.name] || []}
            onChange={(e) => handleChipsChange(e, subField.name)}
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={`${className} p-4 bg-light rounded shadow-sm`}>
      {title && <h2 className="text-center mb-4">{title}</h2>}
      {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
      {formConfig.map((field, fieldIndex) => (
        <React.Fragment key={fieldIndex}>
          {Array.isArray(field.fields) && field.fields.map((subField, index) => (
            <Form.Group as={Row} className="mb-3" key={index}>
              <Form.Label column sm={3}>
                {subField.label}
              </Form.Label>
              <Col sm={9}>
                {renderField(subField, index)}
                {errors[subField.name] && <Form.Text className="text-danger">{errors[subField.name]}</Form.Text>}
              </Col>
            </Form.Group>
          ))}
        </React.Fragment>
      ))}
      <div className="text-center">
        <Button type="submit" className="btn-primary btn-lg">
          {buttonLabel}
        </Button>
      </div>
    </Form>
  );
};

export default CourseForm;
