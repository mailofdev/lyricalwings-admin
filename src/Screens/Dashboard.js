import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { auth } from '../Config/firebase';
import Loader from "../Components/Loader"; // Import Loader component
import { getDatabase, ref, onValue, off } from "firebase/database";
import { Chart } from 'primereact/chart';

function Dashboard() {
  const [usersData, setUsersData] = useState([]); // State to store user data
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [pageSize] = useState(5);
  const [poemsData, setPoemsData] = useState({ totalPoems: 0, emotionsCount: {} });

  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const poemsRef = ref(db, 'AllPoems');
      setLoadingMessage('Fetching user data...');
      onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        if (users) {
          setUsersData(Object.values(users));
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
          setPoemsData({ totalPoems, emotionsCount });
        } else {
          setPoemsData({ totalPoems: 0, emotionsCount: {} });
        }
        setIsLoading(false); // Move setIsLoading(false) here to handle both users and poems data
      });
    };

    fetchData();
    return () => {
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      off(usersRef);
      const poemsRef = ref(db, 'AllPoems');
      off(poemsRef);
    };
  }, []);

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

  const filteredAdmins = usersData.filter(user => user.role === 'admin');
  const filteredUsers = usersData.filter(user => user.role === 'user');

  return (
    <>
      <div className='container'>
        {isLoading ? (
          <Loader loadingMessage={loadingMessage} />
        ) : (
          <>

            <div className='d-flex gap-4 flex-column'>
              <div className="container-sm flex-row justify-content-center bg-light card shadow-sm">
                <div className="">
                  <h3>Emotion Distribution</h3>
                  <Chart type="pie" data={getChartData(poemsData.emotionsCount)} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Total Users</h5>
                      <p className="card-text">{usersData.length}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Total Admins</h5>
                      <p className="card-text">{filteredAdmins.length}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Total Poems</h5>
                      <p className="card-text">{poemsData.totalPoems}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row flex-wrap justify-content-around">
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

              <div>
                <h2>Admins</h2>
                <div className="shadow-sm card p-4 my-4">
                  <DataTable value={filteredAdmins} paginator={true} rows={pageSize}>
                    <Column field="username" header="Username" />
                    <Column field="authMethod" header="Login Method" />
                    <Column field="email" header="Email" />
                  </DataTable>
                </div>
              </div>

              <div>
                <h2>Users</h2>
                <div className="shadow-sm card p-4 my-4">
                  <DataTable value={filteredUsers} paginator={true} rows={pageSize}>
                    <Column field="username" header="Username" />
                    <Column field="authMethod" header="Login Method" />
                    <Column field="email" header="Email" />
                    <Column field="gender" header="Gender" />
                    <Column field="birthdate" header="Birth Date" />
                  </DataTable>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
