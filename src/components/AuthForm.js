import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Password } from 'primereact/password';

const AuthForm = ({
  formConfig,
  onSubmit,
  className = '',
  title = '',
  requiredFields = [],
  buttonLabel = 'Submit',
  cancelConfig = { label: 'Cancel', onCancel: () => { } },
  editingItem = null,
  maxFileSize
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const fileUploadRefs = useRef({});

  useEffect(() => {
    let initialFormData = {};

    if (editingItem) {
      initialFormData = { ...editingItem };
    }

    formConfig[0].fields.forEach(field => {
      if (field.type === 'arrayList' && !Array.isArray(initialFormData[field.name])) {
        initialFormData[field.name] = [{}];
      } else if (field.type === 'chips' && !Array.isArray(initialFormData[field.name])) {
        initialFormData[field.name] = [];
      } else if (!initialFormData.hasOwnProperty(field.name)) {
        initialFormData[field.name] = '';
      }
    });

    setFormData(initialFormData);
  }, [formConfig, editingItem]);

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

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };


  const validateField = (name, value) => {
    if (requiredFields.includes(name) && (!value || (Array.isArray(value) && value.length === 0))) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: 'This field is required' }));
    } else if (name === 'email' && value && !validateEmail(value)) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: 'Please enter a valid email address' }));
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

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData, editingItem ? 'edit' : 'add', editingItem?.id);
      setFormData({});
      setErrors({});
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

  const handlePasswordChange = (e, name) => {
    setFormData(prevData => ({ ...prevData, [name]: e.target.value }));
    validateField(name, e.target.value);
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
      case 'password':
        return (
          <Password
            name={subField.name}
            value={formData[subField.name] || ''}
            onChange={(e) => handlePasswordChange(e, subField.name)}
            toggleMask
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
            feedback={false}
            inputClassName="w-100"
            pt={{
              showIcon: { className: 'cursor-pointer' },
              hideIcon: { className: 'cursor-pointer' }
            }}
          />
        );
      case 'email':
        return (
          <InputText
            name={subField.name}
            value={formData[subField.name] || ''}
            onChange={handleChange}
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
            type="email"
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
            className={`w-100 ${errors[subField.name] ? 'is-invalid' : ''}`}
          />
        );
      case 'file':
        return (
          <FileUpload
            ref={(el) => (fileUploadRefs.current[subField.name] = el)}
            name={subField.name}
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxFileSize={maxFileSize}
            onSelect={(e) => handleFileUpload(e, subField.name)}
            className={errors[subField.name] ? 'is-invalid' : ''}
          />
        );
      case 'image':
        return (
          <FileUpload
            ref={(el) => (fileUploadRefs.current[subField.name] = el)}
            name={subField.name}
            accept="image/*"
            maxFileSize={maxFileSize}
            onSelect={(e) => handleFileUpload(e, subField.name)}
            className={errors[subField.name] ? 'is-invalid' : ''}
          />
        );
      case 'video':
        return (
          <FileUpload
            ref={(el) => (fileUploadRefs.current[subField.name] = el)}
            name={subField.name}
            accept="video/*"
            maxFileSize={maxFileSize}
            onSelect={(e) => handleFileUpload(e, subField.name)}
            className={errors[subField.name] ? 'is-invalid' : ''}
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
          {Array.isArray(field.fields) && field.fields.map((subField, index) => {
            // Skip rendering password and email fields when editing
            if (editingItem && (subField.type === 'password' || subField.type === 'email')) {
              return null;
            }
            return (
              <Form.Group as={Row} className="mb-3" key={index}>
                <Form.Label column sm={3}>
                  {subField.label}
                </Form.Label>
                <Col sm={9}>
                  {renderField(subField, index)}
                  {errors[subField.name] && <Form.Text className="text-danger">{errors[subField.name]}</Form.Text>}
                </Col>
              </Form.Group>
            );
          })}
        </React.Fragment>
      ))}
      <div className="justify-content-center gap-2 d-flex">
        <Button type="submit" className="btn-primary">
          {buttonLabel}
        </Button>
        <Button
          type="button"
          className="btn-secondary"
          onClick={cancelConfig.onCancel}
        >
          {cancelConfig.label}
        </Button>
      </div>
    </Form>
  );
}

export default AuthForm;