function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {year} Joe Majors. All rights reserved.</p>
        <p className="footer-links">
          <a href="https://github.com/YOUR_GITHUB" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span>·</span>
          <a href="https://www.linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <span>·</span>
          <a href="mailto:youremail@example.com">Email</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
