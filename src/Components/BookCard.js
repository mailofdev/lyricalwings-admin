import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import '../css/bookcard.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BookCard = ({ book, onEdit, onDelete }) => {
    return (
        <Card className="book-card form-label">
            <Row className="book-card-body p-0 m-0">
                <Col md={6} className="book-cover-container p-0 m-0">
                    {book.bookCoverUrl && (
                        <Card.Img src={book.bookCoverUrl} alt="Book cover" className="book-cover" />
                    )}
                </Col>
                <Col md={6} className="book-details-container">
                    <Card.Title className="book-title">{book.title}</Card.Title>
                    <Card.Text className="book-subtitle">{book.subTitle}</Card.Text>
                    <Card.Text className="form-label">{book.content}</Card.Text>
                    <Card.Text className="book-author">Author: {book.authorName}</Card.Text>
                    {book.link && (
                        <div className='justify-content-center d-flex'>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center justify-content-center px-4 py-2 text-white"
                            href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            as="a">
                            Buy Book
                        </Button>
                        </div>
                    )}
                    <div className="d-flex justify-content-between">
                        <Button variant="primary" onClick={() => onEdit(book)}>
                        <FaEdit/> Edit
                        </Button>
                        <Button variant="danger" onClick={() => onDelete(book.id)}>
                        <FaTrash/> Delete 
                        </Button>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default BookCard;
