import React from 'react';
import { Button, Table } from 'react-bootstrap';

const Courses = () => {
  const handleAddCourse = () => {
    // Logic to add a course
  };

  return (
    <div>
      <h2>Manage Courses</h2>
      <Button variant="primary" onClick={handleAddCourse} className="mb-3">
        Add Course
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Instructor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example Data */}
          <tr>
            <td>1</td>
            <td>Example Course</td>
            <td>Instructor Name</td>
            <td>
              <Button variant="info" size="sm" className="me-2">Edit</Button>
              <Button variant="danger" size="sm">Delete</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default Courses;
