import React, { useState, useEffect } from 'react';
import globalData from '../Common/Global';


import AllDashboardContent from './AllDashboardContent';
// Import components
import Dashboard from './Dashboard';
import Users from './Users';
import Happiness from './Happiness';
import Sadness from './Sadness';
import Fear from './Fear';
import Anger from './Anger';
import Surprise from './Surprise';
import Disgust from './Disgust';
import Stories from './Stories';
import Feedback from './Feedback';
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
import Sidebar from '../Components/SideBar';
const MainScreen = () => {
  const { headerData, footerData, sidebarData } = globalData;
  const [selectedButtonId, setSelectedButtonId] = useState(1);
  const [sidebarToggle, setsidebarToggle] = useState(false);
  const handleButtonClick = (id) => setSelectedButtonId(id);

  const componentMap = {
    1: <Dashboard />,
    2: <Users />,
    3: <Happiness />,
    4: <Sadness />,
    5: <Fear />,
    6: <Anger />,
    7: <Surprise />,
    8: <Disgust />,
    9: <Stories />,
    10: <Feedback />,
    11: <PrivacyPolicy />,
    12: <TermsAndConditions />,
  };

  const content = componentMap[selectedButtonId] || <div>No content selected</div>;
  
  return (
    <>
      <div className='d-flex'>
        <Sidebar selectedButtonId={selectedButtonId}  onButtonClick={handleButtonClick} sidebarToggle={sidebarToggle} sidebarData={sidebarData} />
          <AllDashboardContent content={content} data={headerData} sidebarToggle={sidebarToggle} setsidebarToggle={setsidebarToggle} />
      </div>

    </>
  );
};

export default MainScreen;
