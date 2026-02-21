export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        width: '100%',
        maxWidth: '380px',
      }}>
        <h1 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Admin Login</h1>

        <form action="/api/admin/login" method="POST">
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 500 }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.7rem',
              fontSize: '1rem',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
