// Footer.js
import React from 'react';

const Footer = (props) => {
  return (
    <footer className="FooterBackground text-white p-1 fixed-bottom w-100">
      <div>{props.data.content}</div>
    </footer>
  );
};

export default Footer;
