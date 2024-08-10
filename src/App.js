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
import User from './Screens/User';
import StoryAndNovel from './Screens/StoryAndNovel';
import StoryAndNovelList from './Screens/StoryAndNovelList'
import DetailStoryAndNovels from './Screens/DetailStoryAndNovels';
import UI from './Screens/UI';
import ItemList from './Screens/ItemList';
import ItemDetails from './Screens/ItemDetails';

function App() {
  return (
    <div>
      <Header />
      <div className='pt-40 mt-40'>
        <Routes>
        <Route path="/" element={<AuthModal show={true} handleClose={() => {}} />} />
        <Route path="*" element={<AuthModal show={true} handleClose={() => {}} />} />

          <Route path="/Dashboard/*" element={<Dashboard />} />
          <Route path="/PoemForm" element={<PoemForm />} />
          <Route path="/About" element={<About />} />
          <Route path="/Courses" element={<Courses />} />
          <Route path="/User" element={<User />} />
          <Route path="/StoryAndNovel" element={<StoryAndNovel />} />
          <Route path="/ItemList/:type" element={<ItemList />} /> 
          <Route path="/item/:id" element={<ItemDetails />} />

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
