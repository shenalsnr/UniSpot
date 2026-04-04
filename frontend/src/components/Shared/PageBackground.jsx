import React from "react";

const PageBackground = ({ children, className = "" }) => {
  return (
    <div className={`min-h-[calc(100vh-90px)] relative overflow-hidden bg-slate-50 ${className}`}>
      
      {/* Abstract Wavy Background Vectors */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none opacity-20 z-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[150px] md:h-[300px]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-blue-400"></path>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none opacity-10 mt-[-5px] z-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[200px] md:h-[400px]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.15,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.44,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-blue-300"></path>
        </svg>
      </div>
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-[20%] left-[10%] w-4 h-4 border-2 border-blue-400/30 rounded-full animate-bounce z-0"></div>
      <div className="absolute top-[40%] left-[50%] w-3 h-3 border-2 border-blue-400/30 rounded-full animate-pulse z-0"></div>
      <div className="absolute top-[60%] left-[80%] w-4 h-4 border-2 border-blue-400/30 rounded-full z-0"></div>
      <div className="absolute top-[70%] left-[60%] w-3 h-3 border-2 border-blue-400/30 rounded-full animate-bounce z-0"></div>
      <div className="absolute top-[30%] left-[85%] w-3 h-3 border-2 border-blue-400/30 rotate-45 animate-pulse z-0"></div>
      <div className="absolute top-[80%] left-[30%] w-3 h-3 border-2 border-blue-400/30 rotate-12 z-0"></div>
      <div className="absolute top-[85%] left-[80%] flex gap-1 opacity-40 z-0">
         <div className="w-1 h-1 bg-blue-400 rounded-full"></div><div className="w-1 h-1 bg-blue-400 rounded-full"></div><div className="w-1 h-1 bg-blue-400 rounded-full"></div>
      </div>
      <div className="absolute bottom-[10%] left-[10%] flex gap-1 opacity-40 z-0">
         <div className="w-1 h-1 bg-blue-400 rounded-full"></div><div className="w-1 h-1 bg-blue-400 rounded-full"></div><div className="w-1 h-1 bg-blue-400 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
