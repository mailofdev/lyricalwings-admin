import React from 'react';
import { Paginator } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';
import { FcPrevious, FcNext } from "react-icons/fc";

const CustomPaginator = ({ first, rows, totalRecords, onPageChange, rowsPerPageOptions }) => {
  const template = {
    layout: 'PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport',
    'PrevPageLink': (options) => (
      <button type="button" className={options.className} onClick={options.onClick} disabled={options.disabled}>
        <span className="p-3"><FcPrevious /></span>
      </button>
    ),
    'NextPageLink': (options) => (
      <button type="button" className={options.className} onClick={options.onClick} disabled={options.disabled}>
        <span className="p-3"><FcNext /></span>
      </button>
    ),
    'PageLinks': (options) => {
      if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
        const className = `${options.className} p-disabled`;
        return <span className={className} style={{ userSelect: 'none' }}>...</span>;
      }
      return (
        <button type="button" className={options.className} onClick={options.onClick}>
          {options.page + 1}
        </button>
      );
    },
    'RowsPerPageDropdown': (options) => (
      <Dropdown 
        value={options.value} 
        options={rowsPerPageOptions.map(option => ({ label: `${option} per page`, value: option })) || ''} 
        onChange={(e) => options.onChange(e.value)}
        className="p-paginator-rpp-options"
      />
    ),
    'CurrentPageReport': (options) => (
      <span className="mx-3" style={{ color: 'var(--text-color)', userSelect: 'none' }}>
        {options.first + 1} - {Math.min(options.first + options.rows, totalRecords)} of {totalRecords}
      </span>
    )
  };

  return (
    <Paginator
      first={first}
      rows={rows}
      totalRecords={totalRecords}
      onPageChange={onPageChange}
      template={template}
      rowsPerPageOptions={rowsPerPageOptions}
    />
  );
};

export default CustomPaginator;