import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../images/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { signoutUser } from '../redux/authSlice';

function Header() {
  const auth = useSelector((state) => state.auth);
  const username = auth.user?.username || 'Anonymous';
  const [expanded, setExpanded] = useState(false);
  const navbarRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      setExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (path) => {
    setExpanded(false);
    navigate(path);
  };

  const handleSignOut = () => {
    dispatch(signoutUser())
      .unwrap()
      .then(() => navigate('/'))
      .catch((error) => console.error('Sign out error:', error));
  };

  return (
    <Navbar
      ref={navbarRef}
      bg="light"
      variant="light"
      expand="lg"
      sticky="top"
      expanded={expanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" onClick={() => handleNavClick('/dashboard')}>
          <img
            src={logo}
            alt="Admin Portal Logo"
            width="140"
            height="40"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>


        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />


        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
          <Nav.Link as={Link} to="/dashboard" onClick={() => handleNavClick('/dashboard')}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/poems" onClick={() => handleNavClick('/poems')}>
              Poems
            </Nav.Link>
            <Nav.Link as={Link} to="/narrative" onClick={() => handleNavClick('/narrative')}>
            Narrative
            </Nav.Link>
            <Nav.Link as={Link} to="/books" onClick={() => handleNavClick('/books')}>
              Books
            </Nav.Link>
            <Nav.Link as={Link} to="/courses" onClick={() => handleNavClick('/courses')}>
              Courses
            </Nav.Link>

          </Nav>

          <Nav>
            <NavDropdown
              title={
                <>
                  <FaUserCircle size={30} className="text-white bg-black" />
                  <span className="ms-2 fw-bold text-uppercase">{username}</span>
                </>
              }
              id="profile-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile" onClick={() => handleNavClick('/profile')}>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/settings" onClick={() => handleNavClick('/settings')}>
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout" onClick={handleSignOut}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
