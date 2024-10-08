import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { FaUserCircle, FaHome, FaBook, FaSignOutAlt, FaGraduationCap, FaUsers } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { signoutUser } from '../redux/userAuthSlice';
import { TfiWrite } from "react-icons/tfi";
import { IoBookSharp } from 'react-icons/io5';
import { CgGirl } from "react-icons/cg";
import { BiColor } from 'react-icons/bi';
import lhyricalwings from '../Common/lhyricalwings.png';

const Header = ({ theme }) => {
  const [open, setOpen] = useState(false);
  const activeTime = 20;
  const [timer, setTimer] = useState(activeTime * 60);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.userAuth.auth.user);

  useEffect(() => {
    let inactivityTimer;
    const inactivityTime = activeTime * 60 * 1000;

    const resetTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      inactivityTimer = setTimeout(() => {
        handleSignout();
      }, inactivityTime);
    };

    const handleActivity = () => {
      resetTimer();
      setTimer(activeTime * 60);
    };

    const updateTimerDisplay = () => {
      setTimer(prev => {
        if (prev <= 0) {
          handleSignout();
          return 0;
        }
        return prev - 1;
      });
    };

    const timerInterval = setInterval(updateTimerDisplay, 1000);

    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('touchstart', handleActivity);

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearInterval(timerInterval);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignout = async () => {
    try {
      await dispatch(signoutUser());
      navigate('/');
    } catch (error) {
      console.error("Sign out failed: ", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const closeNavbar = () => setOpen(false);

  return (
    <Navbar ref={navRef} expand="lg" fixed="top" expanded={open} className='navbar'>
      <div className="container-fluid">
        <Navbar.Brand as={NavLink} to="/Dashboard" onClick={closeNavbar}>
          <img src={lhyricalwings} alt="LyricalWings Logo" style={{ maxWidth: '300px', maxHeight:'300px', height:50, width:220 }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setOpen(!open)} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex gap-4">
            <Nav.Item>
              <Nav.Link as={NavLink} to="/Dashboard" className="nav-link-custom" onClick={closeNavbar}>
                <FaHome /> Dashboard
              </Nav.Link>
            </Nav.Item>

            

            <Nav.Item>
                <Nav.Link as={NavLink} to="/AddData" className="nav-link-custom" onClick={closeNavbar}>
                  <IoBookSharp /> Write
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link as={NavLink} to="/Courses" className="nav-link-custom" onClick={closeNavbar}>
                  <FaBook /> Courses
                </Nav.Link>
              </Nav.Item>
              
            {/* <NavDropdown title={<span className="nav-link-custom"><TfiWrite size={18} /> Add</span>} align="center">
              <Nav.Item>
                <Nav.Link as={NavLink} to="/Poems" className="nav-link-custom" onClick={closeNavbar}>
                  <IoBookSharp /> Poems
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/Narrative" className="nav-link-custom" onClick={closeNavbar}>
                  <FaGraduationCap /> Narratives
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/Courses" className="nav-link-custom" onClick={closeNavbar}>
                  <FaBook /> Courses
                </Nav.Link>
              </Nav.Item>
            </NavDropdown> */}

            <NavDropdown title={<span className="nav-link-custom" ><CgGirl size={27} /> About</span>} align="center">
              <Nav.Item>
                <Nav.Link as={NavLink} to="/Books" className="nav-link-custom" onClick={closeNavbar}>
                  <IoBookSharp /> my book
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/About" className="nav-link-custom" onClick={closeNavbar}>
                  <FaGraduationCap /> About me & us
                </Nav.Link>
              </Nav.Item>
            </NavDropdown>

            <NavDropdown
              title={<span className="nav-link-custom"><FaUserCircle size={25} /> {user ? user.displayName : 'anonymous'}</span>}
              id="basic-nav-dropdown"
              align="end"
              className='me-2' 
              >
              {user && (
                <>

                  <NavDropdown.Item as={NavLink} to="/Themes" className="nav-link-custom"><BiColor /> Themes</NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/User" className="nav-link-custom"><FaUsers /> Users</NavDropdown.Item>
                  <NavDropdown.Item className="nav-link-custom" onClick={() => { closeNavbar(); handleSignout(); }}><FaSignOutAlt /> Sign Out</NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
          {timer <= 180 && (
            <div className="text-danger d-none d-sm-block">
              You will logout in: {formatTime(timer)}
            </div>
          )}
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
