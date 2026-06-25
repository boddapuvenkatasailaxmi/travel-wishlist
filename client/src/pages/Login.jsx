import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setError('');
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 1rem' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} />
        <button onClick={handleSubmit}>Login</button>
      </div>
      <p style={{ marginTop: 12 }}>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}