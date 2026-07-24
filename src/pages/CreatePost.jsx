import { useEffect, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";
import { useDictation } from "../hooks/useDictation.js";

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CreatePost() {
  const user = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [hidden, setHidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const dictation = useDictation();
  const dictationInsertionRef = useRef(null);
  const [dictationSeconds, setDictationSeconds] = useState(0);

  // Splice the live transcript into the spot the cursor was at when dictation started.
  useEffect(() => {
    const insertion = dictationInsertionRef.current;
    if (!insertion) return;
    const { before, after } = insertion;
    const spacer = before && !/\s$/.test(before) ? " " : "";
    setContent(before + spacer + dictation.transcript + after);
  }, [dictation.transcript]);

  useEffect(() => {
    if (!dictation.isRecording) return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setDictationSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [dictation.isRecording]);

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function handleTitleChange(newTitle) {
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  }

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

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? end + before.length + after.length : start + before.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function handleDictationToggle() {
    if (dictation.isRecording) {
      dictation.stop();
      return;
    }

    const textarea = document.getElementById('content');
    const cursor = textarea ? textarea.selectionStart : content.length;
    dictationInsertionRef.current = {
      before: content.slice(0, cursor),
      after: content.slice(cursor),
    };
    setDictationSeconds(0);
    dictation.start();
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
      const now = new Date().toISOString().slice(0, 10);
      const tagsArray = [
        ...new Set(
          tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        ),
      ];

      await setDoc(doc(db, "posts", slug), {
        slug,
        title,
        date: now,
        tags: tagsArray,
        excerpt: content.slice(0, 160) + (content.length > 160 ? "…" : ""),
        content,
        hidden,
      });

      navigate(`/blog/${slug}`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save post.");
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>New Post</h1>
      </header>

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
            <button
              type="button"
              className={`dictation-btn${dictation.isRecording ? " recording" : ""}`}
              onClick={handleDictationToggle}
              disabled={!dictation.isSupported}
              title={
                !dictation.isSupported
                  ? "Dictation isn't supported in this browser"
                  : dictation.isRecording
                  ? "Stop dictation"
                  : "Start dictation"
              }
            >
              {dictation.isRecording
                ? `⏹ Stop ${formatDuration(dictationSeconds)}`
                : "🎤 Dictate"}
            </button>
          </div>
          {dictation.status && (
            <p className="dictation-status">{dictation.status}</p>
          )}
          <textarea
            id="content"
            className="content-editor"
            rows={16}
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={dictation.isRecording}
          />
        </div>

        <div className="toggle-field">
          <label className="toggle">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">
              Hidden
              <small>Only visible to you while logged in as admin</small>
            </span>
          </label>
        </div>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Post"}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default CreatePost;
