import { useState } from "react";
import { Lock, UserRound, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (username.trim() === "admin" && password === "admin123") {
      sessionStorage.setItem("gsr_admin_logged_in", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password. Please check your credentials.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Link to="/">
            <img src={logo} alt="GSR Broadband" />
          </Link>
        </div>

        <span className="login-portal-tag">
          <ShieldCheck size={14} />
          SECURE PORTAL
        </span>

        <h1>Welcome Back</h1>
        <p>Enter your credentials to access the account dashboard.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>
              <UserRound size={16} />
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group password-group">
            <label>
              <Lock size={16} />
              Password
            </label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="primary-button full-button login-btn">
            LOGIN TO PORTAL
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer-links">
          <Link to="/" className="back-home-link">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;