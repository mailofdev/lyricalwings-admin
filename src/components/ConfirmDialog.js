import React from 'react';

const ConfirmDialog = ({
    visible,
    onHide,
    message,
    header,
    acceptLabel = "Yes",
    rejectLabel = "No",
    accept,
    reject,
    acceptClassName = "btn-danger",
    rejectClassName = "btn-secondary",
}) => {
    if (!visible) return null;

    return (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{header}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className={`btn ${rejectClassName}`}
                            onClick={reject || onHide}
                        >
                            {rejectLabel}
                        </button>
                        <button
                            type="button"
                            className={`btn ${acceptClassName}`}
                            onClick={accept}
                        >
                            {acceptLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
