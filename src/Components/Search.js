import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const Search = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    onSearch(event.target.value);  
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
      </InputGroup>
    </div>
  );
};

export default Search;
