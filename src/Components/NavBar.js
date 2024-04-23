



import React, { useState, useEffect, useRef } from 'react';
import { VscAccount } from "react-icons/vsc";
import theme from '../Common/Theme';
import Dropdown from './Dropdown';
import logoImage from "../Assets/logo.jpeg";
import { FaBars } from 'react-icons/fa';

const NavBar = ({ sidebarToggle, setsidebarToggle , data}) => {

  

    return (
        <nav className="bg-primary p-3 d-flex justify-content-between align-items-center" style={{ position: 'fixed', width: '-webkit-fill-available' }}>
                <button className='logo-icon' onClick={()=> setsidebarToggle(!sidebarToggle)}> <FaBars /> </button>
                <img src={logoImage} style={{width: "100px", height: "30px",}} /> 
                <Dropdown data={data.dropdownButtons} />
        </nav>
    );
}

export default NavBar;

{/* <nav className="bg-primary p-1 fixed-top w-100">
            <div className="d-flex justify-content-between align-items-center px-3">
                <button onClick={()=> setsidebarToggle(!sidebarToggle)}> <FaBars /> </button>
                <img src={logoImage} style={{width: "100px", height: "50px",}} /> 
                <Dropdown data={data.dropdownButtons} />
            </div>
        </nav> */}