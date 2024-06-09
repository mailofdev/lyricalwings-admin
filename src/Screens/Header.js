import React,  { useState }  from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { auth } from '../Config/firebase'; 
import Loader from "../Components/Loader"; 
import "../css/customSidebar.css";
import '../App.css';
import "../css/loader.css";
import CustomSidebar from '../Components/CustomSidebar';

function Header () {
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); 
  const navigate = useNavigate();

  const sidebarItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      url: '/Dashboard',
    },
    {
      label: 'Poems',
      icon: 'pi pi-home',
      url: '/PoemForm',
    },
    {
      label: 'Settings',
      icon: 'pi pi-home',
      url: '/Settings',
    },
    {
      label: 'About',
      icon: 'pi pi-home',
      url: '/About',
    },
  
  ];

  const handleSidebarToggle = () => {
    setVisible(!visible);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await auth.signOut();
      navigate('/AuthModal');
      setLoggingOut(false);
    } catch (error) {
      console.error("Error logging out:", error);
    } 
  };
  

  const handleProfileAction = (event) => {
    // const action = event.target.value;
    // if (action === 'logout') {
    //     handleLogout();
    // }
  };
  


  return (
    <header className="fixed-top bg-light">
      <div className="bg-primary-subtle text-light p-2 mt-2 mx-2 border border-1 rounded shadow-sm">
      <div className="d-flex flex-row justify-content-between align-items-center">
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
  </header>
  );
}

export default Header ;
