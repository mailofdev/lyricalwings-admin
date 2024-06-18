import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { getDatabase, ref, onValue, off, remove, set } from "firebase/database";
import Loader from "../Components/Loader"; // Import Loader component
import { Chart } from 'primereact/chart';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Panel } from 'primereact/panel';
import { emailPasswordSignUp } from '../Config/firebase';
import { InputText } from 'primereact/inputtext';

function Dashboard() {
  const [usersData, setUsersData] = useState([]); // State to store user data
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [pageSize] = useState(5);
  const [poemsData, setPoemsData] = useState({ totalPoems: 0, emotionsCount: {} });
  const [showAddUserView, setShowAddUserView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const poemsRef = ref(db, 'AllPoems');

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
    };

    fetchData();
    return () => {
      off(usersRef);
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

  const deleteUser = (id, email) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${id}`);
    remove(userRef).then(() => {
      setUsersData(usersData.filter(user => user.id !== id));
    }).catch((error) => {
      console.error('Error deleting user: ', error);
    });
  }

  const deleteButtonTemplate = (rowData) => {
    return (
      <div className='text-center justify-content-center align-center d-flex'>
        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteUser(rowData.id, rowData.email)} />
      </div>
    );
  }

  const filteredAdmins = usersData.filter(user => user.role === 'admin');
  const filteredUsers = usersData.filter(user => user.role === 'user');

  const validateForm = () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      setError('Please enter email, password, and username.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoadingMessage('Creating user...');
    setIsLoading(true);
    try {
      const userCredential = await emailPasswordSignUp(email, password);
      const userId = userCredential.user.uid;
      const db = getDatabase();
      await set(ref(db, `users/${userId}`), {
        email,
        username,
        role,
      });
      setShowAddUserView(false);
      setEmail('');
      setPassword('');
      setUsername('');
      setRole('user');
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onAddUserClick = () => {
    setShowAddUserView(true);
  };

  const onHideAddUserView = () => {
    setShowAddUserView(false);
  };

  const addUserView = (
    <div className='p-4 border  d-flex gap-4 flex-column shadow-sm card'>
      <div className='flex-row d-flex gap-4'>
        <InputText
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputText
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputText
          type="text"
          className="form-control"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className='flex-row d-flex gap-4'>
        <select
          className="form-control"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className='flex-row d-flex justify-content-end gap-4'>
        <Button onClick={onHideAddUserView} className="p-button-danger">
          Cancel
        </Button>
        <Button onClick={handleSignUp} className="p-button-success">
          Add User
        </Button>
      </div>
    </div>
  );

  return (
    <div className='container'>
      {isLoading ? (
        <Loader loadingMessage={loadingMessage} />
      ) : (
        <>
          <div className='d-flex gap-4 flex-column'>



            <div className="row">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Total Users</h5>
                    <p className="card-text">{filteredUsers.length}</p>
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


            <Panel header="All users" className='m-4' toggleable>

              <div className='d-flex flex-column gap-3'>
              <div>
                <h5 className="card-title">Users</h5>
                  <DataTable value={filteredUsers} paginator rows={pageSize}>
                    <Column field="username" header="Username" />
                    <Column field="email" header="Email" />
                    <Column body={deleteButtonTemplate} header="Actions" />
                  </DataTable>
                </div>

                <div>
                  <h5 className="card-title">Admins</h5>
                  <DataTable value={filteredAdmins} paginator rows={pageSize}>
                    <Column field="username" header="Username" />
                    <Column field="email" header="Email" />
                    <Column body={deleteButtonTemplate} header="Actions" />
                  </DataTable>
                </div>
                <div className='text-center'>
                  <Button onClick={onAddUserClick} className="p-button-success">
                    Add new user
                  </Button>
                </div>
                <div>
                  {showAddUserView && addUserView}
                </div>
              </div>
            </Panel>



            <Panel header="Poem Emotions" className='m-4' toggleable>
              <div className="flex-row justify-content-center card">
                <Chart type="pie" data={getChartData(poemsData.emotionsCount)} />
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
