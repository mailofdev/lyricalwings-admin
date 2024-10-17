
import React from 'react';
import PropTypes from 'prop-types';

const DynamicCard = ({ poem, showActions = true }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{poem.title}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{poem.author}</h6>
        <p className="card-text">{poem.content}</p>
        <p className="card-text">
          <small className="text-muted">Type: {poem.type}</small>
        </p>
        {showActions && (
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <button className="btn btn-sm btn-outline-primary me-2">
                <i className="bi bi-hand-thumbs-up"></i> Like
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-chat"></i> Comment
              </button>
            </div>
            <small className="text-muted">
              Last updated: {new Date(poem.lastUpdated).toLocaleDateString()}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

DynamicCard.propTypes = {
  poem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    lastUpdated: PropTypes.number.isRequired,
  }).isRequired,
  showActions: PropTypes.bool,
};

export default DynamicCard;