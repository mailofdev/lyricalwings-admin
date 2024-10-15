import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './pages/Dashboard'; 
import Poems from './pages/Poems'; 
import Stories from './pages/Stories'; 
import Novels from './pages/Novels'; 
import Books from './pages/Books'; 
import Courses from './pages/Courses'; 
import About from './pages/About'; 
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css'; 
import Login from './pages/Login';
import Narrative from './pages/Narrative';

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
              <Route path="/poems" element={<Poems />} />
              <Route path="/Narrative" element={<Narrative />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/novels" element={<Novels />} />
              <Route path="/books" element={<Books />} />
              <Route path="/courses" element={<Courses />} />
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
 