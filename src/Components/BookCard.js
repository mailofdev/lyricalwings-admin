import React from 'react';
import { Card, Button } from 'react-bootstrap';

const BookCard = ({ book, onEdit, onDelete }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{book.title}</Card.Title>
        <Card.Text>{book.subTitle}</Card.Text>
        <Card.Text>{book.content}</Card.Text>
        <Card.Text>Author: {book.authorName}</Card.Text>
        {book.link && (
          <Card.Link href={book.link} target="_blank" rel="noopener noreferrer">
            Book Link
          </Card.Link>
        )}
        {book.bookCoverUrl && (
          <Card.Img
            src={book.bookCoverUrl}
            alt="Book cover"
            style={{ maxWidth: '150px', maxHeight: '200px' }}
            className="mt-2 mb-2"
          />
        )}
        <div>
          <Button variant="primary" onClick={() => onEdit(book)} className="me-2">
            Edit
          </Button>
          <Button variant="danger" onClick={() => onDelete(book.id)}>
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;