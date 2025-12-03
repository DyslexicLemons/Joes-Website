import { useState, useEffect } from "react";
import { auth, db } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New post state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

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

  async function handleSavePost(e) {
    e.preventDefault();
    if (!title || !slug || !content) {
      setMessage("Title, slug, and content are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Use slug as document ID so /blog/:slug can read it
      await setDoc(doc(db, "posts", slug), {
        slug,
        title,
        date: now,
        tags: tagsArray,
        excerpt: content.slice(0, 160) + (content.length > 160 ? "…" : ""),
        content,
      });

      setMessage("Post saved!");
      setSaving(false);

      // Clear form
      setTitle("");
      setSlug("");
      setTags("");
      setContent("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save post.");
      setSaving(false);
    }
  }

  if (!user) {
    // Not logged in: show login form
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

  // Logged in: show post editor
  return (
    <div className="container">
      <header className="page-header">
        <h1>Admin</h1>
        <p>Logged in as {user.email}</p>
        <button className="btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section>
        <h2>New Post</h2>
        <form className="stack" onSubmit={handleSavePost}>
          <input
            type="text"
            placeholder="Title (e.g., 'How I Built My Site')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Slug (e.g., 'how-i-built-my-site')"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma separated, e.g., react, portfolio)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <textarea
            rows={12}
            placeholder="Content (Markdown-ish text)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Post"}
          </button>
          {message && <p>{message}</p>}
        </form>
      </section>
    </div>
  );
}

export default Admin;
