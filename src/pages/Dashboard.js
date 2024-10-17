import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopThreePoemsByType } from '../redux/poemSlice';
import DynamicList from '../components/DynamicList';
import Loader from '../components/Loader';

function Dashboard() {
  const dispatch = useDispatch();
  const poemTypes = useMemo(() => ['Happiness', 'Sadness', 'Anger', 'Fear', 'Disgust', 'Surprise'], []);
  const topThreePoemsByType = useSelector(state => state.poems.topThreePoems);
  const poems = useSelector(state => state.poems.poems);  // All poems
  const loading = useSelector(state => state.poems.loading);
  const error = useSelector(state => state.poems.error);
  const [hasFetched, setHasFetched] = useState(false);
  const [mostLikedPoems, setMostLikedPoems] = useState([]);

  const fetchAllTopPoems = useCallback(() => {
    poemTypes.forEach(type => {
      dispatch(fetchTopThreePoemsByType(type));
    });
  }, [dispatch, poemTypes]);

  useEffect(() => {
    if (!hasFetched) {
      fetchAllTopPoems();
      setHasFetched(true);
    }
  }, [hasFetched, fetchAllTopPoems]);

  // Find most liked poems across all types
  useEffect(() => {
    if (poems) {
      const likedPoems = Object.keys(poems)
        .map(id => ({
          ...poems[id],
          id,
          likesCount: poems[id].likes ? Object.keys(poems[id].likes).length : 0,
        }))
        .filter(poem => poem.likesCount > 0)
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, 3);
      setMostLikedPoems(likedPoems);
    }
  }, [poems]);

  if (error) {
    return <div className="container text-danger mt-4">Error: {error}</div>;
  }

  const customHeadersAndKeys = [
    { header: 'Title', key: 'title' },
    { header: 'Likes', key: 'likesCount' },
  ];

  return (
    <>
      {loading && <Loader loadingMessage="Fetching data..." showFullPageLoader={true} />}
      <div className="container mt-4">
        <h1 className="mb-4">Poetry Dashboard</h1>

        {poemTypes.map(type => {
          const poems = topThreePoemsByType[type] || [];
          return poems.length > 0 && (
            <div key={type} className="mb-5">
              <h2 className="mb-3">Latest {type} Poems</h2>
              <DynamicList
                data={poems}
                customHeadersAndKeys={[{ header: 'Title', key: 'title' }]}
                noRecordMessage="No poems found."
                className="shadow-md poem-list funky-card"
                isShowInfoCard={false}
              />
            </div>
          );
        })}

        {mostLikedPoems.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-3">Most Liked Poems</h2>
            <DynamicList
              data={mostLikedPoems}
              customHeadersAndKeys={customHeadersAndKeys}
              noRecordMessage="No liked poems found."
              className="shadow-md poem-list funky-card"
              isShowInfoCard={false}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
