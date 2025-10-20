import { useState } from 'react';
import { saveToken } from '../lib/auth';

export default function SignUp() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register');
      saveToken(data.token);
      // navigate to dashboard or fetch profile here
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
    <form onSubmit={onSubmit}>
      <input
        type = "text"
        placeholder = "First Name"
        className = ""
        value= {form.firstName}
        onChange= {e=>setForm({...form, firstName:e.target.value})}
        />
             
      <input
        type = "text"
        placeholder = "Last Name"
        className = ""
        value= {form.lastName}
        onChange= {e=>setForm({...form, lastName:e.target.value})}
        />
      <input
        type= "email"
        placeholder= "Email"
        className= ""
        value= {form.email}
        onChange= {e=>setForm({...form, email:e.target.value})}
        />
      <input
        type="password"
        placeholder="Password"
        className=""
        value={form.password}
        onChange={e=>setForm({...form, password:e.target.value})}
        />
      {error && <p className="">{error}</p>}

      <button
        type="submit"
        className=""
        disabled={loading}
        >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>

      <p className= "">
        Already have an account?{' '}
        <a href="/Login" className="">Log in</a>
      </p>
    </form>
   </div>
  );
}
