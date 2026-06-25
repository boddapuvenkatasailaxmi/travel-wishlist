import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setError('');
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 1rem' }}>
      <h2>Create Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="Your name" value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} />
        <button onClick={handleSubmit}>Register</button>
      </div>
      <p style={{ marginTop: 12 }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}