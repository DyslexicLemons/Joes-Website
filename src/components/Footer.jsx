function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {year} Joe Majors. All rights reserved.</p>
        <p className="footer-links">
          <a href="https://github.com/DyslexicLemons" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span>·</span>
          <a href="https://www.linkedin.com/in/joseph-majors-dfwl13123/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <span>·</span>
          <a href="mailto:jmajors200@gmail.com">Email</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
