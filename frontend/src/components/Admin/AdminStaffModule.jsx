import React, { useState, useEffect } from 'react';
import axios from "axios";
import { showAlert } from "../../components/Shared/BeautifulAlert";
import AdminLayout from "../../components/Admin/AdminLayout";

const AdminStaffModule = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    nic: '',
    designation: 'Security Guard',
    shift: 'Day',
    gate: 'Gate A',
    phone: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (showModal || viewModalOpen || editModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal, viewModalOpen, editModalOpen]);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/security/staff');
      if (res.data.data) {
        setStaff(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      showAlert('error', 'Failed to fetch staff records. Is backend running?');
    }
    setLoading(false);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newStaff.name || !newStaff.nic || !newStaff.phone) {
      showAlert('warning', 'Please fill in all required fields');
      return;
    }

    if (newStaff.nic.length < 10 || newStaff.nic.length > 12 || isNaN(newStaff.nic)) {
      showAlert('warning', 'NIC must be 10-12 digits');
      return;
    }

    if (newStaff.phone.length !== 10 || isNaN(newStaff.phone)) {
      showAlert('warning', 'Phone must be 10 digits');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/security/staff', newStaff);
      if (res.data.data) {
        setShowModal(false);
        setNewStaff({
          name: '',
          nic: '',
          designation: 'Security Guard',
          shift: 'Day',
          gate: 'Gate A',
          phone: '',
          status: 'Active'
        });
        fetchStaff();
        showAlert('success', 'Staff member created successfully');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create staff member';
      showAlert('error', errorMsg);
    }
  };

  const handleDeleteStaff = async (staffID) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/security/staff/${staffID}`);
      setStaff(staff.filter(s => s.staffID !== staffID));
      showAlert('success', 'Staff member deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete staff member';
      showAlert('error', errorMsg);
    }
  };

  const handleViewClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setViewModalOpen(true);
  };

  const handleEditClick = (staffMember, e) => {
    if (e) e.stopPropagation();
    setSelectedStaff(staffMember);
    setEditForm({
      name: staffMember.name,
      nic: staffMember.nic,
      designation: staffMember.designation,
      shift: staffMember.shift,
      gate: staffMember.gate,
      phone: staffMember.phone,
      status: staffMember.status
    });
    setEditModalOpen(true);
    setViewModalOpen(false);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    
    if (!editForm.name || !editForm.nic || !editForm.phone) {
      showAlert('warning', 'Please fill in all required fields');
      return;
    }

    if (editForm.nic.length < 10 || editForm.nic.length > 12 || isNaN(editForm.nic)) {
      showAlert('warning', 'NIC must be 10-12 digits');
      return;
    }

    if (editForm.phone.length !== 10 || isNaN(editForm.phone)) {
      showAlert('warning', 'Phone must be 10 digits');
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/security/staff/${selectedStaff.staffID}`, editForm);
      if (res.data.data) {
        setEditModalOpen(false);
        fetchStaff();
        showAlert('success', 'Staff member updated successfully');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update staff member';
      showAlert('error', errorMsg);
    }
  };

  const filteredStaff = staff.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (member.staffID || '').toLowerCase().includes(searchLower) ||
      (member.name || '').toLowerCase().includes(searchLower) ||
      (member.phone || '').toLowerCase().includes(searchLower) ||
      (member.nic || '').toLowerCase().includes(searchLower) ||
      (member.designation || '').toLowerCase().includes(searchLower) ||
      (member.shift || '').toLowerCase().includes(searchLower) ||
      (member.gate || '').toLowerCase().includes(searchLower) ||
      (member.status || '').toLowerCase().includes(searchLower);

    let matchesFilter = true;
    if (filterStatus === 'Active') matchesFilter = member.status === 'Active';
    if (filterStatus === 'Inactive') matchesFilter = member.status === 'Inactive';

    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Main Header Topic */}
          <div className="mb-10 relative z-10">
            <div className="bg-[oklch(48.8%_0.243_264.376)] text-white rounded-[26px] p-8 shadow-xl shadow-blue-500/20 border border-white/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase">Security Staff Records</h1>
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <span className="w-8 h-px bg-white/30"></span>
                  <p>Comprehensive log of authorized campus security personnel</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-blue-50/40">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="text-xl font-bold text-blue-900">System Records</h2>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-[oklch(48.8%_0.243_264.376)] hover:text-white transition-colors whitespace-nowrap"
                >
                  + Add New Staff
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by Staff ID, Name, Phone, NIC, Designation, Shift, or Gate..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(48.8%_0.243_264.376)] text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[oklch(48.8%_0.243_264.376)] text-gray-700 min-w-[150px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-16 text-center text-blue-500 font-bold animate-pulse text-lg">Fetching records...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-extrabold uppercase tracking-widest border-b-2 border-gray-200">
                    <tr>
                      <th className="py-5 px-6">Staff ID</th>
                      <th className="py-5 px-6">Name</th>
                      <th className="py-5 px-6">Designation</th>
                      <th className="py-5 px-6">NIC</th>
                      <th className="py-5 px-6">Phone</th>
                      <th className="py-5 px-6">Shift</th>
                      <th className="py-5 px-6">Gate</th>
                      <th className="py-5 px-6">Status</th>
                      <th className="py-5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStaff.map((member) => (
                      <tr key={member._id} onClick={() => handleViewClick(member)} className="hover:bg-blue-50/60 transition-colors duration-150 cursor-pointer">
                        <td className="py-5 px-6 font-bold text-blue-900 text-lg">
                          {member.staffID}
                        </td>
                        <td className="py-5 px-6 font-bold text-gray-800">
                          {member.name}
                        </td>
                        <td className="py-5 px-6 text-gray-700 text-sm">
                          {member.designation}
                        </td>
                        <td className="py-5 px-6 font-mono text-gray-600 text-sm">
                          {member.nic}
                        </td>
                        <td className="py-5 px-6 font-mono text-gray-600 text-sm">
                          {member.phone}
                        </td>
                        <td className="py-5 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            {member.shift}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                            {member.gate}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          {member.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-5 px-6 text-center space-x-3">
                          <button 
                            onClick={(e) => handleEditClick(member, e)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                            title="Edit Staff"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteStaff(member.staffID); }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-bold transition-colors"
                            title="Delete Staff"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {staff.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-16 text-center text-gray-400 font-semibold text-lg">
                          No database records found.
                        </td>
                      </tr>
                    )}
                    {staff.length > 0 && filteredStaff.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-16 text-center text-gray-400 font-semibold text-lg">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full my-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6">Add Security Staff</h2>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                  <input 
                    required
                    type="text" 
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">NIC *</label>
                  <input 
                    required
                    type="text" 
                    value={newStaff.nic}
                    onChange={(e) => setNewStaff({...newStaff, nic: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    placeholder="10-12 digits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                  <input 
                    required
                    type="text" 
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    placeholder="10 digits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Designation</label>
                  <select 
                    value={newStaff.designation}
                    onChange={(e) => setNewStaff({...newStaff, designation: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  >
                    <option value="Security Guard">Security Guard</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Shift</label>
                    <select 
                      value={newStaff.shift}
                      onChange={(e) => setNewStaff({...newStaff, shift: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    >
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gate</label>
                    <select 
                      value={newStaff.gate}
                      onChange={(e) => setNewStaff({...newStaff, gate: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    >
                      <option value="Gate A">Gate A</option>
                      <option value="Gate B">Gate B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select 
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({...newStaff, status: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded hover:opacity-90 transition-opacity"
                  >
                    Save Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModalOpen && selectedStaff && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Staff Details</h2>
                <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Staff ID</span>
                    <p className="text-lg font-bold text-blue-900">{selectedStaff.staffID}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                    {selectedStaff.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 mt-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Name</span>
                  <p className="font-semibold">{selectedStaff.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Phone</span>
                    <p>{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">NIC</span>
                    <p className="font-mono">{selectedStaff.nic}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Designation</span>
                    <p>{selectedStaff.designation}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Shift</span>
                    <p>{selectedStaff.shift}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Gate</span>
                  <p>{selectedStaff.gate}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setViewModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Close</button>
                <button 
                  onClick={(e) => handleEditClick(selectedStaff, e)}
                  className="px-5 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded hover:opacity-90 transition-opacity"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && selectedStaff && editForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Edit Staff Member</h2>
                <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleUpdateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                  <input 
                    required
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">NIC *</label>
                  <input 
                    required
                    type="text" 
                    value={editForm.nic}
                    onChange={(e) => setEditForm({...editForm, nic: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                  <input 
                    required
                    type="text" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Designation</label>
                  <select 
                    value={editForm.designation}
                    onChange={(e) => setEditForm({...editForm, designation: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  >
                    <option value="Security Guard">Security Guard</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Shift</label>
                    <select 
                      value={editForm.shift}
                      onChange={(e) => setEditForm({...editForm, shift: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    >
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Gate</label>
                    <select 
                      value={editForm.gate}
                      onChange={(e) => setEditForm({...editForm, gate: e.target.value})}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    >
                      <option value="Gate A">Gate A</option>
                      <option value="Gate B">Gate B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[oklch(48.8%_0.243_264.376)] text-white font-bold rounded hover:opacity-90 transition-opacity"
                  >
                    Update Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStaffModule;
