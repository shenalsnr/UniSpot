import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { showAlert } from '../Shared/BeautifulAlert';
import { showConfirm } from '../Shared/BeautifulConfirm';
import PageBackground from '../Shared/PageBackground';
import { Calendar, Clock, MapPin, X, Download } from 'lucide-react';

const MyBookLocker = () => {
  const [student, setStudent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch student profile and their locker bookings
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Get student info from localStorage
        const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
        const token = studentInfo.token;

        if (!token) {
          navigate('/student-login');
          return;
        }

        setStudent(studentInfo);

        // Fetch student's locker bookings
        try {
          const bookingRes = await axios.get('http://localhost:5000/api/locker/bookings/student/my-bookings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookings(bookingRes.data || []);
        } catch (bookingErr) {
          console.error("Error fetching bookings:", bookingErr);
          setBookings([]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    const confirmed = await showConfirm({
      title: 'Cancel Locker Booking',
      message: 'Are you sure you want to cancel this locker booking? This action cannot be undone.',
      confirmText: 'Yes, Cancel Booking',
      cancelText: 'Keep Booking',
      type: 'warning'
    });

    if (!confirmed) return;

    try {
      const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
      const token = studentInfo.token;

      await axios.delete(`http://localhost:5000/api/locker/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the cancelled booking from state
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      showAlert('success', 'Locker booking cancelled successfully!', 'Success');
    } catch (err) {
      console.error("Cancel error:", err);
      showAlert('error', 'Failed to cancel booking. Please try again.');
    }
  };

  const downloadReceipt = (booking) => {
    // Create a simple text receipt for now
    const receiptContent = `
UNIVERSITY LOCKER BOOKING RECEIPT
================================

Student Information:
- Name: ${student?.name || 'N/A'}
- Student ID: ${student?.studentId || 'N/A'}
- Faculty: ${student?.faculty || 'N/A'}

Booking Details:
- Locker ID: ${booking.lockerId}
- Location: ${booking.locationName || 'N/A'}
- Date: ${booking.date}
- Time: ${booking.startTime} - ${booking.endTime}
- Status: ${booking.status}
- Booking ID: ${booking._id}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    // Create and download text file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `locker-receipt-${booking.lockerId}-${booking.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <>
        <PageBackground className="flex justify-center items-center p-4 md:p-8">
          <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">Loading your locker bookings...</div>
        </PageBackground>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageBackground className="flex justify-center items-center p-4 md:p-8">
          <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl font-semibold shadow-sm">{error}</div>
        </PageBackground>
      </>
    );
  }

  return (
    <>
      <PageBackground className="p-6 md:p-10 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow-sm mb-2">My Locker Bookings</h1>
            <p className="text-blue-100 font-medium">View and manage your current locker bookings</p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-10 text-center border border-white/60">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Locker Bookings</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">You don't have any locker bookings at the moment.</p>
              <Link to="/lockers">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1"
                >
                  Book a Locker
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const displayDate = booking.date
                  ? new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A';

                return (
                  <div key={booking._id} className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/60">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
                      <div className="z-10">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                          booking.status === 'active' 
                            ? 'bg-green-500/30 text-green-100' 
                            : 'bg-gray-500/30 text-gray-100'
                        }`}>
                          Status: {booking.status}
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight">Locker {booking.lockerId}</h2>
                        <p className="text-blue-100 font-medium opacity-90">{booking.locationName || 'Main Campus'}</p>
                      </div>
                      <div className="z-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm ${
                          booking.status === 'active' 
                            ? 'bg-green-500/30' 
                            : 'bg-gray-500/30'
                        }`}>
                          <MapPin size={32} className="text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-100 pb-8">
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Calendar size={16} />
                            Booking Date
                          </h3>
                          <p className="text-lg font-bold text-gray-800 mb-1">{displayDate}</p>
                          <p className="text-gray-600 font-medium inline-flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" />
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Location Details</h3>
                          <p className="text-lg font-bold text-gray-800 mb-1">{booking.locationName || 'Main Campus'}</p>
                          <p className="text-gray-600 font-medium">Locker ID: {booking.lockerId}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Booking Reference</p>
                            <p className="font-mono text-lg font-black text-blue-900 tracking-wider">{booking._id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Student ID</p>
                            <p className="font-mono text-gray-600 font-bold">{student?.studentId}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mb-4">
                        <button
                          onClick={() => downloadReceipt(booking)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Download size={20} />
                          Download Receipt
                        </button>
                        {booking.status === 'active' && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-4 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                          >
                            <X size={20} />
                            Cancel Booking
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => navigate('/student-dashboard')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageBackground>
    </>
  );
};

export default MyBookLocker;