import NavBar from "./NavBar.jsx";
import Footer from "./Footer.jsx";

function Layout({ children }) {
  return (
    <div className="app-root">
      <NavBar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
