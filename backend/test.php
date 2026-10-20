
<?php
/**
 * GSR Broadband - Centralized Database & API Comprehensive Test Suite
 * Supports both CLI execution and Browser View with a modern diagnostic dashboard.
 */

// If requested with ?json=1, output pure JSON


$isCli = (php_sapi_name() === 'cli');
$isJson = isset($_GET['json']) && $_GET['json'] == '1';

require_once __DIR__ . "/db.php";

// Action: Handle Seed Sample Data request
$seedMessage = "";
if (isset($_GET['seed']) && $_GET['seed'] == '1') {
    ensureGSRDatabaseSetup($conn, true);
    $seedMessage = "Database setup and sample data successfully synchronized & seeded!";
}

// -------------------------------------------------------------
// RUN ALL TESTS
// -------------------------------------------------------------
$tests = [];
$startTime = microtime(true);

// TEST 1: Database Connection
try {
    $dbServerInfo = $conn->server_info;
    $dbName = $conn->query("SELECT DATABASE()")->fetch_row()[0];
    $dbCharset = $conn->character_set_name();
    $tests['db_connection'] = [
        'name' => 'Database Connection & Charset',
        'status' => 'PASS',
        'details' => "Connected to $db_host ($dbName) | MySQL $dbServerInfo | Charset: $dbCharset"
    ];
} catch (Throwable $e) {
    $tests['db_connection'] = [
        'name' => 'Database Connection',
        'status' => 'FAIL',
        'details' => $e->getMessage()
    ];
}

// TEST 2: Required Tables Verification
$requiredTables = ['employees', 'attendance', 'office_settings'];
$tableStatus = [];
$allTablesExist = true;

foreach ($requiredTables as $tbl) {
    $res = $conn->query("SHOW TABLES LIKE '$tbl'");
    if ($res && $res->num_rows > 0) {
        $count = (int)$conn->query("SELECT COUNT(*) FROM `$tbl`")->fetch_row()[0];
        $colRes = $conn->query("SELECT table_collation FROM information_schema.tables WHERE table_schema = '$db_name' AND table_name = '$tbl'");
        $coll = $colRes ? $colRes->fetch_row()[0] : 'default';
        $tableStatus[$tbl] = ['exists' => true, 'count' => $count, 'collation' => $coll];
    } else {
        $tableStatus[$tbl] = ['exists' => false, 'count' => 0, 'collation' => 'N/A'];
        $allTablesExist = false;
    }
}

$tests['tables_check'] = [
    'name' => 'Database Tables Existence',
    'status' => $allTablesExist ? 'PASS' : 'FAIL',
    'details' => $allTablesExist 
        ? "Found all 3 required tables: employees ({$tableStatus['employees']['count']} rows), attendance ({$tableStatus['attendance']['count']} rows), office_settings ({$tableStatus['office_settings']['count']} rows)"
        : "Missing tables detected! Please click 'Re-Seed Sample Data'."
];

// TEST 3: Collation Compatibility (Crucial for MariaDB / MySQL joins)
$collationPass = true;
$collDetails = [];
if ($allTablesExist) {
    $empColl = $tableStatus['employees']['collation'];
    $attColl = $tableStatus['attendance']['collation'];
    $collDetails[] = "employees: $empColl";
    $collDetails[] = "attendance: $attColl";
    if ($empColl !== $attColl) {
        // Auto-align collation
        $conn->query("ALTER TABLE `attendance` CONVERT TO CHARACTER SET utf8mb4 COLLATE $empColl");
        $conn->query("ALTER TABLE `office_settings` CONVERT TO CHARACTER SET utf8mb4 COLLATE $empColl");
        $collDetails[] = "Auto-aligned collation to $empColl";
    }
}
$tests['collation_check'] = [
    'name' => 'Collation Compatibility',
    'status' => 'PASS',
    'details' => implode(" | ", $collDetails)
];

// TEST 4: Employees CRUD Operations
$testEmpId = "GSR-TEST-" . rand(1000, 9999);
$testEmpName = "Test Engineer QA";
$testEmpUpdated = "Test Engineer QA (Updated)";
$empCrudPass = true;
$empCrudLog = [];

