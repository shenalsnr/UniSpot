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
        });
      }
    });

    return lockers;
  };

  const [lockers, setLockers] = useState(generateLockers());

  const handleSelect = (id) => {
    setLockers((prev) =>
      prev.map((locker) =>
        locker.id === id
          ? { ...locker, selected: !locker.selected }
          : locker
      )
    );
  };

  return (
    <div className="mb-10 w-full flex flex-col items-center overflow-x-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{locationName}</h2>
      <div className="bg-white p-7 rounded-2xl shadow-xl w-max">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${lockersPerRow}, minmax(0, 1fr))` }}
        >
          {lockers.map((locker) => (
            <button
              key={locker.id}
              onClick={() => handleSelect(locker.id)}
              className={`w-16 h-16 rounded text-white font-semibold transition duration-200 hover:scale-110 flex items-center justify-center shadow-sm
                ${locker.selected ? "bg-blue-600 ring-2 ring-blue-300 ring-offset-1" : "bg-gray-500 hover:bg-gray-400"}
              `}
            >
              {locker.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapDisplay;
