import React from 'react';

const SquareCard = ({ data }) => {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 margin-none" >
      {data.map(item => (
        <div key={item.id}>
          <div style={{ border: '1px solid orange' }} className="py-3 my-2 px-4 br-md ">

            <div className="text-start" style={{ fontFamily: 'Merriweather' }}>{item.label}</div>
            <div className="text-end">{item.icon}</div>
            <div className="text-start">{item.quantity}</div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default SquareCard;
