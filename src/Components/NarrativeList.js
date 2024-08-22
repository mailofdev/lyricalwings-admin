import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Alert } from 'react-bootstrap';
import Loader from './Loader';
import Search from './Search';
import { Paginator } from 'primereact/paginator';
import { fetchNarrative, deleteAllNarrative, deleteNarrative } from '../redux/NarrativeSlice';
import DOMPurify from 'dompurify';
import ConfirmDialog from './ConfirmDialog';

const Narrative_PER_PAGE = 24;

const customTitles = {
  story: 'Stories',
  novel: 'Novels',
  showAllNarrative: 'All',
};

const NarrativeList = () => {
  const { type } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { NarrativeList, loadingMessage, totalNarrative, error } = useSelector((state) => state.Narrative);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteNarrativeConfirm, setShowDeleteNarrativeConfirm] = useState(false);
  const [narrativeToDelete, setNarrativeToDelete] = useState(null);
  const [selectedPoem, setSelectedPoem] = useState(null);

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
    setShowDeleteAllConfirm(true);
  }, []);

  const confirmDeleteAll = () => {
    dispatch(deleteAllNarrative()).then(() => {
      fetchData();
    });
    setShowDeleteAllConfirm(false);
  };

  const handleDeleteNarrative = useCallback((NarrativeId) => {
    setNarrativeToDelete(NarrativeId);
    setShowDeleteNarrativeConfirm(true);
  }, []);

  const confirmDeleteNarrative = () => {
    dispatch(deleteNarrative(narrativeToDelete)).then(() => {
      fetchData();
    });
    setShowDeleteNarrativeConfirm(false);
  };

  const getTitle = useMemo(() => customTitles[type] || 'Narrative', [type]);

  const sanitizeHTML = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  const handleCardClick = (item) => {
    navigate(`/Detail/${item.id}`, { state: { item } });
  };

  return (
    <Container className="d-flex flex-column my-5">
      {loadingMessage && <Loader loadingMessage={loadingMessage} />}
      {!loadingMessage && (
        <>
          <h2 className="text-center form-label mb-4">
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
          <ConfirmDialog
            visible={showDeleteAllConfirm}
            onHide={() => setShowDeleteAllConfirm(false)}
            message="Are you sure you want to delete all Narratives? This action cannot be undone."
            header="Confirm Delete"
            acceptClassName="btn-danger"
            rejectClassName="btn-secondary"
            acceptLabel="Delete"
            rejectLabel="Cancel"
            accept={confirmDeleteAll}
            reject={() => setShowDeleteAllConfirm(false)}
          />

          <ConfirmDialog
            visible={showDeleteNarrativeConfirm}
            onHide={() => setShowDeleteNarrativeConfirm(false)}
            message="Are you sure you want to delete this Narrative?"
            header="Confirm Delete"
            acceptClassName="btn-danger"
            rejectClassName="btn-secondary"
            acceptLabel="Delete"
            rejectLabel="Cancel"
            accept={confirmDeleteNarrative}
            reject={() => setShowDeleteNarrativeConfirm(false)}
          />

          <Row className="mb-4">
            {NarrativeList.map((item) => (
              <Col key={item.id}>
                   <Card
                  className={`mb-4 poem-card ${selectedPoem?.id === item.id ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedPoem(item)}
                  onMouseLeave={() => setSelectedPoem(null)}
                  onClick={() => handleCardClick(item)}
                >
                  <Card.Body>
                    <Card.Title className="text-truncate">{item.title}</Card.Title>
                    <Card.Text
                      className="text-truncate"
                      dangerouslySetInnerHTML={sanitizeHTML(item.htmlContent)}
                    />
                    <div className='d-flex gap-2 mt-2'>
                     <Button variant="primary" size="sm" onClick={() => handleDeleteNarrative(item.id)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteNarrative(item.id)}>
                      Delete
                    </Button>
                    </div>
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
