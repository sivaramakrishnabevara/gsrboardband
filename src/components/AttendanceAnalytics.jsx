import { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  CalendarDays,
  Clock,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Award,
  RefreshCw,
  FileSpreadsheet,
  ArrowUpRight,
  Percent,
} from "lucide-react";
import { formatTime12to24 } from "../services/attendanceService";

export default function AttendanceAnalytics({
  employees = [],
  allAttendance = [],
  onRefresh,
  onAdjustTime,
}) {
  // Analysis View Modes: "daily", "weekly", "monthly", "employee"
  const [viewMode, setViewMode] = useState("daily");

  // Filter States
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(() => todayStr.slice(0, 7)); // YYYY-MM
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0); // 0 = current week, -1 = last week
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [searchEmp, setSearchEmp] = useState("");
  const [presentAbsentTab, setPresentAbsentTab] = useState("ALL"); // "ALL", "PRESENT", "ABSENT"

  // Unique Departments
  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [employees]);

  // Filtered employees list based on department & search
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (deptFilter !== "ALL" && emp.department !== deptFilter) return false;
      if (searchEmp.trim()) {
        const q = searchEmp.toLowerCase();
        const mName = emp.name?.toLowerCase().includes(q);
        const mId = emp.id?.toLowerCase().includes(q);
        const mDept = emp.department?.toLowerCase().includes(q);
        const mRole = emp.role?.toLowerCase().includes(q);
        return mName || mId || mDept || mRole;
      }
      return true;
    });
  }, [employees, deptFilter, searchEmp]);

  // -------------------------------------------------------------
  // 1. DAY-WISE DATA COMPUTATION
  // -------------------------------------------------------------
  const dayStats = useMemo(() => {
    const recordsForDay = allAttendance.filter((r) => r.date === selectedDate);
    const attMap = {};
    recordsForDay.forEach((r) => {
      attMap[r.empId] = r;
    });

    const presentList = [];
    const absentList = [];

    filteredEmployees.forEach((emp) => {
      const record = attMap[emp.id];
      if (record && record.status === "PRESENT") {
        presentList.push({ emp, record });
      } else {
        absentList.push({ emp, record: record || null });
      }
    });

    const total = filteredEmployees.length;
    const present = presentList.length;
    const absent = absentList.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Calculate Average Check-in & Working Hours for day
    let totalMins = 0;
    let minsCount = 0;
    let totalWorkHours = 0;
    let workHoursCount = 0;

    presentList.forEach(({ record }) => {
      if (record?.time) {
        const match = String(record.time).match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const mer = match[3] ? match[3].toUpperCase() : "AM";
          if (mer === "PM" && h < 12) h += 12;
          if (mer === "AM" && h === 12) h = 0;
          totalMins += h * 60 + m;
          minsCount++;
        }
      }
      if (record?.workingHours) {
        const hMatch = String(record.workingHours).match(/(\d+)h/i);
        const mMatch = String(record.workingHours).match(/(\d+)m/i);
        const hrs = hMatch ? parseInt(hMatch[1], 10) : 0;
        const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
        const dur = hrs + mins / 60;
        if (dur > 0) {
          totalWorkHours += dur;
          workHoursCount++;
        }
      }
    });

    let avgTimeStr = "—";
    if (minsCount > 0) {
      const avgTotal = Math.round(totalMins / minsCount);
      const avgH = Math.floor(avgTotal / 60);
      const avgM = avgTotal % 60;
      const mer = avgH >= 12 ? "PM" : "AM";
      const h12 = avgH % 12 || 12;
      avgTimeStr = `${String(h12).padStart(2, "0")}:${String(avgM).padStart(2, "0")} ${mer}`;
    }

    const avgHoursStr = workHoursCount > 0
      ? `${(totalWorkHours / workHoursCount).toFixed(1)} hrs`
      : "—";

    return {
      total,
      present,
      absent,
      rate,
      presentList,
      absentList,
      avgTimeStr,
      avgHoursStr,
    };
  }, [allAttendance, selectedDate, filteredEmployees]);

  // -------------------------------------------------------------
  // 2. 7-DAY DAILY TREND (Trailing 7 days ending at selectedDate)
  // -------------------------------------------------------------
  const trailingTrend = useMemo(() => {
    const list = [];
    const base = new Date(selectedDate);
    if (isNaN(base.getTime())) return [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dt = String(d.getDate()).padStart(2, "0");
      const dateKey = `${y}-${m}-${dt}`;

      const recs = allAttendance.filter((r) => r.date === dateKey && r.status === "PRESENT");
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const presCount = recs.length;
      const absCount = Math.max(0, employees.length - presCount);
      const pct = employees.length > 0 ? Math.round((presCount / employees.length) * 100) : 0;

      list.push({
        date: dateKey,
        dayName,
        label: `${dayName} ${dt}`,
        present: presCount,
        absent: absCount,
        rate: pct,
        isCurrent: dateKey === selectedDate,
      });
    }
    return list;
  }, [selectedDate, allAttendance, employees.length]);

  // -------------------------------------------------------------
  // 3. WEEKLY COMPUTATION (Monday - Sunday for chosen week)
  // -------------------------------------------------------------
  const weekStats = useMemo(() => {
    const today = new Date();
    // Shift by week offset
    today.setDate(today.getDate() + selectedWeekOffset * 7);

    // Get Monday of that week (assuming Monday is start of work week)
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const weekDays = [];
    let totalExpected = 0;
    let totalPresent = 0;

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);

      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const dt = String(current.getDate()).padStart(2, "0");
      const dateKey = `${y}-${m}-${dt}`;

      const recs = allAttendance.filter((r) => r.date === dateKey && r.status === "PRESENT");
      const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
      const fullDay = current.toLocaleDateString("en-US", { weekday: "long" });
      const isSunday = current.getDay() === 0;

      // Sundays are off/half days, but tracked if logged
      const empTotal = filteredEmployees.length;
      const presCount = recs.length;
      const absCount = Math.max(0, empTotal - presCount);
      const rate = empTotal > 0 ? Math.round((presCount / empTotal) * 100) : 0;

      if (!isSunday) {
        totalExpected += empTotal;
        totalPresent += presCount;
      }

      weekDays.push({
        date: dateKey,
        dayName,
        fullDay,
        formattedDate: `${dt}/${m}`,
        present: presCount,
        absent: absCount,
        rate,
        isSunday,
        isToday: dateKey === todayStr,
      });
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const rangeStr = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const weeklyAvgRate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

    // Peak and Lowest days
    const workingDaysOnly = weekDays.filter((w) => !w.isSunday);
    const peakDay = workingDaysOnly.reduce((max, d) => (d.present > max.present ? d : max), workingDaysOnly[0] || { fullDay: "—", present: 0 });
    const lowestDay = workingDaysOnly.reduce((min, d) => (d.present < min.present ? d : min), workingDaysOnly[0] || { fullDay: "—", present: 0 });

    return {
      rangeStr,
      weekDays,
      weeklyAvgRate,
      peakDay,
      lowestDay,
      totalPresent,
      totalExpected,
    };
  }, [selectedWeekOffset, allAttendance, filteredEmployees.length, todayStr]);

  // -------------------------------------------------------------
  // 4. MONTHLY COMPUTATION
  // -------------------------------------------------------------
  const monthStats = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const monthDays = [];

    let totalExpectedManDays = 0;
    let totalPresentManDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dtStr = String(day).padStart(2, "0");
      const dateKey = `${yearStr}-${monthStr}-${dtStr}`;
      const dObj = new Date(year, monthIndex, day);
      const isSunday = dObj.getDay() === 0;

      const recs = allAttendance.filter((r) => r.date === dateKey && r.status === "PRESENT");
      const presCount = recs.length;
      const absCount = Math.max(0, filteredEmployees.length - presCount);
      const rate = filteredEmployees.length > 0 ? Math.round((presCount / filteredEmployees.length) * 100) : 0;

      if (!isSunday) {
        totalExpectedManDays += filteredEmployees.length;
        totalPresentManDays += presCount;
      }

      monthDays.push({
        day,
        date: dateKey,
        isSunday,
        present: presCount,
        absent: absCount,
        rate,
        isFuture: dateKey > todayStr,
      });
    }

    const monthName = new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const monthlyTurnoutRate = totalExpectedManDays > 0 ? Math.round((totalPresentManDays / totalExpectedManDays) * 100) : 0;
    const workingDaysCount = monthDays.filter((m) => !m.isSunday && !m.isFuture).length;

    return {
      monthName,
      monthDays,
      monthlyTurnoutRate,
      totalPresentManDays,
      totalAbsentManDays: Math.max(0, totalExpectedManDays - totalPresentManDays),
      workingDaysCount,
    };
  }, [selectedMonth, allAttendance, filteredEmployees.length, todayStr]);

  // -------------------------------------------------------------
  // 5. EMPLOYEE-WISE CUMULATIVE SCORECARD
  // -------------------------------------------------------------
  const employeeScorecard = useMemo(() => {
    // Determine the relevant date set based on viewMode
    let relevantDates = [];
    if (viewMode === "daily") {
      relevantDates = [selectedDate];
    } else if (viewMode === "weekly") {
      relevantDates = weekStats.weekDays.map((d) => d.date);
    } else {
      // Monthly or All
      relevantDates = monthStats.monthDays.filter((d) => !d.isFuture).map((d) => d.date);
    }

    const totalPeriodDays = Math.max(1, relevantDates.length);

    return filteredEmployees.map((emp) => {
      let daysPresent = 0;
      let totalMins = 0;
      let totalHoursLogged = 0;
      let checkInCount = 0;
      let onTimeCount = 0; // Check-in before 09:30 AM

      relevantDates.forEach((dStr) => {
        const record = allAttendance.find((r) => r.empId === emp.id && r.date === dStr && r.status === "PRESENT");
        if (record) {
          daysPresent++;
          if (record.time) {
            checkInCount++;
            const t24 = formatTime12to24(record.time);
            if (t24 && t24 <= "09:30") onTimeCount++;
          }
          if (record.workingHours) {
            const hMatch = String(record.workingHours).match(/(\d+)h/i);
            const mMatch = String(record.workingHours).match(/(\d+)m/i);
            const hrs = hMatch ? parseInt(hMatch[1], 10) : 0;
            const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
            totalHoursLogged += hrs + mins / 60;
          }
        }
      });

      const daysAbsent = Math.max(0, totalPeriodDays - daysPresent);
      const attRate = Math.round((daysPresent / totalPeriodDays) * 100);
      const punctualityRate = checkInCount > 0 ? Math.round((onTimeCount / checkInCount) * 100) : 0;

      let badge = "Excellent";
      let badgeClass = "badge-green";
      if (attRate < 70) {
        badge = "Needs Attention";
        badgeClass = "badge-red";
      } else if (attRate < 85) {
        badge = "Moderate";
        badgeClass = "badge-yellow";
      }

      return {
        ...emp,
        daysPresent,
        daysAbsent,
        attRate,
        punctualityRate,
        totalHoursStr: totalHoursLogged > 0 ? `${totalHoursLogged.toFixed(1)} hrs` : "—",
        badge,
        badgeClass,
      };
    }).sort((a, b) => b.attRate - a.attRate);
  }, [filteredEmployees, allAttendance, viewMode, selectedDate, weekStats, monthStats]);

  // -------------------------------------------------------------
  // EXPORT TO CSV HANDLER
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `GSR Broadband Attendance Analytics Report - Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Mode: ${viewMode.toUpperCase()}, Filter Department: ${deptFilter}\n\n`;

    if (viewMode === "daily") {
      csvContent += `Date: ${selectedDate}\n`;
      csvContent += `Total Employees,Present,Absent,Turnout Rate,Avg Check-in,Avg Hours\n`;
      csvContent += `${dayStats.total},${dayStats.present},${dayStats.absent},${dayStats.rate}%,${dayStats.avgTimeStr},${dayStats.avgHoursStr}\n\n`;
      csvContent += `Employee ID,Employee Name,Department,Role,Status,Check-In,Sign-Out,Working Hours,Accuracy\n`;
      dayStats.presentList.forEach(({ emp, record }) => {
        csvContent += `"${emp.id}","${emp.name}","${emp.department}","${emp.role}","PRESENT","${record?.time || ''}","${record?.signOutTime || ''}","${record?.workingHours || ''}","${record?.accuracy || '99%'}%"\n`;
      });
      dayStats.absentList.forEach(({ emp }) => {
        csvContent += `"${emp.id}","${emp.name}","${emp.department}","${emp.role}","ABSENT","—","—","—","—"\n`;
      });
    } else {
      csvContent += `Employee ID,Employee Name,Department,Role,Days Present,Days Absent,Attendance Rate,Punctuality Rate,Total Hours,Performance\n`;
      employeeScorecard.forEach((e) => {
        csvContent += `"${e.id}","${e.name}","${e.department}","${e.role}",${e.daysPresent},${e.daysAbsent},"${e.attRate}%","${e.punctualityRate}%","${e.totalHoursStr}","${e.badge}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSR_Attendance_Analytics_${viewMode}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-container">
      {/* HEADER WITH CONTROLS */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <div className="analytics-title-row">
            <div className="analytics-title-icon">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2>Employee Attendance Analytics &amp; Insights</h2>
              <p>Real-time present vs absent tracking, day-wise breakdown, weekly trends &amp; monthly attendance reports</p>
            </div>
          </div>
        </div>

        <div className="analytics-header-right">
          <button
            type="button"
            className="btn-analytics-action"
            onClick={onRefresh}
            title="Refresh database records"
          >
            <RefreshCw size={15} />
            <span>Sync DB</span>
          </button>

          <button
            type="button"
            className="btn-analytics-action btn-export-csv"
            onClick={handleExportCSV}
            title="Download CSV attendance sheet"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* TIMEFRAME VIEW MODE SELECTOR BUTTONS */}
      <div className="analytics-mode-bar">
        <div className="mode-pills-group">
          <button
            type="button"
            className={`mode-pill ${viewMode === "daily" ? "active" : ""}`}
            onClick={() => setViewMode("daily")}
          >
            <Calendar size={15} />
            <span>Day-wise Analysis</span>
          </button>

          <button
            type="button"
            className={`mode-pill ${viewMode === "weekly" ? "active" : ""}`}
            onClick={() => setViewMode("weekly")}
          >
            <CalendarDays size={15} />
            <span>Weekly Analysis</span>
          </button>

          <button
            type="button"
            className={`mode-pill ${viewMode === "monthly" ? "active" : ""}`}
            onClick={() => setViewMode("monthly")}
          >
            <BarChart3 size={15} />
            <span>Monthly Analysis</span>
          </button>

          <button
            type="button"
            className={`mode-pill ${viewMode === "employee" ? "active" : ""}`}
            onClick={() => setViewMode("employee")}
          >
            <Award size={15} />
            <span>Employee Scorecard</span>
          </button>
        </div>

        {/* TIME NAVIGATION SELECTORS */}
        <div className="mode-filter-controls">
          {viewMode === "daily" && (
            <div className="date-picker-control">
              <button
                type="button"
                className="btn-date-nav"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().slice(0, 10));
                }}
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>

              <input
                type="date"
                className="input-analytics-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <button
                type="button"
                className="btn-date-nav"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().slice(0, 10));
                }}
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>

              {selectedDate !== todayStr && (
                <button
                  type="button"
                  className="btn-today-chip"
                  onClick={() => setSelectedDate(todayStr)}
                >
                  Jump to Today
                </button>
              )}
            </div>
          )}

          {viewMode === "weekly" && (
            <div className="date-picker-control">
              <button
                type="button"
                className="btn-date-nav"
                onClick={() => setSelectedWeekOffset((prev) => prev - 1)}
                title="Previous Week"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="week-range-label">{weekStats.rangeStr}</span>

              <button
                type="button"
                className="btn-date-nav"
                onClick={() => setSelectedWeekOffset((prev) => prev + 1)}
                title="Next Week"
              >
                <ChevronRight size={16} />
              </button>

              {selectedWeekOffset !== 0 && (
                <button
                  type="button"
                  className="btn-today-chip"
                  onClick={() => setSelectedWeekOffset(0)}
                >
                  This Week
                </button>
              )}
            </div>
          )}

          {viewMode === "monthly" && (
            <div className="date-picker-control">
              <input
                type="month"
                className="input-analytics-date"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          )}

          {/* Department Filter */}
          <div className="dept-select-wrap">
            <Filter size={14} />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="select-analytics-dept"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "ALL" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW CARDS */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card total-card">
          <div className="kpi-icon-wrap blue">
            <Users size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Staff Monitored</span>
            <h3 className="kpi-value">{filteredEmployees.length}</h3>
            <span className="kpi-detail">Active Registered Employees</span>
          </div>
        </div>

        <div className="analytics-kpi-card present-card">
          <div className="kpi-icon-wrap green">
            <UserCheck size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">
              {viewMode === "daily" ? "Present on Selected Day" : viewMode === "weekly" ? "Weekly Present Shifts" : "Monthly Present Shifts"}
            </span>
            <h3 className="kpi-value text-green">
              {viewMode === "daily" ? dayStats.present : viewMode === "weekly" ? weekStats.totalPresent : monthStats.totalPresentManDays}
            </h3>
            <span className="kpi-detail text-green">
              {viewMode === "daily"
                ? `${dayStats.rate}% Turnout on ${selectedDate}`
                : viewMode === "weekly"
                ? `${weekStats.weeklyAvgRate}% Avg Weekly Turnout`
                : `${monthStats.monthlyTurnoutRate}% Turnout in ${monthStats.monthName}`}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card absent-card">
          <div className="kpi-icon-wrap red">
            <UserX size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">
              {viewMode === "daily" ? "Absent on Selected Day" : viewMode === "weekly" ? "Weekly Absent Shifts" : "Monthly Absent Shifts"}
            </span>
            <h3 className="kpi-value text-red">
              {viewMode === "daily"
                ? dayStats.absent
                : viewMode === "weekly"
                ? Math.max(0, weekStats.totalExpected - weekStats.totalPresent)
                : monthStats.totalAbsentManDays}
            </h3>
            <span className="kpi-detail text-red">
              {viewMode === "daily" ? `${dayStats.total - dayStats.present} Staff Not Logged In` : "Total unrecorded shifts"}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card rate-card">
          <div className="kpi-icon-wrap purple">
            <Percent size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Attendance Health</span>
            <h3 className="kpi-value text-purple">
              {viewMode === "daily"
                ? `${dayStats.rate}%`
                : viewMode === "weekly"
                ? `${weekStats.weeklyAvgRate}%`
                : `${monthStats.monthlyTurnoutRate}%`}
            </h3>
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{
                  width: `${viewMode === "daily" ? dayStats.rate : viewMode === "weekly" ? weekStats.weeklyAvgRate : monthStats.monthlyTurnoutRate}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="analytics-kpi-card time-card">
          <div className="kpi-icon-wrap cyan">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">{viewMode === "daily" ? "Avg Check-In Time" : "Working Day Length"}</span>
            <h3 className="kpi-value text-cyan">
              {viewMode === "daily" ? dayStats.avgTimeStr : "8.5 hrs"}
            </h3>
            <span className="kpi-detail">
              {viewMode === "daily" ? `Avg Hours: ${dayStats.avgHoursStr}` : "Standard Shift: 9 AM - 6 PM"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW MODE 1: DAY-WISE ANALYSIS                            */}
      {/* ========================================================= */}
      {viewMode === "daily" && (
        <div className="analytics-view-panel">
          {/* 7-DAY TREND VISUALIZATION */}
          <div className="analytics-chart-box">
            <div className="chart-box-header">
              <div>
                <h4>7-Day Attendance Trend (Leading to {selectedDate})</h4>
                <p>Click any day bar to inspect its detailed present and absent rosters</p>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-dot green" /> Present</span>
                <span className="legend-item"><span className="legend-dot red" /> Absent</span>
              </div>
            </div>

            <div className="trend-bars-container">
              {trailingTrend.map((t) => (
                <div
                  key={t.date}
                  className={`trend-bar-col ${t.isCurrent ? "current-active" : ""}`}
                  onClick={() => setSelectedDate(t.date)}
                  title={`${t.date}: ${t.present} Present, ${t.absent} Absent (${t.rate}%)`}
                >
                  <span className="bar-top-rate">{t.rate}%</span>
                  <div className="stacked-bar">
                    <div
                      className="bar-segment present"
                      style={{ height: `${Math.max(8, t.rate)}%` }}
                    />
                    <div
                      className="bar-segment absent"
                      style={{ height: `${Math.max(0, 100 - t.rate)}%` }}
                    />
                  </div>
                  <span className="bar-label">{t.label}</span>
                  <span className="bar-counts">{t.present}P / {t.absent}A</span>
                </div>
              ))}
            </div>
          </div>

          {/* DAY'S PRESENT VS ABSENT BREAKDOWN */}
          <div className="day-roster-section">
            <div className="roster-toolbar">
              <div className="roster-tabs">
                <button
                  type="button"
                  className={`roster-tab ${presentAbsentTab === "ALL" ? "active" : ""}`}
                  onClick={() => setPresentAbsentTab("ALL")}
                >
                  All Staff ({filteredEmployees.length})
                </button>
                <button
                  type="button"
                  className={`roster-tab green ${presentAbsentTab === "PRESENT" ? "active" : ""}`}
                  onClick={() => setPresentAbsentTab("PRESENT")}
                >
                  <CheckCircle2 size={14} /> Present ({dayStats.present})
                </button>
                <button
                  type="button"
                  className={`roster-tab red ${presentAbsentTab === "ABSENT" ? "active" : ""}`}
                  onClick={() => setPresentAbsentTab("ABSENT")}
                >
                  <XCircle size={14} /> Absent ({dayStats.absent})
                </button>
              </div>

              <div className="roster-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Filter by name, ID or role..."
                  value={searchEmp}
                  onChange={(e) => setSearchEmp(e.target.value)}
                />
              </div>
            </div>

            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>EMP ID</th>
                    <th>DEPARTMENT / ROLE</th>
                    <th>STATUS</th>
                    <th>CHECK-IN TIME</th>
                    <th>SIGN-OUT TIME</th>
                    <th>WORKING HOURS</th>
                    <th>BIOMETRIC VERIFIED</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(presentAbsentTab === "ALL" || presentAbsentTab === "PRESENT") &&
                    dayStats.presentList.map(({ emp, record }) => (
                      <tr key={`pres-${emp.id}`} className="row-present">
                        <td>
                          <div className="emp-avatar-cell">
                            {emp.facePhoto ? (
                              <img src={emp.facePhoto} alt={emp.name} className="avatar-img" />
                            ) : (
                              <div className="avatar-fallback">{emp.name?.charAt(0)}</div>
                            )}
                            <div>
                              <strong>{emp.name}</strong>
                              <span className="emp-phone-sub">{emp.phone || "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="emp-id-badge">{emp.id}</span></td>
                        <td>
                          <div>
                            <strong>{emp.department || "General"}</strong>
                            <span className="emp-role-sub">{emp.role || "Staff"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge-pill present">
                            <CheckCircle2 size={13} /> PRESENT
                          </span>
                        </td>
                        <td><strong className="text-dark">{record?.time || "—"}</strong></td>
                        <td>{record?.signOutTime || "Active on Duty"}</td>
                        <td><strong className="text-green">{record?.workingHours || "In Progress"}</strong></td>
                        <td>
                          <span className="accuracy-pill">
                            {record?.accuracy ? `${record.accuracy}% Match` : "99.0% Match"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onAdjustTime && onAdjustTime(emp, record)}
                            title="Edit or adjust hours"
                          >
                            Adjust Time
                          </button>
                        </td>
                      </tr>
                    ))}

                  {(presentAbsentTab === "ALL" || presentAbsentTab === "ABSENT") &&
                    dayStats.absentList.map(({ emp, record }) => (
                      <tr key={`abs-${emp.id}`} className="row-absent">
                        <td>
                          <div className="emp-avatar-cell">
                            {emp.facePhoto ? (
                              <img src={emp.facePhoto} alt={emp.name} className="avatar-img desaturated" />
                            ) : (
                              <div className="avatar-fallback absent">{emp.name?.charAt(0)}</div>
                            )}
                            <div>
                              <strong>{emp.name}</strong>
                              <span className="emp-phone-sub">{emp.phone || "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="emp-id-badge">{emp.id}</span></td>
                        <td>
                          <div>
                            <strong>{emp.department || "General"}</strong>
                            <span className="emp-role-sub">{emp.role || "Staff"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge-pill absent">
                            <XCircle size={13} /> ABSENT
                          </span>
                        </td>
                        <td><span className="text-muted">—</span></td>
                        <td><span className="text-muted">—</span></td>
                        <td><span className="text-muted">—</span></td>
                        <td><span className="text-muted">Not Clocked</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn-table-action btn-mark-present"
                            onClick={() => onAdjustTime && onAdjustTime(emp, null)}
                            title="Manually mark present / adjust time"
                          >
                            Mark Present
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: WEEKLY ANALYSIS                              */}
      {/* ========================================================= */}
      {viewMode === "weekly" && (
        <div className="analytics-view-panel">
          <div className="weekly-summary-cards">
            <div className="week-info-card">
              <h4>Week Attendance Overview ({weekStats.rangeStr})</h4>
              <p>Monitored across {filteredEmployees.length} employees for Monday through Saturday operations.</p>
              <div className="week-mini-stats">
                <div>
                  <span>Weekly Average</span>
                  <strong>{weekStats.weeklyAvgRate}%</strong>
                </div>
                <div>
                  <span>Peak Turnout</span>
                  <strong className="text-green">{weekStats.peakDay.fullDay} ({weekStats.peakDay.rate}%)</strong>
                </div>
                <div>
                  <span>Lowest Turnout</span>
                  <strong className="text-red">{weekStats.lowestDay.fullDay} ({weekStats.lowestDay.rate}%)</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="weekly-days-table-card">
            <h4>Day-by-Day Weekly Breakdown</h4>
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>DAY &amp; DATE</th>
                    <th>SCHEDULE</th>
                    <th>PRESENT EMPLOYEES</th>
                    <th>ABSENT EMPLOYEES</th>
                    <th>TURNOUT RATE (%)</th>
                    <th>VISUAL PROGRESS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {weekStats.weekDays.map((w) => (
                    <tr key={w.date} className={w.isToday ? "row-today-highlight" : ""}>
                      <td>
                        <strong>{w.fullDay}</strong>
                        <span className="date-sub-text">{w.date} {w.isToday ? "(Today)" : ""}</span>
                      </td>
                      <td>
                        {w.isSunday ? (
                          <span className="schedule-badge off">Sunday (Off)</span>
                        ) : (
                          <span className="schedule-badge work">09:00 AM – 06:00 PM</span>
                        )}
                      </td>
                      <td>
                        <strong className="text-green">{w.present} Staff</strong>
                      </td>
                      <td>
                        <strong className="text-red">{w.absent} Staff</strong>
                      </td>
                      <td>
                        <strong className="text-dark">{w.rate}%</strong>
                      </td>
                      <td>
                        <div className="table-progress-bar">
                          <div
                            className={`table-progress-fill ${w.rate >= 85 ? "green" : w.rate >= 60 ? "yellow" : "red"}`}
                            style={{ width: `${w.rate}%` }}
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => {
                            setSelectedDate(w.date);
                            setViewMode("daily");
                          }}
                        >
                          View Roster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 3: MONTHLY ANALYSIS                             */}
      {/* ========================================================= */}
      {viewMode === "monthly" && (
        <div className="analytics-view-panel">
          <div className="monthly-overview-bar">
            <div>
              <h3>Monthly Report: {monthStats.monthName}</h3>
              <p>Total Working Days: {monthStats.workingDaysCount} | Total Shifts Served: {monthStats.totalPresentManDays}</p>
            </div>
            <div className="monthly-kpi-badge">
              <span>Overall Monthly Turnout</span>
              <strong>{monthStats.monthlyTurnoutRate}%</strong>
            </div>
          </div>

          <div className="month-calendar-grid">
            {monthStats.monthDays.map((m) => {
              let cellClass = "month-day-cell";
              if (m.isFuture) cellClass += " future";
              else if (m.isSunday) cellClass += " sunday";
              else if (m.rate >= 85) cellClass += " health-high";
              else if (m.rate >= 60) cellClass += " health-med";
              else cellClass += " health-low";

              return (
                <div
                  key={m.date}
                  className={cellClass}
                  onClick={() => {
                    if (!m.isFuture) {
                      setSelectedDate(m.date);
                      setViewMode("daily");
                    }
                  }}
                  title={m.isFuture ? "Future date" : `${m.date}: ${m.present} Present, ${m.absent} Absent (${m.rate}%)`}
                >
                  <div className="month-cell-top">
                    <span className="cell-day-num">{m.day}</span>
                    {m.isSunday ? (
                      <span className="cell-tag sunday">Sun</span>
                    ) : (
                      !m.isFuture && <span className="cell-rate-pill">{m.rate}%</span>
                    )}
                  </div>
                  {!m.isFuture && !m.isSunday && (
                    <div className="month-cell-bottom">
                      <span className="count-p">{m.present}P</span>
                      <span className="count-a">{m.absent}A</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 4: EMPLOYEE SCORECARD                           */}
      {/* ========================================================= */}
      {viewMode === "employee" && (
        <div className="analytics-view-panel">
          <div className="scorecard-toolbar">
            <div className="roster-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search employee by name, ID or department..."
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
              />
            </div>
            <span className="scorecard-count-label">
              Showing {employeeScorecard.length} Employees Ranked by Turnout Rate
            </span>
          </div>

          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>RANK &amp; EMPLOYEE</th>
                  <th>EMP ID</th>
                  <th>DEPARTMENT</th>
                  <th>DAYS PRESENT</th>
                  <th>DAYS ABSENT</th>
                  <th>ATTENDANCE RATE</th>
                  <th>PUNCTUALITY</th>
                  <th>LOGGED HOURS</th>
                  <th>PERFORMANCE RATING</th>
                </tr>
              </thead>
              <tbody>
                {employeeScorecard.map((emp, idx) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-avatar-cell">
                        <span className="rank-num">#{idx + 1}</span>
                        {emp.facePhoto ? (
                          <img src={emp.facePhoto} alt={emp.name} className="avatar-img" />
                        ) : (
                          <div className="avatar-fallback">{emp.name?.charAt(0)}</div>
                        )}
                        <div>
                          <strong>{emp.name}</strong>
                          <span className="emp-role-sub">{emp.role || "Staff"}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="emp-id-badge">{emp.id}</span></td>
                    <td><strong>{emp.department || "General"}</strong></td>
                    <td><strong className="text-green">{emp.daysPresent} Days</strong></td>
                    <td><strong className="text-red">{emp.daysAbsent} Days</strong></td>
                    <td>
                      <div className="rate-cell-flex">
                        <strong>{emp.attRate}%</strong>
                        <div className="table-progress-bar mini">
                          <div
                            className={`table-progress-fill ${emp.attRate >= 85 ? "green" : emp.attRate >= 70 ? "yellow" : "red"}`}
                            style={{ width: `${emp.attRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td><strong>{emp.punctualityRate}%</strong> on-time</td>
                    <td><strong>{emp.totalHoursStr}</strong></td>
                    <td>
                      <span className={`performance-badge ${emp.badgeClass}`}>
                        {emp.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
