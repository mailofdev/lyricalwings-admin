import React, { useState, useRef } from 'react';
import { Menu } from 'primereact/menu';
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, signOut } from '../Config/firebase';
import Loader from "../Components/Loader";
import "../css/customSidebar.css";
import '../App.css';
import "../css/loader.css";
import CustomSidebar from '../Components/CustomSidebar';

function Header() {
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const menu = useRef(null);

  const sidebarItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      url: '/Dashboard',
    },
    {
      label: 'Poems',
      icon: 'pi pi-pencil',
      url: '/PoemForm',
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      url: '/Settings',
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      url: '/About',
    },
  ];

  const handleSidebarToggle = () => {
    setVisible(!visible);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate('/AuthModal');
      setLoggingOut(false);
    } catch (error) {
      console.error("Error logging out:", error);
      setLoggingOut(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      await auth.signOut(auth, email, password);
      navigate('/Dashboard');
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const menuItems = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => handleLogout(),
    },
  ];

  return (
    <header className="fixed-top bg-light">
      <div className="bg-primary-subtle text-light p-2 mt-2 mx-2 border border-1 rounded shadow-sm">
        <div className="d-flex flex-row justify-content-between align-items-center">
          <button onClick={handleSidebarToggle} className="toggle-button">
            <GiHamburgerMenu size={22} />
          </button>
          <div>Logo</div>
          <Menu model={menuItems} popup ref={menu} id="popup_menu"  className='popup_menu'/>
          <button 
            className="p-link profile-menu-button" 
            onClick={(event) => menu.current.toggle(event)} 
            aria-controls="popup_menu" 
            aria-haspopup
          >
            <i className="pi pi-user"></i> 
          </button>
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

export default Header;
