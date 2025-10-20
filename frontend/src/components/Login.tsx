import { useState } from 'react';
import { saveToken } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      saveToken(data.token);
      console.log('Logged in:', data.user);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <form
        onSubmit={onLogin}
        className=""
      >
        <h2 className="">
          Welcome Back
        </h2>

        <input
          type="email"
          placeholder="Email"
          className=""
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className=""
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        {error && <p className="">{error}</p>}

        <button
          type="submit"
          className=""
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="">
          Don’t have an account?{' '}
          <a href="/signup" className="">Sign up</a>
        </p>
      </form>
    </div>
  );
}
