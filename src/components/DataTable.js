'use client';

export default function DataTable({ columns, data, onRowClick, loading, emptyMessage = "No records found" }) {
  if (loading) {
    return (
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ height: '20px', width: j === 0 ? '60%' : '80%' }}></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div style={{ fontSize: '3rem', opacity: 0.5 }}>📭</div>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, j) => (
                  <td key={j}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
