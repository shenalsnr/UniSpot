import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import UnifiedNavbar from "../Shared/UnifiedNavbar";

const BookLockersStatus = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load all bookings on page load
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/locker/bookings/all");
        console.log("📊 Frontend Debug - Bookings received:", res.data);
        setBookings(res.data);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setMessage("Unable to fetch booking data. Please try again later.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((booking) => {
    const studentName = booking.student?.name || (booking.studentId && typeof booking.studentId === 'string' ? `Student ${booking.studentId.slice(-6)}` : "Student Not Found");
    const studentId = booking.student?.studentId || (booking.studentId && typeof booking.studentId === 'string' ? booking.studentId : "N/A");
    
    const searchLower = searchTerm.toLowerCase();
    return (
      studentName.toLowerCase().includes(searchLower) ||
      studentId.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="p-10 text-center font-semibold text-gray-500">
        Loading all booking details...
      </div>
    );
  }

  return (
    <>
      <UnifiedNavbar
        moduleName="BOOKING STATUS"
        centerModule={true}
        rightActions={
          <button
            onClick={() => navigate("/AdminLockerMap")}
            className="px-4 py-2 bg-blue-700 text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300 transition-all hover:scale-105 hover:opacity-90 flex items-center gap-2"
            title="Go Back"
          >
            <ArrowLeft size={18} /> Back
          </button>
        }
      />
      <div className="flex flex-col items-center pb-20 w-full pt-16 min-h-screen relative bg-white">
        {/* Professional White Background */}
        <div className="fixed inset-0 bg-linear-to-br from-white via-slate-50 to-white"></div>
        
        {/* Subtle Geometric Pattern */}
        <div className="fixed inset-0 opacity-3 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)`,
            backgroundSize: '400px 400px, 400px 400px'
          }}></div>
        </div>
        
        {/* Professional Border Accents */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>

        

        <div className="w-full max-w-7xl mx-auto px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-slate-200/50 p-10 rounded-3xl shadow-2xl w-full">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black bg-linear-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-3">
                Complete Booking Database
              </h2>
              <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                All locker booking records stored in the database, including active and expired bookings.
              </p>
            </div>

            {/* Booking Statistics */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-slate-200/60">
              <h3 className="text-2xl font-bold text-slate-900 mb-5">Booking Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50/90 rounded-3xl p-5 border border-blue-100 shadow-sm">
                  <div className="text-2xl font-black text-blue-700">{filteredBookings.length}</div>
                  <div className="text-sm text-blue-800 mt-2">
                    {searchTerm ? 'Filtered Bookings' : 'Total Bookings'}
                  </div>
                </div>
                <div className="bg-green-50/90 rounded-3xl p-5 border border-green-100 shadow-sm">
                  <div className="text-2xl font-black text-green-700">
                    {filteredBookings.filter(b => b.status === 'active').length}
                  </div>
                  <div className="text-sm text-green-800 mt-2">Active Bookings</div>
                </div>
                <div className="bg-red-50/90 rounded-3xl p-5 border border-red-100 shadow-sm">
                  <div className="text-2xl font-black text-red-700">
                    {filteredBookings.filter(b => b.status !== 'active').length}
                  </div>
                  <div className="text-sm text-red-800 mt-2">Expired Bookings</div>
                </div>
                <div className="bg-purple-50/90 rounded-3xl p-5 border border-purple-100 shadow-sm">
                  <div className="text-2xl font-black text-purple-700">
                    {new Set(
                      filteredBookings
                        .map((b) => b.student?.studentId || (typeof b.studentId === 'object' ? b.studentId.studentId : b.studentId))
                        .filter(Boolean)
                    ).size}
                  </div>
                  <div className="text-sm text-purple-800 mt-2">Unique Students</div>
                </div>
              </div>
            </div>

            {message && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {message}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4 gap-4 flex-col sm:flex-row">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">All Booking Records</h2>
                  <p className="text-sm text-slate-500">
                    {searchTerm 
                      ? `Showing ${filteredBookings.length} of ${bookings.length} bookings matching "${searchTerm}"`
                      : "Complete locker booking history from database with student details."
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Refresh Data
                  </button>
                  <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    {filteredBookings.length} {searchTerm ? 'Filtered' : 'Total'} Bookings
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by student name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clear search"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500">
                        Searching for: <span className="font-medium text-gray-700">"{searchTerm}"</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-sm text-slate-500 uppercase tracking-[0.12em]">
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Faculty</th>
                      <th className="px-4 py-3">Locker</th>
                      <th className="px-4 py-3">Booking Date</th>
                      <th className="px-4 py-3">Booking Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => {
                        const studentName = booking.student?.name || (booking.studentId && typeof booking.studentId === 'string' ? `Student ${booking.studentId.slice(-6)}` : "Student Not Found");
                        const studentId = booking.student?.studentId || (booking.studentId && typeof booking.studentId === 'string' ? booking.studentId : "N/A");
                        const studentFaculty = booking.student?.faculty || "N/A";

                        return (
                          <tr key={booking._id} className="bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-3xl">
                            <td className="px-4 py-4 font-medium text-slate-800">
                              {studentName}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {studentId}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {studentFaculty}
                            </td>
                            <td className="px-4 py-4 text-slate-600">{booking.lockerId}</td>
                            <td className="px-4 py-4 text-slate-600">{booking.date}</td>
                            <td className="px-4 py-4 text-slate-600">{booking.startTime} - {booking.endTime}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-6 text-center text-slate-500">
                          {searchTerm 
                            ? `No booking records found matching "${searchTerm}".` 
                            : "No booking records found in database."
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookLockersStatus;