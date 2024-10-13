import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { FaFeatherAlt, FaBookOpen, FaPenNib, FaScroll } from 'react-icons/fa';

const Loader = ({ loadingMessage }) => {
  const iconSize = 30;
  const iconColor = "#5D3A3A"; // Rich dark brown color for a classic feel

  // Animation styles
  const floatAnimation = useSpring({
    loop: true,
    to: [
      { transform: 'translateY(-15px)' },
      { transform: 'translateY(15px)' },
    ],
    from: { transform: 'translateY(0px)' },
    config: config.gentle,
  });

  const rotateAnimation = useSpring({
    loop: true,
    to: { transform: 'rotate(360deg)' },
    from: { transform: 'rotate(0deg)' },
    config: { duration: 4000 },
  });

  const pulseAnimation = useSpring({
    loop: true,
    to: [{ scale: 1.15 }, { scale: 1 }],
    from: { scale: 1 },
    config: config.wobbly,
  });

  const typingProps = useSpring({
    from: { width: '0%' },
    to: { width: '100%' },
    config: { duration: 2500 },
  });

  return (
    <div
      className="loader-container d-flex justify-content-center align-items-center"
      style={{
        background: 'linear-gradient(135deg, #f7ece1 0%, #f8f4eb 100%)',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
        border: '2px solid #5D3A3A',
      }}
    >
      <div className="loader d-flex flex-column align-items-center justify-content-center">
        {/* Icon section */}
        <div className="icon-container d-flex justify-content-around w-100 mb-4">
          <animated.div style={rotateAnimation}>
            <FaFeatherAlt size={iconSize} color={iconColor} />
          </animated.div>
          <animated.div style={pulseAnimation}>
            <FaBookOpen size={iconSize} color={iconColor} />
          </animated.div>
          <animated.div style={floatAnimation}>
            <FaPenNib size={iconSize} color={iconColor} />
          </animated.div>
          <animated.div style={rotateAnimation}>
            <FaScroll size={iconSize} color={iconColor} />
          </animated.div>
        </div>

        {/* Text section */}
        <div
          className="position-relative text-center"
          style={{
            width: '300px',
            height: '50px',
            overflow: 'hidden',
            marginTop: '10px',
          }}
        >
          <animated.div
            className=""
            style={{
              ...typingProps,
              position: 'absolute',
              whiteSpace: 'nowrap',
            }}
          >
            <p className="fs-4" style={{ color: '#5D3A3A', fontFamily: "'Dancing Script', cursive" }}>
              {loadingMessage || "Gathering verses..."}
            </p>
          </animated.div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
