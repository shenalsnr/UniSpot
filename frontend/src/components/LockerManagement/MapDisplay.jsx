import React, { useState, useEffect } from "react";
import axios from "axios";

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
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/bookings/map/${map._id}`);
        const bookings = response.data;
        setLockers((prev) => 
          prev.map((locker) => {
            const booking = bookings.find(b => b.lockerId === locker.id);
            if (booking) {
              return { ...locker, selected: true, date: booking.date, startTime: booking.startTime, endTime: booking.endTime };
            }
            return { ...locker, selected: false, date: "", startTime: "", endTime: "" };
          })
        );
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    if (map && map._id) {
      fetchBookings();
    }
  }, [map, map._id]);

  // Booking Modal State
  const [selectedLockerForBooking, setSelectedLockerForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");

  const todayDateStr = new Date().toISOString().split("T")[0];

  const handleSelect = async (id) => {
    const locker = lockers.find(l => l.id === id);
    if (locker.selected) {
      if (!window.confirm("Are you sure you want to cancel this booking?")) return;
      try {
        await axios.delete(`http://localhost:5000/bookings/map/${map._id}/locker/${id}`);
        setLockers((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, selected: false, date: "", startTime: "", endTime: "" } : l
          )
        );
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Error cancelling booking.");
      }
    } else {
      // Open booking modal
      setSelectedLockerForBooking(id);
      setBookingDate("");
      setBookingStartTime("");
      setBookingEndTime("");
    }
  };

  const confirmBooking = async () => {
    if (!bookingDate || !bookingStartTime || !bookingEndTime) {
      alert("Please select a date, start time, and end time to book.");
      return;
    }
    if (bookingDate < todayDateStr) {
      alert("You cannot book a locker for a past date.");
      return;
    }
    if (bookingStartTime < "06:00" || bookingEndTime > "22:00" || bookingStartTime > "22:00" || bookingEndTime < "06:00") {
      alert("Booking time must be between 06:00 AM and 10:00 PM.");
      return;
    }
    if (bookingStartTime >= bookingEndTime) {
      alert("End time must be after start time.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/bookings", {
        mapId: map._id,
        lockerId: selectedLockerForBooking,
        date: bookingDate,
        startTime: bookingStartTime,
        endTime: bookingEndTime
      });
      setLockers((prev) =>
        prev.map((l) =>
          l.id === selectedLockerForBooking
            ? { ...l, selected: true, date: bookingDate, startTime: bookingStartTime, endTime: bookingEndTime }
            : l
        )
      );
      setSelectedLockerForBooking(null);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error.response?.data?.message || "Booking failed.");
    }
  };

  const cancelBooking = () => {
    setSelectedLockerForBooking(null);
  };

  return (
    <div className="mb-10 w-full flex flex-col items-center overflow-x-auto mt-10 relative">
      <div className="flex flex-col items-stretch w-max">
        <h2 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-blue-200 via-blue-600 to-blue-600 px-8 py-3 rounded-xl shadow-md tracking-wide text-center">
          {locationName}
        </h2>
        <div className="bg-blue-100 border-2 border-blue-300 p-7 rounded-2xl shadow-xl w-full">
          <div
            className="grid gap-4 mx-auto w-max"
            style={{ gridTemplateColumns: `repeat(${lockersPerRow}, minmax(0, 1fr))` }}
          >
          {lockers.map((locker) => (
            <button
              key={locker.id}
              onClick={() => handleSelect(locker.id)}
              className={`w-16 h-16 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-110 hover:-translate-y-1 flex flex-col items-center justify-center relative
                ${locker.selected 
                  ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/50 ring-2 ring-blue-300 ring-offset-2" 
                  : "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-lg shadow-gray-500/50 hover:from-gray-300 hover:via-gray-400 hover:to-gray-500"
                }
              `}
              style={{
                boxShadow: locker.selected 
                  ? '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                  : '0 10px 25px -5px rgba(107, 114, 128, 0.5), 0 8px 10px -6px rgba(107, 114, 128, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
              }}
              title={locker.selected ? `Booked on ${locker.date}\nFrom: ${locker.startTime}\nTo: ${locker.endTime}` : "Available"}
            >
              <span className="text-xl font-bold drop-shadow-sm">{locker.id}</span>
              {locker.selected && (
                <span className="text-[10px] mt-1 opacity-90 font-semibold leading-tight drop-shadow-sm">Booked</span>
              )}
              {/* 3D highlight effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </button>
          ))}
        </div>
        </div>

        {/* Color Legend */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-lg shadow-gray-500/50"></div>
            <span className="text-gray-700 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/50"></div>
            <span className="text-gray-700 font-medium">Booked</span>
          </div>
        </div>
      </div>

      {/* Booking Modal (Transparent Overlay) */}
      {selectedLockerForBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
                className="flex-1 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold py-3 rounded-lg hover:opacity-90 transition shadow hover:shadow-lg"
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
