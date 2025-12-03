import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.js";
import PostCard from "../components/PostCard.jsx";

function Blog() {
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
        <p>Notes on what I’m learning, building, and breaking.</p>
      </header>

      <div className="stack">
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Blog;
