import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import "./Auth.css";

function Signup() {
  const { signup } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    const result = await signup(
      formData.username,
      formData.email,
      formData.password
    );

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/onboarding");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Sign up</h1>
          <p>Please enter your details to create an account.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          <label>
            Username
            <div className="input-with-icon">
              <span className="input-icon">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                autoComplete="username"
              />
            </div>
          </label>

          <label>
            Email
            <div className="input-with-icon">
              <span className="input-icon">✉</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-icon-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          {error && <small className="field-error">{error}</small>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Signing up..." : "Sign up"}
          </button>

        </form>

        <p className="auth-footer">
          Already Have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;
