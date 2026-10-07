export default function Star() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
      <a
        href="https://github.com/josephj9/airforge"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          border: '1px solid #333333',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2a2a2a';
          e.currentTarget.style.borderColor = '#444444';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1e1e1e';
          e.currentTarget.style.borderColor = '#333333';
        }}
      >
        <span>Star on GitHub</span>
        <span style={{ color: '#e25555' }}>❤️</span>
      </a>
    </div>
  );
}