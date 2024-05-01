import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";
import '../App.css';

const ProfileDropdown = ({ options }) => {
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => setVisible(!visible);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button className="btn" onClick={handleToggle}>
        <AiOutlineUser size={22} />
      </button>
      {visible && (
        <div className="dropdown-menu dropdown-menu-end show" style={{ right: 0 }}>
          {options.map((option, index) => (
            <Link key={index} className="dropdown-item d-flex align-items-center" to={option.url} onClick={() => setVisible(false)}>
              <span className="me-2"><i className={option.icon}></i></span>
              {option.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
