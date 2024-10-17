import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPoems, selectLatestPoems, selectMostLikedPoems } from '../redux/poemSlice';
import { fetchNarratives, selectLatestNarratives, selectMostLikedNarratives } from '../redux/narrativeSlice';
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

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchPoems());
      dispatch(fetchNarratives());
      setHasFetched(true);
    }
  }, [dispatch, hasFetched]);

  const customHeadersAndKeys = [
    { header: 'Title', key: 'title' },
    { header: 'Type', key: 'type' },
    { header: 'Likes', key: 'likeCount', formatter: (poem) => poem.likes ? Object.keys(poem.likes).length : 0 },
    { header: 'Created', key: 'createdAt', formatter: (poem) => new Date(poem.createdAt).toLocaleDateString() }
  ];

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      {loading ? (
        <Loader loadingMessage="Loading data.." showFullPageLoader={true} />
      ) : (
        <>
          <div className='d-flex gap-4 flex-column'>
            <div>
              <h2 className=" mb-0">Latest Poems</h2>
              <DynamicList
                data={latestPoems}
                customHeadersAndKeys={customHeadersAndKeys}
                noRecordMessage="No poems found."
                className="funky-list"
                isShowOnDashboard={false}
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
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;