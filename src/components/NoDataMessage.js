import React from 'react';
import { Button } from 'react-bootstrap';
import { FaSadTear } from 'react-icons/fa';

const styles = `.no-data-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    background: linear-gradient(135deg, #f3c7c8 0%, #fad0c4 100%);
    border-radius: 10px;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .no-data-content {
    text-align: center;
    color: #fff;
  }
  
  .no-data-icon {
    font-size: 4rem;
    color: #ffc107;
    margin-bottom: 15px;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
  }
  
  button {
    font-size: 1rem;
    font-weight: 600;
    padding: 10px 20px;
  }`

const NoDataMessage = ({ message, onActionClick, showActionButton = true }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="no-data-container">
        <div className="no-data-content">
          <FaSadTear className="no-data-icon" />
          <h3>{message || "Oops! No data available."}</h3>
          {showActionButton && (
            <Button variant="warning" onClick={onActionClick}>
              Add New
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default NoDataMessage;
