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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M12 .297a12 12 0 0 0-3.793 23.385c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.419-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297Z" />
        </svg>
        <span>Star on GitHub</span>
        <span style={{ color: '#e25555' }}>❤️</span>
      </a>
    </div>
  );
}
