import { Link } from "react-router-dom";

function PostCard({ post }) {
  return (
    <article className="card">
      <h3>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
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
