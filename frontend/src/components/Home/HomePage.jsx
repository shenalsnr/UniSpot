import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import logo from "../../assets/logo.png";
import PageBackground from "../Shared/PageBackground";
import { UserPlus, Car, QrCode, RefreshCcw, Target, Lock } from "lucide-react";

const HomePage = () => {
  return (
    <>
      <PublicNavbar />

      <PageBackground>
        <div className="p-4 md:p-12 xl:p-16 max-w-[1400px] mx-auto">
          {/* HOME SECTION */}
          <section id="home" className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center pt-8 min-h-[70vh]">
            <div className="animate-[fade-in_1s_ease-out] mt-10 md:mt-0">
              <span className="inline-block mb-6 px-5 py-2 rounded-full border border-[oklch(48.8%_0.243_264.376)]/20 bg-[#eef4ff] text-[oklch(48.8%_0.243_264.376)] font-bold tracking-[0.15em] uppercase text-xs shadow-sm">
                WELCOME TO UNISPOT
              </span>

              <h1 className="m-0 mb-6 text-5xl md:text-6xl lg:text-[76px] leading-[1.05] font-black tracking-tight text-slate-800">
                Smart Locker &
                <br />
                <span className="text-slate-800">Parking <br className="lg:hidden" /> Management</span>
              </h1>

              <p className="m-0 mb-10 text-lg md:text-xl leading-relaxed text-slate-500 max-w-[550px] font-medium">
                The ultimate student-friendly ecosystem designed to manage your campus logistics with frictionless precision. Experience real-time tracking and instant access at your fingertips.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Link to="/student-register" className="inline-block px-8 py-4 rounded-[100px] font-bold transition-all duration-300 bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg shadow-[oklch(48.8%_0.243_264.376)]/30 hover:-translate-y-1 hover:scale-[1.02] hover:opacity-90 text-[16px]">
                  Register Now
                </Link>

                <Link to="/student-login" className="inline-block px-8 py-4 rounded-[100px] font-bold transition-all duration-300 bg-slate-100 text-slate-800 border-2 border-transparent hover:-translate-y-1 hover:scale-[1.02] hover:bg-slate-200 text-[16px]">
                  Student Login
                </Link>
              </div>
            </div>

            <div className="animate-fade-in [animation-delay:200ms] lg:pl-10">
              <div 
                className="rounded-[24px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group"
                style={{ background: 'linear-gradient(346deg, rgba(255, 255, 255, 1) 0%, rgba(146, 180, 224, 1) 21%, rgba(250, 250, 250, 1) 50%, rgba(201, 215, 242, 1) 100%)' }}
              >
                {/* Padlock Watermark */}
                <div className="absolute right-4 top-4 opacity-[0.03] pointer-events-none transform transition-transform duration-700 group-hover:scale-110 z-0">
                  <Lock size={180} strokeWidth={2} />
                </div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="text-[oklch(48.8%_0.243_264.376)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  </div>
                  <h3 className="m-0 text-slate-800 text-[26px] font-extrabold tracking-tight">System Highlights</h3>
                </div>
                
                <ul className="pl-0 m-0 list-none relative z-10 flex flex-col gap-6">
                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-[oklch(48.8%_0.243_264.376)] rounded-[12px]">
                      <UserPlus size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-800 font-bold text-[16px]">Student profile registration</h4>
                      <p className="m-0 text-slate-500 text-[14px] mt-1 font-medium">Seamless onboarding process for all campus members.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-[oklch(48.8%_0.243_264.376)] rounded-[12px]">
                      <Car size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-800 font-bold text-[16px]">Vehicle management</h4>
                      <p className="m-0 text-slate-500 text-[14px] mt-1 font-medium">Register multiple vehicles and track parking permits.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-[oklch(48.8%_0.243_264.376)] rounded-[12px]">
                      <QrCode size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-800 font-bold text-[16px]">QR code access</h4>
                      <p className="m-0 text-slate-500 text-[14px] mt-1 font-medium">Instant, contactless entry for lockers and parking zones.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-[oklch(48.8%_0.243_264.376)] rounded-[12px]">
                      <RefreshCcw size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-800 font-bold text-[16px]">Real-time updates</h4>
                      <p className="m-0 text-slate-500 text-[14px] mt-1 font-medium">Live availability status for lockers and parking spots.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-[oklch(48.8%_0.243_264.376)] rounded-[12px]">
                      <Target size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-800 font-bold text-[16px]">Status tracking system</h4>
                      <p className="m-0 text-slate-500 text-[14px] mt-1 font-medium">Detailed history and status logs of all activities.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Feature Grid below */}
          <section className="mt-8 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-10">
            <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md cursor-default group">
              <div className="text-[42px] mb-5 transform transition-transform group-hover:scale-110">👤</div>
              <h3 className="m-0 mb-3 text-slate-800 text-xl font-extrabold tracking-wide">Profile Registration</h3>
              <p className="m-0 text-slate-500 leading-relaxed font-medium">
                Students can create profiles with personal details, photo, and faculty information.
              </p>
            </div>

            <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md cursor-default group">
              <div className="text-[42px] mb-5 transform transition-transform group-hover:scale-110">🚗</div>
              <h3 className="m-0 mb-3 text-slate-800 text-xl font-extrabold tracking-wide">Vehicle Handling</h3>
              <p className="m-0 text-slate-500 leading-relaxed font-medium">
                Students can add vehicle details later and update them seamlessly from the profile page.
              </p>
            </div>

            <div className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md cursor-default group">
              <div className="text-[42px] mb-5 transform transition-transform group-hover:scale-110">📱</div>
              <h3 className="m-0 mb-3 text-slate-800 text-xl font-extrabold tracking-wide">QR Verification</h3>
              <p className="m-0 text-slate-500 leading-relaxed font-medium">
                Each student receives a unique QR code ensuring secure identity and booking confirmations.
              </p>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section id="about" className="mt-20 pt-16 border-t border-slate-200/50">
            <div className="w-full max-w-[1100px] bg-white/85 backdrop-blur-md rounded-[28px] p-6 md:p-10 shadow-xl border border-white/60 mx-auto">
              <h2 className="mt-0 text-4xl md:text-[42px] text-slate-900 font-extrabold mb-5 tracking-tight">About UniSpot</h2>
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
          </section>

          {/* CONTACT SECTION */}
          <section id="contact" className="mt-20 pt-16 pb-20 border-t border-slate-200/50">
             <div className="w-full max-w-[1100px] bg-white/85 backdrop-blur-md rounded-[28px] p-6 md:p-10 shadow-xl border border-white/60 mx-auto">
              <h2 className="mt-0 text-4xl md:text-[42px] text-slate-900 font-extrabold mb-5 tracking-tight">Contact Us</h2>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg font-medium max-w-4xl">
                For registration help, blocked profile issues, or system support,
                please contact the UniSpot management team.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                  <h3 className="mt-0 mb-2 text-blue-700 text-xl font-bold tracking-tight">Email</h3>
                  <p className="m-0 text-slate-700 font-bold text-lg">support@unispot.com</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                  <h3 className="mt-0 mb-2 text-blue-700 text-xl font-bold tracking-tight">Phone</h3>
                  <p className="m-0 text-slate-700 font-bold text-lg">+94 77 123 4567</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                  <h3 className="mt-0 mb-2 text-blue-700 text-xl font-bold tracking-tight">Office</h3>
                  <p className="m-0 text-slate-700 font-medium">Student Services Division, Campus Administration Block</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </PageBackground>
    </>
  );
};

export default HomePage;