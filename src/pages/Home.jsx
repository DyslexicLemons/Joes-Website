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
        <div className="hero-badge">Available for opportunities</div>
        <h1 className="hero-title">
          Hey, I'm <span className="name-highlight">Joe</span>
        </h1>
        <p className="hero-subtitle">
          I build <span className="text-accent">real systems</span> that people actually use.
          Software developer with Security+ certification—I care about how things work
          under the hood and making them secure by design.
        </p>
        <div className="hero-skills">
          <span className="skill-tag">Python</span>
          <span className="skill-tag">React</span>
          <span className="skill-tag">PostgreSQL</span>
          <span className="skill-tag">Security+</span>
        </div>
        <div className="hero-actions">
          <Link to="/projects" className="btn">
            View my work
          </Link>
          <Link to="/contact" className="btn-secondary">
            Get in touch
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
