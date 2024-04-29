import React from 'react';
import { AiOutlineClose } from "react-icons/ai";

const Sidebar = ({ sidebarToggle, sidebarData, onButtonClick, selectedButtonId }) => {

    const sidebarStyle = {
        display: sidebarToggle ? 'none' : 'block',
        position: 'fixed',
        height: '100%',
        overflowY: 'auto'
    };

    const handleButtonClick = (id) => {
        onButtonClick(id);
    };

    return (
        <div style={sidebarStyle} className='bg-primary sidebar-width px-3 h-100'>
            <div className='text-white text-center my-2'>
                Lyricalwings
            </div>
            <div>
                {sidebarData.items.map(item => (
                    <div key={item.id}>
                        {item.isHeading ? (
                            <div className="text-white">{item.label}</div>
                        ) : (
                            <button
                                className={`sidebar-button br-sm my-1 w-100 py-2 gap-3 d-flex align-items-center ${item.subButton ? 'm-2' : ''} ${selectedButtonId === item.id ? 'selected' : ''}`}
                                onClick={() => handleButtonClick(item.id)}>
                                {item.icon} {item.label}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sidebar;
