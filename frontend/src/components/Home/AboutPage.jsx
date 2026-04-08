import PublicNavbar from "./PublicNavbar";

const AboutPage = () => {
  return (
    <>
      <PublicNavbar />

      
        <div className="w-full max-w-[1100px] bg-white/85 backdrop-blur-md rounded-[28px] p-6 md:p-10 shadow-2xl animate-fade-in border border-white/60 mx-auto">
          <h1 className="mt-0 text-4xl md:text-[42px] text-slate-900 font-extrabold mb-5 tracking-tight">About UniSpot</h1>
          <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium max-w-4xl">
            UniSpot is a smart student vehicle parking and locker management system
            developed to improve convenience, security, and booking control within
            a university environment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="mt-0 mb-3 text-blue-700 text-xl font-bold tracking-tight">Student Features</h3>
              <p className="m-0 text-slate-600 leading-relaxed font-medium">
                Students can register, manage profiles, add vehicle details,
                and access QR-based identity information.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="mt-0 mb-3 text-blue-700 text-xl font-bold tracking-tight">System Purpose</h3>
              <p className="m-0 text-slate-600 leading-relaxed font-medium">
                The system helps organize lockers and parking slots in a more
                efficient and user-friendly way.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <h3 className="mt-0 mb-3 text-blue-700 text-xl font-bold tracking-tight">Management Support</h3>
              <p className="m-0 text-slate-600 leading-relaxed font-medium">
                Admin users can monitor student accounts, control profile status,
                and manage the system more effectively.
              </p>
            </div>
          </div>
        </div>
    
    </>
  );
};

export default AboutPage;