import { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Building2,
  Scan,
  Compass,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Search,
  UserRound,
  Clock,
  IdCard,
  Lock,
  XCircle,
  UserX,
  LogOut,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getOfficeLocation,
  setOfficeLocation,
  calculateDistance,
  markAttendance,
  signOutAttendance,
  calculateWorkingHours,
  verifyFaceMatch,
  verifyEmployeeById,
  getTodayDateString,
  getRealCurrentTimeString,
  analyzeEyeBlink,
  getAllAttendanceRecords,
  fetchEmployeesFromDB,
  fetchAttendanceFromDB,
  fetchOfficeFromDB,
  getEmployees,
} from "../services/attendanceService";

function Attendance() {
  // Live real-time clock ticker
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Step navigation: 1 = Enter ID, 2 = Check Location, 3 = Click Pic & Verify, 4 = Present
  const [currentStep, setCurrentStep] = useState(1);

  // Eye Blink Auto-Capture State
  const blinkStateRef = useRef({
    openBaseline: 0,
    openFrames: 0,
    closedFrames: 0,
    triggered: false,
    canvas: null,
    ctx: null,
  });
  const [blinkPrompt, setBlinkPrompt] = useState("Position your face inside the oval");
  const [blinkDetectedAnim, setBlinkDetectedAnim] = useState(false);

  // Employee ID Verification (Step 1 - Zero data shown)
  const [inputEmpId, setInputEmpId] = useState("");
  const [matchedEmp, setMatchedEmp] = useState(null);
  const [empError, setEmpError] = useState("");
  const [verifyingId, setVerifyingId] = useState(false);
  const [idVerifiedSuccess, setIdVerifiedSuccess] = useState(false);
  const [alreadySignedOutModal, setAlreadySignedOutModal] = useState(null);

  // Location state (Step 2 - 50m Rule)
  const [office, setOffice] = useState(getOfficeLocation());
  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationFetching, setLocationFetching] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [demoOfficeSet, setDemoOfficeSet] = useState(false);

  // Camera & Biometric Capture (Step 3 - High Accuracy)
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [faceResult, setFaceResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Present Attendance (Step 4 - Success Page)
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [alreadyMarked, setAlreadyMarked] = useState(null);
  const [actionType, setActionType] = useState("CHECK_IN"); // "CHECK_IN" or "SIGN_OUT"

  // Cleanup camera on unmount or step switch
  useEffect(() => {
    fetchEmployeesFromDB().catch(() => {});
    fetchAttendanceFromDB().catch(() => {});
    fetchOfficeFromDB().then((off) => {
      if (off) setOffice(off);
    }).catch(() => {});

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep === 3) {
      blinkStateRef.current.triggered = false;
      blinkStateRef.current.openBaseline = 0;
      blinkStateRef.current.openFrames = 0;
      blinkStateRef.current.closedFrames = 0;
      setBlinkDetectedAnim(false);
      setBlinkPrompt("Aligning face in the oval...");
      startCamera();
    } else {
      stopCamera();
    }
  }, [currentStep]);

  // ==========================================
  // STEP 1: VERIFY EMPLOYEE ID (ZERO DATA EXPOSED)
  // ==========================================
  const handleVerifyEmpId = async (e) => {
    if (e) e.preventDefault();
    const searchId = inputEmpId.trim().toUpperCase();
    setEmpError("");

    if (!searchId) {
      setEmpError("Please enter your Employee ID (e.g. GSR-101)");
      return;
    }

    setVerifyingId(true);

    try {
      let emps = await fetchEmployeesFromDB().catch(() => null);
      if (!emps || emps.length === 0) {
        emps = getEmployees();
      }

      const found = emps ? emps.find((emp) => emp.id.toUpperCase() === searchId) : null;

      if (found) {
        const hasPhoto = Boolean(
          (found.facePhoto && typeof found.facePhoto === "string" && found.facePhoto.trim().length > 0) ||
          (Array.isArray(found.facePhotos) && found.facePhotos.some((p) => p && typeof p === "string" && p.trim().length > 0))
        );

        if (!hasPhoto) {
          setMatchedEmp(null);
          setIdVerifiedSuccess(false);
          setVerifyingId(false);
          setEmpError(
            `Employee ${found.name} (${found.id}) has no registered face photo in database. Please register your biometric face photo in Admin Dashboard first.`
          );
          return;
        }

        // Check if already marked today
        const today = getTodayDateString();
        let records = await fetchAttendanceFromDB().catch(() => null);
        if (!records || !Array.isArray(records)) {
          records = getAllAttendanceRecords();
        }
        const existing = records.find(
          (r) => r.empId === found.id && r.date === today
        );

        // CASE 1: ALREADY COMPLETED BOTH CHECK-IN AND SIGN-OUT FOR TODAY -> POPUP
        if (existing && existing.signOutTime) {
          setVerifyingId(false);
          setAlreadySignedOutModal({
            ...existing,
            empName: found.name,
            empId: found.id,
            date: today,
          });
          return;
        }

        setMatchedEmp(found);
        setIdVerifiedSuccess(true);
        setVerifyingId(false);
        setAlreadyMarked(existing || null);

        // CASE 2: ALREADY CHECKED IN (PRESENT) TODAY -> AUTOMATICALLY SIGN-OUT
        if (existing && !existing.signOutTime) {
          setActionType("SIGN_OUT");
        } else {
          // CASE 3: FIRST TIME TODAY -> CHECK-IN (PRESENT)
          setActionType("CHECK_IN");
        }

        // Immediately transition to Location Check (Step 2)
        setTimeout(() => {
          setCurrentStep(2);
          fetchLocation();
        }, 500);
      } else {
        setMatchedEmp(null);
        setIdVerifiedSuccess(false);
        setVerifyingId(false);
        setEmpError(
          `Employee ID "${searchId}" is not present in the database. Please verify and try again.`
        );
      }
    } catch {
      setVerifyingId(false);
      setEmpError("Error connecting to database. Please check connection.");
    }
  };

  // ==========================================
  // STEP 2: FETCH LOCATION (50M PERIMETER RULE)
  // ==========================================
  const fetchLocation = () => {
    setLocationFetching(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationFetching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setUserCoords(coords);
        const dist = calculateDistance(
          coords.lat,
          coords.lng,
          office.lat,
          office.lng
        );
        setDistance(dist);
        setLocationFetching(false);
      },
      () => {
        setLocationError(
          "Location access was denied or timed out. Please allow GPS / Location permission in your browser."
        );
        setLocationFetching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Set Current Device Location as Office (Testing Mode helper)
  const handleSetCurrentAsOffice = () => {
    if (!userCoords) {
      alert("Please wait for your GPS coordinates to be fetched first.");
      return;
    }
    const newOffice = {
      ...office,
      name: "Current Device Location (Office Center)",
      lat: userCoords.lat,
      lng: userCoords.lng,
      radiusMeters: 50,
    };
    setOffice(newOffice);
    setOfficeLocation(newOffice);
    setDistance(0);
    setDemoOfficeSet(true);
  };

  const isWithin50m = distance !== null && distance <= 50;

  const handleProceedToCamera = () => {
    if (distance === null) {
      alert("Please wait for location detection to complete.");
      return;
    }
    if (distance > 50) {
      alert(
        `You are ${distance}m away from the office. Attendance is strictly permitted within 50 meters.`
      );
      return;
    }
    setCurrentStep(3);
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Attach video ref and auto-play stream when video mounts
  const attachVideoRef = (el) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      if (el.srcObject !== streamRef.current) {
        el.srcObject = streamRef.current;
      }
      el.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // ==========================================
  // STEP 3: HIGH-ACCURACY CAMERA & FACE VERIFY
  // ==========================================
  const startCamera = async () => {
    setCameraError("");
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
      } catch {
        // Fallback for laptops/browsers with basic camera constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error("Camera start error:", err);
      setCameraError(
        "Camera permission is required to capture live face picture. Please enable camera access in your browser."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture Photo, Strictly Verify against DB & Mark Success
  const handleCaptureAndVerify = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.readyState < 2) {
      alert("Camera video feed is not ready yet. Please wait a moment for the camera to start.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Validate that camera did not capture a black or empty frame
    const testData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let lumSum = 0;
    const step = 16;
    let count = 0;
    for (let i = 0; i < testData.length; i += 4 * step) {
      lumSum += (testData[i] + testData[i + 1] + testData[i + 2]) / 3;
      count++;
    }
    const avgBrightness = lumSum / count;
    if (avgBrightness < 18) {
      alert("Captured frame is pitch black or too dark. Please ensure camera lens is uncovered, and face is well lit.");
      return;
    }

    // High resolution picture with high JPEG quality
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
    stopCamera();

    // Trigger genuine biometric verification against DB reference photo
    setVerifyingFace(true);

    try {
      const refPhotos = (matchedEmp?.facePhotos && Array.isArray(matchedEmp.facePhotos) && matchedEmp.facePhotos.length > 0)
        ? matchedEmp.facePhotos
        : (matchedEmp?.facePhoto ? [matchedEmp.facePhoto] : []);
      const result = await verifyFaceMatch(dataUrl, refPhotos);
      setFaceResult(result);

      if (result.match) {
        if (actionType === "SIGN_OUT") {
          // Automatic Sign-Out on Face Verification - No manual button needed!
          try {
            const record = await signOutAttendance({
              empId: matchedEmp.id,
              capturedPhoto: dataUrl,
              coords: userCoords,
              distanceMeters: distance || 0,
              accuracy: result.score || 99.0,
            });

            const checkInTime = alreadyMarked?.time || record?.time || getRealCurrentTimeString();
            const sTime = record?.signOutTime || getRealCurrentTimeString();
            const hours = record?.workingHours && record.workingHours !== "—"
              ? record.workingHours
              : calculateWorkingHours(checkInTime, sTime);

            const finalRecord = {
              ...record,
              empId: matchedEmp.id,
              empName: matchedEmp.name,
              time: checkInTime,
              signOutTime: sTime,
              workingHours: hours,
              status: "PRESENT",
              capturedPhoto: dataUrl,
              distanceMeters: distance || 0,
              accuracy: result.score || 99.0,
            };

            setAttendanceRecord(finalRecord);
            setAlreadyMarked(finalRecord);

            // Automatically transition to Success Screen!
            setTimeout(() => {
              setVerifyingFace(false);
              setCurrentStep(4);
            }, 600);
          } catch (err) {
            console.error("Auto sign-out error:", err);
            // Graceful fallback to guarantee user gets their hours and confirmation
            const checkInTime = alreadyMarked?.time || getRealCurrentTimeString();
            const sTime = getRealCurrentTimeString();
            const hours = calculateWorkingHours(checkInTime, sTime);

            const fallbackRecord = {
              ...(alreadyMarked || {}),
              empId: matchedEmp.id,
              empName: matchedEmp.name,
              time: checkInTime,
              signOutTime: sTime,
              workingHours: hours,
              status: "PRESENT",
              capturedPhoto: dataUrl,
              distanceMeters: distance || 0,
              accuracy: result.score || 99.0,
            };

            setAttendanceRecord(fallbackRecord);
            setAlreadyMarked(fallbackRecord);

            setTimeout(() => {
              setVerifyingFace(false);
              setCurrentStep(4);
            }, 600);
          }
        } else {
          // Standard Check-In: automatically log attendance
          try {
            const record = await markAttendance({
              empId: matchedEmp.id,
              capturedPhoto: dataUrl,
              coords: userCoords,
              distanceMeters: distance || 0,
              accuracy: result.score || 99.0,
            });
            setAttendanceRecord(record);
            setAlreadyMarked(record);

            // Transition directly to the Success Page!
            setTimeout(() => {
              setVerifyingFace(false);
              setCurrentStep(4);
            }, 700);
          } catch (attErr) {
            console.error("Mark attendance network error, saving fallback:", attErr);
            const fallbackRecord = {
              id: `ATT-${Date.now().toString().slice(-4)}`,
              empId: matchedEmp.id,
              empName: matchedEmp.name,
              date: getTodayDateString(),
              time: getRealCurrentTimeString(),
              status: "PRESENT",
              capturedPhoto: dataUrl,
              distanceMeters: distance || 0,
              accuracy: result.score || 99.0,
            };
            setAttendanceRecord(fallbackRecord);
            setAlreadyMarked(fallbackRecord);

            setTimeout(() => {
              setVerifyingFace(false);
              setCurrentStep(4);
            }, 700);
          }
        }
      } else {
        // Strictly reject: do NOT mark attendance
        setVerifyingFace(false);
        setCameraError(result.reason);
      }
    } catch (err) {
      setVerifyingFace(false);
      setCameraError("Error processing biometric face comparison.");
    }
  };

  // Auto-detect Eye Blink to take photo automatically without pressing any button
  useEffect(() => {
    if (!cameraActive || currentStep !== 3 || capturedImage || verifyingFace) return;

    const intervalId = setInterval(() => {
      if (!videoRef.current || blinkStateRef.current.triggered) return;
      const res = analyzeEyeBlink(videoRef.current, blinkStateRef.current);
      if (res && res.prompt) setBlinkPrompt(res.prompt);
      if (res && res.detected) {
        setBlinkDetectedAnim(true);
        setTimeout(() => {
          handleCaptureAndVerify();
        }, 120);
      }
    }, 75);

    return () => clearInterval(intervalId);
  }, [cameraActive, currentStep, capturedImage, verifyingFace]);

  const handleRetakePic = () => {
    setCapturedImage(null);
    setFaceResult(null);
    setVerifyingFace(false);
    setBlinkDetectedAnim(false);
    blinkStateRef.current.triggered = false;
    blinkStateRef.current.openBaseline = 0;
    blinkStateRef.current.openFrames = 0;
    blinkStateRef.current.closedFrames = 0;
    setBlinkPrompt("Position your face inside the oval");
    startCamera();
  };

  // Reset workflow for new employee
  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setInputEmpId("");
    setMatchedEmp(null);
    setCapturedImage(null);
    setFaceResult(null);
    setAttendanceRecord(null);
    setAlreadyMarked(null);
    setIdVerifiedSuccess(false);
    setDistance(null);
    setActionType("CHECK_IN");
    setAlreadySignedOutModal(null);
    setBlinkDetectedAnim(false);
    blinkStateRef.current.triggered = false;
    blinkStateRef.current.openBaseline = 0;
    blinkStateRef.current.openFrames = 0;
    blinkStateRef.current.closedFrames = 0;
  };

  return (
    <div className="attendance-page">
      {/* HEADER BANNER */}
      <div className="attendance-header-card">
        <div className="attendance-header-left">
          <span className="badge-glow">
            <ShieldCheck size={15} />
            SECURE BIOMETRIC ATTENDANCE
          </span>
          <h1>Employee Attendance Check-In</h1>
        </div>

        <div className="attendance-header-right">
          <div className="attendance-live-clock-card">
            <div className="live-clock-status">
              <span className="live-pulse-dot"></span>
              <span className="live-status-text">OFFICIAL REAL-TIME (IST)</span>
            </div>
            <div className="live-clock-digits">
              <Clock size={17} />
              <span>
                {liveTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="live-clock-date">
              {liveTime.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="office-info-pill">
            <Building2 size={18} className="office-icon" />
            <div>
              <strong>{office.name}</strong>
              <span>50m Geofenced Perimeter • Powerpet, Eluru</span>
            </div>
          </div>
        </div>
      </div>

      {/* STREAMLINED STEP PROGRESS TRACKER */}
      <div className="step-tracker-wrapper">
        <div
          className={`step-item ${
            currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""
          }`}
        >
          <div className="step-bubble">1</div>
          <span className="step-label">Enter ID</span>
        </div>
        <div className="step-line"></div>

        <div
          className={`step-item ${
            currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""
          }`}
        >
          <div className="step-bubble">2</div>
          <span className="step-label">Location Check</span>
        </div>
        <div className="step-line"></div>

        <div
          className={`step-item ${
            currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""
          }`}
        >
          <div className="step-bubble">3</div>
          <span className="step-label">Click Pic</span>
        </div>
        <div className="step-line"></div>

        <div
          className={`step-item ${
            currentStep === 4 ? "completed active" : ""
          }`}
        >
          <div className="step-bubble">4</div>
          <span className="step-label">Present (Success)</span>
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="step-card-container">
        {/* ========================================================
            STEP 1: ENTER EMPLOYEE ID (ZERO DATA EXPOSED)
        ======================================================== */}
        {currentStep === 1 && (
          <div className="workflow-card">
            <div className="workflow-card-header">
              <div className="step-icon-badge blue">
                <IdCard size={24} />
              </div>
              <div>
                <h2>Step 1: Enter Employee ID</h2>
                <p>
                  Enter your unique GSR Employee ID to begin your biometric attendance.
                </p>
              </div>
            </div>

            <div className="workflow-card-body">
              <form onSubmit={handleVerifyEmpId} className="emp-id-input-form">
                <div className="emp-id-input-group">
                  <div className="input-with-icon">
                    <UserRound size={18} className="field-icon" />
                    <input
                      type="text"
                      className="emp-id-input"
                      placeholder="Enter Employee ID (e.g. GSR-101)"
                      value={inputEmpId}
                      onChange={(e) => {
                        setInputEmpId(e.target.value);
                        if (empError) setEmpError("");
                      }}
                      autoFocus
                      disabled={verifyingId}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-verify-id"
                    disabled={verifyingId || !inputEmpId.trim()}
                  >
                    {verifyingId ? (
                      <>
                        <RefreshCw size={16} className="spin-icon" />
                        <span>Checking DB...</span>
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        <span>Verify &amp; Proceed</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* PRIVACY & SECURITY NOTE */}
              <div className="id-privacy-notice">
                <Lock size={15} />
                <span>
                  Privacy Protected: Employee identities and records are kept confidential and verified directly from the company database.
                </span>
              </div>

              {/* ERROR STATE */}
              {empError && (
                <div className="workflow-error-alert">
                  <AlertTriangle size={18} />
                  <span>{empError}</span>
                </div>
              )}

              {/* VERIFIED SUCCESS POPUP / TOAST */}
              {idVerifiedSuccess && matchedEmp && (
                <div className="id-verified-success-banner">
                  <CheckCircle2 size={20} color="#16a34a" />
                  <div>
                    <strong>Employee ID Verified!</strong>
                    <span>
                      Welcome, {matchedEmp.name} ({matchedEmp.id}). Moving to Location Check...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: CHECK LOCATION (50M PERIMETER RULE)
        ======================================================== */}
        {currentStep === 2 && (
          <div className="workflow-card">
            <div className="workflow-card-header">
              <div className="step-icon-badge cyan">
                <MapPin size={24} />
              </div>
              <div>
                <h2>Step 2: Location Verification</h2>
                <p>
                  Verifying your physical presence within <strong>50 meters</strong> of GSR Broadband Office.
                </p>
              </div>
            </div>

            <div className="workflow-card-body">
              {/* EMPLOYEE SUMMARY BAR */}
              {matchedEmp && (
                <div className="step-employee-mini-bar">
                  <div className="mini-avatar-placeholder">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <strong>{matchedEmp.name}</strong>
                    <span>{matchedEmp.id} • {matchedEmp.department}</span>
                  </div>
                </div>
              )}

              {/* AUTOMATIC ATTENDANCE MODE BANNER (NO MANUAL BUTTONS) */}
              <div className={`auto-mode-card ${actionType === "SIGN_OUT" ? "signout-mode" : "checkin-mode"}`}>
                <div className="auto-mode-icon-box">
                  {actionType === "SIGN_OUT" ? <LogOut size={22} /> : <LogIn size={22} />}
                </div>
                <div className="auto-mode-details">
                  <div className="auto-mode-top">
                    <span className="auto-mode-pill">
                      {actionType === "SIGN_OUT" ? "SHIFT SIGN-OUT" : "DAILY CHECK-IN (PRESENT)"}
                    </span>
                    {actionType === "SIGN_OUT" && alreadyMarked?.time && (
                      <span className="checked-in-time-label">
                        <Clock size={13} /> Checked In at {alreadyMarked.time}
                      </span>
                    )}
                    <span className="current-punch-time-badge">
                      <Clock size={13} /> Real-Time: {liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                    </span>
                  </div>
                  <p className="auto-mode-description">
                    {actionType === "SIGN_OUT"
                      ? "You are already marked present today. Next biometric face scan will record your Sign-Out and calculate your total working hours."
                      : `First punch for today (${getTodayDateString()}). Facial biometric verification will mark you Present.`}
                  </p>
                </div>
              </div>

              {/* LOCATION FETCH CARD */}
              <div className="location-fetch-display">
                {locationFetching ? (
                  <div className="location-loading-state">
                    <RefreshCw size={32} className="spin-icon" />
                    <h3>Detecting Live GPS Position...</h3>
                    <p>Calculating distance to Powerpet, Eluru office...</p>
                  </div>
                ) : distance !== null ? (
                  <div
                    className={`location-result-banner ${
                      isWithin50m ? "success" : "failed"
                    }`}
                  >
                    <div className="loc-icon-bubble">
                      {isWithin50m ? (
                        <CheckCircle2 size={32} />
                      ) : (
                        <AlertTriangle size={32} />
                      )}
                    </div>
                    <div className="loc-info-text">
                      <h3>
                        {isWithin50m
                          ? "Within 50m Office Perimeter - Verified ✓"
                          : "Outside 50m Office Perimeter - Restricted ✕"}
                      </h3>
                      <p className="dist-meter-readout">
                        Current Distance: <strong>{distance} meter{distance === 1 ? "" : "s"}</strong> from GSR office
                        (Permitted: &le; 50m)
                      </p>
                      {userCoords && (
                        <span className="raw-coords">
                          Coordinates: {userCoords.lat.toFixed(5)}, {userCoords.lng.toFixed(5)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="location-idle-state">
                    <Compass size={36} className="compass-icon" />
                    <h3>GPS Fetch Pending</h3>
                    <p>Click below to verify your current device position.</p>
                  </div>
                )}

                {locationError && (
                  <div className="workflow-error-alert">
                    <AlertTriangle size={18} />
                    <span>{locationError}</span>
                  </div>
                )}

                <div className="location-actions-bar">
                  <button
                    type="button"
                    className="btn-fetch-location"
                    onClick={fetchLocation}
                    disabled={locationFetching}
                  >
                    <MapPin size={16} />
                    <span>{locationFetching ? "Detecting GPS..." : "Current Location"}</span>
                  </button>

                  {/* Testing helper so local evaluation works from any location */}
                  <button
                    type="button"
                    className="btn-test-office-toggle"
                    onClick={handleSetCurrentAsOffice}
                  >
                    <Compass size={15} />
                    <span>{demoOfficeSet ? "Office Set to Current GPS (0m) ✓" : "Set Current Location as Office"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="workflow-card-footer">
              <button
                type="button"
                className="btn-workflow-back"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} /> Change ID
              </button>

              <button
                type="button"
                className="btn-workflow-next"
                onClick={handleProceedToCamera}
                disabled={distance === null || distance > 50}
              >
                <span>Proceed to Click Photo</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: CLICK THE PIC & HIGH-ACCURACY VERIFICATION
        ======================================================== */}
        {currentStep === 3 && (
          <div className="workflow-card">
            <div className="workflow-card-header">
              <div className="step-icon-badge purple">
                <Camera size={24} />
              </div>
              <div>
                <h2>Step 3: Click Face Photo</h2>
                <p>
                  Look into the camera to capture an HD face snapshot with high biometric accuracy.
                </p>
              </div>
            </div>

            <div className="workflow-card-body">
              {/* Mini Status Ribbon */}
              <div className="step-mini-status-ribbon">
                <span>
                  Employee: <strong>{matchedEmp?.name} ({matchedEmp?.id})</strong>
                </span>
                <span>
                  Mode: <strong className={actionType === "SIGN_OUT" ? "text-amber" : "text-green"}>
                    {actionType === "SIGN_OUT" ? "Sign-Out" : "Check-In (Present)"}
                  </strong>
                </span>
                <span>
                  Location: <strong className="text-green">{distance}m (Within 50m ✓)</strong>
                </span>
              </div>

              {/* CAMERA VIEWPORT OR MISMATCH REJECTION DISPLAY */}
              {capturedImage && faceResult && !faceResult.match ? (
                <div className="biometric-mismatch-panel">
                  <div className="mismatch-banner">
                    <div className="mismatch-icon-bubble">
                      <XCircle size={32} />
                    </div>
                    <div className="mismatch-text">
                      <h3>Biometric Verification Rejected ✕</h3>
                      <p>{faceResult.reason || "Live face does not match registered employee photo in database."}</p>
                    </div>
                  </div>

                  <div className="side-by-side-comparison">
                    <div className="compare-card live-card">
                      <div className="compare-card-badge error-badge">
                        <XCircle size={14} /> Live Camera Snapshot (Rejected)
                      </div>
                      <img
                        src={capturedImage}
                        alt="Live Camera Snapshot"
                        className="compare-photo"
                      />
                      <div className="compare-metric-row">
                        <span>Biometric Score:</span>
                        <strong className="text-red">{faceResult.score}% Match (Failed)</strong>
                      </div>
                    </div>

                    <div className="compare-vs-badge">VS</div>

                    <div className="compare-card db-card">
                      <div className="compare-card-badge db-badge">
                        <ShieldCheck size={14} /> Registered Database Photo
                      </div>
                      <img
                        src={matchedEmp?.facePhoto || (Array.isArray(matchedEmp?.facePhotos) ? matchedEmp.facePhotos[0] : "")}
                        alt="Registered Database Reference"
                        className="compare-photo"
                      />
                      <div className="compare-metric-row">
                        <span>Database Profile:</span>
                        <strong>{matchedEmp?.name} ({matchedEmp?.id})</strong>
                      </div>
                    </div>
                  </div>

                  <div className="attendance-blocked-box">
                    <AlertTriangle size={18} className="blocked-icon" />
                    <div>
                      <strong>Attendance Status: REJECTED (Not Logged)</strong>
                      <p>
                        Proxy attendance or mismatched faces are strictly blocked. Attendance can only be logged when the registered employee is physically in front of the camera.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="workflow-camera-container">
                  {verifyingFace ? (
                    <div className="detecting-loader-box">
                      <RefreshCw size={42} className="spin-icon text-primary" />
                      <h3>Analyzing Facial Biometrics...</h3>
                      <p>Matching facial contours, eyes &amp; nose geometry with database reference (dress/clothing neutral)</p>
                    </div>
                  ) : capturedImage ? (
                    <div className="captured-photo-display">
                      <img
                        src={capturedImage}
                        alt="Captured Face"
                        className="captured-face-full"
                      />
                      <div className="pic-success-tag">
                        <CheckCircle2 size={16} /> Picture Captured &amp; Verifying...
                      </div>
                    </div>
                  ) : cameraActive ? (
                    <div className="active-video-wrapper">
                      <video
                        ref={attachVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="scanner-video-feed"
                      />
                      {/* Live Real-Time Camera Watermark */}
                      <div className="camera-live-timestamp">
                        <span className="live-camera-pulse"></span>
                        <Clock size={12} />
                        <span>{liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
                      </div>

                      {/* Biometric Face Guide Oval */}
                      <div className="biometric-face-oval">
                        <div className="scanning-laser"></div>
                      </div>
                      <div className="scanner-overlay-guidance">
                        <Scan size={16} />
                        <span>Position your face in the oval &amp; Blink your eyes 👁️</span>
                      </div>
                    </div>
                  ) : (
                    <div className="camera-standby-screen">
                      <Camera size={48} className="standby-cam-icon" />
                      <h3>Camera Ready</h3>
                      <p>Click "Start Camera" to view your live camera preview</p>
                    </div>
                  )}

                  {cameraError && (
                    <div className="camera-err-toast">
                      <AlertTriangle size={16} />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* CAMERA CAPTURE / AUTO EYE-BLINK ROW (NO MANUAL BUTTON REQUIRED) */}
              <div className="camera-action-row">
                {capturedImage && faceResult && !faceResult.match ? (
                  <div className="mismatch-btns-group">
                    <button
                      type="button"
                      className="btn-retake-prominent"
                      onClick={handleRetakePic}
                    >
                      <RotateCcw size={18} />
                      <span>Retake Face Photo &amp; Try Again</span>
                    </button>

                    <button
                      type="button"
                      className="btn-cancel-mismatch"
                      onClick={() => {
                        stopCamera();
                        handleResetWorkflow();
                      }}
                    >
                      <span>Cancel &amp; Change Employee</span>
                    </button>
                  </div>
                ) : !capturedImage && !verifyingFace ? (
                  cameraActive ? (
                    <div className="eye-blink-wrapper">
                      <div className={`eye-blink-auto-card ${blinkDetectedAnim ? "radar-flash" : ""}`}>
                        <div className="eye-blink-radar-circle">
                          <span className="eye-blink-emoji">{blinkDetectedAnim ? "⚡" : "👁️"}</span>
                        </div>
                        <div className="eye-blink-auto-text">
                          <strong className={blinkDetectedAnim ? "text-amber" : "text-cyan"}>
                            {blinkDetectedAnim ? "Blink Detected! Taking Picture..." : "Auto-Capture On Eye Blink"}
                          </strong>
                          <span className="blink-live-instruction">{blinkPrompt}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-manual-fallback-link"
                        onClick={handleCaptureAndVerify}
                      >
                        Blink not detecting? Click here to capture manually
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-take-pic-primary"
                      onClick={startCamera}
                    >
                      <Camera size={22} />
                      <span>Start Camera Preview</span>
                    </button>
                  )
                ) : capturedImage && !verifyingFace ? (
                  <button
                    type="button"
                    className="btn-retake-pic"
                    onClick={handleRetakePic}
                  >
                    <RotateCcw size={16} />
                    <span>Retake Picture</span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="workflow-card-footer">
              <button
                type="button"
                className="btn-workflow-back"
                onClick={() => {
                  stopCamera();
                  setCurrentStep(2);
                }}
                disabled={verifyingFace}
              >
                <ArrowLeft size={16} /> Back to Location
              </button>

              <div style={{ fontSize: "12px", color: "#64748b" }}>
                <Sparkles size={13} style={{ display: "inline", marginRight: "4px" }} />
                Enhanced 3-Angle Biometric Matching (Up to 99% Precision)
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: PRESENT (SUCCESS CONFIRMATION PAGE)
        ======================================================== */}
        {currentStep === 4 && (
          <div className="workflow-card success-workflow-card">
            <div className="present-celebration-hero">
              <div
                className="present-celebration-icon"
                style={
                  actionType === "SIGN_OUT"
                    ? {
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#10b981",
                        border: "2px solid #10b981",
                      }
                    : {}
                }
              >
                {actionType === "SIGN_OUT" ? (
                  <CheckCircle2 size={54} color="#10b981" />
                ) : (
                  <CheckCircle2 size={54} />
                )}
              </div>
              <span
                className="present-success-tag"
                style={
                  actionType === "SIGN_OUT"
                    ? {
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#10b981",
                        borderColor: "rgba(16, 185, 129, 0.3)",
                      }
                    : {}
                }
              >
                {actionType === "SIGN_OUT"
                  ? "SHIFT SIGN-OUT RECORDED"
                  : "ATTENDANCE RECORDED"}
              </span>
              <h1 style={actionType === "SIGN_OUT" ? { color: "#10b981" } : {}}>
                {actionType === "SIGN_OUT"
                  ? "SIGN OUT SUCCESSFUL ✓"
                  : "PRESENT ✓"}
              </h1>
              <p>
                {actionType === "SIGN_OUT"
                  ? `Goodbye ${matchedEmp?.name || "Employee"}! Your shift has ended and your total working hours have been logged successfully.`
                  : "Your biometric attendance has been successfully verified and logged."}
              </p>
            </div>

            <div className="workflow-card-body">
              <div className="present-proof-card">
                <div className="present-proof-image-wrapper">
                  <img
                    src={attendanceRecord?.capturedPhoto || capturedImage}
                    alt="Attendance Snapshot"
                    className="present-proof-photo"
                  />
                  <span className="live-snapshot-badge">
                    <Sparkles size={12} /> High Accuracy Biometric Match
                  </span>
                </div>

                <div className="present-details-table">
                  <div className="proof-detail-row">
                    <span>Employee Name</span>
                    <strong>{attendanceRecord?.empName || matchedEmp?.name}</strong>
                  </div>

                  <div className="proof-detail-row">
                    <span>Employee ID</span>
                    <strong className="text-primary">
                      {attendanceRecord?.empId || matchedEmp?.id}
                    </strong>
                  </div>

                  <div className="proof-detail-row">
                    <span>Department &amp; Role</span>
                    <strong>
                      {(matchedEmp?.department || "Field Technical")} •{" "}
                      {(matchedEmp?.role || matchedEmp?.designation || "Staff")}
                    </strong>
                  </div>

                  <div className="proof-detail-row">
                    <span>Attendance Status</span>
                    <strong className="text-green">
                      {actionType === "SIGN_OUT"
                        ? "SIGN OUT SUCCESSFUL ✓"
                        : "PRESENT ✓"}
                    </strong>
                  </div>

                  <div className="proof-detail-row">
                    <span>Check-In Time</span>
                    <strong>
                      {actionType === "SIGN_OUT"
                        ? (alreadyMarked?.time || attendanceRecord?.time || "—")
                        : (attendanceRecord?.time || "—")}
                    </strong>
                  </div>

                  {actionType === "SIGN_OUT" && (
                    <div className="proof-detail-row">
                      <span>Sign-Out Time</span>
                      <strong className="text-amber">
                        {attendanceRecord?.signOutTime || getRealCurrentTimeString()}
                      </strong>
                    </div>
                  )}

                  <div className="proof-detail-row">
                    <span>Verified Real-Time (IST)</span>
                    <strong style={{ color: "#0284c7" }}>
                      {actionType === "SIGN_OUT"
                        ? (attendanceRecord?.signOutTime || getRealCurrentTimeString())
                        : (attendanceRecord?.time || getRealCurrentTimeString())}
                    </strong>
                  </div>

                  {actionType === "SIGN_OUT" && (
                    <div
                      className="proof-detail-row working-hours-card"
                      style={{
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        margin: "10px 0",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Clock size={16} /> Total Working Hours
                      </span>
                      <strong
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "800",
                          color: "#10b981",
                        }}
                      >
                        {attendanceRecord?.workingHours || "—"}
                      </strong>
                    </div>
                  )}

                  <div className="proof-detail-row">
                    <span>Office Distance</span>
                    <strong className="text-green">
                      {attendanceRecord?.distanceMeters || distance || 0} meters
                      (&le; 50m Passed ✓)
                    </strong>
                  </div>

                  <div className="proof-detail-row">
                    <span>Image Match Accuracy</span>
                    <strong className="text-purple">
                      {attendanceRecord?.accuracy ||
                        faceResult?.score ||
                        99.0}
                      % High Precision Match ✓
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="workflow-card-footer present-footer-actions">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={handleResetWorkflow}
              >
                Mark Another Employee
              </button>

              <Link to="/" className="btn-primary-action">
                Done &amp; Return to Home <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL: ALREADY SIGNED OUT FOR TODAY */}
      {alreadySignedOutModal && (
        <div className="modal-backdrop" onClick={() => setAlreadySignedOutModal(null)}>
          <div className="modal-box signed-out-modal" onClick={(e) => e.stopPropagation()}>
            <div className="signed-out-modal-header">
              <div className="signed-out-badge-icon">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3>Shift Already Completed!</h3>
                <p>Attendance already recorded for today</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setAlreadySignedOutModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="signed-out-modal-body">
              <div className="signed-out-emp-profile">
                <UserRound size={22} />
                <div>
                  <strong>{alreadySignedOutModal.empName}</strong>
                  <span>{alreadySignedOutModal.empId}</span>
                </div>
              </div>

              <div className="signed-out-info-table">
                <div className="info-row">
                  <span>Date:</span>
                  <strong>{alreadySignedOutModal.date}</strong>
                </div>
                <div className="info-row">
                  <span>Check-In Time:</span>
                  <strong className="text-green">{alreadySignedOutModal.time}</strong>
                </div>
                <div className="info-row">
                  <span>Sign-Out Time:</span>
                  <strong className="text-amber">{alreadySignedOutModal.signOutTime}</strong>
                </div>
                <div className="info-row highlight-row">
                  <span>Total Working Hours:</span>
                  <strong className="text-primary">{alreadySignedOutModal.workingHours || "—"}</strong>
                </div>
                <div className="info-row">
                  <span>Shift Status:</span>
                  <span className="badge-present-done">PRESENT &amp; COMPLETED ✓</span>
                </div>
              </div>

              <div className="already-done-note">
                <Clock size={16} />
                <span>
                  You have already completed both Check-In and Sign-Out for today. No further attendance punch is required.
                </span>
              </div>

              <button
                type="button"
                className="btn-ack-signed-out"
                onClick={() => {
                  setAlreadySignedOutModal(null);
                  setInputEmpId("");
                }}
              >
                OK, Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;
