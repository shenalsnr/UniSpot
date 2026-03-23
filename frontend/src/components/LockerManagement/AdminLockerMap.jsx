import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lockerBg from "../../assets/locker.png";
import logo from "../../assets/logo.png";

const AdminLockerMap = () => {
  const navigate = useNavigate();

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
    if ((name === "rows" || name === "lockersPerRow") && Number(value) > 10) {
      value = "10";
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
    if ((name === "rows" || name === "lockersPerRow") && Number(value) > 10) {
      value = "10";
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
      className="min-h-screen pb-10 flex flex-col relative bg-cover bg-center bg-fixed w-full"
      style={{ backgroundImage: `url(${lockerBg})` }}
    >
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-[80] w-full bg-gradient-to-r from-blue-200 via-blue-600 to-blue-600 backdrop-blur-md shadow-lg border-b border-blue-800 px-4 md:px-8 py-2 md:py-3 mb-10 flex justify-between items-center transition-all">
        <div className="flex items-center">
          <img src={logo} alt="UniSpot Logo" className="h-20 md:h-[100px] w-auto object-contain scale-110 origin-left drop-shadow-sm" />
        </div>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-extrabold text-blue-800 bg-blue-100 px-8 py-2 border-2 border-blue-300 rounded-xl shadow-md tracking-widest uppercase whitespace-nowrap">
          ADMIN LOCKER MAP
        </h1>

        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition border border-white/20 backdrop-blur-sm"
          >
            Back to Panel
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 max-w-[95%] 2xl:max-w-[1600px] mx-auto w-full px-8">

        {/* Left Side: Table View */}
        <div className="flex-1 bg-blue-100 border-2 border-blue-300 shadow-xl rounded-xl p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-gray-700 border-b border-gray-300 pb-3 text-center">Configured Maps (Table View)</h2>

          <div className="flex-1 overflow-x-auto">
            {maps.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-max text-lg">
                <thead className="sticky top-0 bg-blue-100 shadow-sm z-10 text-gray-600">
                  <tr>
                    <th className="p-4 border-b-2 font-bold w-1/3">Location Name</th>
                    <th className="p-4 border-b-2 font-bold w-1/5">Rows</th>
                    <th className="p-4 border-b-2 font-bold w-1/5">Lockers/Row</th>
                    <th className="p-4 border-b-2 font-bold text-center w-auto">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maps.map((map) => (
                    <tr key={map._id} className={`transition border-b ${editingMapId === map._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 text-gray-800 font-bold">{map.locationName}</td>
                      <td className="p-4 text-gray-600 font-medium">{map.rows}</td>
                      <td className="p-4 text-gray-600 font-medium">{map.lockersPerRow}</td>
                      <td className="p-4 text-center space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => startEditing(map)}
                          className="text-blue-600 hover:text-blue-800 font-extrabold px-5 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(map._id)}
                          className="bg-red-100 text-red-600 hover:text-red-700 font-extrabold px-5 py-2 hover:bg-red-200 rounded-lg transition"
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
        <div className="w-full md:w-96 flex-none bg-blue-100 border-2 border-blue-300 shadow-xl rounded-xl p-6 h-fit sticky top-32 mb-10">
          {editingMapId ? (
            <>
              <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-300 pb-3 text-center">Update Map</h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location Name</label>
                  <input
                    name="locationName"
                    value={updateForm.locationName}
                    placeholder="e.g. Main Hall"
                    onChange={handleUpdateChange}
                    className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Number of Rows</label>
                  <div className="relative">
                    <input
                      name="rows"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={updateForm.rows}
                      placeholder="e.g. 5"
                      onChange={handleUpdateChange}
                      className="w-full bg-white border border-gray-300 p-3 pr-24 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">Max: 10</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lockers Per Row</label>
                  <div className="relative">
                    <input
                      name="lockersPerRow"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={updateForm.lockersPerRow}
                      placeholder="e.g. 10"
                      onChange={handleUpdateChange}
                      className="w-full bg-white border border-gray-300 p-3 pr-24 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">Max: 10</span>
                  </div>
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
                    className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 hover:text-red-700 transition font-bold text-lg shadow hover:shadow-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-300 pb-3 text-center">Create New Map</h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location Name</label>
                  <input
                    name="locationName"
                    value={form.locationName}
                    placeholder="e.g. Main Hall"
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Number of Rows</label>
                  <div className="relative">
                    <input
                      name="rows"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={form.rows}
                      placeholder="e.g. 5"
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 p-3 pr-24 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">Max: 10</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lockers Per Row</label>
                  <div className="relative">
                    <input
                      name="lockersPerRow"
                      type="number"
                      min="1"
                      max="10"
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault(); }}
                      value={form.lockersPerRow}
                      placeholder="e.g. 10"
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 p-3 pr-24 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">Max: 10</span>
                  </div>
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