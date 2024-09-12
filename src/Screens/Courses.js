import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Row, Col, Container, Badge, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlayCircle, FaFile, FaStar, FaUsers } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import CourseForm from '../Components/CourseForm';
import Loader from '../Components/Loader';
import { fetchCourses, addCourses, updateCourses, deleteCourses } from '../redux/courseSlice';

const Courses = () => {
    const dispatch = useDispatch();
    const { CourseData, loading } = useSelector((state) => state.courses);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const toast = useRef(null);

    const formConfig = [
        {
            fields: [
                { type: 'input', name: 'titleOfType', label: 'Course Title' },
                { type: 'textarea', name: 'introductionOfType', label: 'Course Description' },
                { type: 'textarea', name: 'structureOfType', label: 'Course Structure' },
                { type: 'fileOrVideo', name: 'structureContent', label: 'Course Thumbnail' },
                { type: 'textarea', name: 'literatureOfType', label: 'Course Materials' },
                { type: 'fileOrVideo', name: 'literatureContent', label: 'Sample Material' },
                { type: 'textarea', name: 'methodologyOfType', label: 'Teaching Methodology' },
                { type: 'fileOrVideo', name: 'methodologyContent', label: 'Methodology Video' },
                { type: 'textarea', name: 'evaluationOfType', label: 'Evaluation Criteria' },
                { type: 'fileOrVideo', name: 'evaluationContent', label: 'Evaluation Sample' },
                { type: 'textarea', name: 'conclusionOfType', label: 'Course Conclusion' },
                { type: 'fileOrVideo', name: 'conclusionContent', label: 'Conclusion Video' },
                { type: 'input', name: 'instructor', label: 'Instructor Name' },
                { type: 'input', name: 'duration', label: 'Course Duration' },
                { type: 'input', name: 'level', label: 'Course Level' },
                { type: 'input', name: 'rating', label: 'Course Rating' },
                { type: 'input', name: 'students', label: 'Number of Students' },
            ]
        }
    ];

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    const handleFormSubmit = async (data, formType, itemId = null) => {
        try {
            const fileFields = formConfig[0].fields
                .filter(field => field.type === 'fileOrVideo')
                .map(field => field.name);

            const processedData = { ...data };
            fileFields.forEach(field => {
                if (processedData[field] && processedData[field].objectURL) {
                    processedData[field] = processedData[field].objectURL;
                }
            });

            if (formType === 'add') {
                await dispatch(addCourses({ itemData: processedData, fileFields })).unwrap();
                showToast('success', 'Success', 'Course added successfully');
            } else if (formType === 'edit' && itemId) {
                await dispatch(updateCourses({ id: itemId, itemData: processedData, fileFields })).unwrap();
                showToast('success', 'Success', 'Course updated successfully');
            }
            setEditingItem(null);
            setShowForm(false);
            dispatch(fetchCourses());
        } catch (error) {
            console.error("Error submitting form:", error);
            showToast('error', 'Error', error.message);
        }
    };

    const handleDelete = async (id) => {
        setItemToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            const fileFields = formConfig[0].fields
                .filter(field => field.type === 'fileOrVideo')
                .map(field => field.name);
            await dispatch(deleteCourses({ id: itemToDelete, fileFields })).unwrap();
            showToast('success', 'Success', 'Course deleted successfully');
            dispatch(fetchCourses());
        } catch (error) {
            console.error("Error deleting item:", error);
            showToast('error', 'Error', error.message);
        }
        setShowDeleteDialog(false);
        setItemToDelete(null);
    };

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000 });
    };

    // Filter courses by search query
    const filteredCourses = CourseData.filter(course =>
        course.titleOfType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container fluid className="py-4 text-center">
        <Toast ref={toast} />

        <Row className="mb-4">
            <Col md={10} lg={10} sm={10}>
                <Form.Control
                    type="text"
                    placeholder="Search courses by title..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </Col>
            <Col md={2} lg={2} sm={2}>
                <Button variant="success" onClick={() => setShowForm(true)}>
                    Add New Course
                </Button>
            </Col>
        </Row>

        {loading && <Loader loadingMessage="Loading courses..." />}

        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {filteredCourses.map((course) => (
                <Col key={course.id}>
                    <Card className="h-100 shadow-sm">
                        <Card.Img
                            variant="top"
                            src={course.structureContent || "/placeholder-course-image.jpg"}
                            style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                            <Card.Title className="text-primary">{course.titleOfType}</Card.Title>
                            <Card.Text className="text-muted">
                                {course.instructor || 'Unknown Instructor'}
                            </Card.Text>
                            <Card.Text>{course.introductionOfType}</Card.Text>
                            <div className="d-flex justify-content-between">
                                <Badge bg="warning">
                                    <FaStar /> {course.rating || '4.5'}
                                </Badge>
                                <Badge bg="info">
                                    <FaUsers /> {course.students || '1000+'}
                                </Badge>
                            </div>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-between">
                            <Button variant="outline-primary" onClick={() => setEditingItem(course)}>
                                <FaEdit /> Edit
                            </Button>
                            <Button variant="outline-danger" onClick={() => handleDelete(course.id)}>
                                <FaTrash /> Delete
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            ))}
        </Row>

        <Modal
            show={showForm || editingItem !== null}
            onHide={() => {
                setShowForm(false);
                setEditingItem(null);
            }}
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>{editingItem ? "Edit Course" : "Add New Course"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CourseForm
                    formConfig={formConfig}
                    onSubmit={handleFormSubmit}
                    editingItem={editingItem}
                    requiredFields={['titleOfType', 'instructor', 'level', 'duration']}
                    buttonLabel={editingItem ? "Update Course" : "Add Course"}
                />
            </Modal.Body>
        </Modal>

        <Modal
            show={showDeleteDialog}
            onHide={() => setShowDeleteDialog(false)}
        >
            <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this course?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </Modal.Footer>
        </Modal>
    </Container>
    );
};

export default Courses;
