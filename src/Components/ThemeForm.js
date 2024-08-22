import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Row, Alert, Col } from 'react-bootstrap';
import { InputText } from 'primereact/inputtext';

const ThemeForm = ({
    formConfig,
    onSubmit,
    className = '',
    title = '',
    requiredFields = [],
    buttonLabel = 'Submit',
    editingItem = null,
    onCancel,
}) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [activeOverlay, setActiveOverlay] = useState(null);
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
            const clearedFormData = Object.keys(formData).reduce((acc, key) => {
                acc[key] = '';
                return acc;
            }, {});
            setFormData(clearedFormData);
            setErrors({});

            Object.values(fileUploadRefs.current).forEach(ref => {
                if (ref && ref.clear) {
                    ref.clear();
                }
            });

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
            case 'colorInput':
                return (
                    <Row>
                        <Col>
                            <InputText
                                type='color'
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className={`w-100 ${errors[field.name] ? 'is-invalid' : ''}`}
                                placeholder={field.placeholder || ''}
                                style={{height:40}}
                            />
                        </Col>
                        <Col>
                            <InputText
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className={`w-100 ${errors[field.name] ? 'is-invalid' : ''}`}
                                placeholder={field.placeholder || ''}
                                style={{height:40}}
                            />
                        </Col>
                    </Row>
                );

                case 'input':
                    return (
                      <InputText
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-100 ${errors[field.name] ? 'is-invalid' : ''}`}
                        placeholder={field.placeholder || ''}
                      />
                    );
                    
            default:
                return null;
        }
    };

    return (
        <>
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
                    {onCancel && (
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}

                </div>
            </Form>
            {activeOverlay && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} />}
        </>
    );
};

export default ThemeForm;