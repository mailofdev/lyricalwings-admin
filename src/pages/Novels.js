import React from 'react';
import { Button, Table } from 'react-bootstrap';

const Novels = () => {
  const handleAddNovel = () => {
    // Logic to add a novel
  };

  return (
    <div>
      <h2>Manage Novels</h2>
      <Button variant="primary" onClick={handleAddNovel} className="mb-3">
        Add Novel
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
            <td>Example Novel</td>
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

export default Novels;
