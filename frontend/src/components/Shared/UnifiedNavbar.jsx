import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

const UnifiedNavbar = ({ title = "", moduleName, links = [], leftActions, rightActions, centerModule = false }) => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-blue-700 bg-linear-to-br from-blue-600 via-blue-700 to-blue-500 border-b border-white/30 shadow-2xl px-4 md:px-8 py-3 md:py-4 flex justify-between items-center transition-all relative backdrop-blur-sm">
      {/* Left Area: Logo and Module Name */}
      <div className="flex items-center gap-4">
        {leftActions && (
          <div className="flex items-center">
            {leftActions}
          </div>
        )}
        <div className="flex items-center gap-3 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30 shadow-lg">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group">
            <div className="relative">
              <img src={logo} alt="Logo" className="h-16 md:h-20 w-auto object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
            {title && (
              <span className="font-black text-xl md:text-2xl tracking-wider text-slate-800 drop-shadow-sm">
                {title}
              </span>
            )}
          </Link>
        </div>

        {moduleName && !centerModule && (
          <span className="text-white text-sm md:text-base font-black uppercase tracking-widest border-l-2 border-white/50 pl-4 ml-4 drop-shadow-sm">
            {moduleName}
          </span>
        )}
      </div>

      {/* Center Area: Module Name or Links */}
      {moduleName && centerModule ? (
        <h1 className="hidden md:block absolute left-1/2 -translate-x-1/2 text-xl md:text-2xl font-black text-white tracking-widest uppercase whitespace-nowrap drop-shadow-lg">
          {moduleName}
        </h1>
      ) : (
        links.length > 0 && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 space-x-8 lg:space-x-12 items-center">
            {links.map((link, idx) => {
              // Support active state for hash links by checking window.location.hash
              const isHash = link.to.startsWith('#');
              const isActive = isHash 
                 ? location.hash === link.to || (link.to === '#home' && !location.hash) 
                 : location.pathname === link.to;

              const linkClasses = `text-lg font-black tracking-wide transition-all duration-300 relative group pb-2 ${
                isActive ? "text-white" : "text-white/80 hover:text-white"
              }`;

              if (isHash) {
                return (
                  <a
                    key={idx}
                    href={link.to}
                    className={linkClasses}
                  >
                    {link.label}
                    <span className={`absolute left-0 bottom-0 w-full h-[3px] bg-gradient-to-r from-white to-white/80 rounded-full transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
                  </a>
                );
              }

              return (
                <Link
                  key={idx}
                  to={link.to}
                  className={linkClasses}
                >
                  {link.label}
                  <span className={`absolute left-0 bottom-0 w-full h-[3px] bg-gradient-to-r from-white to-white/80 rounded-full transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Right Area: Actions */}
      {rightActions && (
        <div className="flex items-center gap-3">
          {rightActions}
        </div>
      )}
    </nav>
  );
};

export default UnifiedNavbar;
