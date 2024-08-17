import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col } from 'react-bootstrap';
import Loader from '../Components/Loader';
import Search from '../Components/Search';
import { Paginator } from 'primereact/paginator';
import { fetchStoryAndNovels } from '../redux/storyAndNovelSlice';

const customTitles = {
  story: 'Stories',
  novel: 'Novels',
  showAllStoryAndNovel: 'All',
};

const StoryAndNovelItemList = () => {
  const { type } = useParams();
  const dispatch = useDispatch();
  const { storyAndNovelData, loadingMessage, totalCount } = useSelector((state) => state.storyAndNovels);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchData = useCallback(() => {
    dispatch(fetchStoryAndNovels({ page: currentPage, pageSize, type, searchQuery }));
  }, [dispatch, currentPage, pageSize, type, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const onPageChange = (event) => {
    setCurrentPage(event.page + 1);
    setPageSize(event.rows);
  };

  const getTitle = () => customTitles[type] || 'Collection';

  return (
    <Container className="d-flex flex-column my-5">
      {loadingMessage && <Loader loadingMessage={loadingMessage} />}
      {!loadingMessage && (
        <>
          <h2 className="text-center mb-4">
            {getTitle()} ({totalCount})
          </h2>
          <Search onSearch={handleSearch} />
          <Row className="mb-4">
            {storyAndNovelData.map((item) => (
              <Col key={item.id} xs={12} sm={12} md={6} lg={6} xl={4} xxl={4}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title className="text-truncate">{item.title}</Card.Title>
                    <Card.Text className="text-truncate">{item.htmlContent}...</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="d-flex justify-content-center fixed-bottom py-2">
            <Paginator
              first={(currentPage - 1) * pageSize}
              rows={pageSize}
              totalRecords={totalCount}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default StoryAndNovelItemList;