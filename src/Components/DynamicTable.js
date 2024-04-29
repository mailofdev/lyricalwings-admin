import React from 'react';

const DynamicTable = ({ title, data }) => {
  // Extracting headers dynamically from the keys of the first object in data
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="table-responsive br-sm m-4 bg-primary border-gray">
      {title &&
      <div className=''>
         <h2>{title}</h2>
      </div>
     }
      {data.length > 0 ? (
        <table className="table table-striped margin-none">
          <thead className=''>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data here</p>
      )}
    </div>
  );
};

export default DynamicTable;
