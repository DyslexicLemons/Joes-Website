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

  // Auto-generate slug from title
  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
  }

  function handleTitleChange(newTitle) {
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  }

  // Insert formatting into textarea
  function insertFormat(before, after) {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      content.substring(0, start) +
      before + selectedText + after +
      content.substring(end);

    setContent(newContent);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? end + before.length + after.length : start + before.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

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
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., 'How I Built My Site'"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="slug">Slug (auto-generated, edit if needed)</label>
            <input
              id="slug"
              type="text"
              placeholder="Auto-generated from title"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              placeholder="comma separated, e.g., react, portfolio"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="editor-container">
            <label htmlFor="content">Content</label>
            <div className="editor-toolbar">
              <button type="button" onClick={() => insertFormat('**', '**')} title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" onClick={() => insertFormat('*', '*')} title="Italic">
                <em>I</em>
              </button>
              <button type="button" onClick={() => insertFormat('## ', '')} title="Heading">
                H2
              </button>
              <button type="button" onClick={() => insertFormat('- ', '')} title="Bullet List">
                •
              </button>
              <button type="button" onClick={() => insertFormat('[', '](url)')} title="Link">
                Link
              </button>
              <button type="button" onClick={() => insertFormat('`', '`')} title="Code">
                {'</>'}
              </button>
            </div>
            <textarea
              id="content"
              className="content-editor"
              rows={16}
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Post"}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </section>
    </div>
  );
}

export default Admin;
