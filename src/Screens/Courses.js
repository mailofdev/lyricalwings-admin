import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { storage } from '../Config/firebase';
import DynamicForm2 from '../Components/DynamicForm2';
import { addCourse, fetchCourses, deleteCourse, updateCourse } from '../redux/courseSlice';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

const Courses = () => {
    const dispatch = useDispatch();
    const { courses, status, error } = useSelector((state) => state.courses);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formKey, setFormKey] = useState(0);

    const formConfig = [
        {
            fields: [
                { type: 'textarea', name: 'title', label: 'Title' },
                { type: 'file', name: 'file', label: 'Upload File' },

                { type: 'textarea', name: 'titleOfType', label: 'Title' },
                { type: 'file', name: 'titleOfTypeFile', label: 'Upload File' },

                { type: 'textarea', name: 'introOfType', label: 'Introduction' },
                { type: 'file', name: 'introOfTypeFile', label: 'Upload File' },

                { type: 'textarea', name: 'structureOfType', label: 'Structure' },
                { type: 'file', name: 'structureOfTypeFile', label: 'Upload File' },

                { type: 'textarea', name: 'literatureOfType', label: 'Literature' },
                { type: 'file', name: 'literatureOfTypeFile', label: 'Upload File' },

                { type: 'textarea', name: 'methodologyOfType', label: 'Methodology' },
                { type: 'file', name: 'methodologyOfTypeFile', label: 'Upload File' },

                { type: 'textarea', name: 'evaluationOfType', label: 'Evaluation' },
                { type: 'file', name: 'evaluationOfTypeFile', label: 'Upload File' },

                { type: 'textarea', name: 'conclusionOfType', label: 'Conclusion' },
                { type: 'file', name: 'conclusionOfTypeFile', label: 'Upload File' },

            ],
        },
    ];

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchCourses());
        }
    }, [status, dispatch]);

    const handleAddCourse = async (formData) => {
        try {
            const courseData = { id: uuidv4() };
    
            for (const [key, value] of Object.entries(formData)) {
                if (value instanceof File) {
                    if (value.size > 0) {  // Check if file is not empty
                        const fileRef = storageRef(storage, `courses/${formData.title}/${key}`);
                        await uploadBytes(fileRef, value);
                        courseData[key] = await getDownloadURL(fileRef);
                    }
                } else if (value !== undefined && value !== null && value.trim() !== '') {
                    courseData[key] = value;
                }
            }
    
            // Remove any properties with undefined values
            Object.keys(courseData).forEach(key => courseData[key] === undefined && delete courseData[key]);
    
            console.log('Course data being sent:', courseData);  // Log the data before sending
    
            await dispatch(addCourse(courseData)).unwrap();
            alert('Course added successfully!');
            setFormKey(prevKey => prevKey + 1); // Reset the form
        } catch (err) {
            console.error('Error adding course:', err);  // Log the full error
            alert(`Failed to add course: ${err.message}`);
        }
    };
    
    const handleUpdateCourse = async (formData) => {
        try {
            const fileUploads = {};
            for (const [key, value] of Object.entries(formData)) {
                if (value instanceof File) {
                    const fileRef = storageRef(storage, `courses/${formData.title}/${key}`);
                    await uploadBytes(fileRef, value);
                    fileUploads[key] = await getDownloadURL(fileRef);
                }
            }
    
            const courseData = {
                id: editingCourse.id,
                ...Object.fromEntries(
                    Object.entries(formData).map(([key, value]) => 
                        [key, value instanceof File ? fileUploads[key] : (value || editingCourse[key])]
                    )
                )
            };
    
            await dispatch(updateCourse(courseData)).unwrap();
            alert('Course updated successfully!');
            setEditingCourse(null);
            setFormKey(prevKey => prevKey + 1); // Reset the form
        } catch (err) {
            alert(`Failed to update course: ${err.message}`);
        }
    };
    

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await dispatch(deleteCourse(id)).unwrap();
                alert('Course deleted successfully!');
            } catch (err) {
                alert(`Failed to delete course: ${err.message}`);
            }
        }
    };

    return (
        <div className='container my-5'>
            <div className='row'>
                <div className='col-lg-6 mb-4'>
                    <Card>
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4">
                                {editingCourse ? 'Update Course' : 'Add New Course'}
                            </Card.Title>
                            <DynamicForm2
                                key={formKey}
                                formConfig={formConfig}
                                onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}
                                initialValues={editingCourse ? { title: editingCourse.title, file: null } : {}}
                            />
                            {editingCourse && (
                                <div className="mt-3">
                                    <p>Current file: <a href={editingCourse.fileURL} target="_blank" rel="noopener noreferrer" className="btn btn-link">View Current File</a></p>
                                    <p className="text-muted">Upload a new file to replace the current one, or leave empty to keep the current file.</p>
                                    <Button variant="secondary" onClick={() => setEditingCourse(null)} className="mt-2">Cancel Edit</Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>
                <div className='col-lg-6'>
                    <Card>
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4">Course List</Card.Title>
                            {status === 'loading' && <p className="text-center">Loading...</p>}
                            {status === 'failed' && <p className="text-center text-danger">Error: {error}</p>}
                            {status === 'succeeded' && (
                                <ListGroup>
                                    {Object.entries(courses).map(([id, course]) => (
                                        <ListGroup.Item key={id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5>{course.title}</h5>
                                                <a href={course.fileURL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">View File</a>
                                            </div>
                                            <div>
                                                <Button variant="warning" size="sm" className="me-2" onClick={() => setEditingCourse({ id, ...course })}>Edit</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteCourse(id)}>Delete</Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Courses;