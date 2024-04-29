import React, { useState, useEffect, useRef } from 'react';
import theme from '../Common/Theme';
import { VscAccount } from "react-icons/vsc";

const Dropdown = (props) => {
  const { data } = props;
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
   
   
    dropdownMenu: {
      display: dropdownVisible ? 'block' : 'none',
      boxShadow: '0 2px 4px #222222',
      minWidth: '120px',
      position: 'absolute',
      top: '100%',
      right: '24px'
    },
   
  };

  return (

    <>
      <div ref={dropdownRef}>
        <button className="logo-icon" type="button" onClick={toggleDropdown}>
          <VscAccount />
        </button>
        <div className='bg-primary br-sm mt-1' style={styles.dropdownMenu}>
          <div className='text-white'> <label className='m-2'>Hii user..!</label></div>
          {data.map(item => (
            <button key={item.id} 
            className="border-none text-white bg-primary text-start gap-3 
            d-flex align-items-center m-2 py-1" type="button">
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dropdown;
