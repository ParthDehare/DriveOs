export default function LoadingSpinner({ size = 24, color = 'var(--accent-primary)' }) {
  return (
    <div style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `3px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
