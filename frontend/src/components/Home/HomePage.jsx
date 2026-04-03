import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import logo from "../../assets/logo.png";
import PageBackground from "../Shared/PageBackground";
import { UserPlus, Car, QrCode, RefreshCcw, Target, Lock } from "lucide-react";

const HomePage = () => {
  return (
    <>
      <PublicNavbar />

      <div className="bg-white min-h-screen">
        <div className="p-4 md:p-12 xl:p-16 max-w-[1400px] mx-auto">
          {/* HOME SECTION */}
          <section id="home" className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center pt-8 min-h-[70vh]">
            <div className="animate-[fade-in_1s_ease-out] mt-10 md:mt-0">
              <span className="inline-block mb-6 px-6 py-3 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-bold tracking-[0.2em] uppercase text-sm shadow-lg">
                WELCOME TO UNISPOT
              </span>

              <h1 className="m-0 mb-8 text-6xl md:text-7xl lg:text-[90px] leading-[1.02] font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                Smart Locker &
                <br />
                <span className="bg-gradient-to-r from-blue-700 to-slate-800 bg-clip-text text-transparent">Parking <br className="lg:hidden" /> Management</span>
              </h1>

              <p className="m-0 mb-12 text-xl md:text-2xl leading-relaxed text-slate-600 max-w-[600px] font-medium">
                The ultimate student-friendly ecosystem designed to manage your campus logistics with frictionless precision. Experience real-time tracking and instant access at your fingertips.
              </p>

              <div className="flex gap-6 flex-wrap">
                <Link to="/student-register" className="inline-block px-10 py-4 rounded-full font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] text-[16px] border border-blue-500">
                  Register Now
                </Link>

                <Link to="/student-login" className="inline-block px-10 py-4 rounded-full font-bold transition-all duration-300 bg-gradient-to-r from-slate-600 to-slate-700 text-white border-2 border-slate-500 hover:from-slate-700 hover:to-slate-800 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl text-[16px]">
                  Student Login
                </Link>
              </div>
            </div>

            <div className="animate-fade-in [animation-delay:200ms] lg:pl-10">
              <div
                className="rounded-3xl p-10 md:p-12 shadow-2xl border border-slate-200 relative overflow-hidden group bg-white"
              >
                {/* Padlock Watermark */}
                <div className="absolute right-4 top-4 opacity-[0.03] pointer-events-none transform transition-transform duration-700 group-hover:scale-110 z-0">
                  <Lock size={180} strokeWidth={2} />
                </div>

                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                  </div>
                  <h3 className="m-0 text-slate-900 text-[28px] font-black tracking-tight">Key Features</h3>
                </div>

                <ul className="pl-0 m-0 list-none relative z-10 flex flex-col gap-8">
                  <li className="flex items-start gap-4 group">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <UserPlus size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-900 font-bold text-[18px] mb-2">Student Registration</h4>
                      <p className="m-0 text-slate-600 text-[15px] leading-relaxed">Seamless onboarding process for all campus members with instant profile activation.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <Car size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-900 font-bold text-[18px] mb-2">Vehicle Management</h4>
                      <p className="m-0 text-slate-600 text-[15px] leading-relaxed">Register multiple vehicles and track parking permits with real-time updates.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <QrCode size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-900 font-bold text-[18px] mb-2">QR Code Access</h4>
                      <p className="m-0 text-slate-600 text-[15px] leading-relaxed">Instant, contactless entry for lockers and parking zones with secure authentication.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <RefreshCcw size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-900 font-bold text-[18px] mb-2">Real-time Updates</h4>
                      <p className="m-0 text-slate-600 text-[15px] leading-relaxed">Live availability status for lockers and parking spots with instant notifications.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <Target size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="m-0 text-slate-900 font-bold text-[18px] mb-2">Smart Navigation</h4>
                      <p className="m-0 text-slate-600 text-[15px] leading-relaxed">Intuitive campus navigation with location-based services and optimized routing.</p>
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
          <section id="about" className="mt-24 pt-20 pb-16 relative">
            {/* Professional Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-white"></div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-6">
                  About UniSpot
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Smart Campus Management System</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 rounded-3xl shadow-2xl p-10 md:p-16 relative overflow-hidden">
                {/* Professional Header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                
                <p className="text-xl md:text-2xl leading-relaxed text-slate-600 mb-12 font-medium text-center max-w-4xl mx-auto">
                  UniSpot is a comprehensive smart student vehicle parking and locker management system 
                  developed to enhance convenience, security, and booking efficiency within 
                  the university environment.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl p-8 border border-blue-100/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
                    {/* Icon Background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="mt-0 mb-4 text-slate-800 text-2xl font-black tracking-tight">Student Features</h3>
                    <p className="m-0 text-slate-600 leading-relaxed font-medium">
                      Students can register profiles, manage personal information, add vehicle details, 
                      and access secure QR-based identity verification for seamless campus services.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl p-8 border border-green-100/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
                    {/* Icon Background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="mt-0 mb-4 text-slate-800 text-2xl font-black tracking-tight">System Purpose</h3>
                    <p className="m-0 text-slate-600 leading-relaxed font-medium">
                      The system organizes lockers and parking slots efficiently, providing real-time 
                      availability tracking and intelligent resource allocation for optimal campus management.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 via-white to-violet-50 rounded-2xl p-8 border border-purple-100/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
                    {/* Icon Background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="mt-0 mb-4 text-slate-800 text-2xl font-black tracking-tight">Management Support</h3>
                    <p className="m-0 text-slate-600 leading-relaxed font-medium">
                      Admin users can monitor student accounts, control profile status, manage system settings, 
                      and generate comprehensive reports for data-driven decision making.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT SECTION */}
          <section id="contact" className="mt-24 pt-20 pb-24 relative">
            {/* Professional Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent mb-6">
                  Contact Us
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-indigo-700">Get In Touch</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 rounded-3xl shadow-2xl p-10 md:p-16 relative overflow-hidden">
                {/* Professional Header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <p className="text-xl md:text-2xl leading-relaxed text-slate-600 mb-12 font-medium text-center max-w-4xl mx-auto">
                  For registration assistance, profile issues, or technical support, 
                  please reach out to the UniSpot management team through any of the following channels.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl p-8 border border-indigo-100/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
                    {/* Icon Background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="mt-0 mb-4 text-slate-800 text-2xl font-black tracking-tight">Email</h3>
                    <p className="m-0 text-slate-700 font-bold text-xl mb-2">support@unispot.com</p>
                    <p className="m-0 text-slate-600 text-sm">24/7 support available</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl p-8 border border-purple-100/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
                    {/* Icon Background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="mt-0 mb-4 text-slate-800 text-2xl font-black tracking-tight">Phone</h3>
                    <p className="m-0 text-slate-700 font-bold text-xl mb-2">+94 77 123 4567</p>
                    <p className="m-0 text-slate-600 text-sm">Mon-Fri: 9AM-6PM</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 rounded-2xl p-8 border border-pink-100/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden group">
                    {/* Icon Background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="mt-0 mb-4 text-slate-800 text-2xl font-black tracking-tight">Office</h3>
                    <p className="m-0 text-slate-700 font-bold text-xl mb-2">Student Services Division</p>
                    <p className="m-0 text-slate-600 text-sm">Campus Administration Block, Level 3</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default HomePage;