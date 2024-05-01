import React from 'react';
import { useSpring, animated } from '@react-spring/web'; // Import necessary components from react-spring
import "../css/loader.css";

const Loader = ({ loadingMessage }) => {
  const lineAnimation = useSpring({
    loop: { reverse: true },
    from: { width: '0%' },
    to: { width: '100%' },
    config: { duration: 1000 }
  });

  return (
    <div className="loader-container">
      <div className="paper">
        <animated.div className="lines" style={lineAnimation}></animated.div>
        <p className="loading-message">{loadingMessage}</p>
      </div>
    </div>
  );
}

export default Loader;
