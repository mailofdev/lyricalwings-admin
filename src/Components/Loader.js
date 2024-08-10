import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { FaPenNib } from 'react-icons/fa';
import '../css/loader.css';

const Loader = ({ loadingMessage }) => {
  const typingProps = useSpring({
    from: { width: '0%' },
    to: { width: '100%' },
    config: { duration: 3000 },
  });

  const penMovementProps = useSpring({
    from: { left: '0%' },
    to: { left: '100%' },
    config: { duration: 3000 },
  });

  const penAnimation = useSpring({
    loop: true,
    from: { transform: 'rotate(-30deg)' },
    to: { transform: 'rotate(30deg)' },
    config: config.wobbly,
  });

  return (
    <div className="loader-container d-flex justify-content-center align-items-center">
      <div className="loader d-flex flex-column align-items-center justify-content-center position-relative">
        <animated.div
          className="pen-icon"
          style={{
            ...penMovementProps,
            ...penAnimation,
          }}
        >
          <FaPenNib size={40} color="#343a40" />
        </animated.div>
        <div className="typing-container mt-3">
          <animated.div
            className="typing-text"
            style={typingProps}
          >
            {loadingMessage}
          </animated.div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
