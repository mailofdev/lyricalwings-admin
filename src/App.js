import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PoemForm from "./Screens/PoemForm";
import PoemList from './Screens/PoemList';
import Login from './Screens/Login';
import Dashboard from "./Screens/Dashboard"
function App() {
  return (
    <Router>
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path='/Dashboard' element={<Dashboard/>}/>
            <Route path="/PoemForm" element={<PoemForm />} />
            <Route path="/PoemList/:emotion" element={<PoemList />} />
          </Routes>
    </Router>
  );
}

export default App;
