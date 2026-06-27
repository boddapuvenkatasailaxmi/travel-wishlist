import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '2.5rem',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>✈️</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#333' }}>
            Welcome Back!
          </h1>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: 14 }}>
            Login to your travel wishlist
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FFEBEE', color: '#F44336',
            padding: '10px 14px', borderRadius: 10,
            fontSize: 13, marginBottom: 16, textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 12, border: '2px solid #eee',
              fontSize: 14, outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 12, border: '2px solid #eee',
              fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#667eea'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
          }}
        >
          {loading ? 'Logging in...' : '🚀 Login'}
        </button>

        {/* Register Link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}