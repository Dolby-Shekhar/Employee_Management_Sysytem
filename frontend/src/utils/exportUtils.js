/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions with { field, headerName }
 * @param {string} filename - Output filename without extension
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Build CSV header
  const headers = columns.map((col) => col.headerName || col.field).join(',');

  // Build CSV rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = col.valueGetter
          ? col.valueGetter({ row, value: row[col.field] })
          : row[col.field];

        // Handle nested objects and arrays
        let cellValue = value;
        if (value === null || value === undefined) cellValue = '';
        else if (typeof value === 'object') cellValue = JSON.stringify(value);
        else cellValue = String(value);

        // Escape quotes and wrap in quotes if contains comma or newline
        if (cellValue.includes(',') || cellValue.includes('\n') || cellValue.includes('"')) {
          cellValue = `"${cellValue.replace(/"/g, '""')}"`;
        }
        return cellValue;
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to PDF (uses print to PDF approach)
 * @param {string} elementId - ID of the element to print
 * @param {string} filename - Output filename
 */
export const exportToPDF = (elementId, filename = 'report') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Nothing to export');
    return;
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #1976d2; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>${filename}</h2>
        ${element.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

