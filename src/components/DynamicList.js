import React, { useState, useEffect } from 'react';
import { Pagination, Form, Button, InputGroup, Card, Row, Col, Container, Badge, Modal } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaSearch, FaHeart, FaRegHeart, FaComment, FaEye } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import DynamicForm from './DynamicForm'; // Ensure this import points to the correct location

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
  customHeadersAndKeys = [],
  formConfig,
  actionButtons

}) => {
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    let results = data;

    if (searchTerm) {
      results = results.filter(item =>
        Object.values(item).some(val =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedType) {
      results = results.filter(item => item.type === selectedType);
    }

    setFilteredList(results);
    setCurrentPage(1);
  }, [searchTerm, data, selectedType]);

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
      <Pagination className="justify-content-center mt-4 funky-pagination">
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
        className="d-flex align-items-center funky-button"
      >
        {isLiked ? <FaHeart className="me-1" /> : <FaRegHeart className="me-1" />}
        <span>{likeCount}</span>
      </Button>
    );
  };

  const handleViewMore = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = (updatedItem) => {
    onEdit(updatedItem, 'edit');
    setIsEditing(false);
    handleCloseModal();
  };

  const renderTypes = () => {
    return (
      <div className="d-flex justify-content-center flex-wrap">
        <Button 
          key="all"
          className="funky-button mx-2 mb-2"
          variant={selectedType === null ? "primary" : "outline-primary"}
          onClick={() => handleTypeSelect(null)}
        >
          All Types
        </Button>
        {actionButtons.map((item, index) => (
          <Button 
            key={index} 
            className="funky-button mx-2 mb-2"
            variant={selectedType === item.value ? "primary" : "outline-primary"}
            onClick={() => handleTypeSelect(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    );
  };

  const handleTypeSelect = (value) => {
    setSelectedType(value);
  };

  const renderModalContent = () => {
    if (!selectedItem) return null;

    if (isEditing) {
      return (
        <DynamicForm
          formConfig={formConfig}
          onSubmit={handleUpdate}
          editingItem={selectedItem}
          formType="edit"
          buttonLabel="Update"
          cancelConfig={{
            label: 'Cancel',
            onCancel: () => setIsEditing(false)
          }}
        />
      );
    }

    return (
      <>
        {customHeadersAndKeys.map(({ header, key }, idx) => (
          <div key={idx} className="mb-3">
            <strong>{header}: </strong>
            {key === 'htmlContent' || key === 'htmlSubtitle' ? (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedItem[key]) }} />
            ) : key === 'likes' ? (
              <span>{selectedItem[key] ? Object.keys(selectedItem[key]).length : 0}</span>
            ) : key === 'comments' ? (
              <span>{selectedItem[key] ? Object.keys(selectedItem[key]).length : 0}</span>
            ) : (
              <span>{selectedItem[key]?.toString() || '-'}</span>
            )}
          </div>
        ))}
        <h5>Comments:</h5>
        {selectedItem.comments && Object.values(selectedItem.comments).map((comment, index) => (
          <Card key={index} className="mb-2 funky-comment-card">
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-primary">{comment.userName}</strong>
                <small className="text-muted">
                  {new Date(comment.timestamp).toLocaleString()}
                </small>
              </div>
              <p className="mb-0 small">{comment.text}</p>
            </Card.Body>
          </Card>
        ))}
        <Button variant="primary" onClick={handleEdit} className="mt-3">Edit</Button>
      </>
    );
  };

  return (
    <Container fluid className={`${className} py-4 funky-list`}>
      <Row className="mb-4">
        <Col md={4}>
          <Button variant="success" onClick={onAddNew} className="d-flex align-items-center w-100 justify-content-center funky-button">
            <FaPlus className="me-2" /> Add New
          </Button>
        </Col>
        <Col md={4} className="d-flex align-items-center justify-content-center">
          <h5 className="mb-0">Total records: <Badge bg="primary" className="funky-badge">{filteredList.length}</Badge></h5>
        </Col>
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text className="bg-primary funky-input text-white">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="funky-input"
            />
          </InputGroup>
        </Col>
      </Row>
      <Row className='my-4'>
        {renderTypes()}
      </Row>
      <Row xs={1} md={2} lg={3} className="g-4">
        {currentItems.map((item, index) => (
          <Col key={index}>
            <Card className="h-100 funky-card">
              <Card.Header className="funky-header">
                <Card.Title className="text-truncate mb-0">
                  {item[customHeadersAndKeys[0]?.key]?.toString() || '-'}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  {renderLikeButton(item)}
                  <Button variant="outline-secondary" size="sm" className="d-flex align-items-center funky-button">
                    <FaComment className="me-1" />
                    <span>{item.comments ? Object.keys(item.comments).length : 0}</span>
                  </Button>
                </div>
                {renderCommentForm && renderCommentForm(item.id)}
              </Card.Body>
              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between">
                  <Button variant="outline-primary" size="sm" onClick={() => handleViewMore(item)} className="funky-button">
                    <FaEye className="me-1" /> View More
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => onDelete(item)} className="funky-button">
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {renderPagination()}

      {filteredList.length === 0 && (
        <div className="text-center mt-4">
          <h4 className="text-muted">{noRecordMessage}</h4>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Item' : 'View Item Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderModalContent()}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DynamicList;