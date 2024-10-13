import React from 'react';
import { Button, Table } from 'react-bootstrap';

const Books = () => {
  const handleAddBook = () => {
    // Logic to add a book
  };

  return (
    <div>
      <h2>Manage Books</h2>
      <Button variant="primary" onClick={handleAddBook} className="mb-3">
        Add Book
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
            <td>Example Book</td>
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

export default Books;
