import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="logo">Joe Majors</div>
        <nav>
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/projects" className="nav-link">
            Projects
          </NavLink>
          <NavLink to="/blog" className="nav-link">
            Blog
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
