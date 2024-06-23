import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Loader from "../Components/Loader"; // Import Loader component
import { Chart } from 'primereact/chart';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Panel } from 'primereact/panel';

function Dashboard() {
  const [usersData, setUsersData] = useState([]); // State to store user data
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [poemsData, setPoemsData] = useState({ totalPoems: 0, emotionsCount: {} });
  const [booksLength, setBooksLength] = useState(0); // State to store the length of books
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const poemsRef = ref(db, 'AllPoems');
    const aboutRef = ref(db, 'About');

    const fetchData = async () => {
      setLoadingMessage('Fetching user data...');
      onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        if (users) {
          setUsersData(Object.entries(users).map(([key, value]) => ({ id: key, ...value })));
        } else {
          setUsersData([]);
        }
      });
      onValue(poemsRef, (snapshot) => {
        const poems = snapshot.val();
        if (poems) {
          const emotionsCount = {};
          let totalPoems = 0;
          Object.values(poems).forEach(poem => {
            totalPoems++;
            emotionsCount[poem.emotion] = emotionsCount[poem.emotion] ? emotionsCount[poem.emotion] + 1 : 1;
          });

          // Add all possible emotions with a count of 0 if not already in emotionsCount
          const allPossibleEmotions = ['happiness', 'sadness', 'anger', 'disgust', 'fear']; // Adjust this array as needed
          allPossibleEmotions.forEach(emotion => {
            if (!emotionsCount[emotion]) {
              emotionsCount[emotion] = 0;
            }
          });

          setPoemsData({ totalPoems, emotionsCount });
        } else {
          setPoemsData({ totalPoems: 0, emotionsCount: {} });
        }
        setIsLoading(false); // Move setIsLoading(false) here to handle both users and poems data
      });

      // Fetch data from 'About' collection to get the length of books
      onValue(aboutRef, (snapshot) => {
        const aboutData = snapshot.val();
        if (aboutData && aboutData.myBooks) {
          setBooksLength(Object.keys(aboutData.myBooks).length); // Get length of 'myBooks'
        } else {
          setBooksLength(0);
        }
      });
    };

    fetchData();
    return () => {
      off(usersRef);
      off(poemsRef);
      off(aboutRef);
    };
  }, []);

  const roleCounts = usersData.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  function getChartData(emotionsCount) {
    const labels = Object.keys(emotionsCount);
    const datasets = [
      {
        label: 'Emotions',
        data: Object.values(emotionsCount),
        backgroundColor: [
          // Provide an array of colors for each data point
          '#f44336',
          '#9C27B0',
          '#2196F3',
          '#4CAF50',
          '#FFEB3B',
          // ... add more colors if needed
        ],
      },
    ];
    return { labels, datasets };
  }

  const EmotionCounts = ({ emotionsCount }) => {
    const emotionToEmoji = {
      happiness: 'Happy',
      sadness: 'Sad',
      anger: 'Anger',
      fear: 'Fear',
      disgust: 'Disgust',
      surprise: 'Surprise'
    };

    const handleEmotionClick = (emotion) => {
      navigate(`/PoemList/${emotion}`);
    };

    return (
      <div className='container'>
        {isLoading ? (
          <Loader loadingMessage={loadingMessage} />
        ) : (
          <>
            <div className='d-flex flex-column'>
              <div className="row row-cols-1 row-cols-md-1 row-cols-lg-3 g-4">
                <div className="col">
                  <div className="card h-100" onClick={() => navigate('/Users')}>
                    <div className="card-body cursor-pointer">
                      <div className='d-flex justify-content-between align-items-center'>
                        <h5 className="card-title">Users</h5>
                        <h5>{usersData.length}</h5>
                      </div>
                      <div className='d-flex justify-content-between'>
                        <div className="card-text"><small>admin: {roleCounts.admin || 0}</small></div>
                        <div className="card-text"><small>user: {roleCounts.user || 0}</small></div>
                        <div className="card-text"><small>superadmin: {roleCounts.superAdmin || 0}</small></div>
                        <div className="card-text"><small>superuser: {roleCounts.superUser || 0}</small></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="card h-100" onClick={() => navigate('/PoemList/showall')}>
                    <div className="card-body cursor-pointer">
                      <div className='d-flex justify-content-between align-items-center'>
                        <h5 className="card-title">Poems</h5>
                        <h5>{poemsData.totalPoems}</h5>
                      </div>
                      <div className='d-flex flex-wrap justify-content-between'>
                        {Object.entries(emotionsCount).map(([emotion, count]) => (
                          <div key={emotion} className="card-text mb-2 border border-dark rounded" onClick={(e) => { e.stopPropagation(); handleEmotionClick(emotion); }}>
                            <small>{emotionToEmoji[emotion]}{' '}{count || 0}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col">
                  <div className="card h-100" onClick={() => navigate('/About')}>
                    <div className="card-body cursor-pointer">
                      <div className='d-flex justify-content-between align-items-center'>
                        <h5 className="card-title">My books</h5>
                        <h5>{booksLength || 0}</h5>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>

              <Panel header="Poem Emotions" toggleable>
                <div className="d-flex justify-content-center">
                  <Chart type="pie" data={getChartData(poemsData.emotionsCount)} />
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    );
  };

  return <EmotionCounts emotionsCount={poemsData.emotionsCount} />;
}

export default Dashboard;
