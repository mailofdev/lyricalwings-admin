import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopThreePoemsByType ,fetchPoems } from '../redux/poemSlice';
import { fetchTopThreeNarrativesByType, fetchNarratives } from '../redux/narrativeSlice';

import DynamicList from '../components/DynamicList';
import Loader from '../components/Loader';

function Dashboard() {
  const dispatch = useDispatch();

  const poemTypes = useMemo(() => ['Happiness', 'Sadness', 'Anger', 'Fear', 'Disgust', 'Surprise'], []);
  const topThreePoemsByType = useSelector(state => state.poems.topThreePoems);
  const poems = useSelector(state => state.poems.poems);
  const poemsLoading = useSelector(state => state.poems.loading);
  const poemsError = useSelector(state => state.poems.error);

  const narrativeTypes = useMemo(() => ['story', 'novel'], []);
  const topThreeNarrativesByType = useSelector(state => state.narratives.topThreeNarratives);
  const narratives = useSelector(state => state.narratives.narratives);
  const narrativesLoading = useSelector(state => state.narratives.loading);
  const narrativesError = useSelector(state => state.narratives.error);

  const [hasFetched, setHasFetched] = useState(false);
  const [mostLikedPoems, setMostLikedPoems] = useState([]);
  const [mostLikedNarratives, setMostLikedNarratives] = useState([]);

  const fetchAllTopPoems = useCallback(() => {
    poemTypes.forEach(type => {
      dispatch(fetchTopThreePoemsByType(type));
      dispatch(fetchPoems());
      
    });
  }, [dispatch, poemTypes]);

  const fetchAllTopNarratives = useCallback(() => {
    narrativeTypes.forEach(type => {
      dispatch(fetchTopThreeNarrativesByType(type));
      dispatch(fetchNarratives());
    });
  }, [dispatch, narrativeTypes]);

  useEffect(() => {
    if (!hasFetched) {
      fetchAllTopPoems();
      fetchAllTopNarratives();
      setHasFetched(true);
    }
  }, [hasFetched, fetchAllTopPoems, fetchAllTopNarratives]);

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

  // Find most liked narratives across all types
  useEffect(() => {
    if (narratives) {
      const likedNarratives = Object.keys(narratives)
        .map(id => ({
          ...narratives[id],
          id,
          likesCount: narratives[id].likes ? Object.keys(narratives[id].likes).length : 0,
        }))
        .filter(narrative => narrative.likesCount > 0)
        .sort((a, b) => b.likesCount - a.likesCount)
        .slice(0, 3);
      setMostLikedNarratives(likedNarratives);
    }
  }, [narratives]);

  if (poemsError || narrativesError) {
    return <div className="container text-danger mt-4">Error: {poemsError || narrativesError}</div>;
  }

  const customHeadersAndKeys = [
    { header: 'Title', key: 'title' },
    { header: 'Likes', key: 'likesCount' },
  ];

  const isLoading = poemsLoading || narrativesLoading;

  return (
    <>
      {isLoading && <Loader loadingMessage="Fetching data..." showFullPageLoader={true} />}
      <div className="container mt-4">
      {poemsLoading && <Loader loadingMessage="Fetching poems..."  />}
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
        {mostLikedNarratives.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-3">Most Liked Narratives</h2>
            <DynamicList
              data={mostLikedNarratives}
              customHeadersAndKeys={customHeadersAndKeys}
              noRecordMessage="No liked narratives found."
              className="shadow-md poem-list funky-card"
              isShowInfoCard={false}
            />
          </div>
        )}

        {poemTypes.map(type => {
          const poemsOfType = topThreePoemsByType[type] || [];
          return poemsOfType.length > 0 && (
            <div key={type} className="mb-5">
              <h2 className="mb-3">Latest {type} Poems</h2>
              <DynamicList
                data={poemsOfType}
                customHeadersAndKeys={[{ header: 'Title', key: 'title' }]}
                noRecordMessage="No poems found."
                className="shadow-md poem-list funky-card"
                isShowInfoCard={false}
              />
            </div>
          );
        })}

        {narrativeTypes.map(type => {
          const narrativesOfType = topThreeNarrativesByType[type] || [];
          return narrativesOfType.length > 0 && (
            <div key={type} className="mb-5">
              <h2 className="mb-3">Latest {type} Narratives</h2>
              <DynamicList
                data={narrativesOfType}
                customHeadersAndKeys={[{ header: 'Title', key: 'title' }]}
                noRecordMessage="No narratives found."
                className="shadow-md narrative-list funky-card"
                isShowInfoCard={false}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Dashboard;