import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PoemForm from "./Screens/PoemForm";
import PoemList from './Screens/PoemList';
import Dashboard from "./Screens/Dashboard";
import Header from './Screens/Header';
import AuthModal from './Components/AuthModal';
import About from './Screens/About';
import DetailPoem from './Screens/DetailPoem';
import Courses from './Screens/Courses';
import Users from './Screens/Users';
import StoryAndNovels from './Screens/StoryAndNovels';

function App() {
  return (
    <div style={{ paddingTop: '60px', paddingBottom: '60px' }}>
      <Header />
      <div className='m-4'>
        <Routes>
        <Route path="/" element={<AuthModal show={true} handleClose={() => {}} />} />
        <Route path="*" element={<AuthModal show={true} handleClose={() => {}} />} />

          <Route path="/Dashboard/*" element={<Dashboard />} />
          <Route path="/PoemForm" element={<PoemForm />} />
          <Route path="/About" element={<About />} />
          <Route path="/PoemList/:emotion" element={<PoemList />} />
          <Route path="/DetailPoem" element={<DetailPoem />} />
          <Route path="/Courses" element={<Courses />} />
          <Route path="/Users" element={<Users />} />
          <Route path="/StoryAndNovels" element={<StoryAndNovels />} />
        </Routes>
      </div>
    </div>
  );
};

const Root = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default Root;
