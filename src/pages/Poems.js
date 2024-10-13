import React from 'react';
import { Button, Table } from 'react-bootstrap';

const Poems = () => {
  const handleAddPoem = () => {
    // Logic to add a poem
  };

  return (
    <div>
      <h2>Manage Poems</h2>
      <Button variant="primary" onClick={handleAddPoem}>
        Add Poem
      </Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through poems data to render rows */}
          {/* Example data */}
          <tr>
            <td>1</td>
            <td>Example Poem</td>
            <td>Author Name</td>
            <td>
              <Button variant="info" size="sm">Edit</Button>
              <Button variant="danger" size="sm" className="ms-2">Delete</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default Poems;
