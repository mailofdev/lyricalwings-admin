import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPoems, selectLatestPoems, selectMostLikedPoems } from '../redux/poemSlice';
import { fetchNarratives, selectLatestNarratives, selectMostLikedNarratives } from '../redux/narrativeSlice';
import { fetchbook, selectLatestBooks, selectMostLikedBooks } from '../redux/bookSlice';
import DynamicList from '../components/DynamicList';
import Loader from '../components/Loader';

function Dashboard() {
  const dispatch = useDispatch();
  const [hasFetched, setHasFetched] = useState(false);

  // Use the new selectors
  const latestPoems = useSelector(selectLatestPoems);
  const mostLikedPoems = useSelector(selectMostLikedPoems);
  const loading = useSelector(state => state.poems.loading);
  const error = useSelector(state => state.poems.error);

  const latestNarratives = useSelector(selectLatestNarratives);
  const mostLikedNarratives = useSelector(selectMostLikedNarratives);
  const loadingNarratives = useSelector(state => state.narratives.loading);
  const errorNarratives = useSelector(state => state.narratives.error);

  const latestBook = useSelector(selectLatestBooks);
  const mostLikedBook = useSelector(selectMostLikedBooks);
  const loadingBook = useSelector(state => state.book.loading);
  const errorBook = useSelector(state => state.book.error);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchPoems());
      dispatch(fetchNarratives());
      dispatch(fetchbook());
      setHasFetched(true);
    }
  }, [dispatch, hasFetched]);

  const customHeadersAndKeys = [
    { header: 'Title', key: 'title' },
    { header: 'Content', key: 'htmlContent' },
    { header: 'Created At', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
  ];

  if (error || errorNarratives || errorBook) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Error: {error || errorNarratives}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      {loading || loadingNarratives || loadingBook ? (
        <Loader loadingMessage="Loading data.." showFullPageLoader={true} />
      ) : (
        <>
          <div className='d-flex gap-4 flex-column'>

          <div>
              <h2 className=" mb-0">Latest Book</h2>
              <DynamicList
                data={latestBook}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
                rowXS="1"
                rowMD="2"
                rowLG="3"
              />
            </div>

            <div>
              <h2 className=" mb-0">Most Popular Book</h2>
              <DynamicList
                data={mostLikedBook}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
                rowXS="1"
                rowMD="2"
                rowLG="3"
              />
            </div>

            <div>
              <h2 className=" mb-0">Latest Poems</h2>
              <DynamicList
                data={latestPoems}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
                rowXS="1"
                rowMD="2"
                rowLG="3"
              />
            </div>

            <div>
              <h2 className=" mb-0">Most Popular Poems</h2>
              <DynamicList
                data={mostLikedPoems}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
                rowXS="1"
                rowMD="2"
                rowLG="3"
              />
            </div>

            <div>
              <h2 className=" mb-0">Latest narrative</h2>
              <DynamicList
                data={latestNarratives}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
                rowXS="1"
                rowMD="2"
                rowLG="3"
              />
            </div>

            <div>
              <h2 className=" mb-0">Most Popular narrative</h2>
              <DynamicList
                data={mostLikedNarratives}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
                rowXS="1"
                rowMD="2"
                rowLG="3"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;