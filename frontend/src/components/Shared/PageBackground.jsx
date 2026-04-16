import React from "react";

const PageBackground = ({ children, className = "" }) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}
      style={{
        backgroundAttachment: "fixed",
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
        `,
      }}
    >
      {children}
    </div>
  );
};

export default PageBackground;
