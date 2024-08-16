import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col } from 'react-bootstrap';
// import { fetchStoryAndNovels } from '../redux/storyAndNovelSlice';
import Loader from '../Components/Loader';
import Search from '../Components/Search';
import CustomPaginator from '../Components/CustomPaginator';

const customTitles = {
  story: 'Stories Collection',
  novel: 'Novels Collection',
  default: 'All Collection',
};

const StoryAndNovelItemList = () => {
//   const { type } = useParams();
//   const dispatch = useDispatch();
//   const { storyAndNovels, loading } = useSelector((state) => state.storyAndNovels);
//   const [fullItems, setFullItems] = useState([]);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [first, setFirst] = useState(0);
//   const [rows, setRows] = useState(12);

//   useEffect(() => {
//     dispatch(fetchStoryAndNovels())
//       .unwrap()
//       .then((fetchedItems) => {
//         const items = type === 'story'
//           ? fetchedItems.filter((item) => item.type === 'story')
//           : type === 'novel'
//             ? fetchedItems.filter((item) => item.type === 'novel')
//             : fetchedItems;

//         setFullItems(items);
//         setFilteredItems(items);
//       });
//   }, [dispatch, type]);

//   const handleSearch = (query) => {
//     const results = query
//       ? fullItems.filter((item) =>
//         item.title.toLowerCase().includes(query.toLowerCase())
//       )
//       : fullItems;

//     setFilteredItems(results);
//     setFirst(0);
//   };

//   const paginatedItems = filteredItems.slice(first, first + rows);

//   const onPageChange = (event) => {
//     setFirst(event.first);
//     setRows(event.rows);
//   };

//   const getTitle = () => customTitles[type] || customTitles.default;

  return (
    <Container className="d-flex flex-column min-vh-100">
      {/* {loading && <Loader loadingMessage="Loading items" />}
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
          <div className="d-flex justify-content-center py-2">
            <CustomPaginator
              first={first}
              rows={rows}
              totalRecords={filteredItems.length}
              onPageChange={onPageChange}
              rowsPerPageOptions={[12, 18, 21]}
            />
          </div>
        </>
      )} */}
    </Container>
  );
};

export default StoryAndNovelItemList;
