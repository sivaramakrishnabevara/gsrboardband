<?php
// GSR Broadband - Centralized Database Connection & Auto-Setup Engine

$db_host = "193.203.184.248";
$db_user = "u457767862_gsr_nani";
$db_pass = "Veda@Rudra1";
$db_name = "u457767862_gsr1";

// Connect to MySQL
$conn = new mysqli(
    $db_host,
    $db_user,
    $db_pass,
    $db_name
);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die("Database connection failed: " . $conn->connect_error);
}

date_default_timezone_set("Asia/Kolkata");

// Set character encoding & timezone in MySQL
$conn->set_charset("utf8mb4");
$conn->query("SET time_zone = '+05:30'");

/**
 * Auto-Setup Database: Ensures all required tables (employees, attendance, office_settings),
 * columns, collations, and default settings exist and are fully operational.
 */
function ensureGSRDatabaseSetup($conn, $force = false) {
    global $db_name;
    
    // Quick check: if all tables exist and force is false, return immediately
    if (!$force) {
        $chkTables = $conn->query("SHOW TABLES");
        $existing = [];
        if ($chkTables) {
            while ($r = $chkTables->fetch_row()) {
                $existing[] = strtolower($r[0]);
            }
        }
        if (in_array('employees', $existing) && in_array('attendance', $existing) && in_array('office_settings', $existing)) {
            return true; // All tables exist and ready!
        }
    }

    // 1. Detect table collation from employees table
    $empCollation = 'utf8mb4_uca1400_ai_ci';
    $collRes = $conn->query("SELECT table_collation FROM information_schema.tables WHERE table_schema = '$db_name' AND table_name = 'employees'");
    if ($collRes && ($r = $collRes->fetch_row()) && !empty($r[0])) {
        $empCollation = $r[0];
    }

    // 2. Ensure `employees` table has all expected dual-schema columns
    $empColsRes = $conn->query("SHOW COLUMNS FROM `employees`");
    $existingEmpCols = [];
    if ($empColsRes) {
        while ($c = $empColsRes->fetch_assoc()) {
            $existingEmpCols[] = $c['Field'];
        }
    }

    $colsToAdd = [
        'name' => "VARCHAR(150) NULL AFTER `employee_name`",
        'role' => "VARCHAR(100) NULL DEFAULT 'Staff'",
        'phone' => "VARCHAR(50) NULL",
        'shift' => "VARCHAR(50) NULL DEFAULT '09:00 AM - 06:00 PM'",
        'facePhoto' => "LONGTEXT NULL",
        'facePhotos' => "LONGTEXT NULL",
        'joinDate' => "VARCHAR(30) NULL"
    ];

    foreach ($colsToAdd as $colName => $colDef) {
        if (!in_array($colName, $existingEmpCols)) {
            @$conn->query("ALTER TABLE `employees` ADD COLUMN `$colName` $colDef");
        }
    }

    // Sync redundant columns
    @$conn->query("UPDATE `employees` SET `name` = `employee_name` WHERE (`name` IS NULL OR `name` = '') AND `employee_name` IS NOT NULL");
    @$conn->query("UPDATE `employees` SET `phone` = `mobile` WHERE (`phone` IS NULL OR `phone` = '') AND `mobile` IS NOT NULL");
    @$conn->query("UPDATE `employees` SET `role` = `designation` WHERE (`role` IS NULL OR `role` = '') AND `designation` IS NOT NULL");

    // 3. Create `attendance` table if not exists with aligned collation
    $createAttendanceSql = "
    CREATE TABLE IF NOT EXISTS `attendance` (
      `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
      `employee_id` VARCHAR(50) DEFAULT NULL,
      `empId` VARCHAR(50) DEFAULT NULL,
      `empName` VARCHAR(150) DEFAULT NULL,
      `attendance_date` DATE NOT NULL,
      `date` VARCHAR(30) DEFAULT NULL,
      `attendance_time` VARCHAR(30) DEFAULT NULL,
      `time` VARCHAR(30) DEFAULT NULL,
      `signOutTime` VARCHAR(30) DEFAULT NULL,
      `workingHours` VARCHAR(50) DEFAULT NULL,
      `status` VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
      `distance_from_location` INT(11) DEFAULT 0,
      `distanceMeters` INT(11) DEFAULT 0,
      `accuracy` VARCHAR(30) DEFAULT '95.0',
      `withinPerimeter` TINYINT(1) DEFAULT 1,
      `capturedPhoto` LONGTEXT DEFAULT NULL,
      `signOutPhoto` LONGTEXT DEFAULT NULL,
      `latitude` DECIMAL(10,8) DEFAULT NULL,
      `longitude` DECIMAL(11,8) DEFAULT NULL,
      `lat` DECIMAL(10,8) DEFAULT NULL,
      `lng` DECIMAL(11,8) DEFAULT NULL,
      `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `idx_employee_id` (`employee_id`),
      KEY `idx_empId` (`empId`),
      KEY `idx_attendance_date` (`attendance_date`),
      KEY `idx_date` (`date`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=$empCollation;
    ";
    @$conn->query($createAttendanceSql);

    // 4. Create `office_settings` table if not exists
    $createOfficeSql = "
    CREATE TABLE IF NOT EXISTS `office_settings` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(255) NOT NULL DEFAULT 'GSR Broadband Main Office (Powerpet, Eluru)',
      `address` TEXT DEFAULT NULL,
      `lat` DECIMAL(10,8) NOT NULL DEFAULT 16.71070000,
      `lng` DECIMAL(11,8) NOT NULL DEFAULT 81.09520000,
      `radiusMeters` INT(11) NOT NULL DEFAULT 50,
      `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=$empCollation;
    ";
    @$conn->query($createOfficeSql);

    // 5. Ensure default office setting exists
    $chkOffice = $conn->query("SELECT COUNT(*) AS total FROM `office_settings`");
    if ($chkOffice && ($r = $chkOffice->fetch_assoc()) && $r['total'] == 0) {
        $conn->query("INSERT INTO `office_settings` (`name`, `address`, `lat`, `lng`, `radiusMeters`) VALUES (
            'GSR Broadband Main Office (Powerpet, Eluru)',
            '22C-11-21, Chunduri Vari Choultry, Powerpet, Eluru, Andhra Pradesh 534002',
            16.71070000,
            81.09520000,
            50
        )");
    }

    // 6. Ensure default employees exist if table is empty
    $chkEmp = $conn->query("SELECT COUNT(*) AS total FROM `employees`");
    if ($chkEmp && ($r = $chkEmp->fetch_assoc()) && $r['total'] == 0) {
        $sampleEmps = [
            ['EMP001', 'KHAJA MOHIDDIN', '7945621345', 'khaja@gsrbroadband.in', 'Network Operations', 'Network Engineer', '09:00 AM - 06:00 PM', '2025-01-15'],
            ['EMP002', 'RAJU VARMA', '9874561230', 'raju@gsrbroadband.in', 'Field Technical', 'Senior Fiber Technician', '09:00 AM - 06:00 PM', '2025-02-01'],
            ['GSR-101', 'SURESH REDDY', '9848022334', 'suresh@gsrbroadband.in', 'Field Technical', 'FTTH Installation Specialist', '09:00 AM - 06:00 PM', '2025-03-10'],
            ['GSR-102', 'LAKSHMI PRASANNA', '9123456789', 'lakshmi@gsrbroadband.in', 'Customer Support', 'Support Desk Lead', '09:30 AM - 06:30 PM', '2025-04-05'],
            ['GSR-103', 'VENKATESH N', '9988776655', 'venkatesh@gsrbroadband.in', 'Billing & Accounts', 'Accounts Officer', '10:00 AM - 07:00 PM', '2025-05-12'],
            ['GSR-104', 'RAMESH BABU', '9440123456', 'ramesh@gsrbroadband.in', 'Field Technical', 'Linesman / Fiber Splicer', '09:00 AM - 06:00 PM', '2025-06-20']
        ];
        foreach ($sampleEmps as $se) {
            $conn->query("INSERT INTO `employees` (`employee_id`, `employee_name`, `name`, `mobile`, `phone`, `email`, `department`, `designation`, `role`, `shift`, `joinDate`, `allowed_radius`) VALUES ('{$se[0]}', '{$se[1]}', '{$se[1]}', '{$se[2]}', '{$se[2]}', '{$se[3]}', '{$se[4]}', '{$se[5]}', '{$se[5]}', '{$se[6]}', '{$se[7]}', 50.00)");
        }
    }

    // 7. Ensure sample attendance records exist if table is empty
    $chkAtt = $conn->query("SELECT COUNT(*) AS total FROM `attendance`");
    if ($chkAtt && ($r = $chkAtt->fetch_assoc()) && $r['total'] == 0) {
        $today = date("Y-m-d");
        $sampleAtt = [
            ['EMP001', 'KHAJA MOHIDDIN', $today, '09:05 AM', '06:15 PM', '9h 10m', 12],
            ['EMP002', 'RAJU VARMA', $today, '08:55 AM', '06:05 PM', '9h 10m', 18],
            ['GSR-101', 'SURESH REDDY', $today, '09:12 AM', null, null, 24],
            ['GSR-102', 'LAKSHMI PRASANNA', $today, '09:28 AM', null, null, 8]
        ];
        foreach ($sampleAtt as $sa) {
            $so = $sa[4] ? "'{$sa[4]}'" : "NULL";
            $wh = $sa[5] ? "'{$sa[5]}'" : "NULL";
            $conn->query("INSERT INTO `attendance` (`employee_id`, `empId`, `empName`, `attendance_date`, `date`, `attendance_time`, `time`, `signOutTime`, `workingHours`, `status`, `distance_from_location`, `distanceMeters`, `withinPerimeter`, `latitude`, `longitude`, `lat`, `lng`) VALUES ('{$sa[0]}', '{$sa[0]}', '{$sa[1]}', '{$sa[2]}', '{$sa[2]}', '{$sa[3]}', '{$sa[3]}', $so, $wh, 'PRESENT', {$sa[6]}, {$sa[6]}, 1, 16.7107, 81.0952, 16.7107, 81.0952)");
        }
    }

    return true;
}

// Auto-run verification on load to ensure seamless operation
ensureGSRDatabaseSetup($conn, false);

?>
