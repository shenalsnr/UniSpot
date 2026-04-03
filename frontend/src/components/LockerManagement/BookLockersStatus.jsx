import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, ArrowLeft } from "lucide-react";
import UnifiedNavbar from "../Shared/UnifiedNavbar";
import PageBackground from "../Shared/PageBackground";
const BookLockersStatus = () => {
  const navigate = useNavigate();

  const [maps, setMaps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Load maps
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/locker/maps");
        setMaps(res.data);
      } catch (err) {
        console.error("Error loading maps:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  //  Load bookings when map changes
  useEffect(() => {
    if (!maps[selectedIndex]) return;

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/locker/bookings/map/${maps[selectedIndex]._id}`
        );
        setBookings(res.data);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setBookings([]);
      }
    };

    fetchBookings();
  }, [maps, selectedIndex]);

  //  Generate lockers
  const generateLockers = () => {
    if (!maps[selectedIndex]) return [];

    const lockers = [];
    const rows = maps[selectedIndex].rows;
    const cols = maps[selectedIndex].lockersPerRow;

    for (let i = 0; i < rows; i++) {
      const rowLetter = String.fromCharCode(65 + i);

      for (let j = 1; j <= cols; j++) {
        lockers.push(`${rowLetter}${j}`);
      }
    }

    return lockers;
  };

  //  Check booked
  const isBooked = (lockerId) => {
    return bookings.some(
      (b) =>
        b.lockerId &&
        b.lockerId.toUpperCase().trim() === lockerId.toUpperCase().trim()
    );
  };

  const handleNext = () => {
    if (selectedIndex < maps.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-semibold text-gray-500">
        Loading maps...
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
            className="px-4 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] border border-blue-300 transition-all hover:scale-105 hover:opacity-90 flex items-center gap-2"
            title="Go Back"
          >
            <ArrowLeft size={18} /> Back
          </button>
        }
      />
      <PageBackground className="flex flex-col items-center pb-10 w-full pt-10">

      {/* 🔷 MAP NAVIGATION */}
      {maps.length > 0 ? (
        <div className="flex items-center justify-center w-full max-w-7xl relative">

          <button
            onClick={handlePrev}
            disabled={selectedIndex === 0}
            className={`absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-500 rounded-full shadow-lg transition z-10 ${selectedIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400 hover:scale-110'}`}
            aria-label="Previous Map"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>

          {/* LOCKER GRID */}
          <div className="bg-blue-100 border-2 border-blue-300 p-7 rounded-2xl shadow-xl w-full">

            <h2 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-blue-200 via-blue-600 to-blue-600 px-8 py-3 rounded-xl shadow-md tracking-wide text-center">
              {maps[selectedIndex]?.locationName}
            </h2>

            <div 
              className="grid gap-4 mx-auto w-max"
              style={{ gridTemplateColumns: `repeat(${maps[selectedIndex]?.lockersPerRow || 10}, minmax(0, 1fr))` }}
            >
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

            {/* LEGEND */}
            <div className="flex justify-center gap-8 mt-6">
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

          <button
            onClick={handleNext}
            disabled={selectedIndex === maps.length - 1}
            className={`absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-500 rounded-full shadow-lg transition z-10 ${selectedIndex === maps.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400 hover:scale-110'}`}
            aria-label="Next Map"
          >
            <ChevronRight size={32} className="text-white" />
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mt-10">No maps found</p>
      )}

      {/* PAGINATION */}
      {maps.length > 0 && (
        <div className="mt-8 text-gray-500 font-medium tracking-wide">
          Map {selectedIndex + 1} of {maps.length}
        </div>
      )}
    </PageBackground>
    </>
  );
};

export default BookLockersStatus;