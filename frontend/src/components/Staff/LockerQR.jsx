import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import "./LockerQR.css";

const API = "http://localhost:5000/api/locker-qr";

/**
 * LockerQR — Student-ID-based locker access management.
 * No QR codes are generated. QR scanner reads student IDs from their existing ID cards.
 */
const LockerQR = () => {
  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("access");

  // ── Scanner / input ───────────────────────────────────────────────────────
  const [scanMode, setScanMode] = useState("manual");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Student + Locker result ───────────────────────────────────────────────
  const [result, setResult] = useState(null); // { student, locker, hasActiveLocker }

  // ── Assign form ───────────────────────────────────────────────────────────
  const [duration, setDuration] = useState(4);

  // ── All lockers ───────────────────────────────────────────────────────────
  const [allLockers, setAllLockers] = useState([]);
  const [lockersLoading, setLockersLoading] = useState(false);



  // ── Alerts ────────────────────────────────────────────────────────────────
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── QR scanner refs ───────────────────────────────────────────────────────
  const qrRef = useRef(null);
  const cooldownRef = useRef(false);

  // Auto-dismiss alerts
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 5000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(""), 5000); return () => clearTimeout(t); }
  }, [error]);

  // ── Camera lifecycle ──────────────────────────────────────────────────────
  const stopScanning = useCallback(async () => {
    try {
      if (qrRef.current) {
        try { if (qrRef.current.isScanning) await qrRef.current.stop(); } catch (_) {}
        try { await qrRef.current.clear(); } catch (_) {}
        qrRef.current = null;
      }
      const c = document.getElementById("lqr-scanner-container");
      if (c) c.innerHTML = "";
    } catch (_) {}
  }, []);

  const startScanning = useCallback(async () => {
    const container = document.getElementById("lqr-scanner-container");
    if (!container) return;
    if (qrRef.current?.isScanning) return;

    await stopScanning();
    container.innerHTML = "";

    qrRef.current = new Html5Qrcode("lqr-scanner-container", {
      formFactor: "portrait",
      aspectRatio: 1.0,
    });

    try {
      await qrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!decodedText?.trim() || cooldownRef.current) return;
          cooldownRef.current = true;
          const scannedId = decodedText.trim();
          setStudentIdInput(scannedId);
          // Auto-search after scan
          lookupStudent(scannedId);
          setTimeout(() => { cooldownRef.current = false; }, 3000);
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera error:", err);
    }
  }, [stopScanning]);

  useEffect(() => {
    if (activeTab === "access" && scanMode === "camera") {
      startScanning();
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [activeTab, scanMode, startScanning, stopScanning]);

  useEffect(() => () => stopScanning(), [stopScanning]);

  // ── Fetch active/booked lockers only ───────────────────────────────────────
  const fetchLockers = async () => {
    setLockersLoading(true);
    try {
      const { data } = await axios.get(`${API}/active`);
      setAllLockers(data.lockers || []);
    } catch (e) {
      setError("Failed to load active bookings");
    } finally {
      setLockersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "lockers") fetchLockers();
  }, [activeTab]);

  // ── Lookup student & locker ───────────────────────────────────────────────
  const lookupStudent = async (idOverride) => {
    const sid = (idOverride || studentIdInput).trim();
    if (!sid) { setError("Please enter a Student ID"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.get(`${API}/student/${encodeURIComponent(sid)}`);
      setResult(data);
      if (data.hasActiveLocker) {
        setSuccess(`${data.student.name} has Locker ${data.locker.lockerNumber}`);
      } else if (data.locker?.status === "expired") {
        setSuccess(`${data.student.name}'s locker has expired — can reassign`);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Student not found");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    lookupStudent();
  };

  // ── Assign locker ─────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!result?.student?.studentId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/assign`, {
        studentId: result.student.studentId,
        durationHours: Number(duration) || 4,
      });
      setSuccess(data.message);
      setResult({
        ...result,
        locker: data.locker,
        hasActiveLocker: true
      });
    } catch (e) {
      setError(e.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Release locker ────────────────────────────────────────────────────────
  const handleRelease = async () => {
    if (!result?.student?.studentId) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API}/release/${encodeURIComponent(result.student.studentId)}`);
      setSuccess(`Locker ${data.locker?.lockerNumber || ""} released and now available for next student`);
      setResult({
        ...result,
        locker: null,
        hasActiveLocker: false
      });
      // Refresh lockers list so the released locker shows as available immediately
      fetchLockers();
    } catch (e) {
      setError(e.response?.data?.message || "Release failed");
    } finally {
      setLoading(false);
    }
  };



  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetSearch = async () => {
    setResult(null);
    setStudentIdInput("");
    setError("");
    setSuccess("");
    cooldownRef.current = false;
    if (scanMode === "camera") {
      await stopScanning();
      setTimeout(() => startScanning(), 100);
    }
  };

  // ── Time remaining helper ─────────────────────────────────────────────────
  const formatRemaining = (expiresAt) => {
    if (!expiresAt) return "N/A";
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m remaining` : `${mins}m remaining`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="lqr-page">
      {/* Alerts */}
      {success && <div className="lqr-alert lqr-alert-success">✅ {success}</div>}
      {error && <div className="lqr-alert lqr-alert-error">❌ {error}</div>}

      {/* Tabs */}
      <div className="lqr-tabs">
        <button className={`lqr-tab ${activeTab === "access" ? "active" : ""}`} onClick={() => setActiveTab("access")}>
          🔑 Locker Access
        </button>
        <button className={`lqr-tab ${activeTab === "lockers" ? "active" : ""}`} onClick={() => setActiveTab("lockers")}>
          📋 Active Bookings
        </button>

      </div>

      {/* ═══ TAB: Locker Access ═══════════════════════════════════════════ */}
      {activeTab === "access" && (
        <>
          {/* Mode toggle */}
          <div className="lqr-card">
            <div className="lqr-mode-toggle">
              <button className={`lqr-mode-btn ${scanMode === "manual" ? "active" : ""}`} onClick={() => setScanMode("manual")}>
                ⌨️ Manual Entry
              </button>
              <button className={`lqr-mode-btn ${scanMode === "camera" ? "active" : ""}`} onClick={() => setScanMode("camera")}>
                📷 Camera Scan
              </button>
            </div>

            {/* Manual mode */}
            {scanMode === "manual" && (
              <form onSubmit={handleManualSubmit}>
                <div className="lqr-form-group">
                  <label>Student ID</label>
                  <div className="lqr-input-row">
                    <input
                      className="lqr-input"
                      type="text"
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value)}
                      placeholder="Enter Student ID (e.g. IT21345678)"
                      disabled={loading}
                    />
                    <button className="lqr-btn lqr-btn-primary" type="submit" disabled={loading || !studentIdInput.trim()}>
                      {loading ? <span className="lqr-spinner" /> : "🔍 Check"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Camera mode */}
            {scanMode === "camera" && (
              <>
                <div id="lqr-scanner-container" className="lqr-scanner-box" />
                <p className="lqr-scanner-hint">
                  📷 Point camera at student ID card or QR code — auto-fills Student ID
                </p>
                {studentIdInput && (
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Scanned ID: </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#0052a3" }}>{studentIdInput}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Student Result ─────────────────────────────────────────── */}
          {result && result.found && (
            <div className="lqr-card lqr-student-card">
              {/* Student header */}
              <div className="lqr-student-header">
                {result.student.photo ? (
                  <img
                    src={`http://localhost:5000${result.student.photo}`}
                    alt={result.student.name}
                    className="lqr-student-photo"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="lqr-student-photo-placeholder">👤</div>
                )}
                <div className="lqr-student-info">
                  <h4>{result.student.name}</h4>
                  <div className="lqr-student-meta">
                    <span>🎓 {result.student.studentId}</span>
                    <span>📚 {result.student.faculty}</span>
                  </div>
                </div>
              </div>

              {/* Locker status */}
              {result.hasActiveLocker && result.locker ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <span className="lqr-badge lqr-badge-assigned">🔒 Locker Assigned</span>
                  </div>
                  <div className="lqr-details-grid">
                    <div className="lqr-detail-box">
                      <div className="lqr-detail-label">Locker</div>
                      <div className="lqr-detail-value">{result.locker.lockerNumber}</div>
                    </div>
                    <div className="lqr-detail-box">
                      <div className="lqr-detail-label">Assigned At</div>
                      <div className="lqr-detail-value" style={{ fontSize: 14 }}>{new Date(result.locker.assignedAt).toLocaleString()}</div>
                    </div>
                    <div className="lqr-detail-box">
                      <div className="lqr-detail-label">Time Remaining</div>
                      <div className="lqr-detail-value" style={{ color: "#0052a3" }}>{formatRemaining(result.locker.expiresAt)}</div>
                    </div>
                  </div>
                  <button className="lqr-btn lqr-btn-danger lqr-btn-full" onClick={handleRelease} disabled={loading}>
                    {loading ? <><span className="lqr-spinner" /> Releasing...</> : "🔓 Release Locker"}
                  </button>
                </>
              ) : result.locker?.status === "expired" ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <span className="lqr-badge lqr-badge-expired">⏰ Locker Expired</span>
                  </div>
                  <div className="lqr-details-grid">
                    <div className="lqr-detail-box">
                      <div className="lqr-detail-label">Previous Locker</div>
                      <div className="lqr-detail-value">{result.locker.lockerNumber}</div>
                    </div>
                  </div>
                  <div className="lqr-assign-form">
                    <h4 style={{ margin: 0, color: "#166534", fontWeight: 800, fontSize: 15 }}>♻️ Reassign a Locker</h4>
                    <div className="lqr-assign-row">
                      <div className="lqr-form-group">
                        <label>Duration (hours)</label>
                        <input className="lqr-input" type="number" min="1" max="24" value={duration} onChange={(e) => setDuration(e.target.value)} />
                      </div>
                    </div>
                    <button className="lqr-btn lqr-btn-success lqr-btn-full" onClick={handleAssign} disabled={loading}>
                      {loading ? <><span className="lqr-spinner" /> Assigning...</> : "✅ Assign New Locker"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <span className="lqr-badge lqr-badge-no-locker">📭 No Locker Assigned</span>
                  </div>
                  <div className="lqr-assign-form">
                    <h4 style={{ margin: 0, color: "#166534", fontWeight: 800, fontSize: 15 }}>🔐 Assign a Locker</h4>
                    <div className="lqr-assign-row">
                      <div className="lqr-form-group">
                        <label>Duration (hours)</label>
                        <input className="lqr-input" type="number" min="1" max="24" value={duration} onChange={(e) => setDuration(e.target.value)} />
                      </div>
                    </div>
                    <button className="lqr-btn lqr-btn-success lqr-btn-full" onClick={handleAssign} disabled={loading}>
                      {loading ? <><span className="lqr-spinner" /> Assigning...</> : "✅ Assign Locker"}
                    </button>
                  </div>
                </>
              )}

              {/* Scan next button */}
              <button className="lqr-btn lqr-btn-outline lqr-btn-full" onClick={resetSearch} style={{ marginTop: 14 }}>
                🔄 Scan Next Student
              </button>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="lqr-card">
              <div className="lqr-empty">
                <div className="lqr-empty-icon">🔑</div>
                <h4>Ready for Locker Access</h4>
                <p>{scanMode === "camera"
                  ? "Point camera at a student ID card or QR code"
                  : "Enter a Student ID to check or assign a locker"
                }</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ TAB: Active Bookings ══════════════════════════════════════════ */}
      {activeTab === "lockers" && (
        <div className="lqr-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h3 style={{ margin: 0 }}>📋 Active Bookings ({allLockers.length})</h3>
            <button className="lqr-btn lqr-btn-outline" onClick={fetchLockers} disabled={lockersLoading} style={{ padding: "8px 16px", fontSize: 13 }}>
              {lockersLoading ? <><span className="lqr-spinner" style={{ borderTopColor: "#0052a3", borderColor: "rgba(0,82,163,0.2)", width: 16, height: 16 }} /></> : "🔄 Refresh"}
            </button>
          </div>

          {allLockers.length === 0 && !lockersLoading ? (
            <div className="lqr-empty">
              <div className="lqr-empty-icon">✅</div>
              <h4>No Active Bookings</h4>
              <p>All lockers are currently available — no students have active bookings</p>
            </div>
          ) : (
            <div className="lqr-lockers-grid">
              {allLockers.map((l) => (
                <div className="lqr-locker-mini" key={l._id}>
                  <div className="lqr-locker-mini-header">
                    <span className="lqr-locker-mini-id">{l.lockerNumber}</span>
                    <span className="lqr-badge lqr-badge-assigned">● Active</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 700, marginTop: 6 }}>
                    👤 {l.assignedStudentName || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginTop: 4 }}>
                    🎓 {l.assignedTo}
                  </div>
                  {l.assignedAt && (
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>
                      🕐 {new Date(l.assignedAt).toLocaleString()}
                    </div>
                  )}
                  {l.assignedStudentPhone && (
                    <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginTop: 4 }}>
                      📞 {l.assignedStudentPhone}
                    </div>
                  )}
                  {l.expiresAt && (
                    <div style={{ fontSize: 12, color: "#0052a3", fontWeight: 700, marginTop: 4 }}>
                      ⏰ {formatRemaining(l.expiresAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default LockerQR;
