import PublicNavbar from "./PublicNavbar";

const AboutPage = () => {
  return (
    <>
      <PublicNavbar />

      <div className="info-page">
        <div className="info-card fade-up">
          <h1>About UniSpot</h1>
          <p>
            UniSpot is a smart student vehicle parking and locker management system
            developed to improve convenience, security, and booking control within
            a university environment.
          </p>

          <div className="info-grid">
            <div className="info-box">
              <h3>Student Features</h3>
              <p>
                Students can register, manage profiles, add vehicle details,
                and access QR-based identity information.
              </p>
            </div>

            <div className="info-box">
              <h3>System Purpose</h3>
              <p>
                The system helps organize lockers and parking slots in a more
                efficient and user-friendly way.
              </p>
            </div>

            <div className="info-box">
              <h3>Management Support</h3>
              <p>
                Admin users can monitor student accounts, control profile status,
                and manage the system more effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;