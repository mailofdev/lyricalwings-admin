import React, { useState, useEffect, useRef } from 'react';
import { VscAccount } from "react-icons/vsc";
import { GoSidebarCollapse } from "react-icons/go";
import theme from '../Common/Theme';
import Dropdown from './Dropdown';
import logoImage from "../Assets/logo.jpeg";


const Header = ({ data, showSidebarButton, onShowSidebar }) => {

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const styles = {
    header: {

      color: theme.colors.black,
      padding: '10px',
      position: 'fixed',
      top: 0,
      width: '100%',
    },
    button: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: '50%',
      padding: '10px',
      marginRight: '10px',
      cursor: 'pointer',
    },
    logo: {
      width: "100px",
      height: "50px",
    },

  };

  return (
    <header style={styles.header} className="headerBackground p-2 fixed-top w-100">
      <div className="d-flex justify-content-between align-items-center px-3">
        {showSidebarButton && (
          <div>
            <button className="logo-icon" type="button" onClick={onShowSidebar}>
              <GoSidebarCollapse />
            </button>
          </div>
        )}
        <img src={logoImage} style={styles.logo} />
        <Dropdown data={data.dropdownButtons} />
      </div>
    </header>
  );
};

export default Header;
