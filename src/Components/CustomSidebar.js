import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { GiHamburgerMenu } from "react-icons/gi";
import "../App.css"
function CustomSidebar({ visible, onHide, sidebarItems, handleSidebarToggle }) {
  return (
    <Sidebar visible={visible} onHide={onHide} className="p-sidebar">
      <ul>
        {sidebarItems.map((item) => (
          <li key={item.label}>
            {item.subItems ? (
              <>
                <span className="sidebar-item-parent">{item.label}</span>
                <ul>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.label}>
                      <a href={subItem.url}>{subItem.label}</a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <a href={item.url}>{item.label}</a>
            )}
          </li>
        ))}
      </ul>
    </Sidebar>
  );
}

export default CustomSidebar;
