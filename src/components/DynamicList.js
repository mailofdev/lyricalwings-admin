import React, { useState, useEffect } from 'react';
import { Pagination, Form, Button, InputGroup, Card, Row, Col, Container } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaSearch, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const DynamicList = ({
  data,
  itemsPerPage = 9,
  onEdit,
  onDelete,
  onAddNew,
  onLike,
  renderCommentForm,
  noRecordMessage,
  className = '',
  customHeadersAndKeys = []
}) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setList(data);
    setFilteredList(data);
  }, [data]);

  useEffect(() => {
    const results = list.filter(item =>
      Object.values(item).some(val =>
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredList(results);
    setCurrentPage(1);
  }, [searchTerm, list]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredList.length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages).keys()].map(number => (
          <Pagination.Item
            key={number + 1}
            active={currentPage === number + 1}
            onClick={() => paginate(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  const renderLikeButton = (item) => {
    const likeCount = item.likes ? Object.keys(item.likes).length : 0;
    const isLiked = item.likes && Object.keys(item.likes).length > 0;

    return (
      <Button
        variant={isLiked ? "danger" : "outline-danger"}
        size="sm"
        onClick={() => onLike(item.id)}
        className="d-flex align-items-center"
      >
        {isLiked ? <FaHeart className="me-1" /> : <FaRegHeart className="me-1" />}
        <span>{likeCount}</span>
      </Button>
    );
  };

  const renderComments = (item) => {
    console.log(item.comments)
    const commentCount = item.comments ? Object.keys(item.comments).length : 0;
    return (
      <div>
        <Button variant="outline-secondary" size="sm" className="d-flex align-items-center">
          <FaComment className="me-1" />
          <span>{commentCount}</span>
        </Button>
        {commentCount > 0 && (
          <div className="mt-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
            <strong>Comments:</strong>
            {Object.values(item.comments).map((comment, index) => (
              <p key={index} className="mb-1 small text-muted">
                {comment.text}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Container fluid className={`${className} py-4`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="success" onClick={onAddNew} className="d-flex align-items-center">
          <FaPlus className="me-2" /> Add New
        </Button>
        <h4 className="mb-0">Total records: {data.length}</h4>
        <InputGroup className="w-auto">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {currentItems.map((item, index) => (
          <Col key={index}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-primary bg-opacity-10">
                <Card.Title className="text-primary text-truncate mb-0">
                  {item[customHeadersAndKeys[0]?.key]?.toString() || '-'}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {customHeadersAndKeys.slice(1).map(({ header, key, render }, idx) => (
                  <div key={idx} className="mb-2">
                    <strong>{header}: </strong>
                    {render ? render(item[key]) : (
                      key === 'htmlContent' ? (
                        <div className="text-truncate" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item[key]) }} />
                      ) : (
                        item[key]?.toString() || '-'
                      )
                    )}
                  </div>
                ))}
              </Card.Body>
              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)}>
                    <FaEdit className="me-1" /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(item)}>
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </div>
                <div className="d-flex justify-content-between">
                  {renderLikeButton(item)}
                  {renderComments(item)}
                </div>
                {renderCommentForm && renderCommentForm(item.id)}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {renderPagination()}

      {filteredList.length === 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">{noRecordMessage}</p>
        </div>
      )}
    </Container>
  );
};

export default DynamicList;