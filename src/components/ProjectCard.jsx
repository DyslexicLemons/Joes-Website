function ProjectCard({ project }) {
  return (
    <article className="card">
      <h3>{project.name}</h3>
      <p className="card-subtitle">{project.stack}</p>
      <p>{project.description}</p>
      <div className="card-links">
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
