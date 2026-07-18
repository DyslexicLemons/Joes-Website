function About() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>About Me</h1>
        <p>Building things that work, securing things that matter</p>
      </header>

      <div className="about-intro">
        <img
          src="/headshot.png"
          alt="Joe Majors"
          className="about-headshot"
        />
        <div className="about-intro-text">
          <p>
            I'm a Logistics Software Engineer with 3+ years of experience in Python, C++, Java, and
            relational databases, specializing in automation and full-stack systems. Indiana University
            graduate with a B.S. in Computer Science and a specialization in Artificial Intelligence.
            I hold a CompTIA Security+ certification and care about building systems that are both
            functional and secure by design.
          </p>
        </div>
      </div>

      <div className="stack">
        <div className="about-section">
          <h2>Experience</h2>

          <div className="experience-item">
            <div className="experience-header">
              <strong>Logistics Software Engineer – Automation</strong>
              <span className="experience-date">December 2024 – Present</span>
            </div>
            <div className="experience-company">KNAPP Logistics | Whiteland, IN</div>
            <ul>
              <li>
                <strong>PLC &amp; Software Development/Installation:</strong> Engineered and deployed SQL,
                Python, C++, Bash, and Java solutions via Azure DevOps CI/CD pipelines to optimize and
                repair tote storage &amp; retrieval software efficiency.
              </li>
              <li>
                <strong>SCADA CLI Dashboard</strong> (Python, JavaScript, Bash, Oracle SQL): Developed a
                terminal-based real-time operations monitoring dashboard integrating live Oracle SQL
                database queries across multiple subsystems, using a decoupled producer-consumer pipeline
                with atomic data writes, modular metric collection, and configurable threshold-driven alerting.
              </li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <strong>IT Supervisor / Consultant</strong>
              <span className="experience-date">August 2022 – December 2024</span>
            </div>
            <div className="experience-company">IU Support Center | Bloomington, IN</div>
            <ul>
              <li>
                <strong>Tech Support:</strong> Provided support and troubleshooting to university faculty,
                staff, and students via ServiceNow, Microsoft Azure, and SCCM — completing over 3,000
                phone calls and 10,000 emails.
              </li>
              <li>
                <strong>Linux Team Sub-Lead:</strong> Specialized in troubleshooting Linux OS issues
                including VPN certificates, software installation, dual-boot, and package management.
              </li>
              <li>
                <strong>Training &amp; Documentation:</strong> Created training materials and scheduling
                for 30+ new hires. Contributed to global KB documentation viewed by 30,000+ students,
                faculty, and staff.
              </li>
              <li>
                <strong>Hiring Team:</strong> Reviewed 300+ resumes, processed new hire applications,
                and conducted 30 interviews.
              </li>
            </ul>
          </div>
        </div>

        <div className="about-section">
          <h2>Technical Stack</h2>
          <p>
            <strong>Proficient (3+ years):</strong> Python, C++, Java, Bash, Oracle/Postgres SQL,
            JavaScript, TypeScript
          </p>
          <p>
            <strong>Tools &amp; Frameworks:</strong> React, SQLAlchemy, FastAPI, Azure DevOps, Docker,
            AWS, Postman, VSCode, RStudio, IntelliJ, Spring Boot
          </p>
          <p>
            <strong>Certifications:</strong> CompTIA Security+
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
