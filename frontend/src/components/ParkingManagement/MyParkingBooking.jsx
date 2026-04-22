import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentApi from '../Students/studentApi';
import axios from 'axios';

import logoSrc from '../../assets/logo.png';
import { generateParkingReceipt } from '../../utils/pdfGenerator';
import { Calendar, Clock, MapPin, Ticket, FileText, X, ArrowLeft, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import UnifiedNavbar from '../Shared/UnifiedNavbar';

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
        // First, test basic connectivity to backend
        try {
          await axios.get('http://localhost:5000/test', { timeout: 5000 });
        } catch (connectErr) {
          console.error('Backend connectivity test failed:', connectErr);
          setError("Cannot connect to backend server. Please ensure it's running.");
          setLoading(false);
          return;
        }

        // Fetch profile
        const profileRes = await studentApi.get('/students/profile');
        if (!profileRes.data) {
          navigate('/student-login');
          return;
        }

        const curStudent = profileRes.data;
        setStudent(curStudent);

        // Fetch active/expired booking — now returns ParkingBooking record directly
        try {
          const timestamp = Date.now();
          const bookingRes = await studentApi.get(`/parking/my-active?t=${timestamp}`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
            timeout: 10000
          });

          // data is now the ParkingBooking document (has slotNumber, zone,
          // vehicleType, vehicleNumber, arrivalTime, leavingTime, bookingDate)
          const fetchedBooking = bookingRes.data.data;

          // If the departure has already been recorded, treat this as no active booking.
          // Covers the overstay case where status stays 'expired' but car has left.
          if (fetchedBooking?.actualDepartureTime) {
            setBooking(null);
            setBookingStatus('active');
            setActualArrivalTime(null);
          } else {
            setBooking(fetchedBooking);
            setBookingStatus(bookingRes.data.bookingStatus || 'active');
            setActualArrivalTime(bookingRes.data.actualArrivalTime || null);
          }
        } catch (bookingErr) {
          console.error('Primary booking fetch failed:', bookingErr);

          // Fallback: Try direct axios call with explicit auth
          try {
            const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
            const token = studentInfo.token;

            if (token) {
              const timestamp = Date.now();
              const directRes = await axios.get(`http://localhost:5000/api/parking/my-active?t=${timestamp}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                },
                timeout: 10000
              });
              const fetchedBookingFallback = directRes.data.data;
              if (fetchedBookingFallback?.actualDepartureTime) {
                setBooking(null);
                setBookingStatus('active');
                setActualArrivalTime(null);
              } else {
                setBooking(fetchedBookingFallback);
                setBookingStatus(directRes.data.bookingStatus || 'active');
                setActualArrivalTime(directRes.data.actualArrivalTime || null);
              }
            } else {
              console.log('No token found in localStorage');
              setBooking(null);
              setBookingStatus('active');
              setActualArrivalTime(null);
            }
          } catch (fallbackErr) {
            console.error('Fallback booking fetch failed:', fallbackErr);
            setBooking(null);
            setBookingStatus('active');
            setActualArrivalTime(null);
          }
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
    if (bookingStatus === 'waiting_for_slot') {
      alert("Your booking is awaiting slot reassignment by security. You cannot cancel at this time.");
      return;
    }
    if (window.confirm("Are you sure you want to cancel this parking booking?")) {
      try {
        // Pass booking._id (ParkingBooking record id) so the backend cancels the right record
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

        <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">Loading booking details...</div>

      </>
    );
  }

  if (error) {
    return (
      <>

        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl font-semibold shadow-sm">{error}</div>

      </>
    );
  }

  // Friendly date display
  const displayDate = booking?.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-indigo-50 to-slate-100 pb-12">
      <UnifiedNavbar
        moduleName="Parking Management"
        centerModule={true}
        rightActions={
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-5 py-2.5 bg-white text-indigo-900 font-bold rounded-full shadow-lg hover:shadow-indigo-200 border border-indigo-100 transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-indigo-950 tracking-tight leading-tight mb-3">
            My Parking <span className="text-indigo-600">Booking</span>
          </h1>
          <p className="text-slate-600 text-lg font-medium">Review your reservation details and manage your assigned parking slot.</p>
        </div>

        {!booking ? (
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-16 text-center border border-white/60 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-200/50">
                <Ticket size={48} className="text-slate-300" />
              </div>
              <h2 className="text-3xl font-black text-indigo-950 mb-4">No Active Bookings Found</h2>
              <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                You don't have any parking reservations scheduled for today. Ready for your next visit?
              </p>
              <button
                onClick={() => navigate('/parking/zones')}
                data-testid="book-slot-btn"
                className="bg-indigo-900 hover:bg-indigo-800 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-indigo-900/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto text-lg"
              >
                Book Your Spot <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Booking Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60">
              {/* Card Header Banner */}
              <div className={`p-8 text-white relative overflow-hidden ${bookingStatus === 'expired'
                  ? 'bg-gradient-to-r from-rose-600 to-red-500'
                  : bookingStatus === 'waiting_for_slot'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-indigo-900'
                }`}>
                {/* Visual patterns */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/10">
                        {bookingStatus === 'expired' ? '⚠️ EXPIRED' : bookingStatus === 'waiting_for_slot' ? '⏳ WAITING FOR REASSIGNMENT' : '✓ ACTIVE BOOKING'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-5xl font-black tracking-tighter">Slot {booking.slotNumber}</h2>
                      <span className="text-2xl font-medium text-white/70">/ {booking.zone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl min-w-[120px]">
                    {bookingStatus === 'expired' ? (
                      <AlertCircle size={40} className="text-white" />
                    ) : bookingStatus === 'waiting_for_slot' ? (
                      <Clock size={40} className="text-white animate-pulse" />
                    ) : (
                      <ShieldCheck size={40} className="text-white" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-80">Verified</span>
                  </div>
                </div>
              </div>

              {/* Status Banners */}
              {bookingStatus === 'waiting_for_slot' && (
                <div className="bg-amber-50 border-b border-amber-200 px-8 py-4 flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-amber-900 font-bold">Slot occupied — waiting for reassignment</p>
                    <p className="text-amber-700/80 text-sm font-medium mt-0.5 leading-relaxed">
                      Your reserved slot is currently occupied due to overstay. Security is reassigning you to an available slot shortly.
                    </p>
                  </div>
                </div>
              )}

              {booking.isReassigned && (
                <div className="bg-emerald-50 border-b border-emerald-200 px-8 py-4 flex items-start gap-4">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-emerald-900 font-bold">Security Reassigned Your Slot</p>
                    <p className="text-emerald-700/80 text-sm font-medium mt-0.5">
                      Moved from {booking.originalSlotNumber} → <span className="font-black underline">{booking.newSlotNumber}</span> due to congestion.
                    </p>
                  </div>
                </div>
              )}

              {/* QR Scan Guidance */}
              <div className="bg-indigo-50/50 border-b border-indigo-100 px-8 py-5 flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-indigo-100">
                  📲
                </div>
                <div>
                  <p className="text-indigo-950 font-black text-sm">
                    {bookingStatus === 'expired'
                      ? 'Confirm departure with security to avoid further penalties.'
                      : 'Scan QR at entry and departure checkpoints.'}
                  </p>
                  <p className="text-indigo-700/70 text-xs font-bold mt-0.5 uppercase tracking-wide">
                    {actualArrivalTime
                      ? `🕒 Arrival logged at ${new Date(actualArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : '⏳ Waiting for entry scan'}
                  </p>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date</h3>
                        <p className="text-xl font-bold text-slate-800">{displayDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</h3>
                        <p className="text-xl font-bold text-slate-800">{booking.arrivalTime} — {booking.leavingTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-50 p-3 rounded-2xl text-slate-600">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle Info</h3>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-slate-800">{booking.vehicleNumber || 'N/A'}</p>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-tighter">
                            {booking.vehicleType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-950 p-3 rounded-2xl text-white">
                        <Ticket size={24} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pass ID</h3>
                        <p className="text-xl font-black text-indigo-900 font-mono tracking-tighter">
                          {booking._id?.toString().slice(-8).toUpperCase() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-slate-100">
                  <button
                    onClick={downloadReceipt}
                    className="group bg-indigo-900 hover:bg-indigo-950 text-white font-black py-4.5 px-6 rounded-2xl shadow-xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <FileText size={22} className="group-hover:scale-110 transition-transform" />
                    Download Receipt
                  </button>
                  {bookingStatus !== 'expired' && (
                    <button
                      onClick={handleCancelBooking}
                      data-testid="cancel-booking-btn"
                      className="group bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-4.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg border border-rose-100"
                    >
                      <X size={22} className="group-hover:rotate-90 transition-transform" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyParkingBooking;
