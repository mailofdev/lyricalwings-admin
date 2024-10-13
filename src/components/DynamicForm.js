import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Chips } from 'primereact/chips';
import JoditEditor from 'jodit-react';
import { Password } from 'primereact/password';

const DynamicForm = ({
  formConfig,
  onSubmit,
  className = '',
  title = '',
  requiredFields = [],
  buttonLabel = 'Submit',
  cancelConfig = { label: 'Cancel', onCancel: () => {} }, 
  editingItem = null,
  maxFileSize
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const fileUploadRefs = useRef({});
  const [uploadTypes, setUploadTypes] = useState({});

  useEffect(() => {
    let initialFormData = {};
    const initialUploadTypes = {};

    if (editingItem) {
      initialFormData = { ...editingItem };
    }

    formConfig[0].fields.forEach(field => {
      if (field.type === 'fileOrVideo') {
        const content = initialFormData[field.name];
        initialUploadTypes[field.name] = content && content.toLowerCase().endsWith('.mp4') ? 'video' : 'file';
      }
      if (field.type === 'arrayList' && !Array.isArray(initialFormData[field.name])) {
        initialFormData[field.name] = [{}];
      } else if (field.type === 'chips' && !Array.isArray(initialFormData[field.name])) {
        initialFormData[field.name] = [];
      } else if (!initialFormData.hasOwnProperty(field.name)) {
        initialFormData[field.name] = '';
      }
    });

    setFormData(initialFormData);
    setUploadTypes(initialUploadTypes);
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

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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

  const renderArrayListField = (field) => {
    const fieldData = formData[field.name];
    const arrayData = Array.isArray(fieldData) ? fieldData : [{}];

    return (
      <div>
        {arrayData.map((item, index) => (
          <div key={index} className="mb-3 p-3 border rounded">
            {field.subFields.map((subField, subIndex) => (
              <Form.Group as={Row} className="mb-3" key={subIndex}>
                <Form.Label column sm={3}>
                  {subField.label}
                </Form.Label>
                <Col sm={9}>
                  {renderSubField(subField, field.name, index)}
                </Col>
              </Form.Group>
            ))}
            <Button variant="danger" size="sm" onClick={() => removeArrayListItem(field.name, index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={() => addArrayListItem(field.name)}>
          Add {field.label}
        </Button>
      </div>
    );
  };

  const renderSubField = (subField, fieldName, index) => {
    const name = `${fieldName}[${index}].${subField.name}`;
    const value = formData[fieldName]?.[index]?.[subField.name] || '';

    switch (subField.type) {
      case 'divider':
        return (
          <div
            key={index}
          />
        );
      case 'headingTitle':
        return (
          <>
           <div className='test' style={{color:'red'}}>{subField.label}</div>
          </>
        );
      case 'input':
        return (
          <InputText
            name={name}
            value={value}
            onChange={(e) => handleArrayListChange(e, fieldName, index, subField.name)}
            className="w-100"
          />
        );
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            name={name}
            rows={subField.rows || 3}
            value={value}
            onChange={(e) => handleArrayListChange(e, fieldName, index, subField.name)}
          />
        );
      case 'dropdown':
        return (
          <Dropdown
            name={name}
            value={value}
            options={subField.options}
            onChange={(e) => handleArrayListDropdownChange(e, fieldName, index, subField.name)}
            optionLabel="label"
            className="w-100"
          />
        );
      case 'image':
        return (
          <FileUpload
            ref={(el) => (fileUploadRefs.current[name] = el)}
            name={name}
            accept="image/*"
            maxFileSize={maxFileSize}
            onSelect={(e) => handleArrayListFileUpload(e, fieldName, index, subField.name)}
            className="w-100"
          />
        );
      case 'editor':
        return (
          <JoditEditor
            value={value}
            config={subField.config}
            onChange={(content) => handleArrayListEditorChange(content, fieldName, index, subField.name)}
          />
        );
      default:
        return null;
    }
  };

  const handleArrayListChange = (e, fieldName, index, subFieldName) => {
    const { value } = e.target;
    setFormData(prevData => {
      const newArray = [...(prevData[fieldName] || [])];
      newArray[index] = { ...newArray[index], [subFieldName]: value };
      return { ...prevData, [fieldName]: newArray };
    });
  };

  const handleArrayListDropdownChange = (e, fieldName, index, subFieldName) => {
    setFormData(prevData => {
      const newArray = [...(prevData[fieldName] || [])];
      newArray[index] = { ...newArray[index], [subFieldName]: e.value };
      return { ...prevData, [fieldName]: newArray };
    });
  };

  const handleArrayListFileUpload = (e, fieldName, index, subFieldName) => {
    const file = e.files[0];
    setFormData(prevData => {
      const newArray = [...(prevData[fieldName] || [])];
      newArray[index] = { ...newArray[index], [subFieldName]: file };
      return { ...prevData, [fieldName]: newArray };
    });
  };

  const handleArrayListEditorChange = (content, fieldName, index, subFieldName) => {
    setFormData(prevData => {
      const newArray = [...(prevData[fieldName] || [])];
      newArray[index] = { ...newArray[index], [subFieldName]: content };
      return { ...prevData, [fieldName]: newArray };
    });
  };

  const addArrayListItem = (fieldName) => {
    setFormData(prevData => {
      const currentArray = Array.isArray(prevData[fieldName]) ? prevData[fieldName] : [];
      return {
        ...prevData,
        [fieldName]: [...currentArray, {}]
      };
    });
  };

  const removeArrayListItem = (fieldName, index) => {
    setFormData(prevData => {
      const currentArray = Array.isArray(prevData[fieldName]) ? prevData[fieldName] : [];
      return {
        ...prevData,
        [fieldName]: currentArray.filter((_, i) => i !== index)
      };
    });
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
      case 'arrayList':
        return renderArrayListField(subField);
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
    export default DynamicForm;