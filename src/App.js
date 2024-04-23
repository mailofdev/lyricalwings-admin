
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainScreen from './Screens/MainScreen';
import Login from './Screens/Login';

function App() {

  const [isAuth, setIsAuth] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuth={setIsAuth} />} />
        <Route path="/MainScreen" element={<MainScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
