import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStoryAndNovel, fetchPoems } from '../redux/contentSlice';
import { Paginator } from 'primereact/paginator';
import { Card, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loader from '../Components/Loader';

const ItemList = () => {
  const { type } = useParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { poems, storyAndNovel } = useSelector((state) => state.content);
  const loading = useSelector((state) => state.content.loading); 

  useEffect(() => {
    const fetchData = () => {
      if (type === 'story' || type === 'novel') {
        dispatch(fetchStoryAndNovel({ page: currentPage, rowsPerPage }));
      } else {
        dispatch(fetchPoems({ page: currentPage, rowsPerPage }));
      }
    };

    fetchData();
  }, [type, currentPage, rowsPerPage, dispatch]);

  const getItems = () => {
    let items = [];
    let totalRecords = 0;
    if (type === 'story' || type === 'novel') {
      items = storyAndNovel.filter((item) => item.type === type);
      totalRecords = storyAndNovel.length;
    } else if (type === 'showall') {
      items = poems;
      totalRecords = poems.length;
    } else if (type === 'showAllStoryAndNovel') {
      items = storyAndNovel;
      totalRecords = storyAndNovel.length;
    } else {
      items = poems.filter((poem) => poem.type === type);
      totalRecords = poems.length;
    }
    return { items: items.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage), totalRecords };
  };

  const { items, totalRecords } = getItems();

  const onPageChange = (event) => {
    setCurrentPage(event.page);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (item) => {
    navigate(`/item/${item.id}`, { state: { item } });
  };

  return (
    <Container className="my-4">
      {loading && <Loader loadingMessage={'Loading...'} />}
      <h5 className="text-center mb-2 fs-3">
        {type === 'showall' ? 'All Poems' :
          type === 'showAllStoryAndNovel' ? 'All Stories and Novels' :
            `${type.charAt(0).toUpperCase() + type.slice(1)} List`}
      </h5>

      {totalRecords === 0 ? (
        <div className="text-center">No items found.</div>
      ) : (
        <Row>
          {items.map((item) => (
            <Col md={4} sm={6} xs={12} key={item.id} className="mb-4">
              <Card className="shadow-sm h-100" style={{ background: item.cardColor }} onClick={() => handleEdit(item)}>
                <Card.Body>
                  <Card.Title className="h5 text-truncate" style={{ color: item.fontColor }}>
                    {item.title}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted text-truncate" style={{ color: item.fontColor }}>
                    {item.isShowDangerouslySetInnerHTML ? (
                      <div dangerouslySetInnerHTML={{ __html: item.subTitle }}></div>
                    ) : (
                      <div>{item.subTitle}</div>
                    )}
                  </Card.Subtitle>
                  <Card.Text style={{ color: item.fontColor }} className="text-truncate">
                    <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
                  </Card.Text>
                  <div className="text-muted small mt-2">
                    <span>Posted on: {formatDate(item.timestamp)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="d-flex justify-content-center mt-4">
        <Paginator
          first={currentPage * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          className="paginator"
        />
      </div>
    </Container>
  );
};

export default ItemList;
