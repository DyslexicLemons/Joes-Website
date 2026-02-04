import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext.jsx";

function renderContent(content) {
  return content.split("\n\n").map((para, idx) => {
    if (!para.trim()) return null;
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={idx}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  });
}

function Post() {
  const { slug } = useParams();
  const user = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "posts", slug);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPost(snap.data());
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading…</p>
      </div>
    );
  }

  if (!post || (post.hidden && !user)) {
    return (
      <div className="container">
        <p>Post not found.</p>
        <Link to="/blog" className="btn-secondary">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <article className="post">
        <header className="post-header">
          <h1>
            {post.title}
            {post.hidden && <span className="hidden-badge">Hidden</span>}
          </h1>
          <p className="card-subtitle">
            {post.date} · {post.tags && post.tags.join(", ")}
          </p>
        </header>
        <div className="post-body">{renderContent(post.content)}</div>
      </article>
      <Link to="/blog" className="btn-secondary">
        ← Back to blog
      </Link>
    </div>
  );
}

export default Post;
