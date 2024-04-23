import React from 'react';
import NavBar from '../Components/NavBar';

const AllDashboardContent = ({ data, sidebarToggle, setsidebarToggle, content }) => {
    const toggle = {
        marginLeft: sidebarToggle ? '0px' : '250px'
    };

    return (

        <div style={toggle} className='w-100'>
            <NavBar data={data} sidebarToggle={sidebarToggle} setsidebarToggle={setsidebarToggle} />
            <div className='mt-75'>{content}</div>
            
        </div>
    );
}

export default AllDashboardContent;
