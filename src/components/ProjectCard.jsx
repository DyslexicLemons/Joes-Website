import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  return (
    <article className="card">
      <h3>
        {project.detailPath ? (
          <Link to={project.detailPath}>{project.name}</Link>
        ) : (
          project.name
        )}
      </h3>
      <p className="card-subtitle">{project.stack}</p>
      <p>{project.description}</p>
      <div className="card-links">
        {project.detailPath && (
          <Link to={project.detailPath}>Read the write-up →</Link>
        )}
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer">
            Source
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noreferrer">
            Live Demo
          </a>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
