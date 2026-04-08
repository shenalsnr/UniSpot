import logo from "../../assets/logo.png";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-slate-900 text-white pt-20 pb-10 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-lg shadow-blue-500/20">
                <img src={logo} alt="UniSpot Logo" className="w-12 h-12 object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tight uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">UniSpot</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium max-w-sm">
              Developing a smarter university ecosystem through centralized locker and parking management systems.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-20">
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4 list-none p-0 m-0">
              {["Home", "About", "Contact", "Services"].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-slate-400 hover:text-blue-400 transition-colors duration-300 font-medium">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="text-blue-500 mt-1" size={20} />
                <span className="text-slate-400 font-medium italic">support@unispot.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-blue-500 mt-1" size={20} />
                <span className="text-slate-400 font-medium">+94 77 123 4567</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-500 mt-1" size={20} />
                <span className="text-slate-400 font-medium">Student Services Division, Level 3, Administration Block</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-medium m-0">
            © {new Date().getFullYear()} UniSpot Smart Management System. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors decoration-none">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
