import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

const UnifiedNavbar = ({ title = "UniSpot", moduleName, links = [], rightActions, centerModule = false }) => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[oklch(48.8%_0.243_264.376)] border-b border-white/20 shadow-xl px-4 md:px-8 py-2 md:py-3 flex justify-between items-center transition-all relative">
      {/* Left Area: Logo and Module Name */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="UniSpot Logo" className="h-12 md:h-16 w-auto object-contain drop-shadow-sm" />
          {title && (
            <span className="font-extrabold text-xl md:text-2xl tracking-wider text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {title}
            </span>
          )}
        </Link>

        {moduleName && !centerModule && (
          <span className="text-white/90 text-sm md:text-base font-bold uppercase tracking-wide border-l-2 border-white/40 pl-3 ml-3">
            {moduleName}
          </span>
        )}
      </div>

      {/* Center Area: Module Name or Links */}
      {moduleName && centerModule ? (
        <h1 className="hidden md:block absolute left-1/2 -translate-x-1/2 text-xl md:text-2xl font-extrabold text-white tracking-widest uppercase whitespace-nowrap drop-shadow-md">
          {moduleName}
        </h1>
      ) : (
        links.length > 0 && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 space-x-6 lg:space-x-10 items-center">
            {links.map((link, idx) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={idx}
                  to={link.to}
                  className={`text-lg font-bold tracking-wide transition-all duration-300 relative group pb-1 ${
                    isActive 
                      ? "text-white" 
                      : "text-blue-100 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span className={`absolute left-0 bottom-0 w-full h-[3px] bg-white rounded-full transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Right Area: Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {rightActions && (
          <div className="flex items-center gap-2">
            {rightActions}
          </div>
        )}
      </div>
    </nav>
  );
};

export default UnifiedNavbar;
