import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { Pagination } from 'react-bootstrap';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const DynamicList = ({ data, itemsPerPage = 10, onEdit, onDelete, onAddNew }) => {
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
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredList(results);
    setCurrentPage(1);
  }, [searchTerm, list]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredList.length / itemsPerPage); i++) {
      pageNumbers.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
          {i}
        </Pagination.Item>
      );
    }
    return (
      <Pagination>
        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
        {pageNumbers}
        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredList.length / itemsPerPage)} />
      </Pagination>
    );
  };

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col-md-2 mb-2">
          <Button variant="primary" onClick={onAddNew}>
            <FaPlus /> Add New
          </Button>
        </div>
        <div className="col-md-10 mb-2">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </InputGroup>
        </div>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              {Object.keys(list[0] || {}).map((key) => (
                <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index} className={item.role === 'super' ? 'table-secondary' : ''}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{value.toString()}</td>
                ))}
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(item)}
                    disabled={item.role === 'super'}  // Disable for 'super' role
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(item)}
                    disabled={item.role === 'super'}  // Disable for 'super' role
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>

        </Table>
      </div>

      {filteredList.length > itemsPerPage && (
        <div className="d-flex justify-content-center mt-3">
          {renderPagination()}
        </div>
      )}

      {filteredList.length === 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">No records found</p>
        </div>
      )}
    </div>
  );
};

export default DynamicList;