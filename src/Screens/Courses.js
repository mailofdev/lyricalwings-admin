import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { storage } from '../Config/firebase';
import DynamicForm2 from '../Components/DynamicForm2';
import { addCourse, fetchCourses, deleteCourse, updateCourse } from '../redux/courseSlice';
import { Button, Card, ListGroup } from 'react-bootstrap';

const Courses = () => {
    const dispatch = useDispatch();
    const { courses, status, error } = useSelector((state) => state.courses);
    const [editingCourse, setEditingCourse] = useState(null);

    const formConfig = [
        {
            fields: [
                { type: 'input', name: 'title', label: 'Title' },
                { type: 'file', name: 'file', label: 'Upload File' },
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
            if (formData.file) {
                const fileRef = storageRef(storage, `courses/${formData.file.name}`);
                await uploadBytes(fileRef, formData.file);
                const fileURL = await getDownloadURL(fileRef);

                await dispatch(addCourse({ title: formData.title, fileURL })).unwrap();
                alert('Course added successfully!');
            } else {
                alert('Please upload a file.');
            }
        } catch (err) {
            alert(`Failed to add course: ${err.message}`);
        }
    };

    const handleUpdateCourse = async (formData) => {
        try {
            let fileURL = editingCourse.fileURL;
            if (formData.file) {
                const fileRef = storageRef(storage, `courses/${formData.file.name}`);
                await uploadBytes(fileRef, formData.file);
                fileURL = await getDownloadURL(fileRef);
            }

            await dispatch(updateCourse({
                oldTitle: editingCourse.title,
                newTitle: formData.title,
                file: formData.file
            })).unwrap();
            alert('Course updated successfully!');
            setEditingCourse(null);
        } catch (err) {
            alert(`Failed to update course: ${err.message}`);
        }
    };

    const handleDeleteCourse = async (title) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await dispatch(deleteCourse(title)).unwrap();
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
                                    {Object.entries(courses).map(([title, course]) => (
                                        <ListGroup.Item key={title} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5>{title}</h5>
                                                <a href={course.fileURL} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">View File</a>
                                            </div>
                                            <div>
                                                <Button variant="warning" size="sm" className="me-2" onClick={() => setEditingCourse({ title, fileURL: course.fileURL })}>Edit</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteCourse(title)}>Delete</Button>
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