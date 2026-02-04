import { Link } from "react-router-dom";

function PostCard({ post, isAdmin }) {
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
      <Link to={`/blog/${post.slug}`} className="read-more">
        Read more →
      </Link>
    </article>
  );
}

export default PostCard;
