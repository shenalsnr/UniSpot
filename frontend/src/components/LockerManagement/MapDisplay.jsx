import React, { useState } from "react";

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

  // Booking Modal State
  const [selectedLockerForBooking, setSelectedLockerForBooking] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");

  const todayDateStr = new Date().toISOString().split("T")[0];

  const handleSelect = (id) => {
    const locker = lockers.find(l => l.id === id);
    if (locker.selected) {
      // If already selected, deselect it (or cancel booking)
      setLockers((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, selected: false, date: "", startTime: "", endTime: "" } : l
        )
      );
    } else {
      // Open booking modal
      setSelectedLockerForBooking(id);
      setBookingDate("");
      setBookingStartTime("");
      setBookingEndTime("");
    }
  };

  const confirmBooking = () => {
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
    setLockers((prev) =>
      prev.map((l) =>
        l.id === selectedLockerForBooking
          ? { ...l, selected: true, date: bookingDate, startTime: bookingStartTime, endTime: bookingEndTime }
          : l
      )
    );
    setSelectedLockerForBooking(null);
  };

  const cancelBooking = () => {
    setSelectedLockerForBooking(null);
  };

  return (
    <div className="mb-10 w-full flex flex-col items-center overflow-x-auto mt-10 relative">
      <div className="flex flex-col items-stretch w-max">
        <h2 className="text-2xl font-bold mb-6 text-white bg-blue-600 px-8 py-3 rounded-xl shadow-md tracking-wide text-center">
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
              className={`w-16 h-16 rounded text-white font-semibold transition duration-200 hover:scale-110 flex flex-col items-center justify-center shadow-sm
                ${locker.selected ? "bg-blue-600 ring-2 ring-blue-300 ring-offset-1" : "bg-gray-500 hover:bg-gray-400"}
              `}
              title={locker.selected ? `Booked on ${locker.date}\nFrom: ${locker.startTime}\nTo: ${locker.endTime}` : "Available"}
            >
              <span className="text-xl">{locker.id}</span>
              {locker.selected && (
                <span className="text-[10px] mt-1 opacity-80 font-normal leading-tight">Booked</span>
              )}
            </button>
          ))}
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
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow hover:shadow-lg"
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
