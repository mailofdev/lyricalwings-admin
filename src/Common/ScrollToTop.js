// ScrollToTopButton.js

import React, { useState, useEffect } from "react";

const ScrollToTop = ({title}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const scrolled = document.documentElement.scrollTop;
    setIsVisible(scrolled > 300);
  };


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      style={{
        display: isVisible ? "block" : "none",
        ...styles.btn,
      }}
      onClick={scrollToTop}
    >
      &#9650;
      {title}
    </button>
  );
};

const styles = {
  btn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "13px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
export default ScrollToTop;
