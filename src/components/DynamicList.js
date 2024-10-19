import React, { useState, useEffect } from 'react';
import { Pagination, Form, Button, InputGroup, Card, Row, Col, Container, Badge, Modal, Image, Table } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch, FaHeart, FaRegHeart, FaComment, FaEye, FaDownload, FaThLarge, FaList } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import DynamicForm from './DynamicForm';

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
  actionButtons,
  isShowOnDashboard,
  rowXS,
  rowMD,
  rowLG,
  listType = 'card'
}) => {
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [viewType, setViewType] = useState(listType);

  useEffect(() => {
    setViewType(listType);
  }, [listType]);

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
      <>
        {isShowOnDashboard ? (
          <Button
            variant={isLiked ? "danger" : "outline-danger"}
            size="sm"
            onClick={() => onLike(item.id)}
            className="d-flex align-items-center funky-button"
          >
            {isLiked ? <FaHeart className="me-1" /> : <FaRegHeart className="me-1" />}
            <span>{likeCount}</span>
          </Button>
        ) : (
          <Button
            variant={isLiked ? "danger" : "outline-danger"}
            size="sm"
            className="d-flex align-items-center funky-button"
          >
            {isLiked ? <FaHeart className="me-1" /> : <FaRegHeart className="me-1" />}
            <span>{likeCount}</span>
          </Button>
        )}
      </>
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
      <>
        {actionButtons && (
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
        )}
      </>
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
        <div className='border border-black p-2 my-2 rounded bg-body-tertiary'>
          {customHeadersAndKeys.map(({ header, key }, idx) => (
            <div key={idx} className="mb-3">
              <strong>{header}: </strong>
              {key === 'htmlContent' || key === 'htmlSubtitle' ? (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedItem[key]) }} />
              ) : key === 'bookImage' ? (
                <Image src={selectedItem[key]} alt="Book cover" fluid style={{ maxHeight: '300px' }} />
              ) : key === 'likes' ? (
                <span>{selectedItem[key] ? Object.keys(selectedItem[key]).length : 0}</span>
              ) : key === 'comments' ? (
                <span>{selectedItem[key] ? Object.keys(selectedItem[key]).length : 0}</span>
              ) : key.toLowerCase().includes('fileurl') ? (
                selectedItem[key] ? (
                  <Button variant="link" href={selectedItem[key]} target="_blank" rel="noopener noreferrer">
                    <FaDownload className="me-1" /> Download File
                  </Button>
                ) : (
                  <span>No file uploaded</span>
                )
              ) : (
                <span>{selectedItem[key]?.toString() || '-'}</span>
              )}
            </div>
          ))}
        </div>
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
        {isShowOnDashboard && (
          <Button variant="primary" onClick={handleEdit} className="mt-3">Edit</Button>
        )}
      </>
    );
  };

  const renderCardView = () => (
    <Row xs={rowXS} md={rowMD} lg={rowLG} className="g-4">
      {currentItems.map((item, index) => (
        <Col key={index}>
          <Card className="h-100 funky-card">
            {isShowOnDashboard && (
              <Card.Header className="funky-header">
                <Card.Title className="text-truncate mb-0">
                  {item[customHeadersAndKeys[0]?.key]?.toString() || '-'}
                </Card.Title>
              </Card.Header>
            )}
            <Card.Body className="d-flex flex-column">
              {!isShowOnDashboard && (
                <div className="flex-grow-1 mb-3">
                  {item[customHeadersAndKeys[0]?.key]?.toString() || '-'}
                </div>
              )}
              <div className="mt-auto">
                <div className='d-flex justify-content-between'>
                  {renderLikeButton(item)}
                  <Button variant="outline-secondary" size="sm"
                    className={`d-flex align-items-center funky-button ${isShowOnDashboard ? '' : 'default-cursor'}`}
                  >
                    <FaComment className="me-1" />
                    <span>{item.comments ? Object.keys(item.comments).length : 0}</span>
                  </Button>
                </div>
                {renderCommentForm && renderCommentForm(item.id)}
              </div>
            </Card.Body>
            {isShowOnDashboard && (
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
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderGridView = () => (
    <div className="table-responsive">
      <Table striped bordered hover className="funky-table">
        <thead>
          <tr>
            {customHeadersAndKeys.map(({ header }, index) => (
              <th key={index}>{header}</th>
            ))}
            <th>Likes</th>
            <th>Comments</th>
            {isShowOnDashboard && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              {customHeadersAndKeys.map(({ key }, keyIndex) => (
                <td key={keyIndex}>
                  {key === 'htmlContent' || key === 'htmlSubtitle' ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(item[key]?.substring(0, 100) + '...') 
                    }} />
                  ) : key === 'bookImage' ? (
                    <Image src={item[key]} alt="Book cover" height="50" />
                  ) : (
                    item[key]?.toString() || '-'
                  )}
                </td>
              ))}
              <td>{item.likes ? Object.keys(item.likes).length : 0}</td>
              <td>{item.comments ? Object.keys(item.comments).length : 0}</td>
              {isShowOnDashboard && (
                <td>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleViewMore(item)}>
                      <FaEye />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(item)}>
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );  
    return (
      <Container fluid className={`${className} py-4`}>
        {isShowOnDashboard && (
          <>
            <Row className="mb-4 g-3">
              <Col md={3}>
                <Button variant="success" onClick={onAddNew} className="d-flex align-items-center w-100 justify-content-center funky-button">
                  <FaPlus className="me-2" /> Add New
                </Button>
              </Col>
              <Col md={3} className="d-flex align-items-center justify-content-center">
                <h5 className="mb-0">Total records: <Badge bg="primary" className="funky-badge">{filteredList.length}</Badge></h5>
              </Col>
              <Col md={3}>
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
              <Col md={3} className="d-flex justify-content-end">
                <Button
                  variant={viewType === 'card' ? 'primary' : 'outline-primary'}
                  className="me-2"
                  onClick={() => setViewType('card')}
                >
                  <FaThLarge />
                </Button>
                <Button
                  variant={viewType === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewType('grid')}
                >
                  <FaList />
                </Button>
              </Col>
            </Row>
  
            <Row className='my-4'>
              {renderTypes()}
            </Row>
          </>
        )}
  
        {viewType === 'card' ? renderCardView() : renderGridView()}
  
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
  }
  export default DynamicList;