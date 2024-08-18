import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Alert } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import JoditEditor from 'jodit-react';

const DynamicForm = ({
  formConfig,
  onSubmit,
  className = '',
  title = '',
  requiredFields = [],
  buttonLabel = 'Submit',
  editingItem = null,
  maxFileSize,
  fileType = 'image/*,application/pdf',
  onCancel,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const fileUploadRefs = useRef({});
  const editorRefs = useRef({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      const initialFormData = formConfig.reduce((acc, fieldConfig) => {
        fieldConfig.fields.forEach(field => {
          acc[field.name] = field.type === 'editor' ? '' : '';
        });
        return acc;
      }, {});
      setFormData(initialFormData);
    }
  }, [formConfig, editingItem]);

  const handleChange = (name, value, type = 'input') => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value, type);
  };

  const handleEditorChange = (name, value) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
    validateField(name, value, 'editor');
  };

  const validateField = (name, value, type) => {
    if (requiredFields.includes(name)) {
      if ((type === 'editor' && (!value || !value.trim())) || (!value && type !== 'editor')) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: 'This field is required' }));
      } else {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData, editingItem ? 'edit' : 'add', editingItem?.id);

      // Clear form data and errors
      const clearedFormData = Object.keys(formData).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {});
      setFormData(clearedFormData);
      setErrors({});

      // Clear file inputs
      Object.values(fileUploadRefs.current).forEach(ref => {
        if (ref && ref.clear) {
          ref.clear();
        }
      });

      // Clear Jodit Editor contents
      Object.entries(editorRefs.current).forEach(([name, ref]) => {
        if (ref && ref.current) {
          ref.current.value = '';
          handleEditorChange(name, '');
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message });
    }
  };

  const renderField = (field, index) => {
    switch (field.type) {
      case 'input':
        return (
          <InputText
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`w-100 ${errors[field.name] ? 'is-invalid' : ''}`}
          />
        );
      
      case 'dropdown':
        return (
          <Dropdown
            name={field.name}
            value={formData[field.name] || ''}
            options={field.options}
            onChange={(e) => handleChange(field.name, e.value)}
            optionLabel="label"
            placeholder="Select an option"
            className={`w-100 ${errors[field.name] ? 'is-invalid' : ''}`}
          />
        );
      
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            name={field.name}
            rows={field.rows || 3}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={errors[field.name] ? 'is-invalid' : ''}
          />
        );
      
      case 'editor':
        return (
          <JoditEditor
            ref={(el) => (editorRefs.current[field.name] = el)}
            value={formData[field.name] || ''}
            config={field.config}
            onChange={(content) => handleEditorChange(field.name, content)}
          />
        );
      
      case 'file':
        return (
          <FileUpload
            ref={(el) => (fileUploadRefs.current[field.name] = el)}
            name={field.name}
            accept={fileType}
            maxFileSize={maxFileSize}
            onSelect={(e) => handleChange(field.name, e.files[0])}
            className={errors[field.name] ? 'is-invalid' : ''}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={className}>
      {title && <h2 className='text-center'>{title}</h2>}
      {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
      {formConfig.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {Array.isArray(section.fields) && section.fields.map((field, index) => (
            <Row key={index}>
              <Form.Group controlId={`${field.name}-${index}`} className="mb-3">
                <Form.Label>{field.label}</Form.Label>
                {renderField(field, index)}
                {errors[field.name] && <Form.Text className="text-danger">{errors[field.name]}</Form.Text>}
              </Form.Group>
            </Row>
          ))}
        </React.Fragment>
      ))}
      <div className='text-center'>
        <Button type="submit" variant="primary" className="me-2">
          {buttonLabel}
        </Button>
        {editingItem && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

export default DynamicForm;