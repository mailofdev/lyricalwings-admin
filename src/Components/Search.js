import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { MdOutlineCancel } from 'react-icons/md';

const Search = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Button variant="outline-danger" onClick={handleClear}>
        <MdOutlineCancel/>
        </Button>
      </InputGroup>
    </div>
  );
};

export default Search;
