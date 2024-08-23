import React from 'react';
import { Row, Col } from 'react-bootstrap';

const ResponsiveCard = ({
  icon: Icon,
  iconSize,
  iconColor, 
  title,
  count,
  md,
  sm,
  xs,
  customshadow,
  bgGradient,
  textColor,
  onClick
}) => {
  return (
    <Col md={md} sm={sm} xs={xs}>
      <div
        className={`p-2 m-2 card cursor-pointer ${customshadow} ${bgGradient} ${textColor}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <Row className="d-flex align-items-center m-0">
          {Icon && (
            <Col className="align-items-center d-flex flex-column">
              <Icon size={iconSize} className="iconColor"  />
            </Col>
          )}

          <Col className="align-items-center d-flex flex-column">
            <div className="fs-5 iconColor">{title}</div>
            <div className="fs-6 iconColor">{count}</div>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default ResponsiveCard;
