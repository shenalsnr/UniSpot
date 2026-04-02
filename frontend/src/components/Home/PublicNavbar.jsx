import UnifiedNavbar from "../Shared/UnifiedNavbar";
import { Link } from "react-router-dom";

const PublicNavbar = () => {
  return (
    <UnifiedNavbar
      title="UniSpot"
      
      links={[
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/contact", label: "Contact" }
      ]}
      rightActions={
        <Link
          to="/student-register"
          className="px-5 py-2 md:px-7 md:py-2.5 bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90 text-white font-bold rounded-[100px] text-sm md:text-[15px] shadow-sm transition-all hover:-translate-y-0.5"
        >
          Get Started
        </Link>
      }
    />
  );
};

export default PublicNavbar;