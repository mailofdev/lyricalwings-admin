import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PoemForm from "./Screens/PoemForm";
import Dashboard from "./Screens/Dashboard";
import Header from './Screens/Header';
import AuthModal from './Components/AuthModal';
import About from './Screens/About';
import Courses from './Screens/Courses';
import User from './Screens/User';
import StoryAndNovel from './Screens/StoryAndNovel';
import ItemList from './Screens/ItemList';
import ItemDetails from './Screens/ItemDetails';
import PrivateRoute from './Components/PrivateRoute'; // Import the PrivateRoute component
import Books from './Screens/Books';

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
          <Route path="/PoemForm" element={<PrivateRoute element={PoemForm} />} />
          <Route path="/Books" element={<PrivateRoute element={Books} />} />
          <Route path="/About" element={<PrivateRoute element={About} />} />
          <Route path="/Courses" element={<PrivateRoute element={Courses} />} />
          <Route path="/User" element={<PrivateRoute element={User} />} />
          <Route path="/StoryAndNovel" element={<PrivateRoute element={StoryAndNovel} />} />
          <Route path="/ItemList/:type" element={<PrivateRoute element={ItemList} />} />
          <Route path="/item/:id" element={<PrivateRoute element={ItemDetails} />} />
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
