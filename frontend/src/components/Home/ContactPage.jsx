import PublicNavbar from "./PublicNavbar";

const ContactPage = () => {
  return (
    <>
      <PublicNavbar />

      <div className="info-page">
        <div className="info-card fade-up">
          <h1>Contact Us</h1>
          <p>
            For registration help, blocked profile issues, or system support,
            please contact the UniSpot management team.
          </p>

          <div className="info-grid">
            <div className="info-box">
              <h3>Email</h3>
              <p>support@unispot.com</p>
            </div>

            <div className="info-box">
              <h3>Phone</h3>
              <p>+94 77 123 4567</p>
            </div>

            <div className="info-box">
              <h3>Office</h3>
              <p>Student Services Division, Campus Administration Block</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;