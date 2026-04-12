import { Link } from "react-router-dom";

function PostCard({ post, isAdmin, onDelete }) {
  return (
    <article className="card">
      <h3>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        {isAdmin && post.hidden && <span className="hidden-badge">Hidden</span>}
      </h3>
      <p className="card-subtitle">
        {post.date} · {post.tags.join(", ")}
      </p>
      <p>{post.excerpt}</p>
      <div className="card-actions">
        <Link to={`/blog/${post.slug}`} className="read-more">
          Read more →
        </Link>
        {isAdmin && (
          <button
            className="btn-danger"
            onClick={() => onDelete(post.slug)}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default PostCard;
