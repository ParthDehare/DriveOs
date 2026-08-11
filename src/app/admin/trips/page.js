export default function HistoricalTripsPage() {
  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Trip History</h1>
          <p className="page-description">Review completed telematics trips.</p>
        </div>
      </header>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Session ID</th>
                <th>Instructor</th>
                <th>Distance (km)</th>
                <th>Duration (mins)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                  No trip data available yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
