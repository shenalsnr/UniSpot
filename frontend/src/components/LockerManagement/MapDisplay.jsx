import React, { useState, useEffect } from "react";
import axios from "axios";
import { showAlert } from "../Shared/BeautifulAlert";
import { showConfirm } from "../Shared/BeautifulConfirm";

const MapDisplay = ({ map }) => {
  const { locationName, rows, lockersPerRow } = map;

  const generateLockers = () => {
    const lockers = [];
    const rowLetters = Array.from({ length: rows }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    rowLetters.forEach((row) => {
      for (let i = 1; i <= lockersPerRow; i++) {
        lockers.push({
          id: row + i,
          selected: false,
          isMine: false,
          status: 'available', // Add status field
          maintenanceReason: '',
          date: "",
          startTime: "",
          endTime: ""
        });
      }
    });

    return lockers;
  };

  const [lockers, setLockers] = useState(generateLockers());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, maintenanceRes] = await Promise.allSettled([
          axios.get(`http://localhost:5000/api/locker/bookings/map/${map._id}`),
          axios.get(`http://localhost:5000/api/lockers?mapId=${map._id}`)
        ]);

        const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value.data : [];
        const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
        const currentStudentId = studentInfo._id;

        // Build maintenance status lookup
        let maintenanceMap = {};
        if (maintenanceRes.status === 'fulfilled' && maintenanceRes.value.data?.success) {
          maintenanceRes.value.data.data.forEach(l => {
            maintenanceMap[l.id] = l.status;
          });
        }

        setLockers((prev) =>
          prev.map((locker) => {
            // Maintenance takes priority
            if (maintenanceMap[locker.id] === 'maintenance') {
              return { ...locker, status: 'maintenance', selected: false, isMine: false, date: '', startTime: '', endTime: '' };
            }
            // Booking status
            const booking = bookings.find(b => b.lockerId === locker.id);
            if (booking) {
              // Handle different formats of studentId (string, ObjectId, or nested object)
              const bookingStudentId = typeof booking.studentId === 'object' && booking.studentId._id ? booking.studentId._id.toString() : booking.studentId?.toString?.() || booking.studentId;
              const isMyBooking = bookingStudentId === currentStudentId || bookingStudentId === currentStudentId?.toString?.();
              return {
                ...locker,
                status: 'available',
                selected: true,
                isMine: isMyBooking,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime
              };
            }
            return { ...locker, status: 'available', selected: false, isMine: false, date: '', startTime: '', endTime: '' };
          })
        );
      } catch (error) {
        console.error("Error fetching locker data:", error);
      }
    };
    if (map && map._id) {
      fetchData();
    }
  }, [map, map._id]);

  // Booking Modal State
  const [selectedLockerForBooking, setSelectedLockerForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");

  const todayDateStr = new Date().toISOString().split("T")[0];

  const handleSelect = async (id) => {
    console.log("🔍 Debug - Locker clicked:", id);
    const locker = lockers.find(l => l.id === id);
    console.log("🔍 Debug - Locker found:", locker);

    // Prevent booking of maintenance lockers
    if (locker.status === 'maintenance') {
      showAlert('error', 'This locker is blocked for maintenance and cannot be booked.', 'Maintenance Block');
      return;
    }

    if (locker.selected) {
      if (!locker.isMine) {
        showAlert('error', 'You can only cancel your own booking.', 'Action Blocked');
        return;
      }

      const confirmed = await showConfirm({
        title: 'Cancel Booking',
        message: 'Are you sure you want to cancel this locker booking? This action cannot be undone.',
        confirmText: 'Yes, Cancel Booking',
        cancelText: 'Keep Booking',
        type: 'warning'
      });

      if (!confirmed) return;

      try {
        const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
        const token = studentInfo.token;
        console.log("🔍 Debug - Cancel - Token exists:", !!token);

        await axios.delete(`http://localhost:5000/api/locker/bookings/map/${map._id}/locker/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLockers((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, selected: false, isMine: false, date: "", startTime: "", endTime: "" } : l
          )
        );
        showAlert('success', 'Booking cancelled successfully!', 'Success');
      } catch (error) {
        console.error("Error cancelling booking:", error);
        showAlert('error', 'Error cancelling booking.');
      }
    } else {
      console.log("🔍 Debug - Opening booking modal for:", id);

      // Check if student already has any booking before allowing new selection
      try {
        const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
        const token = studentInfo.token;
        console.log("🔍 Debug - Student info from localStorage:", studentInfo);
        console.log("🔍 Debug - Token exists:", !!token);

        if (!token) {
          console.log("❌ Debug - No token found, showing login required");
          showAlert('error', 'Please login to book a locker', 'Authentication Required');
          return;
        }

        console.log("🔍 Debug - Checking student current booking...");
        const response = await axios.get(`http://localhost:5000/api/locker/bookings/student/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("🔍 Debug - Student booking check response:", response.data);

        if (response.data && response.data.hasBooking) {
          console.log("❌ Debug - Student already has booking, blocking");
          showAlert('warning', 'You have already booked a locker. Only one locker is allowed per student.');
          return;
        }

        console.log("✅ Debug - No existing booking, opening modal");
      } catch (error) {
        console.error("❌ Debug - Error checking student booking:", error);
        // If endpoint fails, proceed with normal flow (backend will handle validation)
        console.log("🔍 Debug - Proceeding with booking modal due to endpoint error");
      }

      // Open booking modal
      setSelectedLockerForBooking(id);
      setBookingDate("");
      setBookingStartTime("");
      setBookingEndTime("");
    }
  };

  const confirmBooking = async () => {
    console.log("🔍 Debug - Confirm booking called");
    console.log("🔍 Debug - Booking data:", {
      selectedLocker: selectedLockerForBooking,
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      todayDate: todayDateStr
    });

    if (!bookingDate || !bookingStartTime || !bookingEndTime) {
      console.log("❌ Debug - Missing booking data");
      showAlert('warning', 'Please select a date, start time, and end time to book.');
      return;
    }

    // Date validation
    const bookingDateObj = new Date(bookingDate);
    const todayDateObj = new Date(todayDateStr);
    todayDateObj.setHours(0, 0, 0, 0); // Set to start of day
    bookingDateObj.setHours(0, 0, 0, 0); // Set to start of day

    if (bookingDateObj < todayDateObj) {
      console.log("❌ Debug - Past date selected:", bookingDateObj, "<", todayDateObj);
      showAlert('error', 'You cannot book a locker for a past date.');
      return;
    }

    // Time validation
    if (bookingStartTime < "06:00" || bookingEndTime > "22:00" || bookingStartTime > "22:00" || bookingEndTime < "06:00") {
      console.log("❌ Debug - Time validation failed");
      showAlert('warning', 'Booking time must be between 06:00 AM and 10:00 PM.');
      return;
    }

    if (bookingStartTime >= bookingEndTime) {
      console.log("❌ Debug - End time before start time");
      showAlert('warning', 'End time must be after start time.');
      return;
    }

    try {
      const studentInfo = JSON.parse(localStorage.getItem('studentInfo') || '{}');
      const token = studentInfo.token;

      console.log("🔍 Debug - Student info:", studentInfo);
      console.log("🔍 Debug - Token:", token);
      console.log("🔍 Debug - Map ID:", map._id);
      console.log("🔍 Debug - Locker ID:", selectedLockerForBooking);

      if (!token) {
        console.log("❌ Debug - No token for booking");
        showAlert('error', 'Please login to book a locker', 'Authentication Required');
        return;
      }

      console.log("🔍 Debug - Making booking request...");
      const response = await axios.post("http://localhost:5000/api/locker/bookings", {
        mapId: map._id,
        lockerId: selectedLockerForBooking,
        date: bookingDate,
        startTime: bookingStartTime,
        endTime: bookingEndTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Debug - Booking response:", response.data);

      // Refresh bookings to get updated state
      const bookingsResponse = await axios.get(`http://localhost:5000/api/locker/bookings/map/${map._id}`);
      const bookings = bookingsResponse.data;
      setLockers((prev) =>
        prev.map((locker) => {
          const booking = bookings.find(b => b.lockerId === locker.id);
          if (booking) {
            // Handle different formats of studentId (string, ObjectId, or nested object)
            const bookingStudentId = typeof booking.studentId === 'object' && booking.studentId._id ? booking.studentId._id.toString() : booking.studentId?.toString?.() || booking.studentId;
            const studentInfoId = studentInfo._id?.toString?.() || studentInfo._id;
            const isMyBooking = bookingStudentId === studentInfoId || bookingStudentId === studentInfo._id;
            return {
              ...locker,
              selected: true,
              isMine: isMyBooking,
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime
            };
          }
          return { ...locker, selected: false, isMine: false, date: "", startTime: "", endTime: "" };
        })
      );

      setSelectedLockerForBooking(null);
      showAlert('success', 'Locker booked successfully.', 'Success');
    } catch (error) {
      console.error("Booking failed:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage = error.response?.data?.message || 'Booking failed.';
      showAlert('error', errorMessage);
    }
  };

  const cancelBooking = async () => {
    const confirmed = await showConfirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking process? Any information you entered will be lost.',
      confirmText: 'Yes, Cancel',
      cancelText: 'Continue Booking',
      type: 'info'
    });

    if (confirmed) {
      setSelectedLockerForBooking(null);
    }
  };

  return (
    <div className="w-full">
      {/* ── Locker Grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6 gap-6">
        {lockers.map((locker) => {
          const getCardStyle = () => {
            if (locker.status === 'maintenance')
              return {
                card: 'border-yellow-200 bg-yellow-50/80 shadow-yellow-100',
                badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
                icon: '',
                label: 'Maintenance',
                glow: ''
              };
            if (locker.selected)
              return {
                card: locker.isMine
                  ? 'border-blue-200 bg-blue-50/80 shadow-blue-100'
                  : 'border-red-200 bg-red-50/80 shadow-red-100',
                badge: locker.isMine
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-red-100 text-red-700 border border-red-300',
                icon: '',
                label: locker.isMine ? 'My Booking' : 'Booked',
                glow: ''
              };
            return {
              card: 'border-blue-200 bg-blue-50/80 shadow-blue-100',
              badge: 'bg-blue-100 text-blue-700 border border-blue-300',
              icon: '',
              label: 'Available',
              glow: ''
            };
          };

          const style = getCardStyle();

          return (
            <div
              key={locker.id}
              className={`border-2 rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${style.card} ${style.glow} flex flex-col gap-3 min-h-50`}
            >
              {/* Locker ID + status badge */}
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-black text-slate-800">{locker.id}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge} flex items-center gap-1`}>
                  <span>{style.icon}</span>
                  {style.label}
                </span>
              </div>

              {/* Booking details */}
              {locker.selected && locker.isMine && (
                <div className="text-sm text-blue-700 bg-blue-100 rounded-lg px-2 py-1 leading-snug">
                  <div>Date: {locker.date}</div>
                  <div>Time: {locker.startTime} - {locker.endTime}</div>
                </div>
              )}

              {/* Action button */}
              <div className="mt-auto">
                {locker.status === 'maintenance' ? (
                  <button disabled className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed flex items-center justify-center gap-1">
                    Maintenance
                  </button>
                ) : locker.selected ? (
                  locker.isMine ? (
                    <button
                      onClick={() => handleSelect(locker.id)}
                      className="w-full py-3 rounded-xl bg-linear-to-r from-red-500 to-rose-600 text-white text-sm font-bold hover:from-red-600 hover:to-rose-700 transition-all duration-300 hover:scale-105 shadow-md shadow-red-300/40 flex items-center justify-center gap-1"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <button disabled className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed flex items-center justify-center gap-1">
                      Booked
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleSelect(locker.id)}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-blue-500 text-white text-sm font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-md shadow-blue-300/40 flex items-center justify-center gap-1"
                  >
                    Book Locker
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal (Transparent Overlay) */}
      {selectedLockerForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl w-full max-w-sm border-2 border-blue-500 backdrop-blur-md">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Book Locker {selectedLockerForBooking}
            </h3>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Schedule Date</label>
                <input
                  type="date"
                  min={todayDateStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white"
                />
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Start Time</label>
                  <input
                    type="time"
                    min="06:00"
                    max="22:00"
                    value={bookingStartTime}
                    onChange={(e) => setBookingStartTime(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">End Time</label>
                  <input
                    type="time"
                    min="06:00"
                    max="22:00"
                    value={bookingEndTime}
                    onChange={(e) => setBookingEndTime(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-2">
              <button
                onClick={confirmBooking}
                className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow hover:shadow-lg"
              >
                Confirm
              </button>
              <button
                onClick={cancelBooking}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition shadow hover:shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
