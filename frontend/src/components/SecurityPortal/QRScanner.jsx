import React, { useState, useRef } from 'react';
import axios from 'axios';

const PARKING_API = 'http://localhost:5000/api/parking';
const SECURITY_API = 'http://localhost:5000/api/security';

const QRScanner = () => {
  // Mode: 'staff' or 'parking'
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [scanTarget, setScanTarget] = useState('staff'); // 'staff' or 'parking'
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [parkingScanResult, setParkingScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-dismiss notifications
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Initialize camera on mount
  React.useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [scanMode]);

  // Camera control
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions and try manual entry instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  // Capture frame from video
  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      setError('Camera scanning requires QR library. Please use Manual Entry instead.');
    }
  };

  // ── STAFF verification ────────────────────────────────────────────────────
  const handleVerifyStaff = async (qrData) => {
    if (!qrData.trim()) {
      setError('Please Enter A Valid Staff ID Or QR Code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${SECURITY_API}/staff`);
      const staff = response.data.data?.find(
        (s) => s.staffID === qrData.trim() || s.name.toLowerCase().includes(qrData.toLowerCase())
      );

      if (staff) {
        setScanResult(staff);
        setParkingScanResult(null);
        setSuccess(`✓ Successfully Verified: ${staff.name}`);
        setManualInput('');
      } else {
        setError('Staff Member Not Found. Please Check The QR Code Or Staff ID.');
        setScanResult(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error Verifying Staff. Please Try Again.');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ── PARKING departure QR scan ─────────────────────────────────────────────
  const handleParkingScan = async (qrData) => {
    if (!qrData.trim()) {
      setError('Please Enter A Valid Student ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${PARKING_API}/security/scan-qr`, {
        studentId: qrData.trim(),
      });

      const { data } = response;
      setScanResult(null);
      setParkingScanResult(data);

      if (data.scanType === 'arrival') {
        setSuccess(`✓ Arrival recorded for ${data.data?.studentName || qrData}`);
      } else if (data.scanType === 'departure') {
        setSuccess(`✓ Departure confirmed for ${data.data?.studentName || qrData}`);
      } else {
        setSuccess(data.message || '✓ Scan processed');
      }
      setManualInput('');
    } catch (err) {
      setParkingScanResult(null);
      setError(err.response?.data?.message || 'Error processing parking scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (scanTarget === 'parking') {
      handleParkingScan(manualInput);
    } else {
      handleVerifyStaff(manualInput);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setParkingScanResult(null);
    setManualInput('');
    setError('');
    setSuccess('');
  };

  // ── Parking scan result card ──────────────────────────────────────────────
  const renderParkingScanResult = () => {
    if (!parkingScanResult) return null;

    const { scanType, data, message } = parkingScanResult;

    if (scanType === 'arrival') {
      return (
        <div className="mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-blue-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🚗</div>
            <h3 className="text-3xl font-black text-blue-700">Arrival Recorded</h3>
            <p className="text-blue-600 text-sm font-semibold mt-1">Student Has Entered Parking</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STUDENT</p>
              <p className="text-xl font-bold text-slate-800">{data?.studentName} <span className="text-sm text-slate-500 font-mono">({data?.studentId})</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">SLOT</p>
                <p className="text-lg font-black text-blue-700">{data?.slotNumber}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">ZONE</p>
                <p className="text-sm font-bold text-slate-700">{data?.zone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">BOOKED ARRIVAL</p>
                <p className="text-sm font-bold text-slate-700">{data?.arrivalTime}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-bold text-slate-600 mb-1">BOOKED LEAVING</p>
                <p className="text-sm font-bold text-slate-700">{data?.leavingTime}</p>
              </div>
            </div>
            <div className="bg-blue-100 rounded-xl p-4 border border-blue-300 text-center">
              <p className="text-blue-800 font-bold text-sm">📲 Scan this QR again when student departs to confirm departure</p>
            </div>
          </div>
          <button onClick={resetScan} className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            🔄 Scan Next
          </button>
        </div>
      );
    }

    if (scanType === 'departure') {
      return (
        <div className="mb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-emerald-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">✅</div>
            <h3 className="text-3xl font-black text-emerald-700">Departure Confirmed</h3>
            <p className="text-emerald-600 text-sm font-semibold mt-1">Slot Is Now Available</p>
          </div>
          <div className="space-y-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STUDENT</p>
              <p className="text-xl font-bold text-slate-800">{data?.studentName} <span className="text-sm text-slate-500 font-mono">({data?.studentId})</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">SLOT RELEASED</p>
                <p className="text-lg font-black text-emerald-700">{data?.slotNumber}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">ZONE</p>
                <p className="text-sm font-bold text-slate-700">{data?.zone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">ARRIVAL TIME</p>
                <p className="text-xs font-semibold text-slate-700">{data?.actualArrivalTime ? new Date(data.actualArrivalTime).toLocaleTimeString() : 'N/A'}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">DEPARTURE TIME</p>
                <p className="text-xs font-semibold text-slate-700">{data?.actualDepartureTime ? new Date(data.actualDepartureTime).toLocaleTimeString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-emerald-100 rounded-xl p-3 border border-emerald-300 text-center">
              <p className="text-emerald-800 font-bold text-sm">✉️ Departure notification sent to student</p>
            </div>
          </div>
          <button onClick={resetScan} className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            🔄 Scan Next
          </button>
        </div>
      );
    }

    // already_completed or other
    return (
      <div className="mb-8 bg-white/90 rounded-2xl shadow-xl border-2 border-slate-200 p-8">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">ℹ️</div>
          <h3 className="text-2xl font-black text-slate-700">Scan Info</h3>
        </div>
        <p className="text-slate-600 text-center font-medium">{message}</p>
        <button onClick={resetScan} className="w-full mt-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
          🔄 Scan Next
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Success Notification */}
      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <p className="text-emerald-700 font-bold">{success}</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-500 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✕</span>
            <p className="text-rose-700 font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Scan Target Toggle: Staff vs Parking */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => { setScanTarget('staff'); resetScan(); }}
          className={`py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 ${
            scanTarget === 'staff'
              ? 'bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          👥 Staff Verification
        </button>
        <button
          onClick={() => { setScanTarget('parking'); resetScan(); }}
          className={`py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 ${
            scanTarget === 'parking'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-emerald-400'
          }`}
        >
          🚗 Parking QR Scan
        </button>
      </div>

      {/* Scan target label */}
      {scanTarget === 'parking' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold text-center">
          📲 Parking Mode — Scan student QR to record arrival or departure
        </div>
      )}

      {/* Mode Toggle: Camera vs Manual */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setScanMode('camera')}
          className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            scanMode === 'camera'
              ? 'bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          📷 Camera Scan
        </button>
        <button
          onClick={() => setScanMode('manual')}
          className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            scanMode === 'manual'
              ? 'bg-[oklch(48.8%_0.243_264.376)] text-white shadow-lg'
              : 'bg-white border-2 border-slate-300 text-slate-800 hover:border-blue-400'
          }`}
        >
          ⌨️ Manual Entry
        </button>
      </div>

      {/* Camera Mode */}
      {scanMode === 'camera' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <div className="relative bg-black rounded-2xl overflow-hidden mb-6">
            {/* Animated Neon Frame */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg shadow-lg shadow-cyan-400/50"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30 animate-pulse"></div>
            </div>

            {/* Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-80 object-cover"
            />

            {/* Overlay Dark */}
            <div className="absolute inset-0 pointer-events-none bg-black/10"></div>
          </div>

          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="hidden"
          />

          <button
            onClick={captureAndScan}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? '⏳ Scanning...' : '🎯 Capture & Scan'}
          </button>

          <p className="text-center text-slate-600 text-sm mt-4">
            Position QR code within frame and click "Capture & Scan"
          </p>
        </div>
      )}

      {/* Manual Entry Mode */}
      {scanMode === 'manual' && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {scanTarget === 'parking' ? 'Student ID (from QR)' : 'Staff ID Or QR Code Value'}
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={scanTarget === 'parking' ? 'E.g., IT21345678' : 'E.g., ST-1001'}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 font-semibold text-lg text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 disabled:opacity-50 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                scanTarget === 'parking'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[oklch(48.8%_0.243_264.376)] hover:opacity-90'
              }`}
            >
              {loading
                ? '⏳ Processing...'
                : scanTarget === 'parking'
                ? '🚗 Scan Parking QR'
                : '🔍 Verify Staff'}
            </button>
          </form>
        </div>
      )}

      {/* Parking Scan Result */}
      {parkingScanResult && renderParkingScanResult()}

      {/* Staff Scan Result - Success */}
      {scanResult && scanResult.status === 'Active' && (
        <div className="mb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-emerald-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">✅</div>
            <h3 className="text-3xl font-black text-emerald-700">Access Granted</h3>
            <p className="text-emerald-600 text-sm font-semibold mt-1">Staff Member Verified</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STAFF ID</p>
              <p className="text-2xl font-black text-emerald-700">{scanResult.staffID}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">NAME</p>
              <p className="text-xl font-bold text-slate-800">{scanResult.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">DESIGNATION</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.designation}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">SHIFT</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.shift}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">GATE</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.gate}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
                <p className="text-xs font-bold text-slate-600 mb-1">PHONE</p>
                <p className="text-sm font-bold text-slate-700">{scanResult.phone}</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-emerald-200">
              <p className="text-xs font-bold text-slate-600 mb-1">NIC</p>
              <p className="text-lg font-bold text-slate-800">{scanResult.nic}</p>
            </div>
          </div>

          <button
            onClick={resetScan}
            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔄 Scan Another
          </button>
        </div>
      )}

      {/* Staff Scan Result - Inactive */}
      {scanResult && scanResult.status !== 'Active' && (
        <div className="mb-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl shadow-xl border-2 border-yellow-300 p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-bounce">⚠️</div>
            <h3 className="text-3xl font-black text-yellow-700">Access Restricted</h3>
            <p className="text-yellow-600 text-sm font-semibold mt-1">Staff Member Status: Inactive</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-yellow-200">
              <p className="text-xs font-bold text-slate-600 mb-1">STAFF ID</p>
              <p className="text-2xl font-black text-yellow-700">{scanResult.staffID}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-yellow-200">
              <p className="text-xs font-bold text-slate-600 mb-1">NAME</p>
              <p className="text-xl font-bold text-slate-800">{scanResult.name}</p>
            </div>

            <div className="bg-yellow-100 rounded-xl p-4 border-2 border-yellow-300">
              <p className="text-yellow-800 font-bold text-center">
                ⚠️ This Staff Member Is Currently Inactive. Contact Administration To Activate.
              </p>
            </div>
          </div>

          <button
            onClick={resetScan}
            className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🔄 Try Another Scan
          </button>
        </div>
      )}

      {/* Empty State */}
      {!scanResult && !parkingScanResult && !loading && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
          <p className="text-5xl mb-4">{scanTarget === 'parking' ? '🚗' : '📱'}</p>
          <p className="text-xl font-bold text-slate-800">
            {scanTarget === 'parking' ? 'Ready To Scan Parking QR' : 'Ready To Scan'}
          </p>
          <p className="text-slate-600 mt-2">
            {scanTarget === 'parking'
              ? 'Enter student ID to record arrival or departure'
              : scanMode === 'camera'
              ? 'Position a QR code in the camera frame'
              : 'Enter staff ID or scan QR code data'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
