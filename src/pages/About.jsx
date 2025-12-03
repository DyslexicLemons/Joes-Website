function About() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>About</h1>
      </header>
      <div className="stack">
        <p>
          I’m Joe, a software developer with a background in computer science and
          cybersecurity (Security+). I like building tools that are actually
          used by people—especially around training, operations, and workflow
          automation.
        </p>
        <p>
          I’ve worked with Python, C++, JavaScript/TypeScript, SQL (PostgreSQL,
          Oracle), and I enjoy learning how systems behave from the hardware
          level up to the UI.
        </p>
        <p>
          Outside of work, I:
        </p>
        <ul>
          <li>Play and occasionally over-analyze games</li>
          <li>Hack on side projects and experiment with infrastructure</li>
          <li>Read about philosophy and how people think/learn</li>
        </ul>
      </div>
    </div>
  );
}

export default About;
