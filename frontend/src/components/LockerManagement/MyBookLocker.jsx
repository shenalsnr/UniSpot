import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import logo from '../../assets/logo.png';
import { showAlert } from '../Shared/BeautifulAlert';
import { showConfirm } from '../Shared/BeautifulConfirm';

import { Calendar, Clock, MapPin, X, Download, ArrowLeft } from 'lucide-react';
import UnifiedNavbar from '../Shared/UnifiedNavbar';

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
          // 1. Fetch full student profile to get the latest QR code and data
          const profileRes = await axios.get('http://localhost:5000/api/students/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStudent({ ...studentInfo, ...profileRes.data });

          // 2. Fetch student's locker bookings
          const bookingRes = await axios.get('http://localhost:5000/api/locker/bookings/student/my-bookings', {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Only show active bookings - auto-remove expired/past bookings from this view
          const allBookings = bookingRes.data || [];
          const activeBookings = allBookings.filter(booking => booking.status === 'active');
          setBookings(activeBookings);
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

  const downloadReceipt = async (booking) => {
    try {
      const templateURL = 'http://localhost:5000/uploads/templates/locker_receipt_template.pdf';
      const response = await fetch(templateURL);

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF template: ${response.status} ${response.statusText}. Please ensure the backend server was RESTARTED.`);
      }

      const existingPdfBytes = await response.arrayBuffer();

      // Load the PDF template
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      // Helper function to map mm coordinates to points (y is from bottom)
      const mmToPt = (mm) => mm * 2.83465;
      const drawTextAt = (text, xMm, yMm, size = 11, font = helveticaFont, color = rgb(0, 0, 0)) => {
        firstPage.drawText(String(text), {
          x: mmToPt(xMm),
          y: height - mmToPt(yMm),
          size,
          font,
          color
        });
      };

      // 1. Add University Logo to the white box (Centered in top-left box)
      try {
        const logoBytes = await fetch(logo).then(res => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoBytes);

        // Target box in template: 50x40mm at (20, 5) from top
        const targetSize = mmToPt(32);
        firstPage.drawImage(logoImage, {
          x: mmToPt(20) + (mmToPt(50) - targetSize) / 2,
          y: height - mmToPt(41), // Top margin 5mm + Vertical slack (40-32)/2 = 9mm from top
          width: targetSize,
          height: targetSize,
        });
      } catch (err) {
        console.error("Logo embed error:", err);
      }

      // 2. Add Student QR Code (Centered in QR section)
      if (student?.qrCode) {
        try {
          const qrBytes = await fetch(student.qrCode).then(res => res.arrayBuffer());
          const qrImage = await pdfDoc.embedPng(qrBytes);

          // Target box in template: 51x51mm at (132, 115) from top
          const qrSize = mmToPt(45);
          firstPage.drawImage(qrImage, {
            x: mmToPt(132) + (mmToPt(51) - qrSize) / 2,
            y: height - mmToPt(163), // Top margin 115mm + Vertical slack (51-45)/2 = 118mm from top
            width: qrSize,
            height: qrSize,
          });

          drawTextAt("Scan for student", 143, 175, 8, helveticaFont, rgb(148 / 255, 163 / 255, 184 / 255));
          drawTextAt("verification", 148, 180, 8, helveticaFont, rgb(148 / 255, 163 / 255, 184 / 255));
        } catch (err) {
          console.error("QR embed error:", err);
        }
      }

      // 3. Map Student Details (Sharper font and tighter alignment)
      const detailSize = 11;
      drawTextAt(student?.name || "N/A", 50, 115, detailSize, helveticaBold);
      drawTextAt(student?.studentId || "N/A", 50, 125, detailSize, helveticaBold);
      drawTextAt(student?.faculty || "N/A", 50, 135, detailSize, helveticaBold);

      // 4. Map Locker Details (Fixing the 10mm shift to align with labels)
      drawTextAt(booking.lockerId, 50, 155, detailSize, helveticaBold); // Shifted up from 165
      drawTextAt(booking.locationName || "Main Campus", 50, 165, detailSize, helveticaBold); // Shifted up from 175
      drawTextAt(new Date(booking.date).toLocaleDateString(), 50, 175, detailSize, helveticaBold); // Shifted up from 185
      drawTextAt(`${booking.startTime} - ${booking.endTime}`, 50, 185, detailSize, helveticaBold); // Shifted up from 195

      // 5. Map Booking Reference & Status (High Contrast)
      drawTextAt(booking._id.slice(-8).toUpperCase(), 28, 233, 18, helveticaBold, rgb(30 / 255, 58 / 255, 138 / 255));
      drawTextAt(new Date().toLocaleDateString(), 85, 233, 12, helveticaBold);

      // Status is already green-boxed in the template, but we can draw the text for clarity if needed
      // drawTextAt(booking.status.toUpperCase(), 154, 230, 11, helveticaBold, rgb(21/255, 128/255, 61/255));

      // 6. Save and Download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `locker-receipt-${booking.lockerId}-${booking._id.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PDF Template Filling error:", err);
      showAlert('error', 'Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <>

        <div className="p-8 text-center font-bold text-white text-lg bg-black/20 rounded-2xl backdrop-blur-sm">Loading your locker bookings...</div>

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

  return (
    <>
      <UnifiedNavbar
        moduleName="My Locker Booking"
        centerModule={true}
        rightActions={
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-5 py-2.5 bg-blue-500 text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        }
      />
      <div className="max-w-4xl mx-auto pt-10">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/lockers">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  Book a Locker
                </button>
              </Link>
              <button
                onClick={() => navigate('/student-dashboard')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl transition-all w-full sm:w-auto"
              >
                Back to Dashboard
              </button>
            </div>
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${booking.status === 'active'
                          ? 'bg-green-500/30 text-green-100'
                          : 'bg-gray-500/30 text-gray-100'
                        }`}>
                        Status: {booking.status}
                      </span>
                      <h2 className="text-3xl font-extrabold tracking-tight">Locker {booking.lockerId}</h2>
                      <p className="text-blue-100 font-medium opacity-90">{booking.locationName || 'Main Campus'}</p>
                    </div>
                    <div className="z-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm ${booking.status === 'active'
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

    </>
  );
};

export default MyBookLocker;