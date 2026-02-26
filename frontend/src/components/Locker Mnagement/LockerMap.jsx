
import React, { useState } from "react";


const LockerMap = () => {

    const rows = ["A", "B", "C", "D", "E"];

    const generateLockers = () => {
        const lockers = [];

        rows.forEach((row) => {
            for (let i=1; i <= 10; i++){
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
                 ? {...locker, selected: !locker.selected}
                 : locker

    )
);
    };


  return (
    <div className=" min-h-screen bg-gray-100 flex flex-col items-center p-10 ">
      <h1 className="text-3xl font-bold mb-8">
        LOCKER MAP</h1>

      <div className="bg-white p-7 rounded-2xl shadow-xl">
        <div className="grid grid-cols-10 gap-4 ">

      {lockers.map((locker) => (
        <button 
          key={locker.id}
          onClick={() => handleSelect(locker.id)}
          className={`w-12 h-12 rounded text- transition duration-200 hover:scale-110 
            ${locker.selected ? "bg-green-700" : "bg-gray-500"}
            `}
          
          >
            {locker.id}
          </button>
      ))
      }

        </div>
    </div>
    </div>
  );
};

export default LockerMap
