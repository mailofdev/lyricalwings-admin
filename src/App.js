import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from "./Screens/Dashboard";
import Header from './Screens/Header';
import AuthModal from './Components/AuthModal';
import About from './Screens/About';
import Courses from './Screens/Courses';
import User from './Screens/User';
import PoemList from './Components/PoemList';
import PrivateRoute from './Components/PrivateRoute'; // Import the PrivateRoute component
import Books from './Screens/Books';
import Poems from './Screens/Poems';
import Narrative from './Screens/Narrative';
import NarrativeList from './Components/NarrativeList';
import Detail from './Components/Detail';

function App() {
  return (
    <div>
      <Header />
      <div className='pt-40 mt-40'>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AuthModal show={true} handleClose={() => {}} />} />
          <Route path="*" element={<AuthModal show={true} handleClose={() => {}} />} />

          {/* Private Routes */}
          <Route path="/Dashboard/*" element={<PrivateRoute element={Dashboard} />} />
          <Route path="/Books" element={<PrivateRoute element={Books} />} />
          <Route path="/About" element={<PrivateRoute element={About} />} />
          <Route path="/Courses" element={<PrivateRoute element={Courses} />} />
          <Route path="/User" element={<PrivateRoute element={User} />} />
          <Route path="/Poems" element={<PrivateRoute element={Poems} />} />
          <Route path="/PoemList/:type" element={<PrivateRoute element={PoemList} />} />       
          <Route path="/Narrative" element={<PrivateRoute element={Narrative} />} />
          <Route path="/NarrativeList/:type" element={<PrivateRoute element={NarrativeList} />} />    
          <Route path="/Detail/:id" element={<PrivateRoute element={Detail} />} />    
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
