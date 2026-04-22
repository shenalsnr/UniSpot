import React, { useState, useEffect } from 'react';
import axios from 'axios';

// SVG Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const StaffRegister = () => {
  // State Management
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [generatedID, setGeneratedID] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    designation: 'Security Guard',
    shift: 'Day',
    gate: 'Gate A',
    phone: '',
    status: 'Active',
  });

  const [formErrors, setFormErrors] = useState({});
  const API_URL = 'http://localhost:5000/api/security';

  // Fetch staff list on mount
  useEffect(() => {
    fetchAllStaff();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // API: Fetch all staff
  const fetchAllStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/staff`);
      setStaffList(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff records');
    } finally {
      setLoading(false);
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.nic.trim()) {
      errors.nic = 'NIC is required';
    } else if (!/^[0-9]{10,12}$/.test(formData.nic)) {
      errors.nic = 'NIC must be 10-12 digits only';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Phone Number must be exactly 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nic: '',
      designation: 'Security Guard',
      shift: 'Day',
      gate: 'Gate A',
      phone: '',
      status: 'Active',
    });
    setFormErrors({});
    setGeneratedID('');
    setSelectedStaff(null);
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      nic: staff.nic,
      designation: staff.designation,
      shift: staff.shift,
      gate: staff.gate,
      phone: staff.phone,
      status: staff.status,
    });
    setGeneratedID(staff.staffID);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // API: Submit form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditMode && selectedStaff) {
        // UPDATE
        await axios.put(`${API_URL}/staff/${selectedStaff.staffID}`, formData);
        setSuccess('Staff member updated successfully');
      } else {
        // CREATE
        const response = await axios.post(`${API_URL}/staff`, formData);
        setGeneratedID(response.data.data?.staffID);
        setSuccess('Staff member registered successfully');
      }

      // Refresh data and close modal
      fetchAllStaff();
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // API: Delete staff
  const handleDeleteStaff = async (staffID) => {
    if (window.confirm('Are you absolutely sure you want to delete this staff member? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/staff/${staffID}`);
        setSuccess('Staff member deleted successfully');
        fetchAllStaff();
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting staff member');
      }
    }
  };

  // API: Toggle status
  const toggleStatus = async (staff) => {
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.put(`${API_URL}/staff/${staff.staffID}`, { status: newStatus });
      setSuccess(`Staff status changed to ${newStatus}`);
      fetchAllStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating staff status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3">
        {success && (
          <div className="animate-slide-in-right flex items-center gap-3 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-lg p-4 px-6 min-w-[320px]">
            <div className="text-emerald-500"><CheckCircleIcon /></div>
            <div>
              <p className="text-slate-900 font-bold">Success</p>
              <p className="text-slate-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="animate-slide-in-right flex items-center gap-3 bg-white border-l-4 border-rose-500 shadow-2xl rounded-lg p-4 px-6 min-w-[320px]">
            <div className="text-rose-500"><ExclamationCircleIcon /></div>
            <div>
              <p className="text-slate-900 font-bold">Error Occurred</p>
              <p className="text-slate-600 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black text-[#1e1b4b] tracking-tight mb-2">Security Staff</h2>
          <p className="text-slate-500 font-medium">Manage and monitor all security personnel across university gates</p>
        </div>
        <button
          onClick={openAddModal}
          className="group flex items-center gap-2 bg-[#1e1b4b] hover:bg-[#2e2a63] text-white font-bold py-3.5 px-8 rounded-2xl shadow-[0_10px_20px_rgba(30,27,75,0.2)] hover:shadow-[0_15px_30px_rgba(30,27,75,0.3)] transform hover:-translate-y-1 transition-all duration-300"
        >
          <PlusIcon />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Staff Table Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all duration-500">
        {loading ? (
          <div className="p-24 text-center">
            <div className="inline-block w-16 h-16 border-4 border-[#1e1b4b]/10 border-t-[#1e1b4b] rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-6 font-bold text-lg tracking-wide animate-pulse">Fetching staff records...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-24 text-center max-w-md mx-auto">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <EmptyIcon />
            </div>
            <p className="text-2xl font-black text-slate-800 mb-3">No Records Yet</p>
            <p className="text-slate-500 font-medium mb-8">Start by adding your first security staff member to the system.</p>
            <button
              onClick={openAddModal}
              className="text-[#1e1b4b] font-bold underline underline-offset-4 hover:text-[#2e2a63] transition-colors"
            >
              Register staff now &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff ID</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Basic Info</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffList.map((staff) => (
                  <tr key={staff._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <span className="font-mono font-bold text-[#1e1b4b] bg-[#1e1b4b]/5 px-3 py-1.5 rounded-lg text-sm">
                        {staff.staffID}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">{staff.name}</span>
                        <span className="text-slate-400 text-xs mt-0.5">NIC: {staff.nic}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-slate-600">{staff.designation}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider">
                          {staff.shift}
                        </span>
                        <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider">
                          {staff.gate}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-slate-700 font-medium">{staff.phone}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() => toggleStatus(staff)}
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                          staff.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-400 hover:text-white ring-1 ring-slate-200'
                        }`}
                      >
                        {staff.status}
                      </button>
                    </td>
    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 transition-opacity duration-300">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                          title="Edit Staff"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.staffID)}
                          className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300"
                          title="Delete Staff"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Modern Glassmorphism Implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 ml-[72px] lg:ml-[240px]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#1e1b4b]/40 backdrop-blur-[10px] animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="bg-[#1e1b4b] px-10 py-8 text-white relative">
              <div className="absolute top-0 right-0 p-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              <h3 className="text-3xl font-black mb-2">
                {isEditMode ? 'Edit Staff Profile' : 'Staff Registration'}
              </h3>
              <p className="text-white/60 font-medium">Complete the information below to {isEditMode ? 'update' : 'enroll'} staff</p>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Staff ID - read only */}
                <div className="col-span-full">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    System Generated ID
                  </label>
                  <div className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[#1e1b4b] font-mono font-bold">
                    {generatedID || 'PENDING ASSIGNMENT'}
                  </div>
                </div>

                {/* Name */}
                <div className="col-span-full">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter official designation name"
                    className={`w-full px-5 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 font-bold ${
                      formErrors.name
                        ? 'border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b]'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-wider mt-1.5 px-2">
                       {formErrors.name}
                    </p>
                  )}
                </div>

                {/* NIC */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    placeholder="10 or 12 digits"
                    className={`w-full px-5 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 font-bold ${
                      formErrors.nic
                        ? 'border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b]'
                    }`}
                  />
                  {formErrors.nic && (
                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-wider mt-1.5 px-2">
                       {formErrors.nic}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Mobile Contact *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="07XXXXXXXX"
                    className={`w-full px-5 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 font-bold ${
                      formErrors.phone
                        ? 'border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b]'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-wider mt-1.5 px-2">
                       {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Designation *
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b] transition-all duration-300 font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9InN0ZWVsdm9pZCIgc3Ryb2tlLXdpZHRoPSIyIiBviewQm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                  >
                    <option value="Security Guard">Security Guard</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Shift Mode *
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b] transition-all duration-300 font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9InN0ZWVsdm9pZCIgc3Ryb2tlLXdpZHRoPSIyIiBviewQm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                  </select>
                </div>

                {/* Gate */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Assigned Post *
                  </label>
                  <select
                    name="gate"
                    value={formData.gate}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b] transition-all duration-300 font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9InN0ZWVsdm9pZCIgc3Ryb2tlLXdpZHRoPSIyIiBviewQm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                  >
                    <option value="Gate A">Gate A (Main)</option>
                    <option value="Gate B">Gate B (West)</option>
                    <option value="Gate C">Gate C (Staff)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Account Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1e1b4b]/10 focus:border-[#1e1b4b] transition-all duration-300 font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9InN0ZWVsdm9pZCIgc3Ryb2tlLXdpZHRoPSIyIiBviewQm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                  >
                    <option value="Active">Operational</option>
                    <option value="Inactive">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-12">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-300"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-[#1e1b4b] hover:bg-[#2e2a63] disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_10px_20px_rgba(30,27,75,0.2)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  {loading ? 'Processing...' : isEditMode ? 'Apply Updates' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRegister;
