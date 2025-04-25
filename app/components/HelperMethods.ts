/**
 * Get rows from a data array based on a search column and value
 * @param data - Array of arrays, where first row is headers and the rest are rows
 * @param searchColumn - Column to search in
 * @param searchValue - Value to search for
 * @returns Object containing headers and matching rows
 */
export function getRowsByColumn(
    data: string[][],
    searchColumn: string,
    searchValue: string
  ) {
    try {
      if (!Array.isArray(data) || data.length === 0) throw new Error("Data is empty or invalid.");
      const [headers, ...rows] = data;
      const columnIndex = headers.indexOf(searchColumn);
      if (columnIndex === -1) throw new Error(`Header '${searchColumn}' not found in the table.`);
  
      const filteredRows = rows.filter(row => {
        const cellValue = row[columnIndex];
        return cellValue && searchValue && cellValue.toString().trim() === searchValue.toString().trim();
      });
  
      return {
        success: true,
        headers,
        data: filteredRows,
        count: filteredRows.length
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }