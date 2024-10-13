import React from 'react';
import { Button, Table } from 'react-bootstrap';

const Stories = () => {
  const handleAddStory = () => {
    // Logic to add a story
  };

  return (
    <div>
      <h2>Manage Stories</h2>
      <Button variant="primary" onClick={handleAddStory} className="mb-3">
        Add Story
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example Data */}
          <tr>
            <td>1</td>
            <td>Example Story</td>
            <td>Author Name</td>
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

export default Stories;
