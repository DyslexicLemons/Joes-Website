function About() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>About Me</h1>
        <p>Building things that work, securing things that matter</p>
      </header>
      <div className="stack">
        <div className="about-section">
          <h2>What I Do</h2>
          <p>
            I'm a software developer who believes the best code is code that solves real problems.
            With a Security+ certification and a computer science background, I build systems that
            are both functional and secure by design—especially tools for training, operations, and
            workflow automation.
          </p>
        </div>

        <div className="about-section">
          <h2>Technical Stack</h2>
          <p>
            I work across the full stack with <strong>Python</strong>, <strong>JavaScript/TypeScript</strong>,
            <strong>React</strong>, and <strong>SQL</strong> (PostgreSQL, Oracle). I also write <strong>C++</strong> when
            performance matters. What I enjoy most is understanding systems from the hardware level all the way
            up to the UI—that complete picture helps me build better software.
          </p>
        </div>

        <div className="about-section">
          <h2>Beyond Code</h2>
          <p>When I'm not building software:</p>
          <ul>
            <li>Playing and occasionally over-analyzing games (yes, I min-max everything)</li>
            <li>Experimenting with infrastructure and side projects that probably don't need to exist</li>
            <li>Reading about philosophy, learning theory, and how people think</li>
            <li>Breaking things to understand how they work, then fixing them better</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
