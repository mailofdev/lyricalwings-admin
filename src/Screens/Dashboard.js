import React, { useState } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { auth } from '../Config/firebase'; 
import CustomSidebar from "../Components/CustomSidebar";
import Loader from "../Components/Loader"; 
import "../css/customSidebar.css";
import '../App.css';
import "../css/loader.css";

function Dashboard() {
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); 
  const navigate = useNavigate();

  const sidebarItems = [
    {
      label: 'Emotions',
      icon: 'pi pi-chart-line',
      subItems: [
        { label: 'Poems', url: '/PoemForm' },
      ],
    },
  ];

  const handleSidebarToggle = () => {
    setVisible(!visible);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await auth.signOut();
      navigate('/Login');
      setLoggingOut(false);
    } catch (error) {
      console.error("Error logging out:", error);
    } 
  };
  
  

  const handleProfileAction = (event) => {
    const action = event.target.value;
    if (action === 'logout') {
        handleLogout();
    }
  };
  

  return (
    <div className="App">
      <div className="fixed-top-content">
        <div className="d-flex justify-content-between align-items-center mx-4">
          <button onClick={handleSidebarToggle} className="toggle-button">
            <GiHamburgerMenu size={22} />
          </button>
          <div>Logo</div>
          <select onChange={handleProfileAction}>
            <option value="">Profile</option>
            <option value="logout">Logout</option>
          </select>
        </div>
      </div>
      <div className="main-content">
        <CustomSidebar
          visible={visible}
          onHide={() => setVisible(false)}
          sidebarItems={sidebarItems}
          handleSidebarToggle={handleSidebarToggle}
        />
      </div>
      {loggingOut && <Loader loadingMessage="Logging out..." />}
    </div>
  );
}

export default Dashboard;
