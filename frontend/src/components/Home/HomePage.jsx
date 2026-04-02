import { Link } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

const HomePage = () => {
  return (
    <>
      <PublicNavbar />

      <div className="home-page">
        <section className="home-hero">
          <div className="home-hero-left fade-up">
            <span className="home-badge">Welcome to UniSpot</span>

            <h1>
              Smart Locker & Parking
              <br />
              <span>Management for Students</span>
            </h1>

            <p>
              UniSpot helps students register profiles, manage vehicle details,
              generate QR codes, and use a modern university locker and parking system
              with better control and convenience.
            </p>

            <div className="home-buttons">
              <Link to="/student-register" className="primary-btn">
                Register Now
              </Link>

              <Link to="/student-login" className="secondary-btn">
                Student Login
              </Link>
            </div>
          </div>

          <div className="home-hero-right fade-up-delay">
            <div className="glass-feature-card">
              <h3>System Highlights</h3>
              <ul>
                <li>Student profile registration</li>
                <li>Vehicle management</li>
                <li>Unique QR generation</li>
                <li>Locker and parking support</li>
                <li>Marks and status tracking</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <div className="feature-card floating-card">
            <div className="feature-icon">👤</div>
            <h3>Profile Registration</h3>
            <p>
              Students can create profiles with personal details, photo, and faculty information.
            </p>
          </div>

          <div className="feature-card floating-card">
            <div className="feature-icon">🚗</div>
            <h3>Vehicle Handling</h3>
            <p>
              Students can add vehicle details later and update them from the profile page.
            </p>
          </div>

          <div className="feature-card floating-card">
            <div className="feature-icon">📱</div>
            <h3>QR Verification</h3>
            <p>
              Each student gets a unique QR code for identity and booking confirmation.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;