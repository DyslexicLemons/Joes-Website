import { Link } from "react-router-dom";
import { projects } from "../data/projects.js";
import { posts } from "../data/posts.js";
import ProjectCard from "../components/ProjectCard.jsx";
import PostCard from "../components/PostCard.jsx";

function Home() {
  const latestProjects = projects.slice(0, 3);
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="container">
      <section className="hero">
        <h1>Hi, I’m Joe 👋</h1>
        <p className="hero-subtitle">
          Software developer with a Security+ background. I like building real
          systems, understanding how they work under the hood, and explaining
          them clearly.
        </p>
        <div className="hero-actions">
          <Link to="/projects" className="btn">
            View projects
          </Link>
          <Link to="/blog" className="btn-secondary">
            Read the blog
          </Link>
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>Featured Projects</h2>
          <Link to="/projects" className="section-link">
            View all →
          </Link>
        </div>
        <div className="grid">
          {latestProjects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <h2>Latest Posts</h2>
          <Link to="/blog" className="section-link">
            View all →
          </Link>
        </div>
        <div className="grid">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
