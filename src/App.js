import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './pages/Dashboard'; 
import About from './pages/About'; 
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css'; 
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-fill">
          <div className="container my-4">
            <Routes>
            <Route path="/" element={<Login show={true} handleClose={() => {}} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
