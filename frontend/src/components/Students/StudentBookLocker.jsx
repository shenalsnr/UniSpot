import StudentNavbar from "./StudentNavbar";

const StudentBookLocker = () => {
  return (
    <>
      <StudentNavbar />
      <div className="student-simple-page">
        <div className="student-simple-card fade-up">
          <h1>Locker Booking</h1>
          <p>
            This page is ready for the upcoming locker booking module.
          </p>
          <div className="student-info-box">
            <h3>Coming Soon</h3>
            <p>
              Locker booking functionality will be connected here once your team
              completes that module.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentBookLocker;