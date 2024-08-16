import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col } from 'react-bootstrap';
import Loader from '../Components/Loader';
import Search from '../Components/Search';
import { Paginator } from 'primereact/paginator';

const customTitles = {
  story: 'Stories Collection',
  novel: 'Novels Collection',
  showAllStoryAndNovel: 'All Collection',
};

const StoryAndNovelItemList = () => {
  const { type } = useParams();
  const { storyAndNovelData, loading } = useSelector((state) => state.storyAndNovels);
  const [filteredItems, setFilteredItems] = useState([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);

  useEffect(() => {
    if (storyAndNovelData) {
      const items = type === 'showAllStoryAndNovel'
        ? storyAndNovelData
        : storyAndNovelData.filter((item) => item.type === type);
      setFilteredItems(items.reverse());
    }
  }, [storyAndNovelData, type]);

  const handleSearch = (query) => {
    const results = query
      ? (type === 'showAllStoryAndNovel'
        ? storyAndNovelData
        : storyAndNovelData.filter((item) => item.type === type))
        .filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        )
      : (type === 'showAllStoryAndNovel'
        ? storyAndNovelData
        : storyAndNovelData.filter((item) => item.type === type));

    setFilteredItems(results);
    setFirst(0);
  };

  const paginatedItems = filteredItems.slice(first, first + rows);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const getTitle = () => customTitles[type] || 'Collection';

  return (
    <Container className="d-flex flex-column my-5">
      {loading && <Loader loadingMessage="Loading items" />}
      {!loading && (
        <>
          <h2 className="text-center mb-4">
            {getTitle()} ({filteredItems.length})
          </h2>
          <Search onSearch={handleSearch} />
          <Row className="mb-4">
            {paginatedItems.map((item) => (
              <Col key={item.id} xs={12} sm={6} md={4} lg={4} xl={4}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title className="text-truncate">{item.title}</Card.Title>
                    <Card.Text className="text-truncate">{item.htmlContent.substring(0, 100)}...</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="d-flex justify-content-center fixed-bottom py-2">
            <Paginator
              first={first}
              rows={rows}
              totalRecords={filteredItems.length}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default StoryAndNovelItemList;
