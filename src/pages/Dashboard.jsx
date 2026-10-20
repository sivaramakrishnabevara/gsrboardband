import { useState, useEffect, useRef } from "react";
import {
  Users,
  IndianRupee,
  MessageSquare,
  UserPlus,
  Wifi,
  TrendingUp,
  UserCheck,
  UserX,
  Camera,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Pencil,
  Settings,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Building,
  Upload,
  RefreshCw,
  RotateCcw,
  LogOut,
  Calendar,
  Check,
  FileText,
} from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import AttendanceAnalytics from "../components/AttendanceAnalytics";
import {
  getEmployees,
  fetchEmployeesFromDB,
  fetchAttendanceFromDB,
  getAllAttendanceRecords,
  fetchOfficeFromDB,
  addEmployee,
  deleteEmployee,
  updateEmployee,
  updateEmployeeFacePhoto,
  getTodayAttendance,
  toggleEmployeeAttendance,
  adjustEmployeeAttendanceTime,
  formatTime24to12,
  formatTime12to24,
  getOfficeLocation,
  setOfficeLocation,
  resetOfficeLocation,
  getTodayDateString,
  generateAutoEmpId,
  calculateWorkingHours,
  clearAllAttendance,
} from "../services/attendanceService";

function Dashboard() {
  const isAdmin = typeof window !== "undefined" && sessionStorage.getItem("gsr_admin_logged_in") === "true";

  const [activeTab, setActiveTab] = useState("attendance"); // "attendance", "analytics", or "overview"
  const [employees, setEmployees] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "PRESENT", "ABSENT"

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(null);
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [updatePhotoEmp, setUpdatePhotoEmp] = useState(null);
  const [updateCamActive, setUpdateCamActive] = useState(false);
  const [updateCapturedPhotos, setUpdateCapturedPhotos] = useState(["", "", ""]);
  const [updateCaptureStep, setUpdateCaptureStep] = useState(0);
  const updateVideoRef = useRef(null);
  const updateStreamRef = useRef(null);

  // 3-Angle Face Registration Definitions
  const FACE_ANGLES = [
    { index: 0, title: "Photo 1: Frontal View", short: "1. Front", prompt: "Look straight into camera (Direct Center)" },
    { index: 1, title: "Photo 2: Left Angle", short: "2. Left (~15°)", prompt: "Turn face slightly left (~15° angle)" },
    { index: 2, title: "Photo 3: Right Angle", short: "3. Right (~15°)", prompt: "Turn face slightly right (~15° angle)" },
  ];

  // Edit / View Employee Details Modal State
  const [editEmpModal, setEditEmpModal] = useState(null);

  // Manual Attendance & Time Adjustment Modal State (Fix Absent Mistake)
  const [timeAdjustModal, setTimeAdjustModal] = useState(null);
  const [timeFormData, setTimeFormData] = useState({
    empId: "",
    empName: "",
    date: getTodayDateString(),
    checkInTime24: "09:00",
    signOutTime24: "18:00",
    hasSignOut: false,
    status: "PRESENT",
    remarks: "Employee absent by mistake - Admin manual entry",
  });
  const [isSavingTime, setIsSavingTime] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    role: "",
    department: "",
    phone: "",
    email: "",
    shift: "",
    facePhoto: "",
    facePhotos: [],
    joinDate: "",
  });
  const [editCamActive, setEditCamActive] = useState(false);
  const editVideoRef = useRef(null);
  const editStreamRef = useRef(null);

  // New Employee Form State (Requires 3 biometric reference photos for up to 99% accuracy)
  const [newEmp, setNewEmp] = useState({
    id: "",
    name: "",
    role: "",
    department: "",
    phone: "",
    email: "",
    shift: "09:00 AM - 06:00 PM",
    facePhoto: "",
    facePhotos: [],
  });
  const [addCapturedPhotos, setAddCapturedPhotos] = useState(["", "", ""]);
  const [addCaptureStep, setAddCaptureStep] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const addVideoRef = useRef(null);
  const addStreamRef = useRef(null);

  // Geofence Office State
  const [office, setOffice] = useState(getOfficeLocation());
  const [tempLat, setTempLat] = useState(office.lat);
  const [tempLng, setTempLng] = useState(office.lng);
  const [tempRadius, setTempRadius] = useState(office.radiusMeters || 50);

  const navigate = useNavigate();

  // Load Data & verify admin auth with centralized MySQL DB
  const refreshData = async () => {
    const empList = getEmployees();
    setEmployees(empList);
    const allAtt = getAllAttendanceRecords();
    setAllAttendance(allAtt);
    const attList = getTodayAttendance();
    setTodayAttendance(attList);

    try {
      const freshEmps = await fetchEmployeesFromDB();
      if (freshEmps && Array.isArray(freshEmps)) {
        setEmployees(freshEmps);
      }
      const freshAtt = await fetchAttendanceFromDB();
      if (freshAtt && Array.isArray(freshAtt)) {
        setAllAttendance(freshAtt);
        const today = getTodayDateString();
        setTodayAttendance(freshAtt.filter((r) => r.date === today));
      }
    } catch (e) {
      console.warn("DB refresh error:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("gsr_admin_logged_in");
    navigate("/login");
  };

  // Compute stats
  const totalEmployees = employees.length;
  const attendanceMap = {};
  todayAttendance.forEach((att) => {
    attendanceMap[att.empId] = att;
  });

  const presentCount = employees.filter((e) => attendanceMap[e.id]).length;
  const absentCount = Math.max(0, totalEmployees - presentCount);
  const attendanceRate = totalEmployees > 0
    ? Math.round((presentCount / totalEmployees) * 100)
    : 0;

  // Filter Employees
  const filteredEmployees = employees.filter((emp) => {
    const isPresent = Boolean(attendanceMap[emp.id]);
    if (statusFilter === "PRESENT" && !isPresent) return false;
    if (statusFilter === "ABSENT" && isPresent) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchId = emp.id.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      return matchName || matchId || matchDept || matchRole;
    }
    return true;
  });

  // Handle Manual Refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Open Add Employee Modal with Auto-generated Unique ID
  const handleOpenAddModal = () => {
    const nextId = generateAutoEmpId(employees);
    setNewEmp({
      id: nextId,
      name: "",
      role: "",
      department: "",
      phone: "",
      email: "",
      shift: "09:00 AM - 06:00 PM",
      facePhoto: "",
      facePhotos: [],
    });
    setAddCapturedPhotos(["", "", ""]);
    setAddCaptureStep(0);
    setShowAddModal(true);
  };

  // Suggestion lists for Department and Role (allowing full manual entry + quick selection)
  const departmentSuggestions = Array.from(
    new Set([
      "Field Technical",
      "NOC & Infrastructure",
      "Support & Helpdesk",
      "Installation Team",
      "Accounts & Billing",
      "Management",
      "Sales & Marketing",
      "Customer Care",
      "Operations",
      ...employees.map((e) => e.department).filter(Boolean),
    ])
  );

  const roleSuggestions = Array.from(
    new Set([
      "Fiber Technician",
      "Network Engineer",
      "Splicing Specialist",
      "Helpdesk Executive",
      "NOC Operator",
      "Billing Executive",
      "Field Supervisor",
      "Branch Manager",
      "Accountant",
      "Line Inspector",
      ...employees.map((e) => e.role).filter(Boolean),
    ])
  );

  // Handle Add Employee Submit (Requires 3 biometric photos for up to 99% accuracy)
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmp.name.trim()) {
      alert("Please enter the employee's name.");
      return;
    }

    const photos = (newEmp.facePhotos && newEmp.facePhotos.filter(Boolean).length === 3)
      ? newEmp.facePhotos
      : (addCapturedPhotos.filter(Boolean).length === 3 ? addCapturedPhotos : []);

    if (photos.length < 3) {
      alert("Please capture all 3 facial biometric photos (1. Front, 2. Left Angle, 3. Right Angle) to enable high biometric accuracy up to 99% before registering the employee.");
      return;
    }

    const assignedId = newEmp.id && newEmp.id.trim() ? newEmp.id.trim() : generateAutoEmpId(employees);
    const created = await addEmployee({
      ...newEmp,
      id: assignedId,
      facePhoto: photos[0],
      facePhotos: photos,
      role: newEmp.role && newEmp.role.trim() ? newEmp.role.trim() : "Staff",
      department: newEmp.department && newEmp.department.trim() ? newEmp.department.trim() : "Field Technical",
    });

    stopAddCamera();
    setShowAddModal(false);
    setNewEmp({
      id: "",
      name: "",
      role: "",
      department: "",
      phone: "",
      email: "",
      shift: "09:00 AM - 06:00 PM",
      facePhoto: "",
      facePhotos: [],
    });
    setAddCapturedPhotos(["", "", ""]);
    setAddCaptureStep(0);
    await refreshData();
    alert(`Employee ${created.name} (${created.id}) registered with 3-angle biometric reference (Up to 99% Accuracy Enabled)!`);
  };

  // Recapture / Update Reference Photo for Existing Employee
  // Recapture / Update Reference Photo for Existing Employee (3 Angles for up to 99% accuracy)
  const handleOpenUpdatePhoto = (emp) => {
    setUpdatePhotoEmp(emp);
    const existing = Array.isArray(emp.facePhotos) && emp.facePhotos.length === 3
      ? [...emp.facePhotos]
      : [emp.facePhoto || "", "", ""];
    setUpdateCapturedPhotos(existing);
    setUpdateCaptureStep(0);
    setUpdateCamActive(false);
  };

  const attachUpdateVideoRef = (el) => {
    updateVideoRef.current = el;
    if (el && updateStreamRef.current) {
      el.srcObject = updateStreamRef.current;
      el.play().catch(() => {});
    }
  };

  const startUpdateCamera = async (targetIndex = null) => {
    if (targetIndex !== null) {
      setUpdateCaptureStep(targetIndex);
    }
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      updateStreamRef.current = stream;
      setUpdateCamActive(true);
      setTimeout(() => {
        if (updateVideoRef.current) {
          updateVideoRef.current.srcObject = stream;
          updateVideoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please allow camera permissions in browser.");
    }
  };

  const stopUpdateCamera = () => {
    if (updateStreamRef.current) {
      updateStreamRef.current.getTracks().forEach((t) => t.stop());
      updateStreamRef.current = null;
    }
    setUpdateCamActive(false);
  };

  const captureNewPhoto = (targetIndex = null) => {
    if (!updateVideoRef.current) return;
    const v = updateVideoRef.current;
    if (v.videoWidth === 0 || v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const testData = ctx.getImageData(0, 0, c.width, c.height).data;
    let lumSum = 0;
    const step = 16;
    let count = 0;
    for (let i = 0; i < testData.length; i += 4 * step) {
      lumSum += (testData[i] + testData[i + 1] + testData[i + 2]) / 3;
      count++;
    }
    if ((lumSum / count) < 20) {
      alert("Captured frame is too dark or black. Please ensure good lighting.");
      return;
    }

    const dataUrl = c.toDataURL("image/jpeg", 0.95);
    const stepIdx = targetIndex !== null ? targetIndex : updateCaptureStep;
    const nextPhotos = [...updateCapturedPhotos];
    nextPhotos[stepIdx] = dataUrl;
    setUpdateCapturedPhotos(nextPhotos);

    if (targetIndex === null && stepIdx < 2) {
      setUpdateCaptureStep(stepIdx + 1);
    } else {
      if (nextPhotos.filter(Boolean).length === 3) {
        stopUpdateCamera();
      }
    }
  };

  const handleSaveUpdatedPhoto = async () => {
    const valid = updateCapturedPhotos.filter(Boolean);
    if (valid.length === 0 || !updatePhotoEmp) {
      alert("Please capture the face photos first.");
      return;
    }
    await updateEmployeeFacePhoto(updatePhotoEmp.id, updateCapturedPhotos[0] || valid[0], updateCapturedPhotos);
    stopUpdateCamera();
    const updatedName = updatePhotoEmp.name;
    const updatedId = updatePhotoEmp.id;
    setUpdatePhotoEmp(null);
    setUpdateCapturedPhotos(["", "", ""]);
    await refreshData();
    alert(`Biometric face photos (3 reference angles) successfully updated for ${updatedName} (${updatedId})! Up to 99% accuracy is now active.`);
  };

  // Open Edit / View Employee Details Modal
  const handleOpenEditModal = (emp) => {
    setEditEmpModal(emp);
    setEditFormData({
      id: emp.id,
      name: emp.name || "",
      role: emp.role || "",
      department: emp.department || "Field Technical",
      phone: emp.phone || "",
      email: emp.email || "",
      shift: emp.shift || "09:00 AM - 06:00 PM",
      facePhoto: emp.facePhoto || "",
      facePhotos: Array.isArray(emp.facePhotos) && emp.facePhotos.length > 0 ? emp.facePhotos : (emp.facePhoto ? [emp.facePhoto] : []),
      joinDate: emp.joinDate || "",
    });
    setEditCamActive(false);
  };

  const attachEditVideoRef = (el) => {
    editVideoRef.current = el;
    if (el && editStreamRef.current) {
      el.srcObject = editStreamRef.current;
      el.play().catch(() => {});
    }
  };

  const startEditCamera = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      editStreamRef.current = stream;
      setEditCamActive(true);
      setTimeout(() => {
        if (editVideoRef.current) {
          editVideoRef.current.srcObject = stream;
          editVideoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please allow camera permissions in browser.");
    }
  };

  const stopEditCamera = () => {
    if (editStreamRef.current) {
      editStreamRef.current.getTracks().forEach((t) => t.stop());
      editStreamRef.current = null;
    }
    setEditCamActive(false);
  };

  const captureEditFace = () => {
    if (!editVideoRef.current) return;
    const v = editVideoRef.current;
    if (v.videoWidth === 0 || v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const testData = ctx.getImageData(0, 0, c.width, c.height).data;
    let lumSum = 0;
    const step = 16;
    let count = 0;
    for (let i = 0; i < testData.length; i += 4 * step) {
      lumSum += (testData[i] + testData[i + 1] + testData[i + 2]) / 3;
      count++;
    }
    if ((lumSum / count) < 20) {
      alert("Captured frame is too dark or black. Please ensure good lighting.");
      return;
    }

    const dataUrl = c.toDataURL("image/jpeg", 0.95);
    setEditFormData((prev) => ({
      ...prev,
      facePhoto: dataUrl,
      facePhotos: [dataUrl, ...(prev.facePhotos ? prev.facePhotos.slice(1) : [])],
    }));
    stopEditCamera();
  };

  const handleSaveEditEmployee = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      alert("Employee name is required.");
      return;
    }
    await updateEmployee(editEmpModal.id, editFormData);
    stopEditCamera();
    setEditEmpModal(null);
    await refreshData();
    alert(`Employee ${editFormData.name} (${editFormData.id}) details updated in database successfully!`);
  };

  // Attach video ref and auto-play stream when video mounts
  const attachAddVideoRef = (el) => {
    addVideoRef.current = el;
    if (el && addStreamRef.current) {
      el.srcObject = addStreamRef.current;
      el.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (cameraActive && addVideoRef.current && addStreamRef.current) {
      addVideoRef.current.srcObject = addStreamRef.current;
      addVideoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // Start Camera in Add Modal (supports targeting specific slot 0, 1, or 2)
  const startAddCamera = async (targetIndex = null) => {
    if (targetIndex !== null) {
      setAddCaptureStep(targetIndex);
    }
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        // Fallback for laptops/browsers with basic camera constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      addStreamRef.current = stream;
      setCameraActive(true);

      setTimeout(() => {
        if (addVideoRef.current) {
          addVideoRef.current.srcObject = stream;
          addVideoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please allow camera permissions in your browser or upload a photo.");
    }
  };

  const stopAddCamera = () => {
    if (addStreamRef.current) {
      addStreamRef.current.getTracks().forEach((track) => track.stop());
      addStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureAddFace = (targetIndex = null) => {
    if (!addVideoRef.current) return;
    const video = addVideoRef.current;
    if (video.videoWidth === 0 || video.readyState < 2) {
      alert("Camera video feed is not ready yet. Please wait a moment for the camera to start.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Check if the captured frame is black or too dark
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
      alert("Captured frame is pitch black or too dark. Please ensure camera lens is uncovered and lighting is adequate.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const curIdx = targetIndex !== null ? targetIndex : addCaptureStep;
    const nextPhotos = [...addCapturedPhotos];
    nextPhotos[curIdx] = dataUrl;
    setAddCapturedPhotos(nextPhotos);

    const validPhotos = nextPhotos.filter(Boolean);
    setNewEmp((prev) => ({
      ...prev,
      facePhoto: nextPhotos[0] || validPhotos[0] || "",
      facePhotos: nextPhotos,
    }));

    if (targetIndex === null && curIdx < 2) {
      setAddCaptureStep(curIdx + 1);
    } else {
      if (nextPhotos.filter(Boolean).length === 3) {
        stopAddCamera();
      }
    }
  };

  // Toggle Attendance
  const handleToggleAttendance = (empId, currentStatus) => {
    const newStatus = currentStatus === "PRESENT" ? "ABSENT" : "PRESENT";
    toggleEmployeeAttendance(empId, newStatus);
    refreshData();
  };

  // Open Time Adjustment / Manual Attendance Modal
  const handleOpenTimeModal = (emp, existingAtt = null) => {
    const today = getTodayDateString();
    const defaultCheckIn = existingAtt?.time
      ? formatTime12to24(existingAtt.time)
      : "09:00";
    const defaultSignOut = existingAtt?.signOutTime
      ? formatTime12to24(existingAtt.signOutTime)
      : "";

    setTimeAdjustModal({
      emp,
      att: existingAtt,
    });

    setTimeFormData({
      empId: emp.id,
      empName: emp.name,
      date: existingAtt?.date || today,
      checkInTime24: defaultCheckIn,
      signOutTime24: defaultSignOut,
      hasSignOut: Boolean(defaultSignOut),
      status: existingAtt?.status || "PRESENT",
      remarks:
        existingAtt?.remarks ||
        (existingAtt
          ? "Time corrected by admin"
          : "Employee absent by mistake - Admin manual entry"),
    });
  };

  // Save Manual Attendance & Time Entry
  const handleSaveTimeAdjustment = async (e) => {
    if (e) e.preventDefault();
    if (!timeAdjustModal || !timeFormData.checkInTime24) {
      alert("Please specify a valid Check-In time.");
      return;
    }

    setIsSavingTime(true);
    try {
      const checkIn12 = formatTime24to12(timeFormData.checkInTime24);
      const signOut12 =
        timeFormData.hasSignOut && timeFormData.signOutTime24
          ? formatTime24to12(timeFormData.signOutTime24)
          : null;

      await adjustEmployeeAttendanceTime({
        empId: timeFormData.empId,
        date: timeFormData.date,
        checkInTime: checkIn12,
        signOutTime: signOut12,
        status: timeFormData.status,
        remarks: timeFormData.remarks,
      });

      await refreshData();
      setTimeAdjustModal(null);
    } catch (err) {
      console.error("Error saving attendance time:", err);
      await refreshData();
      setTimeAdjustModal(null);
    } finally {
      setIsSavingTime(false);
    }
  };

  // Remove attendance / Revert to Absent from inside the Time Modal
  const handleRemoveAttendanceFromModal = async () => {
    if (!timeAdjustModal) return;
    const ok = window.confirm(
      `Are you sure you want to remove attendance and mark "${timeFormData.empName}" as ABSENT for ${timeFormData.date}?`
    );
    if (!ok) return;

    setIsSavingTime(true);
    try {
      await adjustEmployeeAttendanceTime({
        empId: timeFormData.empId,
        date: timeFormData.date,
        status: "ABSENT",
      });
      await refreshData();
      setTimeAdjustModal(null);
    } catch (err) {
      console.error("Error removing attendance:", err);
    } finally {
      setIsSavingTime(false);
    }
  };

  // Delete Employee
  const handleDeleteEmployee = async (empId, name) => {
    if (!empId) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove employee "${name}" (${empId}) from the database?\n\nAll biometric reference photos and attendance records for this employee will be deleted.`
    );
    if (!confirmed) return;

    try {
      await deleteEmployee(empId);
      setEmployees((prev) => prev.filter((e) => String(e.id).trim() !== String(empId).trim()));
      setTodayAttendance((prev) => prev.filter((a) => String(a.empId).trim() !== String(empId).trim()));
      await refreshData();
      alert(`Employee ${name} (${empId}) has been successfully deleted from the database.`);
    } catch (err) {
      console.error("Delete employee error:", err);
      setEmployees((prev) => prev.filter((e) => String(e.id).trim() !== String(empId).trim()));
      await refreshData();
      alert(`Employee ${name} (${empId}) removed.`);
    }
  };

  // Clear All Attendance Records
  const handleClearAttendance = async () => {
    const ok = window.confirm(
      "⚠️ DANGER: Are you sure you want to permanently DELETE ALL attendance records?\n\nThis will remove check-ins, sign-outs, GPS location logs, and biometric verification proofs for all employees. This cannot be undone."
    );
    if (!ok) return;

    try {
      await clearAllAttendance();
      setTodayAttendance([]);
      await refreshData();
      alert("All attendance data has been permanently removed from the database and system.");
    } catch (err) {
      console.error("Error clearing attendance:", err);
      setTodayAttendance([]);
      await refreshData();
      alert("Attendance data cleared.");
    }
  };

  // Save Office Location
  const handleSaveOffice = (e) => {
    e.preventDefault();
    const updated = {
      ...office,
      lat: parseFloat(tempLat),
      lng: parseFloat(tempLng),
      radiusMeters: parseInt(tempRadius, 10) || 50,
    };
    setOffice(updated);
    setOfficeLocation(updated);
    setShowGeoModal(false);
    alert("Office location & geofence radius updated successfully!");
  };

  // Fetch current GPS and auto-fill coordinates input
  const [geoLocFetching, setGeoLocFetching] = useState(false);
  const handleFillCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLocFetching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTempLat(pos.coords.latitude);
        setTempLng(pos.coords.longitude);
        setGeoLocFetching(false);
      },
      (err) => {
        setGeoLocFetching(false);
        alert("Failed to retrieve current device GPS: " + (err.message || "Permission denied"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Use current device GPS as Office
  const handleUseCurrentGPSAsOffice = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTempLat(pos.coords.latitude);
        setTempLng(pos.coords.longitude);
        const updated = {
          ...office,
          name: "Current Device Location (Office Center)",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusMeters: 50,
        };
        setOffice(updated);
        setOfficeLocation(updated);
        setShowGeoModal(false);
        alert(`Office location set to current GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) with 50m geofence!`);
      },
      () => {
        alert("Failed to retrieve current device GPS.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Reset Office
  const handleResetOffice = () => {
    const reset = resetOfficeLocation();
    setOffice(reset);
    setTempLat(reset.lat);
    setTempLng(reset.lng);
    setTempRadius(reset.radiusMeters);
    alert("Reset office location to GSR Powerpet, Eluru (50m perimeter).");
  };

  // Original broadband overview stats
  const broadbandStats = [
    { title: "Total Customers", value: "1,248", icon: <Users size={24} /> },
    { title: "Total Revenue", value: "₹8.45L", icon: <IndianRupee size={24} /> },
    { title: "Total Complaints", value: "24", icon: <MessageSquare size={24} /> },
    { title: "New Connections", value: "38", icon: <UserPlus size={24} /> },
    { title: "Active Partners", value: "12", icon: <Wifi size={24} /> },
  ];

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-page">
      {/* ADMIN HEADER */}
      <div className="dashboard-header">
        <div>
          <span className="dash-badge">ADMIN CONTROL CENTER</span>
          <h1>GSR Broadband Administration</h1>
          <p className="dash-subtext">
            Manage employee attendance, biometric face verification, 50m geofence &amp; network operations.
          </p>
        </div>

        <div className="dash-header-actions">
          <div className="dashboard-status">
            <TrendingUp size={16} />
            System Live
          </div>

          <button
            type="button"
            className="btn-admin-logout"
            onClick={handleLogout}
            title="Log out of Admin Portal"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="dashboard-tab-bar">
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          <UserCheck size={18} />
          <span>Employee Attendance &amp; Records</span>
          <span className="tab-pill">{presentCount}/{totalEmployees} Present</span>
        </button>

        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <TrendingUp size={18} />
          <span>Attendance Analytics &amp; Reports</span>
          <span className="tab-pill">Daily • Weekly • Monthly</span>
        </button>

        <button
          type="button"
          className={`dash-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Wifi size={18} />
          <span>Broadband &amp; Customer Overview</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & EMPLOYEES MANAGEMENT */}
      {activeTab === "attendance" && (
        <div className="attendance-admin-wrapper">
          {/* ATTENDANCE KPI STATS CARDS */}
          <div className="attendance-kpi-grid">
            <div className="att-kpi-card">
              <div className="att-kpi-icon blue">
                <Users size={24} />
              </div>
              <div>
                <p>Total Employees</p>
                <h2>{totalEmployees}</h2>
                <span className="kpi-sub">Registered Staff</span>
              </div>
            </div>

            <div className="att-kpi-card">
              <div className="att-kpi-icon green">
                <UserCheck size={24} />
              </div>
              <div>
                <p>Present Today</p>
                <h2 className="text-green">{presentCount}</h2>
                <span className="kpi-sub text-green">Face &amp; 50m Verified</span>
              </div>
            </div>

            <div className="att-kpi-card">
              <div className="att-kpi-icon red">
                <UserX size={24} />
              </div>
              <div>
                <p>Absent Today</p>
                <h2 className="text-red">{absentCount}</h2>
                <span className="kpi-sub text-red">Not Checked In</span>
              </div>
            </div>

            <div className="att-kpi-card">
              <div className="att-kpi-icon purple">
                <Sparkles size={24} />
              </div>
              <div>
                <p>Attendance Rate</p>
                <h2>{attendanceRate}%</h2>
                <span className="kpi-sub">Today's Turnout</span>
              </div>
            </div>

            <div className="att-kpi-card">
              <div className="att-kpi-icon cyan">
                <MapPin size={24} />
              </div>
              <div>
                <p>Geofence Radius</p>
                <h2>50m</h2>
                <span className="kpi-sub">GPS Strict Perimeter</span>
              </div>
            </div>
          </div>

          {/* TABLE TOOLBAR (SEARCH, FILTER, ADD EMPLOYEE & GEOFENCE) */}
          <div className="att-table-toolbar">
            <div className="toolbar-left">
              <div className="search-input-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search employee by name, ID or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-buttons-group">
                <button
                  type="button"
                  className={`btn-filter ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  All ({employees.length})
                </button>
                <button
                  type="button"
                  className={`btn-filter ${statusFilter === "PRESENT" ? "active" : ""}`}
                  onClick={() => setStatusFilter("PRESENT")}
                >
                  Present ({presentCount})
                </button>
                <button
                  type="button"
                  className={`btn-filter ${statusFilter === "ABSENT" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ABSENT")}
                >
                  Absent ({absentCount})
                </button>
                <button
                  type="button"
                  className={`btn-filter btn-filter-employees ${statusFilter === "EMPLOYEES" ? "active" : ""}`}
                  onClick={() => setStatusFilter("EMPLOYEES")}
                >
                  <Users size={14} />
                  <span>Employees ({employees.length})</span>
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              <button
                type="button"
                className="btn-toolbar-settings btn-toolbar-analytics"
                onClick={() => setActiveTab("analytics")}
                title="View Comprehensive Attendance Analytics"
              >
                <TrendingUp size={16} />
                <span>Analytics &amp; Reports</span>
              </button>

              <button
                type="button"
                className={`btn-toolbar-settings ${isRefreshing ? "refreshing" : ""}`}
                onClick={handleRefresh}
                title="Refresh Live Data"
              >
                <RefreshCw size={15} className={isRefreshing ? "spin-icon" : ""} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                className="btn-toolbar-settings"
                onClick={() => setShowGeoModal(true)}
              >
                <MapPin size={16} />
                <span>Geofence (50m)</span>
              </button>

              <button
                type="button"
                className="btn-add-emp-primary"
                onClick={handleOpenAddModal}
              >
                <Plus size={18} />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* ATTENDANCE & EMPLOYEES TABLE */}
          <div className="dashboard-panel table-panel">
            <div className="panel-header">
              <div>
                <span>
                  {statusFilter === "EMPLOYEES"
                    ? "EMPLOYEE DIRECTORY & STAFF MANAGEMENT"
                    : "LIVE ATTENDANCE COLUMN & ROSTER"}
                </span>
                <h2>
                  {statusFilter === "EMPLOYEES"
                    ? `Registered Employees List (${employees.length}) — Edit & Modify Profiles`
                    : `Employee Attendance Roster (Today: ${getTodayDateString()})`}
                </h2>
              </div>
            </div>

            <div className="responsive-table-wrapper">
              <table className="attendance-table">
                <thead>
                  {statusFilter === "EMPLOYEES" ? (
                    <tr>
                      <th>EMPLOYEE &amp; PHOTO</th>
                      <th>EMP ID</th>
                      <th>DEPARTMENT</th>
                      <th>ROLE / DESIGNATION</th>
                      <th>CONTACT</th>
                      <th>WORK SHIFT</th>
                      <th>JOIN DATE</th>
                      <th>ACTIONS (EDIT &amp; MODIFY)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>EMPLOYEE &amp; PHOTO</th>
                      <th>EMP ID</th>
                      <th>DEPARTMENT / ROLE</th>
                      <th>CONTACT</th>
                      <th>ATTENDANCE STATUS</th>
                      <th>CHECK-IN</th>
                      <th>SIGN-OUT</th>
                      <th>WORKING HOURS</th>
                      <th>DISTANCE (≤ 50M)</th>
                      <th>FACE ACCURACY &amp; PROOF</th>
                      <th>ATTENDANCE ACTION</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={statusFilter === "EMPLOYEES" ? "8" : "11"} className="no-data-cell" style={{ padding: "48px 20px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-muted, #94a3b8)" }}>
                          <Users size={40} style={{ opacity: 0.45, color: "#38bdf8" }} />
                          <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                            {employees.length === 0 ? "Employee Database is Fresh & Clean" : "No matching employees found"}
                          </strong>
                          <p style={{ margin: 0, fontSize: "13px", maxWidth: "420px", lineHeight: "1.5" }}>
                            {employees.length === 0
                              ? "There are currently 0 employees in the database. Click '+ Add Employee' to start registering your team with facial photos & GPS geofencing."
                              : "No employees match your search or filter criteria. Try adjusting the filter or search keyword."}
                          </p>
                          {employees.length === 0 && (
                            <button
                              type="button"
                              className="btn-add-emp-primary"
                              onClick={handleOpenAddModal}
                              style={{ marginTop: "8px" }}
                            >
                              <Plus size={16} />
                              <span>Register First Employee</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : statusFilter === "EMPLOYEES" ? (
                    /* -------------------------------------------------------------
                       EMPLOYEES VIEW: FULL EDIT, MODIFY & PROFILE MANAGEMENT ONLY
                       ------------------------------------------------------------- */
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="row-employee-item">
                        {/* Photo & Name */}
                        <td>
                          <div className="emp-cell">
                            <img
                              src={emp.facePhoto}
                              alt={emp.name}
                              className="emp-table-avatar"
                            />
                            <div>
                              <strong>{emp.name}</strong>
                              <span>{emp.role}</span>
                              {Array.isArray(emp.facePhotos) && emp.facePhotos.filter(Boolean).length >= 3 ? (
                                <span className="pill-3pic" title="3-Angle Biometric Profile (99% Precision Mode)">
                                  <Sparkles size={10} /> 3 Pics (99%)
                                </span>
                              ) : (
                                <span className="pill-1pic" title="Single Photo Profile">
                                  1 Pic
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td>
                          <span className="table-emp-id">
                            {emp.id}
                          </span>
                        </td>

                        {/* Department */}
                        <td>
                          <span className="dept-tag">{emp.department}</span>
                        </td>

                        {/* Role */}
                        <td>
                          <strong>{emp.role}</strong>
                        </td>

                        {/* Contact */}
                        <td>
                          <div className="contact-cell">
                            <span>{emp.phone}</span>
                            <span className="email-sub">{emp.email}</span>
                          </div>
                        </td>

                        {/* Work Shift */}
                        <td>
                          <span className="shift-badge">{emp.shift}</span>
                        </td>

                        {/* Join Date */}
                        <td>
                          <span className="join-date-cell">{emp.joinDate || "2024-01-15"}</span>
                        </td>

                        {/* ACTIONS: EDIT & MODIFY AVAILABLE ONLY HERE */}
                        <td>
                          <div className="action-buttons-cell">
                            <button
                              type="button"
                              className="btn-edit-emp-direct"
                              onClick={() => handleOpenEditModal(emp)}
                              title="Edit & Modify Employee Details"
                            >
                              <Pencil size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className="btn-update-photo-emp"
                              onClick={() => handleOpenUpdatePhoto(emp)}
                              title="Recapture & Update Live Face Reference Photo"
                            >
                              <Camera size={14} />
                            </button>

                            <button
                              type="button"
                              className="btn-delete-emp"
                              onClick={() =>
                                handleDeleteEmployee(emp.id, emp.name)
                              }
                              title="Delete Employee"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* -------------------------------------------------------------
                       ATTENDANCE VIEW (ALL, PRESENT, ABSENT): NO EDIT BUTTONS
                       ------------------------------------------------------------- */
                    filteredEmployees.map((emp) => {
                      const att = attendanceMap[emp.id];
                      const isPresent = Boolean(att);

                      return (
                        <tr key={emp.id} className={isPresent ? "row-present" : "row-absent"}>
                          {/* Photo & Name - Strict attendance display (No edit triggers) */}
                          <td>
                            <div className="emp-cell">
                              <img
                                src={emp.facePhoto}
                                alt={emp.name}
                                className="emp-table-avatar"
                              />
                              <div>
                                <strong>{emp.name}</strong>
                                <span>Shift: {emp.shift}</span>
                                {Array.isArray(emp.facePhotos) && emp.facePhotos.filter(Boolean).length >= 3 ? (
                                  <span className="pill-3pic" title="3-Angle Biometric Profile (99% Precision Mode)">
                                    <Sparkles size={10} /> 3 Pics (99%)
                                  </span>
                                ) : (
                                  <span className="pill-1pic" title="Single Photo Profile">
                                    1 Pic
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ID - Strict attendance display (No edit triggers) */}
                          <td>
                            <span className="table-emp-id">
                              {emp.id}
                            </span>
                          </td>

                          {/* Department / Role */}
                          <td>
                            <div className="dept-cell">
                              <strong>{emp.role}</strong>
                              <span>{emp.department}</span>
                            </div>
                          </td>

                          {/* Contact */}
                          <td>
                            <div className="contact-cell">
                              <span>{emp.phone}</span>
                              <span className="email-sub">{emp.email}</span>
                            </div>
                          </td>

                          {/* ATTENDANCE COLUMN (PRESENT / ABSENT) */}
                          <td>
                            {isPresent ? (
                              <span className="status-badge present">
                                <CheckCircle2 size={14} />
                                PRESENT
                              </span>
                            ) : (
                              <span className="status-badge absent">
                                <XCircle size={14} />
                                ABSENT
                              </span>
                            )}
                          </td>

                          {/* Check-in Time */}
                          <td>
                            {isPresent ? (
                              <div
                                className="time-cell time-clickable"
                                onClick={() => handleOpenTimeModal(emp, att)}
                                title="Click to adjust Check-In / Sign-Out time"
                              >
                                <Clock size={13} className="time-icon-active" />
                                <span>{att.time}</span>
                                <Pencil size={11} className="time-edit-hint" />
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn-add-time-inline"
                                onClick={() => handleOpenTimeModal(emp, null)}
                                title="Employee marked absent by mistake? Click to set arrival time"
                              >
                                <Clock size={11} />
                                <span>+ Add Time</span>
                              </button>
                            )}
                          </td>

                          {/* Sign-Out Time */}
                          <td>
                            {isPresent ? (
                              att.signOutTime ? (
                                <div
                                  className="time-cell signout-time time-clickable"
                                  onClick={() => handleOpenTimeModal(emp, att)}
                                  title="Click to adjust Sign-Out time"
                                >
                                  <LogOut size={13} />
                                  <span>{att.signOutTime}</span>
                                  <Pencil size={11} className="time-edit-hint" />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="badge-working-active badge-working-clickable"
                                  onClick={() => handleOpenTimeModal(emp, att)}
                                  title="Currently On Duty. Click to set sign-out time."
                                >
                                  <span className="pulse-dot"></span> On Duty
                                  <Pencil size={10} style={{ marginLeft: "4px", opacity: 0.7 }} />
                                </button>
                              )
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* Working Hours */}
                          <td>
                            {isPresent ? (
                              att.workingHours && att.workingHours !== "—" ? (
                                <span className="working-hours-pill">
                                  <Clock size={12} />
                                  {att.workingHours}
                                </span>
                              ) : (
                                <span className="working-in-progress">
                                  {calculateWorkingHours(att.time, new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }))} (Live)
                                </span>
                              )
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* Distance from Office (50m) */}
                          <td>
                            {isPresent ? (
                              <div className="distance-cell">
                                <MapPin size={14} className="pin-icon" />
                                <strong>{att.distanceMeters}m</strong>
                                <span className="dist-tag">≤ 50m Verified</span>
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* Face Accuracy & Proof */}
                          <td>
                            {isPresent && att.capturedPhoto ? (
                              <div className="proof-cell">
                                <button
                                  type="button"
                                  className="proof-thumb-btn"
                                  onClick={() => setShowProofModal(att)}
                                  title="Click to view live face snapshot & GPS proof"
                                >
                                  <img
                                    src={att.capturedPhoto}
                                    alt="Live Snapshot"
                                    className="proof-thumb"
                                  />
                                  <span className="accuracy-pill">
                                    {att.accuracy}% Match
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted">No Face Data</span>
                            )}
                          </td>

                          {/* ATTENDANCE ACTION */}
                          <td>
                            <div className="action-buttons-cell">
                              <button
                                type="button"
                                className={`btn-adjust-time ${
                                  isPresent ? "btn-edit-time" : "btn-add-time"
                                }`}
                                onClick={() => handleOpenTimeModal(emp, att)}
                                title={
                                  isPresent
                                    ? "Edit Check-in & Sign-out Time"
                                    : "Employee absent by mistake? Click to add arrival time"
                                }
                              >
                                <Clock size={12} />
                                <span>{isPresent ? "Edit Time" : "Add Time"}</span>
                              </button>

                              <button
                                type="button"
                                className={`btn-toggle-att ${
                                  isPresent ? "btn-mark-absent" : "btn-mark-present"
                                }`}
                                onClick={() =>
                                  handleToggleAttendance(
                                    emp.id,
                                    isPresent ? "PRESENT" : "ABSENT"
                                  )
                                }
                                title={
                                  isPresent
                                    ? "Mark as Absent"
                                    : "1-Click Quick Present (Current Time)"
                                }
                              >
                                {isPresent ? "Mark Absent" : "Present (Now)"}
                              </button>

                              <button
                                type="button"
                                className="btn-edit-emp-direct"
                                onClick={() => handleOpenEditModal(emp)}
                                title="Edit Employee Details"
                              >
                                <Pencil size={13} />
                              </button>

                              <button
                                type="button"
                                className="btn-delete-emp"
                                onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                title="Delete Employee"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE ANALYTICS & INSIGHTS (PRESENT/ABSENT, DAY-WISE, WEEKLY, MONTHLY) */}
      {activeTab === "analytics" && (
        <AttendanceAnalytics
          employees={employees}
          allAttendance={allAttendance}
          onRefresh={handleRefresh}
          onAdjustTime={handleOpenTimeModal}
        />
      )}

      {/* TAB 3: ORIGINAL BROADBAND OVERVIEW */}
      {activeTab === "overview" && (
        <div className="overview-tab-content">
          <div className="dashboard-stats">
            {broadbandStats.map((stat) => (
              <div className="dashboard-stat-card" key={stat.title}>
                <div className="dashboard-stat-icon">{stat.icon}</div>
                <div>
                  <p>{stat.title}</p>
                  <h2>{stat.value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <span>CUSTOMER DATA</span>
                  <h2>Customer Overview</h2>
                </div>
              </div>
              <div className="overview-grid">
                <div>
                  <strong>38</strong>
                  <span>Registered Today</span>
                </div>
                <div>
                  <strong>107</strong>
                  <span>Expired Last 7 Days</span>
                </div>
                <div>
                  <strong>82</strong>
                  <span>Expired Customers</span>
                </div>
                <div>
                  <strong>64</strong>
                  <span>Expire Next 7 Days</span>
                </div>
                <div>
                  <strong>995</strong>
                  <span>More Than 7 Days</span>
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <span>PARTNER DATA</span>
                  <h2>Partner Overview</h2>
                </div>
              </div>
              <div className="partner-list">
                <div className="partner-row">
                  <span>SuperAdmin</span>
                  <strong>24</strong>
                </div>
                <div className="partner-row">
                  <span>Vrplay</span>
                  <strong>107</strong>
                </div>
                <div className="partner-row">
                  <span>Mani Kanta Star &amp; Cable Net</span>
                  <strong>42</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel expiry-panel">
            <div className="panel-header">
              <div>
                <span>EXPIRY ANALYSIS</span>
                <h2>Customer Expiry Overview</h2>
              </div>
            </div>
            <div className="expiry-bars">
              <div className="expiry-item">
                <div className="expiry-label">
                  <span>Expired</span>
                  <strong>107</strong>
                </div>
                <div className="bar">
                  <div className="bar-fill red" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div className="expiry-item">
                <div className="expiry-label">
                  <span>Next 7 Days</span>
                  <strong>64</strong>
                </div>
                <div className="bar">
                  <div className="bar-fill blue" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div className="expiry-item">
                <div className="expiry-label">
                  <span>More Than 7 Days</span>
                  <strong>995</strong>
                </div>
                <div className="bar">
                  <div className="bar-fill green" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-box add-emp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="badge-pill">ADMIN ACTION</span>
                <h3>Add New Employee</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  stopAddCamera();
                  setShowAddModal(false);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit}>
              <div className="modal-form-grid">
                <div className="form-group">
                  <div className="label-with-action">
                    <label>
                      Employee ID <span className="auto-gen-pill">Auto Generated</span>
                    </label>
                    <button
                      type="button"
                      className="btn-regen-id"
                      onClick={() =>
                        setNewEmp((prev) => ({
                          ...prev,
                          id: generateAutoEmpId(employees),
                        }))
                      }
                      title="Generate next available ID"
                    >
                      <RefreshCw size={11} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. GSR-101"
                    value={newEmp.id}
                    onChange={(e) => setNewEmp({ ...newEmp, id: e.target.value })}
                    required
                  />
                  <small className="help-text-sub">
                    Unique ID automatically assigned. You can also customize manually.
                  </small>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    required
                    value={newEmp.name}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Role / Designation</label>
                  <input
                    type="text"
                    list="add-role-suggestions"
                    placeholder="e.g. Fiber Technician, Splicer, Field Engineer"
                    value={newEmp.role}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, role: e.target.value })
                    }
                  />
                  <datalist id="add-role-suggestions">
                    {roleSuggestions.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    list="add-dept-suggestions"
                    placeholder="e.g. Field Technical, NOC, Accounts"
                    value={newEmp.department}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, department: e.target.value })
                    }
                  />
                  <datalist id="add-dept-suggestions">
                    {departmentSuggestions.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98480 00000"
                    value={newEmp.phone}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="rajesh.gsr@gmail.com"
                    value={newEmp.email}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label>Work Shift</label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 06:00 PM"
                    value={newEmp.shift}
                    onChange={(e) =>
                      setNewEmp({ ...newEmp, shift: e.target.value })
                    }
                  />
                </div>

                {/* 3-PICTURE BIOMETRIC ENROLLMENT (FOR UP TO 99% ACCURACY) */}
                <div className="form-group full-width">
                  <div className="label-with-action">
                    <label>
                      Biometric Face Enrollment (3 Pictures Required) *
                    </label>
                    <span className="accuracy-badge-99">
                      <Sparkles size={12} /> Up to 99% Precision Mode
                    </span>
                  </div>

                  <div className="face-registration-box multi-angle-box">
                    {cameraActive ? (
                      <div className="face-camera-capture-box multi-capture-cam-box">
                        {/* Step selector pills */}
                        <div className="multi-angle-steps-bar">
                          {FACE_ANGLES.map((angle) => (
                            <button
                              key={angle.index}
                              type="button"
                              className={`angle-step-pill ${addCaptureStep === angle.index ? "active" : ""} ${addCapturedPhotos[angle.index] ? "completed" : ""}`}
                              onClick={() => setAddCaptureStep(angle.index)}
                            >
                              <span className="step-num">{angle.index + 1}</span>
                              <span>{angle.short}</span>
                              {addCapturedPhotos[angle.index] && <CheckCircle2 size={12} className="text-green" />}
                            </button>
                          ))}
                        </div>

                        {/* Camera guidance prompt */}
                        <div className="camera-step-instruction">
                          <span className="step-tag">SHOT {addCaptureStep + 1} OF 3</span>
                          <strong>{FACE_ANGLES[addCaptureStep].prompt}</strong>
                        </div>

                        <div className="camera-viewport-container">
                          <video
                            ref={attachAddVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="modal-camera-video"
                          />
                          <div className="biometric-face-oval-small">
                            <div className="scanning-laser-mini"></div>
                          </div>
                        </div>

                        <div className="capture-btns-row">
                          <button
                            type="button"
                            className="btn-modal-capture btn-pulse"
                            onClick={() => captureAddFace()}
                          >
                            <Camera size={16} /> Capture {FACE_ANGLES[addCaptureStep].short}
                          </button>
                          <button
                            type="button"
                            className="btn-modal-cancel-cam"
                            onClick={stopAddCamera}
                          >
                            Close Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="face-3shots-display">
                        <div className="face-3shots-grid">
                          {FACE_ANGLES.map((angle) => {
                            const photo = addCapturedPhotos[angle.index];
                            return (
                              <div
                                key={angle.index}
                                className={`face-shot-card ${photo ? "has-photo" : "empty-photo"}`}
                              >
                                <div className="shot-card-header">
                                  <span className="shot-title">{angle.title}</span>
                                  {photo && (
                                    <span className="shot-verified-tag">
                                      <CheckCircle2 size={11} /> Saved
                                    </span>
                                  )}
                                </div>

                                <div className="shot-thumbnail-box">
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={angle.title}
                                      className="registered-face-thumb-slot"
                                    />
                                  ) : (
                                    <div className="empty-shot-placeholder">
                                      <Camera size={24} className="text-muted" />
                                      <span>Pending Shot</span>
                                    </div>
                                  )}
                                </div>

                                <div className="shot-card-footer">
                                  {photo ? (
                                    <button
                                      type="button"
                                      className="btn-retake-slot"
                                      onClick={() => {
                                        setAddCaptureStep(angle.index);
                                        startAddCamera(angle.index);
                                      }}
                                    >
                                      <RotateCcw size={12} /> Retake
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn-capture-slot"
                                      onClick={() => {
                                        setAddCaptureStep(angle.index);
                                        startAddCamera(angle.index);
                                      }}
                                    >
                                      <Camera size={12} /> Take Photo
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {addCapturedPhotos.filter(Boolean).length === 3 ? (
                          <div className="biometric-ready-status-banner">
                            <CheckCircle2 size={18} className="text-green" />
                            <div>
                              <strong>3-Angle Biometric Profile Complete!</strong>
                              <span>All 3 reference photos recorded. Live face matching will operate with up to 99% precision.</span>
                            </div>
                            <button
                              type="button"
                              className="btn-retake-all-link"
                              onClick={() => {
                                setAddCapturedPhotos(["", "", ""]);
                                setNewEmp((prev) => ({ ...prev, facePhoto: "", facePhotos: [] }));
                                setAddCaptureStep(0);
                                startAddCamera(0);
                              }}
                            >
                              Retake All
                            </button>
                          </div>
                        ) : (
                          <div className="multi-capture-cta-row">
                            <button
                              type="button"
                              className="btn-cam-opt btn-prominent-enroll"
                              onClick={() => {
                                const nextEmpty = addCapturedPhotos.findIndex((p) => !p);
                                const target = nextEmpty >= 0 ? nextEmpty : 0;
                                setAddCaptureStep(target);
                                startAddCamera(target);
                              }}
                            >
                              <Camera size={18} />
                              <span>
                                {addCapturedPhotos.filter(Boolean).length === 0
                                  ? "Start 3-Photo Camera Capture (Front, Left, Right)"
                                  : `Capture Remaining Photos (${3 - addCapturedPhotos.filter(Boolean).length} left)`}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <small className="help-text" style={{ marginTop: "10px" }}>
                      Capturing all 3 distinct facial angles (Frontal, Left ~15°, Right ~15°) enables ultra-high biometric accuracy up to 99% and eliminates false rejections.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    stopAddCamera();
                    setShowAddModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save &amp; Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW ATTENDANCE PHOTO & BIOMETRIC PROOF */}
      {showProofModal && (
        <div className="modal-backdrop" onClick={() => setShowProofModal(null)}>
          <div
            className="modal-box proof-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="badge-pill green">BIOMETRIC PROOF</span>
                <h3>Face Attendance Snapshot</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowProofModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="proof-modal-content">
              <div className="proof-large-image-wrapper">
                <img
                  src={showProofModal.capturedPhoto}
                  alt={showProofModal.empName}
                  className="proof-large-image"
                />
                <div className="proof-overlay-badge">
                  <CheckCircle2 size={16} />
                  <span>Verified Live Face Capture</span>
                </div>
              </div>

              <div className="proof-meta-grid">
                <div>
                  <span>Employee Name</span>
                  <strong>{showProofModal.empName}</strong>
                </div>
                <div>
                  <span>Employee ID</span>
                  <strong>{showProofModal.empId}</strong>
                </div>
                <div>
                  <span>Check-in Timestamp</span>
                  <strong>
                    {showProofModal.date} at {showProofModal.time}
                  </strong>
                </div>
                <div>
                  <span>Sign-Out Timestamp</span>
                  <strong>
                    {showProofModal.signOutTime
                      ? `${showProofModal.date} at ${showProofModal.signOutTime}`
                      : "Shift In Progress (On Duty)"}
                  </strong>
                </div>
                <div>
                  <span>Total Working Hours</span>
                  <strong className="text-purple">
                    {showProofModal.workingHours ||
                      calculateWorkingHours(
                        showProofModal.time,
                        new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      ) + " (Live)"}
                  </strong>
                </div>
                <div>
                  <span>GPS Distance from Office</span>
                  <strong className="text-green">
                    {showProofModal.distanceMeters} meters (Within 50m Rule)
                  </strong>
                </div>
                <div>
                  <span>Biometric Accuracy Score</span>
                  <strong className="text-purple">
                    {showProofModal.accuracy}% Match
                  </strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong className="status-present">
                    {showProofModal.signOutTime ? "SIGNED OUT (PRESENT)" : "PRESENT (ON DUTY)"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowProofModal(null)}
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GEOFENCE 50M CONFIGURATION */}
      {showGeoModal && (
        <div className="modal-backdrop" onClick={() => setShowGeoModal(false)}>
          <div
            className="modal-box geo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="badge-pill">GEOFENCE SETTINGS</span>
                <h3>Office Location &amp; 50-Meter Radius</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowGeoModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffice}>
              <div className="geo-modal-body">
                <p>
                  Employees must be physically located within <strong>50 meters</strong> of this office coordinate to mark face attendance.
                </p>

                <div className="form-group">
                  <label>Office Name / Branch</label>
                  <input
                    type="text"
                    value={office.name}
                    disabled
                    style={{ background: "#f8fafc" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", marginTop: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>
                    Office Coordinates &amp; Geofence
                  </span>
                  <button
                    type="button"
                    className="btn-current-location-pill"
                    onClick={handleFillCurrentLocation}
                    disabled={geoLocFetching}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      background: "linear-gradient(135deg, #0284c7, #0369a1)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                      transition: "all 0.15s ease",
                    }}
                    title="Auto-fill Latitude & Longitude using your current device GPS"
                  >
                    <MapPin size={14} />
                    <span>{geoLocFetching ? "Detecting GPS..." : "📍 Current Location"}</span>
                  </button>
                </div>

                <div className="geo-inputs-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={tempLat}
                      onChange={(e) => setTempLat(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={tempLng}
                      onChange={(e) => setTempLng(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Perimeter (Meters)</label>
                    <input
                      type="number"
                      value={tempRadius}
                      onChange={(e) => setTempRadius(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="geo-quick-buttons">
                  <button
                    type="button"
                    className="btn-quick-gps"
                    onClick={handleUseCurrentGPSAsOffice}
                  >
                    <MapPin size={16} />
                    <span>Set Current Location as Office</span>
                  </button>

                  <button
                    type="button"
                    className="btn-reset-gps"
                    onClick={handleResetOffice}
                  >
                    Reset to Powerpet, Eluru (Default)
                  </button>
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowGeoModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RECAPTURE / UPDATE EMPLOYEE FACE PHOTO */}
      {updatePhotoEmp && (
        <div
          className="modal-backdrop"
          onClick={() => {
            stopUpdateCamera();
            setUpdatePhotoEmp(null);
          }}
        >
          <div
            className="modal-box update-photo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="badge-pill purple">BIOMETRIC REGISTRATION</span>
                <h3>Update Face Photo: {updatePhotoEmp.name} ({updatePhotoEmp.id})</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  stopUpdateCamera();
                  setUpdatePhotoEmp(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="update-photo-modal-body">
              <div className="update-photo-intro-row">
                <p>
                  Register 3 distinct facial reference pictures for <strong>{updatePhotoEmp.name}</strong> ({updatePhotoEmp.id}) to achieve <strong>up to 99% biometric match accuracy</strong>.
                </p>
                <span className="accuracy-badge-99">
                  <Sparkles size={12} /> Up to 99% Precision Mode
                </span>
              </div>

              <div className="face-registration-box multi-angle-box">
                {updateCamActive ? (
                  <div className="face-camera-capture-box multi-capture-cam-box">
                    {/* Step selector pills */}
                    <div className="multi-angle-steps-bar">
                      {FACE_ANGLES.map((angle) => (
                        <button
                          key={angle.index}
                          type="button"
                          className={`angle-step-pill ${updateCaptureStep === angle.index ? "active" : ""} ${updateCapturedPhotos[angle.index] ? "completed" : ""}`}
                          onClick={() => setUpdateCaptureStep(angle.index)}
                        >
                          <span className="step-num">{angle.index + 1}</span>
                          <span>{angle.short}</span>
                          {updateCapturedPhotos[angle.index] && <CheckCircle2 size={12} className="text-green" />}
                        </button>
                      ))}
                    </div>

                    {/* Camera guidance prompt */}
                    <div className="camera-step-instruction">
                      <span className="step-tag">SHOT {updateCaptureStep + 1} OF 3</span>
                      <strong>{FACE_ANGLES[updateCaptureStep].prompt}</strong>
                    </div>

                    <div className="camera-viewport-container">
                      <video
                        ref={attachUpdateVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="modal-camera-video"
                      />
                      <div className="biometric-face-oval-small">
                        <div className="scanning-laser-mini"></div>
                      </div>
                    </div>

                    <div className="capture-btns-row">
                      <button
                        type="button"
                        className="btn-modal-capture btn-pulse"
                        onClick={() => captureNewPhoto()}
                      >
                        <Camera size={16} /> Capture {FACE_ANGLES[updateCaptureStep].short}
                      </button>
                      <button
                        type="button"
                        className="btn-modal-cancel-cam"
                        onClick={stopUpdateCamera}
                      >
                        Close Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="face-3shots-display">
                    <div className="face-3shots-grid">
                      {FACE_ANGLES.map((angle) => {
                        const photo = updateCapturedPhotos[angle.index];
                        return (
                          <div
                            key={angle.index}
                            className={`face-shot-card ${photo ? "has-photo" : "empty-photo"}`}
                          >
                            <div className="shot-card-header">
                              <span className="shot-title">{angle.title}</span>
                              {photo && (
                                <span className="shot-verified-tag">
                                  <CheckCircle2 size={11} /> Saved
                                </span>
                              )}
                            </div>

                            <div className="shot-thumbnail-box">
                              {photo ? (
                                <img
                                  src={photo}
                                  alt={angle.title}
                                  className="registered-face-thumb-slot"
                                />
                              ) : (
                                <div className="empty-shot-placeholder">
                                  <Camera size={24} className="text-muted" />
                                  <span>Pending Shot</span>
                                </div>
                              )}
                            </div>

                            <div className="shot-card-footer">
                              {photo ? (
                                <button
                                  type="button"
                                  className="btn-retake-slot"
                                  onClick={() => {
                                    setUpdateCaptureStep(angle.index);
                                    startUpdateCamera(angle.index);
                                  }}
                                >
                                  <RotateCcw size={12} /> Retake
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-capture-slot"
                                  onClick={() => {
                                    setUpdateCaptureStep(angle.index);
                                    startUpdateCamera(angle.index);
                                  }}
                                >
                                  <Camera size={12} /> Take Photo
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {updateCapturedPhotos.filter(Boolean).length === 3 ? (
                      <div className="biometric-ready-status-banner">
                        <CheckCircle2 size={18} className="text-green" />
                        <div>
                          <strong>3-Angle Biometric Profile Complete!</strong>
                          <span>All 3 reference photos recorded. Live face matching will operate with up to 99% precision.</span>
                        </div>
                        <button
                          type="button"
                          className="btn-retake-all-link"
                          onClick={() => {
                            setUpdateCapturedPhotos(["", "", ""]);
                            setUpdateCaptureStep(0);
                            startUpdateCamera(0);
                          }}
                        >
                          Recapture All 3
                        </button>
                      </div>
                    ) : (
                      <div className="biometric-pending-banner">
                        <span>
                          {updateCapturedPhotos.filter(Boolean).length} of 3 photos captured. Please capture all 3 angles to enable maximum 99% recognition accuracy.
                        </span>
                        <button
                          type="button"
                          className="btn-start-all-3"
                          onClick={() => {
                            const firstEmpty = updateCapturedPhotos.findIndex((p) => !p);
                            const nextStep = firstEmpty !== -1 ? firstEmpty : 0;
                            setUpdateCaptureStep(nextStep);
                            startUpdateCamera(nextStep);
                          }}
                        >
                          <Camera size={15} /> Continue Capture
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  stopUpdateCamera();
                  setUpdatePhotoEmp(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveUpdatedPhoto}
                disabled={updateCapturedPhotos.filter(Boolean).length === 0}
              >
                Save &amp; Activate 3-Angle Face (99% Accuracy)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW & EDIT EMPLOYEE DETAILS */}
      {editEmpModal && (
        <div
          className="modal-backdrop"
          onClick={() => {
            stopEditCamera();
            setEditEmpModal(null);
          }}
        >
          <div
            className="modal-box edit-emp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="badge-pill blue">EMPLOYEE DETAILS &amp; EDIT</span>
                <h3>Edit Employee: {editFormData.name} ({editFormData.id})</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  stopEditCamera();
                  setEditEmpModal(null);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee}>
              {/* Employee Overview Card inside Modal */}
              <div className="edit-profile-header-card">
                <div className="edit-profile-avatar-wrapper">
                  <img
                    src={editFormData.facePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
                    alt={editFormData.name}
                    className="edit-profile-avatar"
                  />
                  <span className="edit-emp-id-tag">{editFormData.id}</span>
                </div>
                <div className="edit-profile-header-info">
                  <h4>{editFormData.name || "Employee Name"}</h4>
                  <p>{editFormData.role || "Role Not Set"} • <strong>{editFormData.department}</strong></p>
                  <div className="edit-profile-meta-tags">
                    <span>Shift: {editFormData.shift}</span>
                    <span>Joined: {editFormData.joinDate || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Employee ID (Primary Key - Read Only)</label>
                  <input
                    type="text"
                    value={editFormData.id}
                    disabled
                    style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                  />
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    placeholder="Employee Full Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department (Type Manually or Select)</label>
                  <input
                    type="text"
                    list="edit-dept-suggestions"
                    value={editFormData.department}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, department: e.target.value })
                    }
                    placeholder="e.g. Field Technical or custom department"
                  />
                  <datalist id="edit-dept-suggestions">
                    {departmentSuggestions.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Designation / Role (Type Manually or Select)</label>
                  <input
                    type="text"
                    list="edit-role-suggestions"
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    placeholder="e.g. Senior Fiber Engineer or custom role"
                  />
                  <datalist id="edit-role-suggestions">
                    {roleSuggestions.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    placeholder="+91 98480 00000"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    placeholder="employee@gsrbroadband.in"
                  />
                </div>

                <div className="form-group">
                  <label>Work Shift</label>
                  <input
                    type="text"
                    value={editFormData.shift}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, shift: e.target.value })
                    }
                    placeholder="09:00 AM - 06:00 PM"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Joining</label>
                  <input
                    type="date"
                    value={editFormData.joinDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, joinDate: e.target.value })
                    }
                  />
                </div>

                {/* BIOMETRIC FACE PHOTO FIELD */}
                <div className="form-group full-width">
                  <label>Biometric Face Reference Photo (Used for Live Verification)</label>
                  <div className="face-registration-box">
                    {editCamActive ? (
                      <div className="face-camera-capture-box">
                        <video
                          ref={attachEditVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="modal-camera-video"
                        />
                        <div className="capture-btns-row">
                          <button
                            type="button"
                            className="btn-modal-capture"
                            onClick={captureEditFace}
                          >
                            <Camera size={16} /> Click to Capture Face
                          </button>
                          <button
                            type="button"
                            className="btn-modal-cancel-cam"
                            onClick={stopEditCamera}
                          >
                            Cancel Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="edit-face-photo-row">
                        <img
                          src={editFormData.facePhoto}
                          alt="Face Reference"
                          className="edit-face-thumb"
                        />
                        <div className="edit-face-info">
                          <button
                            type="button"
                            className="btn-cam-opt"
                            onClick={startEditCamera}
                          >
                            <Camera size={16} />
                            <span>Capture New Photo via Live Camera</span>
                          </button>
                          <small className="help-text">
                            Must be a clean frontal face photo with good lighting.
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions-footer edit-emp-footer">
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => {
                    const empId = editFormData.id;
                    const empName = editFormData.name;
                    stopEditCamera();
                    setEditEmpModal(null);
                    handleDeleteEmployee(empId, empName);
                  }}
                  title="Permanently Delete this Employee"
                >
                  <Trash2 size={15} />
                  <span>Delete Employee</span>
                </button>

                <div className="footer-right-buttons">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      stopEditCamera();
                      setEditEmpModal(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: MANUAL ATTENDANCE & TIME ENTRY (FOR EMPLOYEES MARKED ABSENT BY MISTAKE) */}
      {timeAdjustModal && (
        <div
          className="modal-backdrop"
          onClick={() => !isSavingTime && setTimeAdjustModal(null)}
        >
          <div
            className="modal-box time-adjust-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <span className="badge-pill time-badge-pill">
                  <Clock size={12} /> ADMIN OVERRIDE
                </span>
                <h3>
                  {timeAdjustModal.att
                    ? "Adjust Attendance Time"
                    : "Add Attendance Time (Fix Absent Mistake)"}
                </h3>
                <p className="modal-subtitle">
                  Manually record or correct arrival &amp; departure time for employees who missed punching or were marked absent by mistake.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isSavingTime && setTimeAdjustModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTimeAdjustment}>
              <div className="modal-body-scroll">
                {/* Employee Info Header Card */}
                <div className="time-modal-emp-card">
                  <img
                    src={timeAdjustModal.emp.facePhoto}
                    alt={timeAdjustModal.emp.name}
                    className="time-modal-avatar"
                  />
                  <div className="time-modal-emp-info">
                    <div className="emp-title-row">
                      <strong>{timeAdjustModal.emp.name}</strong>
                      <span className="table-emp-id">{timeAdjustModal.emp.id}</span>
                      {timeAdjustModal.att ? (
                        <span className="status-badge present">
                          <CheckCircle2 size={12} /> Currently Present
                        </span>
                      ) : (
                        <span className="status-badge absent">
                          <XCircle size={12} /> Currently Absent
                        </span>
                      )}
                    </div>
                    <div className="emp-sub-row">
                      <span>
                        {timeAdjustModal.emp.role} • {timeAdjustModal.emp.department}
                      </span>
                      <span>
                        Shift: <strong>{timeAdjustModal.emp.shift || "09:00 AM - 06:00 PM"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="time-modal-form-grid">
                  {/* Attendance Date */}
                  <div className="form-group">
                    <label>
                      <Calendar size={14} /> Attendance Date *
                    </label>
                    <input
                      type="date"
                      value={timeFormData.date}
                      onChange={(e) =>
                        setTimeFormData((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Attendance Status */}
                  <div className="form-group">
                    <label>Attendance Status *</label>
                    <select
                      value={timeFormData.status}
                      onChange={(e) =>
                        setTimeFormData((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="form-input"
                    >
                      <option value="PRESENT">PRESENT (Full Day)</option>
                      <option value="HALF_DAY">HALF DAY (Present)</option>
                    </select>
                  </div>
                </div>

                {/* Check-In Time Section */}
                <div className="time-input-card">
                  <div className="time-card-header">
                    <label className="time-card-title">
                      <Clock size={15} style={{ color: "#0284c7" }} /> Check-In (Arrival Time) *
                    </label>
                    <span className="time-preview-tag">
                      12-Hour: <strong>{formatTime24to12(timeFormData.checkInTime24)}</strong>
                    </span>
                  </div>
                  <input
                    type="time"
                    value={timeFormData.checkInTime24}
                    onChange={(e) =>
                      setTimeFormData((prev) => ({
                        ...prev,
                        checkInTime24: e.target.value,
                      }))
                    }
                    className="form-input time-picker-input"
                    required
                  />
                  <div className="time-presets">
                    <span className="preset-label">Quick Presets:</span>
                    <button
                      type="button"
                      className="btn-preset"
                      onClick={() =>
                        setTimeFormData((prev) => ({ ...prev, checkInTime24: "09:00" }))
                      }
                    >
                      09:00 AM (Shift Start)
                    </button>
                    <button
                      type="button"
                      className="btn-preset"
                      onClick={() =>
                        setTimeFormData((prev) => ({ ...prev, checkInTime24: "09:30" }))
                      }
                    >
                      09:30 AM
                    </button>
                    <button
                      type="button"
                      className="btn-preset"
                      onClick={() =>
                        setTimeFormData((prev) => ({ ...prev, checkInTime24: "10:00" }))
                      }
                    >
                      10:00 AM
                    </button>
                    <button
                      type="button"
                      className="btn-preset"
                      onClick={() => {
                        const now = new Date();
                        const h = String(now.getHours()).padStart(2, "0");
                        const m = String(now.getMinutes()).padStart(2, "0");
                        setTimeFormData((prev) => ({ ...prev, checkInTime24: `${h}:${m}` }));
                      }}
                    >
                      Current Time (Now)
                    </button>
                  </div>
                </div>

                {/* Sign-Out Time Section */}
                <div className="time-input-card">
                  <div className="time-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id="hasSignOutCheck"
                        checked={timeFormData.hasSignOut}
                        onChange={(e) =>
                          setTimeFormData((prev) => ({
                            ...prev,
                            hasSignOut: e.target.checked,
                            signOutTime24: e.target.checked
                              ? prev.signOutTime24 || "18:00"
                              : "",
                          }))
                        }
                        className="custom-checkbox"
                      />
                      <label htmlFor="hasSignOutCheck" className="time-card-title clickable">
                        <LogOut size={15} style={{ color: "#16a34a" }} /> Record Sign-Out / Departure Time
                      </label>
                    </div>
                    {timeFormData.hasSignOut && (
                      <span className="time-preview-tag signout">
                        12-Hour: <strong>{formatTime24to12(timeFormData.signOutTime24)}</strong>
                      </span>
                    )}
                  </div>

                  {timeFormData.hasSignOut ? (
                    <>
                      <input
                        type="time"
                        value={timeFormData.signOutTime24}
                        onChange={(e) =>
                          setTimeFormData((prev) => ({
                            ...prev,
                            signOutTime24: e.target.value,
                          }))
                        }
                        className="form-input time-picker-input"
                        required={timeFormData.hasSignOut}
                      />
                      <div className="time-presets">
                        <span className="preset-label">Quick Presets:</span>
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() =>
                            setTimeFormData((prev) => ({
                              ...prev,
                              signOutTime24: "18:00",
                            }))
                          }
                        >
                          06:00 PM (Shift End)
                        </button>
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() =>
                            setTimeFormData((prev) => ({
                              ...prev,
                              signOutTime24: "18:30",
                            }))
                          }
                        >
                          06:30 PM
                        </button>
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() =>
                            setTimeFormData((prev) => ({
                              ...prev,
                              signOutTime24: "19:00",
                            }))
                          }
                        >
                          07:00 PM
                        </button>
                        <button
                          type="button"
                          className="btn-preset"
                          onClick={() => {
                            const now = new Date();
                            const h = String(now.getHours()).padStart(2, "0");
                            const m = String(now.getMinutes()).padStart(2, "0");
                            setTimeFormData((prev) => ({
                              ...prev,
                              signOutTime24: `${h}:${m}`,
                            }));
                          }}
                        >
                          Current Time (Now)
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="time-muted-note">
                      Leave unchecked if employee is currently <strong>On Duty / Still Working</strong>. Working hours will be calculated live until departure.
                    </p>
                  )}
                </div>

                {/* Working Duration Preview */}
                <div className="duration-preview-box">
                  <div className="duration-left">
                    <Sparkles size={16} className="sparkle-icon" />
                    <div>
                      <strong>Calculated Work Duration:</strong>
                      <span className="duration-val">
                        {timeFormData.hasSignOut && timeFormData.signOutTime24 ? (
                          calculateWorkingHours(
                            formatTime24to12(timeFormData.checkInTime24),
                            formatTime24to12(timeFormData.signOutTime24)
                          )
                        ) : (
                          "Active (On Duty - Live Progress)"
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="duration-shift-hint">
                    Shift: {timeAdjustModal.emp.shift || "09:00 AM - 06:00 PM"}
                  </span>
                </div>

                {/* Reason / Remarks */}
                <div className="form-group">
                  <label>
                    <FileText size={14} /> Reason for Manual Time Entry
                  </label>
                  <input
                    type="text"
                    value={timeFormData.remarks}
                    onChange={(e) =>
                      setTimeFormData((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                    placeholder="e.g. Employee absent by mistake, Forgot punch, Field duty"
                    className="form-input"
                  />
                  <div className="time-presets" style={{ marginTop: "6px" }}>
                    <span className="preset-label">Quick Suggestions:</span>
                    {[
                      "Absent by mistake (Present in office)",
                      "Biometric face scan glitch",
                      "Forgot to punch in morning",
                      "Field installation / On-duty",
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="btn-preset"
                        onClick={() =>
                          setTimeFormData((prev) => ({ ...prev, remarks: s }))
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="modal-actions-footer">
                {timeAdjustModal.att ? (
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={handleRemoveAttendanceFromModal}
                    disabled={isSavingTime}
                    title="Remove attendance and revert to absent"
                  >
                    <Trash2 size={14} />
                    <span>Revert to Absent</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="footer-right-buttons">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setTimeAdjustModal(null)}
                    disabled={isSavingTime}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary btn-save-time"
                    disabled={isSavingTime}
                  >
                    {isSavingTime ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" />
                        <span>Saving Time...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Attendance Time</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;