import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const DataTable = ({ rows, columns, pageSize = 10, getRowId, loading, ...props }) => (
  <DataGrid
    rows={rows || []}
    columns={columns}
    pageSize={pageSize}
    rowsPerPageOptions={[10, 25, 50]}
    getRowId={getRowId || ((row) => row._id)}
    autoHeight
    disableSelectionOnClick
    loading={loading}
    {...props}
  />
);

export default DataTable;

