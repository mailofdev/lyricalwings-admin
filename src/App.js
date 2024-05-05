import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PoemForm from "./Screens/PoemForm";
import PoemList from './Screens/PoemList';
import Login from './Screens/Login';
import Dashboard from "./Screens/Dashboard";
import FixedTopContent from "./Screens/FixedTopContent"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard/*" element={<WithTopContent><Dashboard /></WithTopContent>} />
        <Route path="/PoemForm" element={<WithTopContent><PoemForm /></WithTopContent>} />
        <Route path="/PoemList/:emotion" element={<WithTopContent><PoemList /></WithTopContent>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

// Wrapper component to conditionally include the FixedTopContent
function WithTopContent({ children }) {
  // Check if the current path is not the Login page
  const showTopContent = !window.location.pathname.startsWith("/Login");
  // If not on Login page, render FixedTopContent with children
  return showTopContent ? <><FixedTopContent />{children}</> : children;
}

export default App;
