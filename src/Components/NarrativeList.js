import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Alert } from 'react-bootstrap';
import Loader from './Loader';
import Search from './Search';
import { Paginator } from 'primereact/paginator';
import { fetchNarrative, deleteAllNarrative, deleteNarrative } from '../redux/NarrativeSlice';
import DOMPurify from 'dompurify';

const Narrative_PER_PAGE = 24;

const customTitles = {
  story: 'Stories',
  novel: 'Novels',
  showAllNarrative: 'All',
};

const NarrativeList = () => {
  const { type } = useParams();
  const dispatch = useDispatch();
  const { NarrativeList, loadingMessage, totalNarrative, error } = useSelector((state) => state.Narrative);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(() => {
    dispatch(fetchNarrative({ 
      page: currentPage, 
      pageSize: Narrative_PER_PAGE, 
      filterType: type === 'showAllNarrative' ? 'all' : type,
      searchQuery: searchQuery
    }));
  }, [dispatch, currentPage, type, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [type]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // Fetch data immediately when search is triggered
    dispatch(fetchNarrative({ 
      page: 1, 
      pageSize: Narrative_PER_PAGE, 
      filterType: type === 'showAllNarrative' ? 'all' : type,
      searchQuery: query
    }));
  }, [dispatch, type]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    // Fetch data immediately when search is cleared
    dispatch(fetchNarrative({ 
      page: 1, 
      pageSize: Narrative_PER_PAGE, 
      filterType: type === 'showAllNarrative' ? 'all' : type,
      searchQuery: ''
    }));
  }, [dispatch, type]);

  const onPageChange = useCallback((event) => {
    setCurrentPage(event.page + 1);
  }, []);

  const handleDeleteAll = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all Narrative? This action cannot be undone.')) {
      dispatch(deleteAllNarrative()).then(() => {
        fetchData();
      });
    }
  }, [dispatch, fetchData]);

  const handleDeleteNarrative = useCallback((NarrativeId) => {
    if (window.confirm('Are you sure you want to delete this Narrative?')) {
      dispatch(deleteNarrative(NarrativeId)).then(() => {
        fetchData();
      });
    }
  }, [dispatch, fetchData]);

  const getTitle = useMemo(() => customTitles[type] || 'Narrative', [type]);

  const sanitizeHTML = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  return (
    <Container className="d-flex flex-column my-5">
      {loadingMessage && <Loader loadingMessage={loadingMessage} />}
      {!loadingMessage && (
        <>
          <h2 className="text-center mb-4">
            {getTitle} ({totalNarrative})
          </h2>
          <Search 
        onSearch={handleSearch} 
        onClear={handleClearSearch} 
        initialSearchQuery={searchQuery} 
      />
                <Button variant="danger" className="mb-4" onClick={handleDeleteAll}>
            Delete All
          </Button>
          <Row className="mb-4">
            {NarrativeList.map((item) => (
              <Col key={item.id} xs={12} sm={12} md={6} lg={6} xl={4} xxl={4}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title className="text-truncate">{item.title}</Card.Title>
                    <Card.Text 
                      className="text-truncate" 
                      dangerouslySetInnerHTML={sanitizeHTML(item.htmlContent)}
                    />
                    <Button variant="danger" size="sm" onClick={() => handleDeleteNarrative(item.id)}>
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {NarrativeList.length === 0 && (
            <Alert variant="info">No Narrative found matching your search criteria.</Alert>
          )}
          <div className="d-flex justify-content-center py-2">
            <Paginator
              first={(currentPage - 1) * Narrative_PER_PAGE}
              rows={Narrative_PER_PAGE}
              totalRecords={totalNarrative}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default NarrativeList;