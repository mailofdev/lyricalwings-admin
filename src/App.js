import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import BrowserRouter and Route
import { Sidebar } from 'primereact/sidebar';
import './App.css';
import { GiHamburgerMenu } from "react-icons/gi";
import Happiness from './Screens/Happiness';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [visible, setVisible] = useState(false);

  const sidebarItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      url: '/',
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      url: '/users',
    },
    {
      label: 'Emotions',
      icon: 'pi pi-chart-line',
      subItems: [
        { label: 'Happiness', url: '/Happiness' },
        { label: 'Sadness', url: '/sadness' },
        { label: 'Fear', url: '/fear' },
        { label: 'Anger', url: '/anger' },
        { label: 'Surprise', url: '/surprise' },
        { label: 'Disgust', url: '/disgust' },
      ],
    },
    {
      label: 'Stories',
      icon: 'pi pi-book',
      url: '/stories',
    },
    {
      label: 'Feedback',
      icon: 'pi pi-comment',
      url: '/feedback',
    },
    {
      label: 'Privacy Policy',
      icon: 'pi pi-shield',
      url: '/privacy-policy',
    },
  ];

  const handleSidebarToggle = () => {
    setVisible(!visible);
  };

  return (
    <Router> {/* Wrap your entire application with the Router component */}
      <div className="App">
        <Sidebar visible={visible} onHide={() => setVisible(false)} className="p-sidebar">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.label}>
                {item.subItems ? (
                  <>
                    <span className="sidebar-item-parent">{item.label}</span>
                    <ul>
                      {item.subItems.map((subItem) => (
                        <li key={subItem.label}>
                          <a href={subItem.url}>{subItem.label}</a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <a href={item.url}>{item.label}</a>
                )}
              </li>
            ))}
          </ul>
        </Sidebar>
        {!visible && (
          <button onClick={handleSidebarToggle} className="toggle-button" style={{ right: '10px' }}>
            <GiHamburgerMenu />
          </button>
        )}

        {/* Define your routes */}
        <Routes>
          {/* Route for the Happiness component */}
          <Route path="/Happiness" element={<Happiness />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
