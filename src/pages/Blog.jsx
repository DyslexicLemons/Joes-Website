import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";

function Blog() {
  const user = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const q = query(collection(db, "posts"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => doc.data());
        setPosts(list);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const visiblePosts = user ? posts : posts.filter((p) => !p.hidden);

  if (loading) {
    return (
      <div className="container">
        <p>Loading posts…</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>Blog</h1>
        <p>Notes on what I'm learning, building, and breaking.</p>
        {user && (
          <Link to="/blog/create" className="btn" style={{ marginTop: "1rem" }}>
            Create new post
          </Link>
        )}
      </header>

      <div className="stack">
        {visiblePosts.length === 0 && <p>No posts yet.</p>}
        {visiblePosts.map((post) => (
          <PostCard key={post.slug} post={post} isAdmin={!!user} />
        ))}
      </div>
    </div>
  );
}

export default Blog;
