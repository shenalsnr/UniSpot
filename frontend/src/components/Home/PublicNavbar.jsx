import UnifiedNavbar from "../Shared/UnifiedNavbar";
import { Link } from "react-router-dom";

const PublicNavbar = ({ links, hideLogin = false }) => {
  const defaultLinks = [
    { to: "#home", label: "Home" },
    { to: "#about", label: "About" },
    { to: "#contact", label: "Contact" }
  ];

  return (
    <UnifiedNavbar
      links={links || defaultLinks}
      rightActions={
        !hideLogin && (
          <Link
            to="/student-login"
            className="px-8 py-2.5 bg-white text-blue-700 font-bold text-base rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 border-none"
          >
            Login
          </Link>
        )
      }
    />
  );
};

export default PublicNavbar;