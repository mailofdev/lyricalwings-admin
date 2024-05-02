import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineUser } from "react-icons/ai";
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomSidebar from './Components/CustomSidebar';
import PoemForm from "./Screens/PoemForm";
import { Dropdown } from 'primereact/dropdown';
import './css/customSidebar.css';
import ProfileDropdown from './Components/ProfileDropdown';

function App() {
  const [visible, setVisible] = useState(false);

  const sidebarItems = [
    // {
    //   label: 'Dashboard',
    //   icon: 'pi pi-home',
    //   url: '/',
    // },
    // {
    //   label: 'Users',
    //   icon: 'pi pi-users',
    //   url: '/users',
    // },
    {
      label: 'Emotions',
      icon: 'pi pi-chart-line',
      subItems: [
        { label: 'Poems', url: '/PoemForm' },
        // { label: 'Sadness', url: '/sadness' },
        // { label: 'Fear', url: '/fear' },
        // { label: 'Anger', url: '/anger' },
        // { label: 'Surprise', url: '/surprise' },
        // { label: 'Disgust', url: '/disgust' },
      ],
    },
    // {
    //   label: 'Stories',
    //   icon: 'pi pi-book',
    //   url: '/stories',
    // },
    // {
    //   label: 'Feedback',
    //   icon: 'pi pi-comment',
    //   url: '/feedback',
    // },
    // {
    //   label: 'Privacy Policy',
    //   icon: 'pi pi-shield',
    //   url: '/privacy-policy',
    // },
  ];

  const handleSidebarToggle = () => {
    setVisible(!visible);
  };

  const profileOptions = [
    // { label: 'Profile', url: '/profile', icon: 'pi pi-user' },
    // { label: 'Settings', url: '/settings', icon: 'pi pi-cog' },
    { label: 'Logout', url: '/logout', icon: 'pi pi-sign-out' }
  ];

  return (
    <Router>
      <div className="App">
        {/* Fixed top content */}
        <div className="fixed-top-content">
          <div className="d-flex justify-content-between align-items-center mx-4">
            <button onClick={handleSidebarToggle} className="toggle-button">
              <GiHamburgerMenu size={22} />
            </button>
            <div>Logo</div>
            <ProfileDropdown options={profileOptions} />
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <CustomSidebar
            visible={visible}
            onHide={() => setVisible(false)}
            sidebarItems={sidebarItems}
            handleSidebarToggle={handleSidebarToggle}
          />
          <Routes>
            <Route path="/PoemForm" element={<PoemForm />} />
            {/* Other routes */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
