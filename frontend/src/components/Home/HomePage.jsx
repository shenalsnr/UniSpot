import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import Footer from "./Footer";

import { UserPlus, Car, QrCode, RefreshCcw, Target, Lock, UserCircle, CarFront, CheckCircle2, Search, Smartphone, MapPin, SquareCheckBig, ShieldCheck } from "lucide-react";
import ImageCarousel from "./ImageCarousel";

import cc from "../../assets/cc.jpg";
import dd from "../../assets/dd.jpg";
import ee from "../../assets/ee.jpg";
import ff from "../../assets/ff.jpg";

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

              <h1 className="m-0 mb-8 text-6xl md:text-7xl lg:text-[85px] leading-[1.05] font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                Secure Locker &
                <br />
                <span className="bg-gradient-to-r from-blue-800 to-slate-800 bg-clip-text text-transparent">Parking <br className="lg:hidden" /> Management</span>
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
              <ImageCarousel images={[cc, dd, ee, ff]} />
            </div>
          </section>

          {/* Feature Grid below */}
          <section className="mt-8 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-10">
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:-translate-y-2 cursor-default group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <UserCircle size={40} />
              </div>
              <h3 className="m-0 mb-3 text-slate-900 text-xl font-bold">Profile Registration</h3>
              <p className="m-0 text-slate-600 leading-relaxed font-medium">
                Create your student profile with faculty details and a secure photo ID in seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:-translate-y-2 cursor-default group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <CarFront size={40} />
              </div>
              <h3 className="m-0 mb-3 text-slate-900 text-xl font-bold">Vehicle Handling</h3>
              <p className="m-0 text-slate-600 leading-relaxed font-medium">
                Add and manage multiple vehicles seamlessly from your dashboard at any time.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 hover:-translate-y-2 cursor-default group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
                <QrCode size={40} />
              </div>
              <h3 className="m-0 mb-3 text-slate-900 text-xl font-bold">QR Verification</h3>
              <p className="m-0 text-slate-600 leading-relaxed font-medium">
                Use your unique QR code for instant, secure access to all campus facilities.
              </p>
            </div>
          </section>

          {/* LOCKER BOOKING SECTION */}
          <section id="lockers" className="mt-24 pt-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
                Easy Locker Booking
              </h2>
              <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                Secure your personal storage in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 transform group-hover:scale-110 transition-all duration-500 border-4 border-white">
                  <Search size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">1. Find</h4>
                <p className="text-slate-600 font-medium">Browse available lockers in real-time by zone and type.</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 transform group-hover:scale-110 transition-all duration-500 border-4 border-white">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">2. Reserve</h4>
                <p className="text-slate-600 font-medium">Confirm your booking with a single click and receive a QR code.</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 transform group-hover:scale-110 transition-all duration-500 border-4 border-white">
                  <Smartphone size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">3. Access</h4>
                <p className="text-slate-600 font-medium">Use your smartphone to unlock and manage your locker instantly.</p>
              </div>
            </div>
          </section>

          {/* PARKING BOOKING SECTION */}
          <section id="parking" className="mt-24 pt-20 border-t border-slate-100">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 bg-clip-text text-transparent mb-6">
                Reliable Parking Booking
              </h2>
              <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                Find and reserve your parking spot in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 transform group-hover:scale-110 transition-all duration-500 border-4 border-white">
                  <MapPin size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">1. Locate Zone</h4>
                <p className="text-slate-600 font-medium">Select your preferred campus zone from the interactive map.</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 transform group-hover:scale-110 transition-all duration-500 border-4 border-white">
                  <SquareCheckBig size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">2. Select Spot</h4>
                <p className="text-slate-600 font-medium">Choose an available spot and confirm your reservation instantly.</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 transform group-hover:scale-110 transition-all duration-500 border-4 border-white">
                  <ShieldCheck size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">3. Park & Secure</h4>
                <p className="text-slate-600 font-medium">Navigate to your spot and enjoy secure, monitored campus parking.</p>
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section id="about" className="mt-24 pt-20 pb-16 relative">
            {/* Professional Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-white"></div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-6">
                  About UniSpot
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Smart Campus Management System</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
                <p className="text-xl md:text-2xl leading-relaxed text-slate-700 mb-12 font-semibold text-center max-w-4xl mx-auto">
                  UniSpot is an intelligent student vehicle parking and locker management system 
                  designed for maximum campus efficiency and booking convenience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 transition-all hover:bg-slate-50 hover:shadow-md group">
                    <div className="w-14 h-14 bg-white text-blue-600 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Student Features</h3>
                    <p className="m-0 text-slate-600 leading-relaxed font-medium">
                      Manage personal profiles, vehicle records, and access secure QR-based verification in one central dashboard.
                    </p>
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 transition-all hover:bg-slate-50 hover:shadow-md group">
                    <div className="w-14 h-14 bg-white text-blue-600 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">System Purpose</h3>
                    <p className="m-0 text-slate-600 leading-relaxed font-medium">
                      Optimized resource allocation with real-time tracking for lockers and parking spots, ensuring zero friction.
                    </p>
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 transition-all hover:bg-slate-50 hover:shadow-md group">
                    <div className="w-14 h-14 bg-white text-blue-600 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                    </div>
                    <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Management Support</h3>
                    <p className="m-0 text-slate-600 leading-relaxed font-medium">
                      Advanced administrative tools for profile control, system configuration, and data-driven reporting.
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
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent mb-6">
                  Contact Us
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-indigo-700">Get In Touch</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
                <p className="text-xl md:text-2xl leading-relaxed text-slate-700 mb-12 font-semibold text-center max-w-4xl mx-auto">
                  For registration assistance, profile issues, or technical support, 
                  please reach out to our management team.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md group">
                    <div className="w-14 h-14 bg-white text-indigo-600 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Email</h3>
                    <p className="m-0 text-slate-700 font-bold text-lg mb-1">support@unispot.com</p>
                    <p className="m-0 text-slate-500 text-sm">24/7 dedicated support</p>
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md group">
                    <div className="w-14 h-14 bg-white text-indigo-600 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Phone</h3>
                    <p className="m-0 text-slate-700 font-bold text-lg mb-1">+94 77 123 4567</p>
                    <p className="m-0 text-slate-500 text-sm">Mon-Fri: 9AM - 6PM</p>
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md group">
                    <div className="w-14 h-14 bg-white text-indigo-600 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-0 mb-4 text-slate-900 text-xl font-bold">Office</h3>
                    <p className="m-0 text-slate-700 font-bold text-lg mb-1">Student Services Division</p>
                    <p className="m-0 text-slate-500 text-sm">Administration Block, L3</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;