import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const Search = ({ onSearch, onClear, initialSearchQuery }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(initialSearchQuery);

  const handleSearchChange = (event) => {
    setLocalSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onClear();
  };

  return (
    <Form onSubmit={handleSearchSubmit} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={localSearchQuery}
          onChange={handleSearchChange}
        />
        <Button type="submit" variant="primary">
          Search
        </Button>
        {localSearchQuery && (
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear
          </Button>
        )}
      </InputGroup>
    </Form>
  );
};

export default Search;