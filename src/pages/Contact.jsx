function Contact() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Contact</h1>
        <p>Reach out if you’d like to talk about work, projects, or ideas.</p>
      </header>

      <div className="stack">
        <p>
          Email:{" "}
          <a href="mailto:jmajors200@gmail.com">jmajors200@gmail.com</a>
        </p>
        <p>
          GitHub:{" "}
          <a
            href="https://github.com/DyslexicLemons"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/DyslexicLemons
          </a>
        </p>
        <p>
          LinkedIn:{" "}
          <a
            href="https://www.linkedin.com/in/joseph-majors-dfwl13123/"
            target="_blank"
            rel="noreferrer"
          >
            https://www.linkedin.com/in/joseph-majors-dfwl13123/
          </a>
        </p>
      </div>
    </div>
  );
}

export default Contact;
