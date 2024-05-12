import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { auth } from '../Config/firebase';
import Loader from "../Components/Loader"; // Import Loader component
import "../App.css";
import "../css/loader.css";
import "../css/dashboard.css";
import { getDatabase, ref, onValue, off } from "firebase/database";

function Dashboard() {
  const [poemsData, setPoemsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      const poemsRef = ref(db, 'AllPoems');
      setLoadingMessage('Fetching data...');
      onValue(poemsRef, (snapshot) => {
        const poems = snapshot.val();
        if (poems) {
          const emotionsCount = {};
          let totalPoems = 0;
          Object.values(poems).forEach(poem => {
            totalPoems++;
            emotionsCount[poem.emotion] = emotionsCount[poem.emotion] ? emotionsCount[poem.emotion] + 1 : 1;
          });
          setPoemsData({ totalPoems, emotionsCount });
          setIsLoading(false);
        } else {
          setPoemsData({ totalPoems: 0, emotionsCount: {} });
          setIsLoading(false);
        }
      });
    };

    fetchData();

    return () => {
      const db = getDatabase();
      const poemsRef = ref(db, 'AllPoems');
      off(poemsRef);
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader loadingMessage={loadingMessage} />
      ) : (
        <>
          <div className="row flex-wrap justify-content-around mx-2">
            {/* Display total number of poems */}
            <div className="col-lg-2 col-md-4 my-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Total Poems</h5>
                  <p className="card-text">{poemsData.totalPoems}</p>
                </div>
              </div>
            </div>
            {/* Display number of poems for each emotion */}
            {Object.entries(poemsData.emotionsCount).map(([emotion, count]) => (
              <div key={emotion} className="col-lg-2 col-md-4 my-2">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{emotion}</h5>
                    <p className="card-text">{count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default Dashboard;
