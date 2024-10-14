import React, { useState, useEffect } from 'react';
import { Pagination, Form, Button, InputGroup, Card, Row, Col, Container } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const DynamicList = React.memo(({
  data,
  itemsPerPage = 9,
  onEdit,
  onDelete,
  onAddNew,
  noRecordMessage,
  className = '',
  customHeadersAndKeys = []
}) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Update list when data changes
  useEffect(() => {
    setList(data);
    setFilteredList(data); // Initialize filtered list with all data
  }, [data]);

  // Filter list based on search term
  useEffect(() => {
    const results = list.filter(item =>
      Object.values(item).some(val =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredList(results);
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, list]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem); // Slicing the filtered list

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredList.length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPagination = () => {
    const totalItems = filteredList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null; // No pagination needed if only one page

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        {pageNumbers}
        <Pagination.Next 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Container fluid className={`${className} p-4 rounded shadow-sm`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="primary" onClick={onAddNew} className="d-flex align-items-center">
          <FaPlus className="me-2" /> Add New
        </Button>
        <h4>Total records: {data.length}</h4>
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

      <Row xs={1} md={2} lg={2} xl={3} className="g-4">
        {currentItems.map((item, index) => (
          <Col key={index}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="bg-primary bg-opacity-10">
                <Card.Title className="text-primary text-truncate">
                  {item[customHeadersAndKeys[0]?.key]?.toString() || '-'}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {customHeadersAndKeys.slice(1).map(({ header, key }, idx) => (
                  <div key={idx} className="mb-1">
                    {key === 'htmlContent' ? (
                      <div className='text-truncate' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item[key]) }} />
                    ) : (
                      item[key]?.toString() || '-'
                    )}
                  </div>
                ))}
              </Card.Body>

              <Card.Footer className="bg-light d-flex justify-content-between">
                <Button variant="outline-primary" size="sm" onClick={() => onEdit(item)}>
                  <FaEdit className="me-1" /> Edit
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onDelete(item)}>
                  <FaTrash className="me-1" /> Delete
                </Button>
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
});

export default DynamicList;