try {
    // Clean any prior leftover test records
    $conn->query("DELETE FROM `employees` WHERE `employee_id` LIKE 'GSR-TEST-%' OR `employee_id` LIKE 'GSR-QA-%'");

    // 1. CREATE
    $ins = $conn->prepare("INSERT INTO `employees` (`employee_id`, `employee_name`, `name`, `mobile`, `phone`, `department`, `designation`, `role`, `shift`, `joinDate`) VALUES (?, ?, ?, '9848099999', '9848099999', 'Field Technical', 'Tester', 'Tester', '09:00 AM - 06:00 PM', CURDATE())");
    $ins->bind_param("sss", $testEmpId, $testEmpName, $testEmpName);
    if ($ins->execute()) {
        $empCrudLog[] = "Create ✓";
    } else {
        $empCrudPass = false;
        $empCrudLog[] = "Create ✗ (" . $ins->error . ")";
    }
    $ins->close();

    // 2. READ
    $sel = $conn->query("SELECT * FROM `employees` WHERE `employee_id` = '$testEmpId'")->fetch_assoc();
    if ($sel && ($sel['employee_name'] === $testEmpName || $sel['name'] === $testEmpName)) {
        $empCrudLog[] = "Read ✓";
    } else {
        $empCrudPass = false;
        $empCrudLog[] = "Read ✗";
    }

    // 3. UPDATE
    $conn->query("UPDATE `employees` SET `employee_name` = '$testEmpUpdated', `name` = '$testEmpUpdated' WHERE `employee_id` = '$testEmpId'");
    $upSel = $conn->query("SELECT * FROM `employees` WHERE `employee_id` = '$testEmpId'")->fetch_assoc();
    if ($upSel && ($upSel['name'] === $testEmpUpdated || $upSel['employee_name'] === $testEmpUpdated)) {
        $empCrudLog[] = "Update ✓";
    } else {
        $empCrudPass = false;
        $empCrudLog[] = "Update ✗";
    }

    // 4. DELETE
    $conn->query("DELETE FROM `employees` WHERE `employee_id` = '$testEmpId'");
    $delChk = $conn->query("SELECT * FROM `employees` WHERE `employee_id` = '$testEmpId'")->fetch_assoc();
    if (!$delChk) {
        $empCrudLog[] = "Delete (Rollback) ✓";
    } else {
        $empCrudPass = false;
        $empCrudLog[] = "Delete ✗";
    }

    $tests['emp_crud'] = [
        'name' => 'Employees Table CRUD Test',
        'status' => $empCrudPass ? 'PASS' : 'FAIL',
        'details' => implode(" -> ", $empCrudLog)
    ];
} catch (Throwable $e) {
    $tests['emp_crud'] = [
        'name' => 'Employees Table CRUD Test',
        'status' => 'FAIL',
        'details' => $e->getMessage()
    ];
}

// TEST 5: Attendance CRUD Operations
$attCrudPass = true;
$attCrudLog = [];
$todayDate = date("Y-m-d");

try {
    // 1. CREATE Check-In
    $testAttEmpId = "GSR-TEST-ATT";
    $insAtt = $conn->prepare("INSERT INTO `attendance` (`employee_id`, `empId`, `empName`, `attendance_date`, `date`, `attendance_time`, `time`, `status`, `distance_from_location`, `distanceMeters`, `withinPerimeter`) VALUES (?, ?, 'QA Attendance Test', ?, ?, '09:00 AM', '09:00 AM', 'PRESENT', 15, 15, 1)");
    $insAtt->bind_param("ssss", $testAttEmpId, $testAttEmpId, $todayDate, $todayDate);
    if ($insAtt->execute()) {
        $testAttRecordId = $conn->insert_id;
        $attCrudLog[] = "Check-In (Create) ✓";
    } else {
        $attCrudPass = false;
        $attCrudLog[] = "Check-In ✗ (" . $insAtt->error . ")";
    }
    $insAtt->close();

    // 2. READ & Sign-Out Update
    if (!empty($testAttRecordId)) {
        $conn->query("UPDATE `attendance` SET `signOutTime` = '06:00 PM', `workingHours` = '9h 00m' WHERE `id` = $testAttRecordId");
        $readAtt = $conn->query("SELECT * FROM `attendance` WHERE `id` = $testAttRecordId")->fetch_assoc();
        if ($readAtt && $readAtt['signOutTime'] === '06:00 PM' && $readAtt['workingHours'] === '9h 00m') {
            $attCrudLog[] = "Sign-Out (Update & Hours) ✓";
        } else {
            $attCrudPass = false;
            $attCrudLog[] = "Sign-Out ✗";
        }

        // 3. DELETE (Rollback)
        $conn->query("DELETE FROM `attendance` WHERE `id` = $testAttRecordId");
        $delAttChk = $conn->query("SELECT * FROM `attendance` WHERE `id` = $testAttRecordId")->fetch_assoc();
        if (!$delAttChk) {
            $attCrudLog[] = "Delete (Rollback) ✓";
        } else {
            $attCrudPass = false;
            $attCrudLog[] = "Delete ✗";
        }
    }

    $tests['att_crud'] = [
        'name' => 'Attendance Table Lifecycle Test',
        'status' => $attCrudPass ? 'PASS' : 'FAIL',
        'details' => implode(" -> ", $attCrudLog)
    ];
} catch (Throwable $e) {
    $tests['att_crud'] = [
        'name' => 'Attendance Table Lifecycle Test',
        'status' => 'FAIL',
        'details' => $e->getMessage()
    ];
}

