import React from 'react';
import { Table } from 'react-bootstrap';

// Thin wrapper around a responsive Bootstrap table so admin pages share
// consistent spacing/typography.
const AdminTable = ({ columns, children }) => (
  <div className="table-responsive bg-white border rounded">
    <Table hover className="align-middle mb-0">
      <thead className="table-light">
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </Table>
  </div>
);

export default AdminTable;
