import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function doSignUp(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
    const lastName  = (document.getElementById('lastName') as HTMLInputElement).value;
    const username  = (document.getElementById('username') as HTMLInputElement).value;
    const email     = (document.getElementById('email') as HTMLInputElement).value;
    const password  = (document.getElementById('loginPassword') as HTMLInputElement).value;

    try {
      const response = await fetch('https://playedit.games/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, username, password })
      });
      const data = await response.json();

      const result = document.getElementById("sign-up-result");
      if (response.ok) {
        if (result) result.innerText = "Account created. Please log in to verify your email.";
        // 💡 Use client-side navigation (no full reload)
        nav("/", { state: { msg: "Account created. Please log in to verify your email." } });
      } else {
        if (result) result.innerText = data.message ?? "Sign up failed.";
      }
    } catch (err) {
      const result = document.getElementById("sign-up-result");
      if (result) result.innerText = "Server error — try again later.";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="page-container">
      <div id="sign-up-container">
        <span id="inner-title">Welcome to PlayedIt!</span><br />
        <span id="inner-smaller-title">Insert your information below to join our ranks.</span><br />

        {/* Wrap fields in a form and submit with onSubmit */}
        <form onSubmit={doSignUp}>
          <input type="text" id="firstName" placeholder="First Name"/><br />
          <input type="text" id="lastName" placeholder="Last Name"/><br />
          <input type="text" id="username" placeholder="Username"/><br />
          <input type="text" id="email" placeholder="Email" /><br />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="loginPassword"
              placeholder="Password"
              className="login-input"
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button type="submit" id="loginButton" className="buttons" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <span id="sign-up-result"></span>
        <p className="login-link"> Already have an account? <br /><Link to="/">Log In</Link></p>
      </div>
    </div>
  );
}
export default SignUp;