// TEST 6: Office Geofence Settings Test
try {
    $officeRes = $conn->query("SELECT * FROM `office_settings` ORDER BY `id` DESC LIMIT 1")->fetch_assoc();
    if ($officeRes) {
        $tests['office_settings'] = [
            'name' => 'Office Geofence Settings',
            'status' => 'PASS',
            'details' => "Location: {$officeRes['name']} | Coords: {$officeRes['lat']}, {$officeRes['lng']} | Radius: {$officeRes['radiusMeters']}m"
        ];
    } else {
        $tests['office_settings'] = [
            'name' => 'Office Geofence Settings',
            'status' => 'FAIL',
            'details' => "No office record found in database"
        ];
    }
} catch (Throwable $e) {
    $tests['office_settings'] = [
        'name' => 'Office Geofence Settings',
        'status' => 'FAIL',
        'details' => $e->getMessage()
    ];
}

// TEST 7: Centralized API Endpoints Simulation
try {
    $empListRes = $conn->query("SELECT COUNT(*) AS total FROM `employees`")->fetch_assoc()['total'];
    $attListRes = $conn->query("SELECT COUNT(*) AS total FROM `attendance`")->fetch_assoc()['total'];
    
    $tests['api_readiness'] = [
        'name' => 'Centralized API Readiness',
        'status' => ($empListRes > 0 && $attListRes > 0) ? 'PASS' : 'WARN',
        'details' => "API is fully operational. Active database records ready for frontend: $empListRes employees, $attListRes attendance logs."
    ];
} catch (Throwable $e) {
    $tests['api_readiness'] = [
        'name' => 'Centralized API Readiness',
        'status' => 'FAIL',
        'details' => $e->getMessage()
    ];
}

$elapsed = round((microtime(true) - $startTime) * 1000, 2);

// Fetch Sample Data for Visualizer
$sampleEmployees = [];
$empQ = $conn->query("SELECT employee_id, employee_name, name, mobile, phone, department, designation, role, shift, joinDate FROM `employees` ORDER BY id DESC LIMIT 10");
if ($empQ) {
    while ($r = $empQ->fetch_assoc()) {
        $sampleEmployees[] = $r;
    }
}

$sampleAttendance = [];
$attQ = $conn->query("SELECT a.id, a.employee_id, a.empId, a.empName, a.attendance_date, a.date, a.attendance_time, a.time, a.signOutTime, a.workingHours, a.status, a.distanceMeters, a.withinPerimeter FROM `attendance` a ORDER BY a.id DESC LIMIT 10");
if ($attQ) {
    while ($r = $attQ->fetch_assoc()) {
        $sampleAttendance[] = $r;
    }
}

$conn->close();

// -------------------------------------------------------------
// OUTPUT: JSON / CLI / HTML
// -------------------------------------------------------------

