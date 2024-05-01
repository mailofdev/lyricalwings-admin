import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { GiHamburgerMenu } from "react-icons/gi";
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomSidebar from './Components/CustomSidebar';
import Happiness from "./Screens/Happiness";
import './css/customSidebar.css'


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
        { label: 'Happiness', url: '/Happiness' },
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

  return (
    <Router>
      <div className="App">
        <CustomSidebar
          visible={visible}
          onHide={() => setVisible(false)}
          sidebarItems={sidebarItems}
          handleSidebarToggle={handleSidebarToggle}
        />
        {!visible && (
          <button onClick={handleSidebarToggle} className="toggle-button" style={{ right: '10px' }}>
            <GiHamburgerMenu />
          </button>
        )}
        <Routes>
           <Route path="/Happiness" element={<Happiness />} />   
               </Routes>
      </div>
    </Router>
  );
}

export default App;
