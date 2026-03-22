import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminLockerMap = () => {

  const [form, setForm] = useState({
    locationName: "",
    rows: "",
    lockersPerRow: ""
  });

  const [loading, setLoading] = useState(false);
  const [maps, setMaps] = useState([]);

  // Fetch maps from the backend
  const fetchMaps = async () => {
    try {
      const response = await axios.get("http://localhost:5000/maps");
      setMaps(response.data);
    } catch (error) {
      console.error("Error fetching maps:", error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // submit form
  const handleSubmit = async () => {

    // basic validation
    if (!form.locationName || form.rows <= 0 || form.lockersPerRow <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/create-map", {
        locationName: form.locationName,
        rows: Number(form.rows),
        lockersPerRow: Number(form.lockersPerRow)
      });

      alert("Map Created Successfully");

      // clear form after submit
      setForm({
        locationName: "",
        rows: "",
        lockersPerRow: ""
      });

      // Refresh maps list immediately
      await fetchMaps();

    } catch (error) {
      console.error(error);
      alert("Error creating map");
    } finally {
      setLoading(false);
    }
  };

  // Delete map
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this map?")) return;
    try {
      await axios.delete(`http://localhost:5000/delete-map/${id}`);
      await fetchMaps();
    } catch (error) {
      console.error(error);
      alert("Error deleting map");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col">

      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-wide uppercase">
        ADMIN LOCKER MAP
      </h1>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full">

        {/* Left Side: Table View with Scroll */}
        <div className="flex-1 bg-white shadow-xl rounded-xl p-6 flex flex-col h-[75vh]">
          <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-3">Configured Maps (Table View)</h2>
          
          <div className="overflow-y-auto flex-1 pr-2">
            {maps.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10 text-gray-600">
                  <tr>
                    <th className="p-4 border-b-2 font-semibold">Location Name</th>
                    <th className="p-4 border-b-2 font-semibold">Rows</th>
                    <th className="p-4 border-b-2 font-semibold">Lockers/Row</th>
                    <th className="p-4 border-b-2 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maps.map((map) => (
                    <tr key={map._id} className="hover:bg-gray-50 transition border-b">
                      <td className="p-4 text-gray-800 font-medium">{map.locationName}</td>
                      <td className="p-4 text-gray-600">{map.rows}</td>
                      <td className="p-4 text-gray-600">{map.lockersPerRow}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(map._id)}
                          className="text-red-500 hover:text-red-700 font-semibold px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg italic">No maps configured yet. Add one from the right panel.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Create Form */}
        <div className="w-full md:w-80 bg-white shadow-xl rounded-xl p-6 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 text-gray-700 border-b pb-3">Create New Map</h2>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location Name</label>
              <input
                name="locationName"
                value={form.locationName}
                placeholder="e.g. Main Hall"
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Number of Rows</label>
              <input
                name="rows"
                type="number"
                value={form.rows}
                placeholder="e.g. 5"
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lockers Per Row</label>
              <input
                name="lockersPerRow"
                type="number"
                value={form.lockersPerRow}
                placeholder="e.g. 10"
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-sm"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition font-bold text-lg shadow hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Map"}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminLockerMap;