import { projects } from "../data/projects.js";
import ProjectCard from "../components/ProjectCard.jsx";

function Projects() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Projects</h1>
        <p>
          A selection of things I’ve built or contributed to. Many started as
          experiments and grew into real tools.
        </p>
      </header>

      <div className="grid">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Projects;
