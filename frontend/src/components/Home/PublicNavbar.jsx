import UnifiedNavbar from "../Shared/UnifiedNavbar";
import { Link } from "react-router-dom";

const PublicNavbar = () => {
  return (
    <UnifiedNavbar
      
      links={[
        { to: "#home", label: "Home" },
        { to: "#about", label: "About" },
        { to: "#contact", label: "Contact" }
      ]}
      rightActions={
        <Link
          to="/student-register"
          className="group relative px-6 py-3 md:px-8 md:py-3.5 bg-linear-to-br from-blue-600 via-blue-700 to-blue-500 hover:via-blue-700 hover:to-blue-700 text-white font-black text-sm md:text-base rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 backdrop-blur-sm"
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
        </Link>
      }
    />
  );
};

export default PublicNavbar;