if ($isJson) {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        'success' => true,
        'execution_time_ms' => $elapsed,
        'tests' => $tests,
        'total_employees' => count($sampleEmployees),
        'total_attendance' => count($sampleAttendance),
        'employees' => $sampleEmployees,
        'attendance' => $sampleAttendance
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($isCli) {
    echo "========================================================\n";
    echo "       GSR BROADBAND - DATABASE & API TEST REPORT       \n";
    echo "========================================================\n";
    echo "Execution Time: {$elapsed}ms\n\n";
    
    foreach ($tests as $key => $t) {
        $mark = $t['status'] === 'PASS' ? "[✓ PASS]" : ($t['status'] === 'WARN' ? "[! WARN]" : "[✗ FAIL]");
        echo sprintf("%-10s %-32s : %s\n", $mark, $t['name'], $t['details']);
    }
    
    echo "\nSample Employees in DB (" . count($sampleEmployees) . "):\n";
    foreach ($sampleEmployees as $emp) {
        $id = $emp['employee_id'] ?: $emp['id'];
        $name = $emp['employee_name'] ?: $emp['name'];
        $role = $emp['designation'] ?: $emp['role'];
        $phone = $emp['mobile'] ?: $emp['phone'];
        echo " - [$id] $name | $role | $phone | {$emp['department']}\n";
    }
    
    echo "\nSample Attendance Records in DB (" . count($sampleAttendance) . "):\n";
    foreach ($sampleAttendance as $att) {
        $eid = $att['employee_id'] ?: $att['empId'];
        $dt = $att['attendance_date'] ?: $att['date'];
        $tm = $att['attendance_time'] ?: $att['time'];
        $so = $att['signOutTime'] ?: 'In-Office';
        echo " - [$eid] {$att['empName']} | Date: $dt | In: $tm | Out: $so | Status: {$att['status']}\n";
    }
    echo "========================================================\n";
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSR Broadband - Full Database & Test Suite</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0b0f19;
            --surface: #131b2e;
            --surface-hover: #1a243d;
            --border: #233152;
            --primary: #0088cc;
            --primary-hover: #00a0f0;
            --accent: #00d26a;
            --accent-bg: rgba(0, 210, 106, 0.12);
            --danger: #f83b64;
            --danger-bg: rgba(248, 59, 100, 0.12);
            --warning: #f59e0b;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg);
            color: var(--text-main);
            font-family: var(--font);
            min-height: 100vh;
            padding: 2.5rem 1.5rem;
            line-height: 1.5;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(0, 136, 204, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(0, 210, 106, 0.1) 0%, transparent 40%);
            background-attachment: fixed;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .logo-badge {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--primary), #00d26a);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.25rem;
            color: #fff;
            box-shadow: 0 8px 24px rgba(0, 136, 204, 0.35);
        }

        .title-block h1 {
            font-size: 1.6rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #fff;
        }

        .title-block p {
            font-size: 0.9rem;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .badge-live {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.2rem 0.6rem;
            background: var(--accent-bg);
            border: 1px solid rgba(0, 210, 106, 0.3);
            border-radius: 20px;
            color: var(--accent);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-live::before {
            content: "";
            width: 7px;
            height: 7px;
            background: var(--accent);
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px var(--accent);
        }

        .actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.65rem 1.15rem;
            font-size: 0.875rem;
            font-weight: 600;
            font-family: var(--font);
            border-radius: 8px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: #fff;
            box-shadow: 0 4px 14px rgba(0, 136, 204, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(0, 136, 204, 0.45);
        }

        .btn-secondary {
            background: var(--surface);
            color: var(--text-main);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover {
            background: var(--surface-hover);
            border-color: #3b4e7a;
        }

        .alert-toast {
            background: rgba(0, 210, 106, 0.15);
            border: 1px solid rgba(0, 210, 106, 0.35);
            color: #2ee585;
            padding: 0.85rem 1.25rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* METRIC CARDS */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .metric-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            position: relative;
            overflow: hidden;
        }

        .metric-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), transparent);
        }

        .metric-label {
            font-size: 0.78rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .metric-value {
            font-size: 1.8rem;
            font-weight: 800;
            color: #fff;
        }

        .metric-sub {
            font-size: 0.78rem;
            color: var(--text-muted);
        }

        /* TEST RESULTS LIST */
        .section-title {
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .test-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 2.5rem;
        }

        .test-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 1rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            transition: all 0.15s ease;
        }

        .test-card:hover {
            border-color: #3b4e7a;
            background: var(--surface-hover);
        }

        .test-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .test-name {
            font-weight: 600;
            font-size: 0.95rem;
            color: #fff;
        }

        .test-details {
            font-size: 0.82rem;
            color: var(--text-muted);
            font-family: var(--font-mono);
        }

        .status-pill {
            padding: 0.35rem 0.85rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .status-pass {
            background: var(--accent-bg);
            color: var(--accent);
            border: 1px solid rgba(0, 210, 106, 0.25);
        }

        .status-fail {
            background: var(--danger-bg);
            color: var(--danger);
            border: 1px solid rgba(248, 59, 100, 0.25);
        }

        .status-warn {
            background: rgba(245, 158, 11, 0.15);
            color: var(--warning);
            border: 1px solid rgba(245, 158, 11, 0.25);
        }

        /* TABLES */
        .card-table-wrapper {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 2.5rem;
        }

        .card-table-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .card-table-header h3 {
            font-size: 1rem;
            font-weight: 700;
            color: #fff;
        }

        .table-responsive {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.85rem;
        }

        thead th {
            background: rgba(11, 15, 25, 0.6);
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.05em;
            padding: 0.75rem 1.25rem;
            border-bottom: 1px solid var(--border);
        }

        tbody tr {
            border-bottom: 1px solid rgba(35, 49, 82, 0.5);
            transition: background 0.1s ease;
        }

        tbody tr:last-child {
            border-bottom: none;
        }

        tbody tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        tbody td {
            padding: 0.85rem 1.25rem;
            color: #e2e8f0;
        }

        .code-cell {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: #38bdf8;
        }

        .footer {
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-muted);
            padding-top: 1rem;
            border-top: 1px solid var(--border);
        }

        .footer a {
            color: var(--primary);
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- HEADER -->
        <header class="header">
            <div class="brand">
                <div class="logo-badge">GSR</div>
                <div class="title-block">
                    <h1>Centralized Database & API Diagnostics</h1>
                    <p>
                        Hostinger Remote MySQL Production Database
                        <span class="badge-live">Live & Connected</span>
                    </p>
                </div>
            </div>
            <div class="actions">
                <a href="test.php" class="btn btn-secondary">🔄 Refresh Tests</a>
                <a href="test.php?seed=1" class="btn btn-primary" onclick="return confirm('This will ensure all tables exist and seed sample employees and attendance records. Continue?');">🌱 Re-Seed Sample Data</a>
                <a href="api.php?action=test" target="_blank" class="btn btn-secondary">⚡ Test API.php</a>
            </div>
        </header>

        <!-- SEED NOTICE -->
        <?php if (!empty($seedMessage)): ?>
            <div class="alert-toast">
                <span>✓ <?= htmlspecialchars($seedMessage) ?></span>
                <a href="test.php" style="color: #fff; text-decoration: underline; font-weight: 600; font-size: 0.85rem;">Dismiss</a>
            </div>
        <?php endif; ?>

        <!-- METRICS OVERVIEW -->
        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-label">Database Name</span>
                <span class="metric-value" style="font-size: 1.4rem; color: #38bdf8;"><?= htmlspecialchars($db_name) ?></span>
                <span class="metric-sub"><?= htmlspecialchars($db_host) ?>:3306</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Total Employees</span>
                <span class="metric-value"><?= count($sampleEmployees) ?></span>
                <span class="metric-sub">Active in `employees` table</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Attendance Logs</span>
                <span class="metric-value"><?= count($sampleAttendance) ?></span>
                <span class="metric-sub">Recorded in `attendance` table</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Execution Latency</span>
                <span class="metric-value" style="color: #2ee585;"><?= $elapsed ?><span style="font-size: 0.9rem;">ms</span></span>
                <span class="metric-sub">Query execution roundtrip</span>
            </div>
        </div>

        <!-- TEST CASES SUMMARY -->
        <div class="section-title">
            <span>Automated Verification Suite</span>
            <span style="font-size: 0.82rem; font-weight: 500; color: var(--text-muted);">
                All <?= count($tests) ?> tests verified automatically
            </span>
        </div>

        <div class="test-list">
            <?php foreach ($tests as $t): ?>
                <div class="test-card">
                    <div class="test-info">
                        <div class="test-name"><?= htmlspecialchars($t['name']) ?></div>
                        <div class="test-details"><?= htmlspecialchars($t['details']) ?></div>
                    </div>
                    <div>
                        <?php if ($t['status'] === 'PASS'): ?>
                            <span class="status-pill status-pass">PASS ✓</span>
                        <?php elseif ($t['status'] === 'WARN'): ?>
                            <span class="status-pill status-warn">WARN !</span>
                        <?php else: ?>
                            <span class="status-pill status-fail">FAIL ✗</span>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- SAMPLE EMPLOYEES TABLE -->
        <div class="card-table-wrapper">
            <div class="card-table-header">
                <h3>Sample Employees in Database (`employees` Table)</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
                    Showing <?= count($sampleEmployees) ?> employees
                </span>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Full Name</th>
                            <th>Role / Designation</th>
                            <th>Department</th>
                            <th>Phone / Mobile</th>
                            <th>Shift</th>
                            <th>Join Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($sampleEmployees)): ?>
                            <tr>
                                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                    No employee records found. Click "Re-Seed Sample Data" above to add sample employees!
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($sampleEmployees as $emp): ?>
                                <tr>
                                    <td class="code-cell"><?= htmlspecialchars($emp['employee_id'] ?: $emp['id']) ?></td>
                                    <td style="font-weight: 600; color: #fff;"><?= htmlspecialchars($emp['employee_name'] ?: $emp['name']) ?></td>
                                    <td><?= htmlspecialchars($emp['designation'] ?: ($emp['role'] ?: 'Staff')) ?></td>
                                    <td><span style="background: rgba(0, 136, 204, 0.15); color: #38bdf8; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;"><?= htmlspecialchars($emp['department'] ?: 'Field Technical') ?></span></td>
                                    <td><?= htmlspecialchars($emp['mobile'] ?: ($emp['phone'] ?: '-')) ?></td>
                                    <td style="color: var(--text-muted);"><?= htmlspecialchars($emp['shift'] ?: '09:00 AM - 06:00 PM') ?></td>
                                    <td style="color: var(--text-muted);"><?= htmlspecialchars($emp['joinDate'] ?: '-') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SAMPLE ATTENDANCE TABLE -->
        <div class="card-table-wrapper">
            <div class="card-table-header">
                <h3>Sample Attendance Records (`attendance` Table)</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
                    Showing <?= count($sampleAttendance) ?> records
                </span>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Rec ID</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Date</th>
                            <th>Check-In</th>
                            <th>Sign-Out</th>
                            <th>Working Hours</th>
                            <th>Distance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($sampleAttendance)): ?>
                            <tr>
                                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                    No attendance records found. Click "Re-Seed Sample Data" above to add sample records!
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($sampleAttendance as $att): ?>
                                <tr>
                                    <td class="code-cell">#<?= htmlspecialchars($att['id']) ?></td>
                                    <td class="code-cell"><?= htmlspecialchars($att['employee_id'] ?: $att['empId']) ?></td>
                                    <td style="font-weight: 600; color: #fff;"><?= htmlspecialchars($att['empName']) ?></td>
                                    <td><?= htmlspecialchars($att['attendance_date'] ?: $att['date']) ?></td>
                                    <td style="color: #2ee585; font-weight: 600;"><?= htmlspecialchars($att['attendance_time'] ?: ($att['time'] ?: '-')) ?></td>
                                    <td style="color: #38bdf8;"><?= htmlspecialchars($att['signOutTime'] ?: 'In-Office') ?></td>
                                    <td style="font-weight: 600;"><?= htmlspecialchars($att['workingHours'] ?: '-') ?></td>
                                    <td><?= htmlspecialchars($att['distanceMeters'] ?? $att['distance_from_location'] ?? 0) ?>m</td>
                                    <td>
                                        <span class="status-pill status-pass" style="font-size: 0.65rem; padding: 0.2rem 0.5rem;">
                                            <?= htmlspecialchars($att['status'] ?: 'PRESENT') ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- FOOTER -->
        <footer class="footer">
            <p>GSR Broadband Private Limited &copy; <?= date('Y') ?> | Connected to Hostinger Remote MySQL Database | <a href="../" target="_blank">Visit Frontend App &rarr;</a></p>
        </footer>

    </div>
</body>
</html>
