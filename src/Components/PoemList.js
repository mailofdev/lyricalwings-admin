import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Alert } from 'react-bootstrap';
import Loader from './Loader';
import Search from './Search';
import { Paginator } from 'primereact/paginator';
import { fetchPoems, deleteAllPoems, deletePoem } from '../redux/poemSlice';
import DOMPurify from 'dompurify';
import ConfirmDialog from './ConfirmDialog';

const POEMS_PER_PAGE = 24;

const customTitles = {
  happiness: 'Happy Poems',
  sadness: 'Sad Poems',
  anger: 'Angry Poems',
  fear: 'Fearful Poems',
  disgust: 'Disgusting Poems',
  surprise: 'Surprising Poems',
  showAllPoems: 'All Poems',
};

const PoemList = () => {
  const { type } = useParams();
  const dispatch = useDispatch();
  const { poemsList, loadingMessage, totalPoems, error } = useSelector((state) => state.poem);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeletePoemConfirm, setShowDeletePoemConfirm] = useState(false);
  const [poemToDelete, setPoemToDelete] = useState(null);

  const fetchData = useCallback(() => {
    dispatch(fetchPoems({ 
      page: currentPage, 
      pageSize: POEMS_PER_PAGE, 
      filterType: type === 'showAllPoems' ? 'all' : type,
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
    dispatch(fetchPoems({ 
      page: 1, 
      pageSize: POEMS_PER_PAGE, 
      filterType: type === 'showAllPoems' ? 'all' : type,
      searchQuery: query
    }));
  }, [dispatch, type]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    dispatch(fetchPoems({ 
      page: 1, 
      pageSize: POEMS_PER_PAGE, 
      filterType: type === 'showAllPoems' ? 'all' : type,
      searchQuery: ''
    }));
  }, [dispatch, type]);

  const onPageChange = useCallback((event) => {
    setCurrentPage(event.page + 1);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setShowDeleteAllConfirm(true);
  }, []);

  const confirmDeleteAll = () => {
    dispatch(deleteAllPoems()).then(() => {
      fetchData();
    });
    setShowDeleteAllConfirm(false);
  };

  const handleDeletePoem = useCallback((poemId) => {
    setPoemToDelete(poemId);
    setShowDeletePoemConfirm(true);
  }, []);

  const confirmDeletePoem = () => {
    dispatch(deletePoem(poemToDelete)).then(() => {
      fetchData();
    });
    setShowDeletePoemConfirm(false);
  };

  const getTitle = useMemo(() => customTitles[type] || 'Poems', [type]);

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
            {getTitle} ({totalPoems})
          </h2>
          <Search 
            onSearch={handleSearch} 
            onClear={handleClearSearch} 
            initialSearchQuery={searchQuery} 
          />
          <Button variant="danger" className="mb-4" onClick={handleDeleteAll}>
            Delete All
          </Button>
          <ConfirmDialog
            visible={showDeleteAllConfirm}
            onHide={() => setShowDeleteAllConfirm(false)}
            message="Are you sure you want to delete all poems? This action cannot be undone."
            header="Confirm Delete"
            acceptClassName="btn-danger"
            rejectClassName="btn-secondary"
            acceptLabel="Delete"
            rejectLabel="Cancel"
            accept={confirmDeleteAll}
            reject={() => setShowDeleteAllConfirm(false)}
          />

          <ConfirmDialog
            visible={showDeletePoemConfirm}
            onHide={() => setShowDeletePoemConfirm(false)}
            message="Are you sure you want to delete this poem?"
            header="Confirm Delete"
            acceptClassName="btn-danger"
            rejectClassName="btn-secondary"
            acceptLabel="Delete"
            rejectLabel="Cancel"
            accept={confirmDeletePoem}
            reject={() => setShowDeletePoemConfirm(false)}
          />

          <Row className="mb-4">
            {poemsList.map((item) => (
              <Col key={item.id} xs={12} sm={12} md={6} lg={6} xl={4} xxl={4}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title className="text-truncate">{item.title}</Card.Title>
                    <Card.Text 
                      className="text-truncate" 
                      dangerouslySetInnerHTML={sanitizeHTML(item.htmlContent)}
                    />
                    <Button variant="danger" size="sm" onClick={() => handleDeletePoem(item.id)}>
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {poemsList.length === 0 && (
            <Alert variant="info">No poems found matching your search criteria.</Alert>
          )}
          <div className="d-flex justify-content-center py-2">
            <Paginator
              first={(currentPage - 1) * POEMS_PER_PAGE}
              rows={POEMS_PER_PAGE}
              totalRecords={totalPoems}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default PoemList;
