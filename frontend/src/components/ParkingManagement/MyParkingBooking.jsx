import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentApi from '../Students/studentApi';

import logoSrc from '../../assets/logo.png';
import { generateParkingReceipt } from '../../utils/pdfGenerator';

const MyParkingBooking = () => {
  const [student, setStudent] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('active');
  const [actualArrivalTime, setActualArrivalTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch student profile and their active booking
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Fetch profile
        const profileRes = await studentApi.get('/students/profile');
        if (!profileRes.data) {
          navigate('/student-login');
          return;
        }

        const curStudent = profileRes.data;
        setStudent(curStudent);

        // Fetch active booking (slot stays occupied even when expired)
        try {
          const bookingRes = await studentApi.get('/parking/my-active');
          setBooking(bookingRes.data.data);
          setBookingStatus(bookingRes.data.bookingStatus || 'active');
          setActualArrivalTime(bookingRes.data.actualArrivalTime || null);
        } catch (bookingErr) {
          setBooking(null);
          setBookingStatus('active');
          setActualArrivalTime(null);
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

  const handleCancelBooking = async () => {
    if (bookingStatus === 'expired') {
      alert("This booking has expired. Cancellation is not available. Please contact security or administration.");
      return;
    }
    if (window.confirm("Are you sure you want to cancel this parking booking?")) {
      try {
        const res = await studentApi.put(`/parking/${booking._id}/cancel`);
        if (res.data?.success) {
          setBooking(null);
          setBookingStatus('active');
          setActualArrivalTime(null);
          alert("Booking cancelled successfully.");
        } else {
          alert("Failed to cancel booking.");
        }
      } catch (err) {
        console.error("Cancel error:", err);
        alert(err.response?.data?.message || "Error connecting to server.");
      }
    }
  };

  const downloadReceipt = () => {
    if (!booking || !student) return;
    generateParkingReceipt(booking, student, logoSrc);
  };


  if (loading) {
    return (
      <>
        <PageBackground className="flex justify-center items-center p-4 md:p-8">
          <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">Loading booking details...</div>
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

  // Friendly date display
  const displayDate = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <>
      <PageBackground className="p-6 md:p-10 font-sans">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 drop-shadow-sm mb-2">My Parking Booking</h1>
            <p className="text-blue-100 font-medium">Manage and view your currently active parking spot</p>
          </div>

          {!booking ? (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-10 text-center border border-white/60">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Active Bookings</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">You don't have any active parking bookings at the moment.</p>
              <button
                onClick={() => navigate('/parking/zones')}
                className="bg-[oklch(48.8%_0.243_264.376)] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1"
              >
                Book Parking Slot
              </button>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/60">
              <div className={`p-6 text-white flex justify-between items-center relative overflow-hidden ${bookingStatus === 'expired' ? 'bg-gradient-to-r from-orange-600 to-red-500' : 'bg-gradient-to-r from-blue-600 to-[oklch(48.8%_0.243_264.376)]'}`}>
                <div className="z-10">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${bookingStatus === 'expired' ? 'bg-white/20' : 'bg-white/20'}`}>
                    Status: {bookingStatus === 'expired' ? 'Expired ⚠️' : 'Active'}
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight">Slot {booking.slotNumber}</h2>
                  <p className="text-blue-100 font-medium opacity-90">{booking.zone}</p>
                </div>
                <div className="z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    {bookingStatus === 'expired'
                      ? <span className="text-3xl">⏰</span>
                      : <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    }
                  </div>
                </div>
              </div>

              {/* Expired warning banner */}
              {bookingStatus === 'expired' && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-3">
                  <span className="text-red-500 text-xl flex-shrink-0 mt-0.5">🚨</span>
                  <div>
                    <p className="text-red-800 font-bold text-sm">Booking time has expired</p>
                    <p className="text-red-600 text-xs mt-0.5">
                      Your booked time has passed without a confirmed departure scan. Your slot is still reserved until Security confirms your departure. A penalty may have been applied.
                    </p>
                  </div>
                </div>
              )}

              {/* QR Scan Guidance Banner */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
                <span className="text-amber-500 text-xl">📲</span>
                <div>
                  <p className="text-amber-800 font-bold text-sm">
                    {bookingStatus === 'expired'
                      ? 'Show your QR to security to confirm departure and release the slot.'
                      : 'Show your QR code to security when arriving and leaving.'}
                  </p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    {actualArrivalTime
                      ? `✓ Arrival recorded at ${new Date(actualArrivalTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} — show QR again when leaving`
                      : 'Arrival not yet scanned — security will scan on entry'}
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-100 pb-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Schedule</h3>
                    <p className="text-lg font-bold text-gray-800 mb-1">{displayDate}</p>
                    <p className="text-gray-600 font-medium inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {booking.arrivalTime} - {booking.leavingTime}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle</h3>
                    <p className="text-lg font-bold text-gray-800 mb-1">{booking.vehicleType || 'N/A'}</p>
                    <p className="text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded inline-block text-sm">{booking.vehicleNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 mb-8 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Booking Reference</p>
                    <p className="font-mono text-lg font-black text-blue-900 tracking-wider">REF-ACTIVE</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Assigned Student ID</p>
                    <p className="font-mono text-gray-600 font-bold">{student.studentId}</p>
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <button
                    onClick={downloadReceipt}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Receipt PDF
                  </button>
                  {bookingStatus !== 'expired' && (
                    <button
                      onClick={handleCancelBooking}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-4 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
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
          )}
        </div>
      </PageBackground>
    </>
  );
};

export default MyParkingBooking;
