import React, { useState, useEffect } from "react";
import axios from "axios";
import lockerBg from "../../assets/locker.png";

const AdminLockerMap = () => {

  const [form, setForm] = useState({
    locationName: "",
    rows: "",
    lockersPerRow: ""
  });

  const [updateForm, setUpdateForm] = useState({
    locationName: "",
    rows: "",
    lockersPerRow: ""
  });

  const [loading, setLoading] = useState(false);
  const [maps, setMaps] = useState([]);
  const [editingMapId, setEditingMapId] = useState(null);

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

  // handle input change for create
  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "locationName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }
    setForm({
      ...form,
      [name]: value
    });
  };

  // handle input change for update
  const handleUpdateChange = (e) => {
    let { name, value } = e.target;
    if (name === "locationName") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }
    setUpdateForm({
      ...updateForm,
      [name]: value
    });
  };

  // submit create form
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

  // submit update form
  const handleUpdateSubmit = async () => {
    if (!updateForm.locationName || updateForm.rows <= 0 || updateForm.lockersPerRow <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/update-map/${editingMapId}`, {
        locationName: updateForm.locationName,
        rows: Number(updateForm.rows),
        lockersPerRow: Number(updateForm.lockersPerRow)
      });
      alert("Map Updated Successfully");

      setEditingMapId(null);
      await fetchMaps();
    } catch (error) {
      console.error(error);
      alert("Error updating map");
    } finally {
      setLoading(false);
    }
  };

  // Start inline editing
  const startEditing = (map) => {
    setEditingMapId(map._id);
    setUpdateForm({
      locationName: map.locationName,
      rows: map.rows,
      lockersPerRow: map.lockersPerRow
    });
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
    <div 
      className="min-h-screen p-8 flex flex-col relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${lockerBg})` }}
    >

      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-wide uppercase bg-white/80 py-3 rounded-xl mx-auto w-max px-10 shadow-sm backdrop-blur-md">
        ADMIN LOCKER MAP
      </h1>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full">

        {/* Left Side: Table View with Scroll */}
        <div className="flex-1 bg-white shadow-xl rounded-xl p-6 flex flex-col h-[75vh]">
          <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-3">Configured Maps (Table View)</h2>

          <div className="overflow-y-auto flex-1 pr-2">
            {maps.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="sticky top-0 bg-white shadow-sm z-10 text-gray-600">
                  <tr>
                    <th className="p-4 border-b-2 font-semibold w-1/3">Location Name</th>
                    <th className="p-4 border-b-2 font-semibold w-1/5">Rows</th>
                    <th className="p-4 border-b-2 font-semibold w-1/5">Lockers/Row</th>
                    <th className="p-4 border-b-2 font-semibold text-center w-auto">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maps.map((map) => (
                    <tr key={map._id} className={`transition border-b ${editingMapId === map._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 text-gray-800 font-medium">{map.locationName}</td>
                      <td className="p-4 text-gray-600">{map.rows}</td>
                      <td className="p-4 text-gray-600">{map.lockersPerRow}</td>
                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => startEditing(map)}
                          className="text-blue-500 hover:text-blue-700 font-semibold px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded transition"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(map._id)}
                          className="text-red-500 hover:text-red-700 font-semibold px-4 py-2 bg-red-50 hover:bg-red-100 rounded transition"
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

        {/* Right Side: Create / Update Form */}
        <div className="w-full md:w-80 bg-white shadow-xl rounded-xl p-6 h-fit sticky top-8">
          {editingMapId ? (
            <>
              <h2 className="text-xl font-bold mb-6 text-black border-b pb-3 text-center">Update Map</h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location Name</label>
                  <input
                    name="locationName"
                    value={updateForm.locationName}
                    placeholder="e.g. Main Hall"
                    onChange={handleUpdateChange}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Number of Rows</label>
                  <input
                    name="rows"
                    type="number"
                    min="1"
                    onKeyDown={(e) => { if(['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                    value={updateForm.rows}
                    placeholder="e.g. 5"
                    onChange={handleUpdateChange}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lockers Per Row</label>
                  <input
                    name="lockersPerRow"
                    type="number"
                    min="1"
                    onKeyDown={(e) => { if(['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                    value={updateForm.lockersPerRow}
                    placeholder="e.g. 10"
                    onChange={handleUpdateChange}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={handleUpdateSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditingMapId(null)}
                    disabled={loading}
                    className="bg-gray-300 text-gray-800 p-3 rounded-lg hover:bg-gray-400 transition font-bold text-lg shadow hover:shadow-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6 text-black border-b pb-3 text-center">Create New Map</h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location Name</label>
                  <input
                    name="locationName"
                    value={form.locationName}
                    placeholder="e.g. Main Hall"
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Number of Rows</label>
                  <input
                    name="rows"
                    type="number"
                    min="1"
                    onKeyDown={(e) => { if(['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                    value={form.rows}
                    placeholder="e.g. 5"
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lockers Per Row</label>
                  <input
                    name="lockersPerRow"
                    type="number"
                    min="1"
                    onKeyDown={(e) => { if(['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                    value={form.lockersPerRow}
                    placeholder="e.g. 10"
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Map"}
                </button>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminLockerMap;