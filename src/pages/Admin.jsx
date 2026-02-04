import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext.jsx";

function Admin() {
  const user = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Login failed. Check email/password.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  if (!user) {
    return (
      <div className="container">
        <h1>Admin Login</h1>
        <form className="stack" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" type="submit">
            Log in
          </button>
          {message && <p>{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>Admin</h1>
        <p>Logged in as {user.email}</p>
      </header>
      <div className="hero-actions">
        <Link to="/blog/create" className="btn">
          Create new post
        </Link>
        <button className="btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}

export default Admin;
