import React, { useEffect, useState } from "react";
import axios from "axios";

const BookLockersStatus = () => {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load maps
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await axios.get("http://localhost:5000/maps");
        setMaps(res.data);

        if (res.data.length > 0) {
          setSelectedMap(res.data[0]);
        }
      } catch (err) {
        console.error("Error loading maps:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  // ✅ Load bookings when map changes
  useEffect(() => {
    if (!selectedMap) return;

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/bookings/map/${selectedMap._id}`
        );

        console.log("Bookings:", res.data); // 🔥 DEBUG
        setBookings(res.data);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setBookings([]);
      }
    };

    fetchBookings();
  }, [selectedMap]);

  // ✅ Generate lockers (A1, A2...)
  const generateLockers = () => {
    if (!selectedMap) return [];

    const lockers = [];
    const rows = selectedMap.rows;
    const cols = selectedMap.lockersPerRow;

    for (let i = 0; i < rows; i++) {
      const rowLetter = String.fromCharCode(65 + i); // A, B, C

      for (let j = 1; j <= cols; j++) {
        lockers.push(`${rowLetter}${j}`);
      }
    }

    return lockers;
  };

  // ✅ Check if booked (FIXED)
  const isBooked = (lockerId) => {
    return bookings.some(
      (b) =>
        b.lockerId &&
        b.lockerId.toUpperCase().trim() === lockerId.toUpperCase().trim()
    );
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-gray-500">
        Loading maps...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Locker Booking Status
      </h1>

      {/* Debug Info */}
      <p className="text-center text-sm text-gray-500 mb-4">
        Total Bookings: {bookings.length}
      </p>

      {/* Map Selector */}
      <div className="flex justify-center mb-6">
        <select
          className="p-2 border rounded"
          value={selectedMap?._id || ""}
          onChange={(e) => {
            const selected = maps.find((m) => m._id === e.target.value);
            setSelectedMap(selected);
          }}
        >
          {maps.map((map) => (
            <option key={map._id} value={map._id}>
              {map.locationName}
            </option>
          ))}
        </select>
      </div>

      {/* Locker Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-10 gap-3">
          {generateLockers().map((lockerId) => {
            const booked = isBooked(lockerId);

            return (
              <div
                key={lockerId}
                className={`w-14 h-14 flex items-center justify-center rounded font-bold text-white shadow-md transition ${
                  booked
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {lockerId}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
      </div>

    </div>
  );
};

export default BookLockersStatus;