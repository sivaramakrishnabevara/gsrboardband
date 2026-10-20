<?php
// GSR Broadband Centralized REST API
// Dual-Schema Engine: Works natively on Hostinger (employee_id, employee_name, mobile, designation, attendance_date)
// and Local XAMPP (id, name, phone, role, date, time).

date_default_timezone_set("Asia/Kolkata");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/db.php";

$action = isset($_GET['action']) ? trim($_GET['action']) : '';

// Read raw JSON body if available
$raw_input = file_get_contents("php://input");
$payload = json_decode($raw_input, true);
if (!is_array($payload)) {
    $payload = $_POST ?: [];
}

// Helper to inspect table columns
function getTableColumns($conn, $table) {
    $cols = [];
    $res = $conn->query("SHOW COLUMNS FROM `$table`");
    if ($res) {
        while ($c = $res->fetch_assoc()) {
            $cols[] = $c['Field'];
        }
    }
    return $cols;
}

switch ($action) {
    // -------------------------------------------------------------
    // 1. HEALTH / TEST DIAGNOSTICS
    // -------------------------------------------------------------
    case 'test':
        try {
            $res = $conn->query("SELECT COUNT(*) AS total FROM `employees`");
            $count = $res ? (int)$res->fetch_assoc()['total'] : 0;

            $attRes = $conn->query("SELECT COUNT(*) AS total FROM `attendance`");
            $attCount = $attRes ? (int)$attRes->fetch_assoc()['total'] : 0;

            $empCols = getTableColumns($conn, 'employees');
            $attCols = getTableColumns($conn, 'attendance');

            echo json_encode([
                "success" => true,
                "message" => "Database connected successfully to server",
                "database" => $db_name,
                "total_employees" => $count,
                "total_attendance" => $attCount,
                "employees_columns" => $empCols,
                "attendance_columns" => $attCols
            ], JSON_INVALID_UTF8_SUBSTITUTE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 2. FULL AUTOMATED DATABASE CRUD TEST (Add, Update, Delete)
    // -------------------------------------------------------------
    case 'test_crud':
        $admin_key = "GSR_ADMIN_SECURE_2026";
        $provided_key = $_GET['key'] ?? ($payload['key'] ?? '');
        if ($provided_key !== $admin_key) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "Unauthorized. Valid admin security key required to run CRUD tests."]);
            exit;
        }

        try {
            $empCols = getTableColumns($conn, 'employees');
            $attCols = getTableColumns($conn, 'attendance');

            $report = [
                "connection" => "PASS ($db_name)",
                "insert_employee" => "PENDING",
                "read_employee" => "PENDING",
                "update_employee" => "PENDING",
                "delete_employee" => "PENDING",
                "insert_attendance" => "PENDING",
                "read_attendance" => "PENDING",
                "delete_attendance" => "PENDING"
            ];

            $testId = "GSR-QA-" . rand(1000, 9999);
            $testName = "QA Verification Employee";
            $updatedName = "QA Verification Employee (Updated)";
            $phone = "9848099999";
            $today = date("Y-m-d");

            // 1. Insert Test Employee dynamically
            $insFields = [];
            $insPlaceholders = [];
            $insVals = [];
            $insTypes = "";

            if (in_array('employee_id', $empCols)) {
                $insFields[] = "`employee_id`";
                $insPlaceholders[] = "?";
                $insVals[] = $testId;
                $insTypes .= "s";
            }
            if (in_array('id', $empCols)) {
                $idColInfo = $conn->query("SHOW COLUMNS FROM `employees` LIKE 'id'")->fetch_assoc();
                if ($idColInfo && strpos(strtolower($idColInfo['Type']), 'varchar') !== false) {
                    $insFields[] = "`id`";
                    $insPlaceholders[] = "?";
                    $insVals[] = $testId;
                    $insTypes .= "s";
                }
            }
            if (in_array('employee_name', $empCols)) {
                $insFields[] = "`employee_name`";
                $insPlaceholders[] = "?";
                $insVals[] = $testName;
                $insTypes .= "s";
            }
            if (in_array('name', $empCols)) {
                $insFields[] = "`name`";
                $insPlaceholders[] = "?";
                $insVals[] = $testName;
                $insTypes .= "s";
            }
            if (in_array('mobile', $empCols)) {
                $insFields[] = "`mobile`";
                $insPlaceholders[] = "?";
                $insVals[] = $phone;
                $insTypes .= "s";
            }
            if (in_array('phone', $empCols)) {
                $insFields[] = "`phone`";
                $insPlaceholders[] = "?";
                $insVals[] = $phone;
                $insTypes .= "s";
            }
            if (in_array('department', $empCols)) {
                $insFields[] = "`department`";
                $insPlaceholders[] = "?";
                $insVals[] = "QA Testing";
                $insTypes .= "s";
            }
            if (in_array('designation', $empCols)) {
                $insFields[] = "`designation`";
                $insPlaceholders[] = "?";
                $insVals[] = "Tester";
                $insTypes .= "s";
            }
            if (in_array('role', $empCols)) {
                $insFields[] = "`role`";
                $insPlaceholders[] = "?";
                $insVals[] = "Tester";
                $insTypes .= "s";
            }

            $sqlIns = "INSERT INTO `employees` (" . implode(", ", $insFields) . ") VALUES (" . implode(", ", $insPlaceholders) . ")";
            $stmt = $conn->prepare($sqlIns);
            if ($stmt) {
                $stmt->bind_param($insTypes, ...$insVals);
                if ($stmt->execute()) {
                    $report['insert_employee'] = "PASS (Created $testId)";
                } else {
                    $report['insert_employee'] = "FAIL: " . $stmt->error;
                }
                $stmt->close();
            } else {
                $report['insert_employee'] = "FAIL: " . $conn->error;
            }

            // 2. Read Test Employee
            $whereEmp = in_array('employee_id', $empCols) ? "(`employee_id` = '$testId' OR `id` = '$testId')" : "`id` = '$testId'";
            $selRes = $conn->query("SELECT * FROM `employees` WHERE $whereEmp");
            $readEmp = $selRes ? $selRes->fetch_assoc() : null;
            if ($readEmp) {
                $report['read_employee'] = "PASS (Found $testId)";
            } else {
                $report['read_employee'] = "FAIL: Record not found";
            }

            // 3. Update Test Employee
            $upFields = [];
            if (in_array('employee_name', $empCols)) $upFields[] = "`employee_name` = '$updatedName'";
            if (in_array('name', $empCols)) $upFields[] = "`name` = '$updatedName'";
            if (!empty($upFields)) {
                $conn->query("UPDATE `employees` SET " . implode(", ", $upFields) . " WHERE $whereEmp");
                $chkUp = $conn->query("SELECT * FROM `employees` WHERE $whereEmp")->fetch_assoc();
                $foundName = $chkUp['employee_name'] ?? ($chkUp['name'] ?? '');
                if ($foundName === $updatedName) {
                    $report['update_employee'] = "PASS (Updated to $updatedName)";
                } else {
                    $report['update_employee'] = "FAIL: Value not updated (found: $foundName)";
                }
            } else {
                $report['update_employee'] = "PASS (No name column to update)";
            }

            // 4. Insert Test Attendance
            $testAttId = "ATT-QA-" . rand(1000, 9999);
            $attFields = [];
            $attPlaceholders = [];
            $attVals = [];
            $attTypes = "";

            if (in_array('id', $attCols)) {
                $idColInfo = $conn->query("SHOW COLUMNS FROM `attendance` LIKE 'id'")->fetch_assoc();
                if ($idColInfo && strpos(strtolower($idColInfo['Type']), 'varchar') !== false) {
                    $attFields[] = "`id`";
                    $attPlaceholders[] = "?";
                    $attVals[] = $testAttId;
                    $attTypes .= "s";
                }
            }
            if (in_array('employee_id', $attCols)) {
                $attFields[] = "`employee_id`";
                $attPlaceholders[] = "?";
                $attVals[] = $testId;
                $attTypes .= "s";
            }
            if (in_array('empId', $attCols)) {
                $attFields[] = "`empId`";
                $attPlaceholders[] = "?";
                $attVals[] = $testId;
                $attTypes .= "s";
            }
            if (in_array('empName', $attCols)) {
                $attFields[] = "`empName`";
                $attPlaceholders[] = "?";
                $attVals[] = $updatedName;
                $attTypes .= "s";
            }
            if (in_array('attendance_date', $attCols)) {
                $attFields[] = "`attendance_date`";
                $attPlaceholders[] = "?";
                $attVals[] = $today;
                $attTypes .= "s";
            }
            if (in_array('date', $attCols)) {
                $attFields[] = "`date`";
                $attPlaceholders[] = "?";
                $attVals[] = $today;
                $attTypes .= "s";
            }
            if (in_array('attendance_time', $attCols)) {
                $attFields[] = "`attendance_time`";
                $attPlaceholders[] = "?";
                $attVals[] = date("h:i A");
                $attTypes .= "s";
            }
            if (in_array('time', $attCols)) {
                $attFields[] = "`time`";
                $attPlaceholders[] = "?";
                $attVals[] = date("h:i A");
                $attTypes .= "s";
            }
            if (in_array('status', $attCols)) {
                $attFields[] = "`status`";
                $attPlaceholders[] = "?";
                $attVals[] = "PRESENT";
                $attTypes .= "s";
            }

            $sqlAtt = "INSERT INTO `attendance` (" . implode(", ", $attFields) . ") VALUES (" . implode(", ", $attPlaceholders) . ")";
            $stmtAtt = $conn->prepare($sqlAtt);
            if ($stmtAtt) {
                $stmtAtt->bind_param($attTypes, ...$attVals);
                if ($stmtAtt->execute()) {
                    $report['insert_attendance'] = "PASS (Created Attendance for $testId)";
                } else {
                    $report['insert_attendance'] = "FAIL: " . $stmtAtt->error;
                }
                $stmtAtt->close();
            } else {
                $report['insert_attendance'] = "FAIL: " . $conn->error;
            }

            // 5. Read Test Attendance
            $whereAtt = in_array('employee_id', $attCols) ? "`employee_id` = '$testId'" : "`empId` = '$testId'";
            $readAttRes = $conn->query("SELECT * FROM `attendance` WHERE $whereAtt");
            $readAtt = $readAttRes ? $readAttRes->fetch_assoc() : null;
            if ($readAtt) {
                $report['read_attendance'] = "PASS (Found Attendance for $testId)";
            } else {
                $report['read_attendance'] = "FAIL: Attendance record not found";
            }

            // 6. Delete Test Attendance
            $conn->query("DELETE FROM `attendance` WHERE $whereAtt");
            $delAttChk = $conn->query("SELECT * FROM `attendance` WHERE $whereAtt")->fetch_assoc();
            if (!$delAttChk) {
                $report['delete_attendance'] = "PASS (Cleaned up attendance)";
            } else {
                $report['delete_attendance'] = "FAIL: Attendance record not deleted";
            }

            // 7. Delete Test Employee
            $conn->query("DELETE FROM `employees` WHERE $whereEmp");
            $delEmpChk = $conn->query("SELECT * FROM `employees` WHERE $whereEmp")->fetch_assoc();
            if (!$delEmpChk) {
                $report['delete_employee'] = "PASS (Deleted $testId)";
            } else {
                $report['delete_employee'] = "FAIL: Employee still exists";
            }

            $allPass = true;
            foreach ($report as $k => $v) {
                if (strpos($v, "FAIL") === 0) {
                    $allPass = false;
                }
            }

            echo json_encode([
                "success" => $allPass,
                "message" => $allPass ? "All Database CRUD operations (Add, Read, Update, Delete) are working 100%!" : "Some database operations failed",
                "test_report" => $report
            ], JSON_INVALID_UTF8_SUBSTITUTE | JSON_PRETTY_PRINT);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Test error: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 3. GET ALL EMPLOYEES
    // -------------------------------------------------------------
    case 'get_employees':
        try {
            $avail = getTableColumns($conn, 'employees');
            $order = in_array('id', $avail) ? "ORDER BY `id` DESC" : "";

            $sql = "SELECT * FROM `employees` $order";
            $res = $conn->query($sql);
            $employees = [];
            if ($res) {
                while ($row = $res->fetch_assoc()) {
                    $empId = !empty($row['employee_id']) ? $row['employee_id'] : (!empty($row['id']) ? $row['id'] : '');
                    $empName = !empty($row['employee_name']) ? $row['employee_name'] : (!empty($row['name']) ? $row['name'] : '');
                    $mobile = !empty($row['mobile']) ? $row['mobile'] : (!empty($row['phone']) ? $row['phone'] : '');
                    $role = !empty($row['designation']) ? $row['designation'] : (!empty($row['role']) ? $row['role'] : 'Staff');
                    $dept = !empty($row['department']) ? $row['department'] : 'Field Technical';
                    $email = !empty($row['email']) ? $row['email'] : '';
                    $photo = !empty($row['facePhoto']) ? $row['facePhoto'] : (!empty($row['image_path']) ? $row['image_path'] : '');
                    $photosRaw = !empty($row['facePhotos']) ? $row['facePhotos'] : '';
                    $photosList = [];
                    if (!empty($photosRaw)) {
                        $decoded = json_decode($photosRaw, true);
                        if (is_array($decoded)) {
                            $photosList = $decoded;
                        }
                    }
                    if (empty($photosList) && !empty($photo)) {
                        $photosList = [$photo];
                    }
                    $joinDate = !empty($row['joinDate']) ? $row['joinDate'] : (isset($row['created_at']) ? substr($row['created_at'], 0, 10) : date("Y-m-d"));
                    $shift = !empty($row['shift']) ? $row['shift'] : '09:00 AM - 06:00 PM';

                    $employees[] = [
                        'id' => (string)$empId,
                        'name' => $empName,
                        'role' => $role,
                        'department' => $dept,
                        'phone' => $mobile,
                        'email' => $email,
                        'shift' => $shift,
                        'facePhoto' => $photo,
                        'facePhotos' => $photosList,
                        'joinDate' => $joinDate
                    ];
                }
            }
            echo json_encode([
                "success" => true,
                "data" => $employees
            ], JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to load employees: " . $e->getMessage(),
                "data" => []
            ]);
        }
        break;

    // -------------------------------------------------------------
    // 4. ADD NEW EMPLOYEE (Permanent DB Insert / Upsert)
    // -------------------------------------------------------------
    case 'add_employee':
        try {
            $id = !empty($payload['id']) ? trim($payload['id']) : (!empty($payload['employee_id']) ? trim($payload['employee_id']) : '');
            if (empty($id)) {
                $q = $conn->query("SELECT employee_id, id FROM `employees`");
                $max_id = 100;
                if ($q) {
                    while ($r = $q->fetch_assoc()) {
                        $checkId = $r['employee_id'] ?? $r['id'];
                        if (preg_match('/(\d+)/', $checkId, $m)) {
                            $val = (int)$m[1];
                            if ($val > $max_id) $max_id = $val;
                        }
                    }
                }
                $id = "GSR-" . ($max_id + 1);
            }
            $name = isset($payload['name']) ? trim($payload['name']) : (isset($payload['employee_name']) ? trim($payload['employee_name']) : '');
            $role = isset($payload['role']) && trim($payload['role']) !== '' ? trim($payload['role']) : (isset($payload['designation']) ? trim($payload['designation']) : 'Staff');
            $department = isset($payload['department']) && trim($payload['department']) !== '' ? trim($payload['department']) : 'Field Technical';
            $phone = isset($payload['phone']) ? trim($payload['phone']) : (isset($payload['mobile']) ? trim($payload['mobile']) : '');
            $email = isset($payload['email']) ? trim($payload['email']) : '';
            $shift = isset($payload['shift']) ? trim($payload['shift']) : '09:00 AM - 06:00 PM';
            $facePhoto = isset($payload['facePhoto']) ? $payload['facePhoto'] : (isset($payload['image_path']) ? $payload['image_path'] : '');
            $facePhotos = '';
            $facePhotosList = [];
            if (isset($payload['facePhotos'])) {
                if (is_array($payload['facePhotos'])) {
                    $facePhotosList = $payload['facePhotos'];
                    $facePhotos = json_encode($payload['facePhotos'], JSON_UNESCAPED_SLASHES);
                    if (empty($facePhoto) && !empty($payload['facePhotos'][0])) {
                        $facePhoto = $payload['facePhotos'][0];
                    }
                } else if (is_string($payload['facePhotos'])) {
                    $facePhotos = $payload['facePhotos'];
                    $decoded = json_decode($facePhotos, true);
                    $facePhotosList = is_array($decoded) ? $decoded : [$facePhotos];
                }
            } else if (!empty($facePhoto)) {
                $facePhotos = json_encode([$facePhoto], JSON_UNESCAPED_SLASHES);
                $facePhotosList = [$facePhoto];
            }
            $joinDate = !empty($payload['joinDate']) ? $payload['joinDate'] : date("Y-m-d");

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Employee name is required"]);
                exit;
            }

            $availCols = getTableColumns($conn, 'employees');

            $cols = [];
            $vals = [];
            $types = "";

            $potentialFields = [
                'employee_id' => $id,
                'employee_name' => $name,
                'name' => $name,
                'designation' => $role,
                'role' => $role,
                'department' => $department,
                'mobile' => $phone,
                'phone' => $phone,
                'email' => $email,
                'shift' => $shift,
                'facePhoto' => $facePhoto,
                'facePhotos' => $facePhotos,
                'image_path' => $facePhoto,
                'joinDate' => $joinDate,
                'allowed_radius' => 50.00
            ];

            // If table has varchar 'id' primary key
            if (in_array('id', $availCols)) {
                $idColInfo = $conn->query("SHOW COLUMNS FROM `employees` LIKE 'id'")->fetch_assoc();
                if ($idColInfo && strpos(strtolower($idColInfo['Type']), 'varchar') !== false) {
                    $potentialFields['id'] = $id;
                }
            }

            foreach ($potentialFields as $fName => $fVal) {
                if (in_array($fName, $availCols) && !in_array("`$fName`", $cols)) {
                    $cols[] = "`$fName`";
                    $vals[] = $fVal;
                    $types .= (is_numeric($fVal) && !is_string($fVal)) ? "d" : "s";
                }
            }

            $placeholders = implode(", ", array_fill(0, count($cols), "?"));
            $upList = [];
            foreach ($cols as $col) {
                if ($col !== '`id`' && $col !== '`employee_id`') {
                    $upList[] = "$col = VALUES($col)";
                }
            }

            $sql = "INSERT INTO `employees` (" . implode(", ", $cols) . ") VALUES ($placeholders)";
            if (!empty($upList)) {
                $sql .= " ON DUPLICATE KEY UPDATE " . implode(", ", $upList);
            }

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                http_response_code(500);
                echo json_encode(["success" => false, "error" => "SQL prepare failed: " . $conn->error]);
                exit;
            }

            $stmt->bind_param($types, ...$vals);

            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true,
                    "message" => "Employee added to database successfully",
                    "data" => [
                        "id" => $id,
                        "name" => $name,
                        "role" => $role,
                        "department" => $department,
                        "phone" => $phone,
                        "email" => $email,
                        "shift" => $shift,
                        "facePhoto" => $facePhoto,
                        "facePhotos" => $facePhotosList,
                        "joinDate" => $joinDate
                    ]
                ], JSON_INVALID_UTF8_SUBSTITUTE);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "error" => "Failed to save employee: " . $stmt->error]);
            }
            $stmt->close();
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 5. UPDATE EXISTING EMPLOYEE
    // -------------------------------------------------------------
    case 'update_employee':
        try {
            $id = !empty($payload['id']) ? trim($payload['id']) : (isset($_GET['id']) ? trim($_GET['id']) : '');
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Employee ID is required"]);
                exit;
            }

            $availCols = getTableColumns($conn, 'employees');

            $fields = [];
            $types = "";
            $params = [];

            // Name mapping
            if (isset($payload['name'])) {
                if (in_array('employee_name', $availCols)) {
                    $fields[] = "`employee_name` = ?";
                    $types .= "s";
                    $params[] = $payload['name'];
                }
                if (in_array('name', $availCols)) {
                    $fields[] = "`name` = ?";
                    $types .= "s";
                    $params[] = $payload['name'];
                }
            }

            // Role mapping
            if (isset($payload['role'])) {
                if (in_array('designation', $availCols)) {
                    $fields[] = "`designation` = ?";
                    $types .= "s";
                    $params[] = $payload['role'];
                }
                if (in_array('role', $availCols)) {
                    $fields[] = "`role` = ?";
                    $types .= "s";
                    $params[] = $payload['role'];
                }
            }

            // Phone mapping
            if (isset($payload['phone'])) {
                if (in_array('mobile', $availCols)) {
                    $fields[] = "`mobile` = ?";
                    $types .= "s";
                    $params[] = $payload['phone'];
                }
                if (in_array('phone', $availCols)) {
                    $fields[] = "`phone` = ?";
                    $types .= "s";
                    $params[] = $payload['phone'];
                }
            }

            // Department
            if (isset($payload['department']) && in_array('department', $availCols)) {
                $fields[] = "`department` = ?";
                $types .= "s";
                $params[] = $payload['department'];
            }

            // Email
            if (isset($payload['email']) && in_array('email', $availCols)) {
                $fields[] = "`email` = ?";
                $types .= "s";
                $params[] = $payload['email'];
            }

            // Shift
            if (isset($payload['shift']) && in_array('shift', $availCols)) {
                $fields[] = "`shift` = ?";
                $types .= "s";
                $params[] = $payload['shift'];
            }

            // Photo mapping
            if (isset($payload['facePhoto'])) {
                if (in_array('image_path', $availCols)) {
                    $fields[] = "`image_path` = ?";
                    $types .= "s";
                    $params[] = $payload['facePhoto'];
                }
                if (in_array('facePhoto', $availCols)) {
                    $fields[] = "`facePhoto` = ?";
                    $types .= "s";
                    $params[] = $payload['facePhoto'];
                }
            }

            if (isset($payload['facePhotos'])) {
                $photosJson = is_array($payload['facePhotos']) ? json_encode($payload['facePhotos'], JSON_UNESCAPED_SLASHES) : $payload['facePhotos'];
                if (in_array('facePhotos', $availCols)) {
                    $fields[] = "`facePhotos` = ?";
                    $types .= "s";
                    $params[] = $photosJson;
                }
            }

            // Join Date
            if (isset($payload['joinDate']) && in_array('joinDate', $availCols)) {
                $fields[] = "`joinDate` = ?";
                $types .= "s";
                $params[] = $payload['joinDate'];
            }

            if (empty($fields)) {
                echo json_encode(["success" => true, "message" => "No changes detected"]);
                exit;
            }

            // Where clause supporting employee_id and id
            $hasEmpId = in_array('employee_id', $availCols);
            if ($hasEmpId) {
                $where = "(`id` = ? OR `employee_id` = ?)";
                $types .= "ss";
                $params[] = $id;
                $params[] = $id;
            } else {
                $where = "`id` = ?";
                $types .= "s";
                $params[] = $id;
            }

            $sql = "UPDATE `employees` SET " . implode(", ", $fields) . " WHERE $where";
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                http_response_code(500);
                echo json_encode(["success" => false, "error" => "SQL prepare failed: " . $conn->error]);
                exit;
            }

            $stmt->bind_param($types, ...$params);

            if ($stmt->execute()) {
                // Also update empName in attendance if name changed and table supports empName
                if (isset($payload['name'])) {
                    $attCols = getTableColumns($conn, 'attendance');
                    if (in_array('empName', $attCols)) {
                        $attWhere = in_array('employee_id', $attCols) ? "(`empId` = ? OR `employee_id` = ?)" : "`empId` = ?";
                        $attStmt = $conn->prepare("UPDATE `attendance` SET `empName` = ? WHERE $attWhere");
                        if ($attStmt) {
                            if (in_array('employee_id', $attCols)) {
                                $attStmt->bind_param("sss", $payload['name'], $id, $id);
                            } else {
                                $attStmt->bind_param("ss", $payload['name'], $id);
                            }
                            $attStmt->execute();
                            $attStmt->close();
                        }
                    }
                }

                echo json_encode(["success" => true, "message" => "Employee updated successfully in database"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "error" => "Update failed: " . $stmt->error]);
            }
            $stmt->close();
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error updating employee: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 6. DELETE EMPLOYEE (Permanent DB Removal)
    // -------------------------------------------------------------
    case 'delete_employee':
        try {
            $id = !empty($_GET['id']) ? trim($_GET['id']) : (!empty($payload['id']) ? trim($payload['id']) : '');
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Employee ID is required to delete"]);
                exit;
            }

            $empCols = getTableColumns($conn, 'employees');
            $attCols = getTableColumns($conn, 'attendance');

            // 1. Permanently delete from employees table
            $affected = 0;
            if (in_array('employee_id', $empCols)) {
                $stmt = $conn->prepare("DELETE FROM `employees` WHERE `employee_id` = ?");
                if ($stmt) {
                    $stmt->bind_param("s", $id);
                    $stmt->execute();
                    $affected += $stmt->affected_rows;
                    $stmt->close();
                }
            }
            if ($affected === 0 && is_numeric($id)) {
                $numId = (int)$id;
                $stmt = $conn->prepare("DELETE FROM `employees` WHERE `id` = ?");
                if ($stmt) {
                    $stmt->bind_param("i", $numId);
                    $stmt->execute();
                    $affected += $stmt->affected_rows;
                    $stmt->close();
                }
            }

            // 2. Also permanently remove associated attendance records
            if (in_array('employee_id', $attCols)) {
                $stmt2 = $conn->prepare("DELETE FROM `attendance` WHERE `employee_id` = ? OR `empId` = ?");
                if ($stmt2) {
                    $stmt2->bind_param("ss", $id, $id);
                    $stmt2->execute();
                    $stmt2->close();
                }
            } elseif (in_array('empId', $attCols)) {
                $stmt2 = $conn->prepare("DELETE FROM `attendance` WHERE `empId` = ?");
                if ($stmt2) {
                    $stmt2->bind_param("s", $id);
                    $stmt2->execute();
                    $stmt2->close();
                }
            }

            echo json_encode([
                "success" => true,
                "message" => "Employee permanently deleted from database",
                "id" => $id,
                "affectedRows" => $affected
            ]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error deleting employee: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 7. GET ALL ATTENDANCE RECORDS
    // -------------------------------------------------------------
    case 'get_attendance':
        try {
            $attCols = getTableColumns($conn, 'attendance');
            $empCols = getTableColumns($conn, 'employees');
            
            // Build dynamic robust join
            $joinConds = [];
            if (in_array('employee_id', $attCols)) {
                if (in_array('employee_id', $empCols)) $joinConds[] = "a.employee_id = e.employee_id";
                if (in_array('id', $empCols)) $joinConds[] = "a.employee_id = e.id";
            }
            if (in_array('empId', $attCols)) {
                if (in_array('employee_id', $empCols)) $joinConds[] = "a.empId = e.employee_id";
                if (in_array('id', $empCols)) $joinConds[] = "a.empId = e.id";
            }
            $joinSql = !empty($joinConds) ? "LEFT JOIN `employees` e ON (" . implode(" OR ", $joinConds) . ")" : "";
            
            $sql = "SELECT a.*, 
                    " . (in_array('employee_name', $empCols) ? "e.employee_name" : "'' AS employee_name") . ", 
                    " . (in_array('name', $empCols) ? "e.name AS emp_alt_name" : "'' AS emp_alt_name") . " 
                    FROM `attendance` a 
                    $joinSql 
                    ORDER BY a.id DESC";

            $res = $conn->query($sql);
            $records = [];
            if ($res) {
                while ($row = $res->fetch_assoc()) {
                    $empId = !empty($row['employee_id']) ? $row['employee_id'] : (!empty($row['empId']) ? $row['empId'] : '');
                    
                    // Name priority: employee_name > emp_alt_name > empName > 'Employee'
                    $empName = !empty($row['employee_name']) ? $row['employee_name'] : (!empty($row['emp_alt_name']) ? $row['emp_alt_name'] : (!empty($row['empName']) ? $row['empName'] : 'Employee'));
                    
                    $date = !empty($row['attendance_date']) ? $row['attendance_date'] : (!empty($row['date']) ? $row['date'] : '');
                    $time = !empty($row['attendance_time']) ? $row['attendance_time'] : (!empty($row['time']) ? $row['time'] : '');
                    $dist = isset($row['distance_from_location']) ? (int)$row['distance_from_location'] : (isset($row['distanceMeters']) ? (int)$row['distanceMeters'] : 0);
                    $lat = isset($row['latitude']) ? $row['latitude'] : (isset($row['lat']) ? $row['lat'] : null);
                    $lng = isset($row['longitude']) ? $row['longitude'] : (isset($row['lng']) ? $row['lng'] : null);

                    $records[] = [
                        'id' => (string)$row['id'],
                        'empId' => (string)$empId,
                        'empName' => $empName,
                        'date' => (string)$date,
                        'time' => (string)$time,
                        'signOutTime' => $row['signOutTime'] ?? null,
                        'workingHours' => $row['workingHours'] ?? null,
                        'status' => !empty($row['status']) ? $row['status'] : 'PRESENT',
                        'distanceMeters' => $dist,
                        'accuracy' => isset($row['accuracy']) ? (string)$row['accuracy'] : '99.0',
                        'withinPerimeter' => isset($row['withinPerimeter']) ? (bool)$row['withinPerimeter'] : ($dist <= 50),
                        'capturedPhoto' => $row['capturedPhoto'] ?? '',
                        'signOutPhoto' => $row['signOutPhoto'] ?? null,
                        'location' => ($lat !== null && $lng !== null) ? ["lat" => (float)$lat, "lng" => (float)$lng] : null
                    ];
                }
            }
            echo json_encode([
                "success" => true,
                "data" => $records
            ], JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => "Failed to load attendance: " . $e->getMessage(),
                "data" => []
            ]);
        }
        break;

    // -------------------------------------------------------------
    // 8. MARK ATTENDANCE / CHECK-IN (Permanent DB Insert)
    // -------------------------------------------------------------
    case 'mark_attendance':
        try {
            $empId = isset($payload['empId']) ? trim($payload['empId']) : (!empty($payload['employee_id']) ? trim($payload['employee_id']) : '');
            if (empty($empId)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "empId is required"]);
                exit;
            }

            // Get employee name
            $empCols = getTableColumns($conn, 'employees');
            $whereEmp = in_array('employee_id', $empCols) ? "(`id` = ? OR `employee_id` = ?)" : "`id` = ?";
            $empStmt = $conn->prepare("SELECT * FROM `employees` WHERE $whereEmp");
            if ($empStmt) {
                if (in_array('employee_id', $empCols)) {
                    $empStmt->bind_param("ss", $empId, $empId);
                } else {
                    $empStmt->bind_param("s", $empId);
                }
                $empStmt->execute();
                $empRow = $empStmt->get_result()->fetch_assoc();
                $empStmt->close();
            } else {
                $empRow = null;
            }

            if (!$empRow) {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Employee not found in database"]);
                exit;
            }

            $empName = !empty($empRow['employee_name']) ? $empRow['employee_name'] : (!empty($empRow['name']) ? $empRow['name'] : 'Employee');
            $today = !empty($payload['date']) ? trim($payload['date']) : date("Y-m-d");
            $time = !empty($payload['time']) ? trim($payload['time']) : date("h:i A");
            $distanceMeters = isset($payload['distanceMeters']) ? (int)$payload['distanceMeters'] : 0;
            $accuracy = isset($payload['accuracy']) ? (string)$payload['accuracy'] : '99.0';
            $withinPerimeter = $distanceMeters <= 50 ? 1 : 0;
            $capturedPhoto = isset($payload['capturedPhoto']) ? $payload['capturedPhoto'] : '';
            $lat = isset($payload['coords']['lat']) ? (float)$payload['coords']['lat'] : (isset($payload['lat']) ? (float)$payload['lat'] : null);
            $lng = isset($payload['coords']['lng']) ? (float)$payload['coords']['lng'] : (isset($payload['lng']) ? (float)$payload['lng'] : null);

            $attCols = getTableColumns($conn, 'attendance');

            // Check if attendance already exists for today
            $whereCheck = [];
            $checkParams = [];
            $checkTypes = "";

            if (in_array('employee_id', $attCols)) {
                $whereCheck[] = "`employee_id` = ?";
                $checkParams[] = $empId;
                $checkTypes .= "s";
            } elseif (in_array('empId', $attCols)) {
                $whereCheck[] = "`empId` = ?";
                $checkParams[] = $empId;
                $checkTypes .= "s";
            }

            if (in_array('attendance_date', $attCols)) {
                $whereCheck[] = "`attendance_date` = ?";
                $checkParams[] = $today;
                $checkTypes .= "s";
            } elseif (in_array('date', $attCols)) {
                $whereCheck[] = "`date` = ?";
                $checkParams[] = $today;
                $checkTypes .= "s";
            }

            $existing = null;
            if (!empty($whereCheck)) {
                $checkStmt = $conn->prepare("SELECT * FROM `attendance` WHERE " . implode(" AND ", $whereCheck));
                if ($checkStmt) {
                    $checkStmt->bind_param($checkTypes, ...$checkParams);
                    $checkStmt->execute();
                    $existing = $checkStmt->get_result()->fetch_assoc();
                    $checkStmt->close();
                }
            }

            $signOutTime = null;
            $workingHours = null;

            if ($existing) {
                $recId = $existing['id'];
                $signOutTime = $existing['signOutTime'] ?? null;
                $workingHours = $existing['workingHours'] ?? null;
                $time = $existing['attendance_time'] ?? ($existing['time'] ?? $time);

                // Update existing record
                $upFields = [];
                $upVals = [];
                $upTypes = "";

                if (in_array('distance_from_location', $attCols)) {
                    $upFields[] = "`distance_from_location` = ?";
                    $upVals[] = $distanceMeters;
                    $upTypes .= "i";
                }
                if (in_array('distanceMeters', $attCols)) {
                    $upFields[] = "`distanceMeters` = ?";
                    $upVals[] = $distanceMeters;
                    $upTypes .= "i";
                }
                if (in_array('accuracy', $attCols)) {
                    $upFields[] = "`accuracy` = ?";
                    $upVals[] = $accuracy;
                    $upTypes .= "s";
                }
                if (in_array('withinPerimeter', $attCols)) {
                    $upFields[] = "`withinPerimeter` = ?";
                    $upVals[] = $withinPerimeter;
                    $upTypes .= "i";
                }
                if (in_array('capturedPhoto', $attCols)) {
                    $upFields[] = "`capturedPhoto` = ?";
                    $upVals[] = $capturedPhoto;
                    $upTypes .= "s";
                }
                if (in_array('latitude', $attCols)) {
                    $upFields[] = "`latitude` = ?";
                    $upVals[] = $lat;
                    $upTypes .= "d";
                }
                if (in_array('lat', $attCols)) {
                    $upFields[] = "`lat` = ?";
                    $upVals[] = $lat;
                    $upTypes .= "d";
                }
                if (in_array('longitude', $attCols)) {
                    $upFields[] = "`longitude` = ?";
                    $upVals[] = $lng;
                    $upTypes .= "d";
                }
                if (in_array('lng', $attCols)) {
                    $upFields[] = "`lng` = ?";
                    $upVals[] = $lng;
                    $upTypes .= "d";
                }

                if (!empty($upFields)) {
                    $upFieldsSql = implode(", ", $upFields);
                    $upSql = "UPDATE `attendance` SET $upFieldsSql WHERE `id` = ?";
                    $upVals[] = $recId;
                    $upTypes .= is_numeric($recId) ? "i" : "s";
                    $upStmt = $conn->prepare($upSql);
                    if ($upStmt) {
                        $upStmt->bind_param($upTypes, ...$upVals);
                        $upStmt->execute();
                        $upStmt->close();
                    }
                }
                $id = (string)$recId;
            } else {
                // Insert new record
                $insCols = [];
                $insVals = [];
                $insTypes = "";

                if (in_array('id', $attCols)) {
                    $idColInfo = $conn->query("SHOW COLUMNS FROM `attendance` LIKE 'id'")->fetch_assoc();
                    if ($idColInfo && strpos(strtolower($idColInfo['Type']), 'varchar') !== false) {
                        $id = "ATT-" . substr(time(), -4) . rand(10, 99);
                        $insCols[] = "`id`";
                        $insVals[] = $id;
                        $insTypes .= "s";
                    }
                }

                if (in_array('employee_id', $attCols)) {
                    $insCols[] = "`employee_id`";
                    $insVals[] = $empId;
                    $insTypes .= "s";
                }
                if (in_array('empId', $attCols)) {
                    $insCols[] = "`empId`";
                    $insVals[] = $empId;
                    $insTypes .= "s";
                }
                if (in_array('empName', $attCols)) {
                    $insCols[] = "`empName`";
                    $insVals[] = $empName;
                    $insTypes .= "s";
                }
                if (in_array('attendance_date', $attCols)) {
                    $insCols[] = "`attendance_date`";
                    $insVals[] = $today;
                    $insTypes .= "s";
                }
                if (in_array('date', $attCols)) {
                    $insCols[] = "`date`";
                    $insVals[] = $today;
                    $insTypes .= "s";
                }
                if (in_array('attendance_time', $attCols)) {
                    $insCols[] = "`attendance_time`";
                    $insVals[] = $time;
                    $insTypes .= "s";
                }
                if (in_array('time', $attCols)) {
                    $insCols[] = "`time`";
                    $insVals[] = $time;
                    $insTypes .= "s";
                }
                if (in_array('status', $attCols)) {
                    $insCols[] = "`status`";
                    $insVals[] = "PRESENT";
                    $insTypes .= "s";
                }
                if (in_array('distance_from_location', $attCols)) {
                    $insCols[] = "`distance_from_location`";
                    $insVals[] = $distanceMeters;
                    $insTypes .= "i";
                }
                if (in_array('distanceMeters', $attCols)) {
                    $insCols[] = "`distanceMeters`";
                    $insVals[] = $distanceMeters;
                    $insTypes .= "i";
                }
                if (in_array('accuracy', $attCols)) {
                    $insCols[] = "`accuracy`";
                    $insVals[] = $accuracy;
                    $insTypes .= "s";
                }
                if (in_array('withinPerimeter', $attCols)) {
                    $insCols[] = "`withinPerimeter`";
                    $insVals[] = $withinPerimeter;
                    $insTypes .= "i";
                }
                if (in_array('capturedPhoto', $attCols)) {
                    $insCols[] = "`capturedPhoto`";
                    $insVals[] = $capturedPhoto;
                    $insTypes .= "s";
                }
                if (in_array('latitude', $attCols)) {
                    $insCols[] = "`latitude`";
                    $insVals[] = $lat;
                    $insTypes .= "d";
                }
                if (in_array('lat', $attCols)) {
                    $insCols[] = "`lat`";
                    $insVals[] = $lat;
                    $insTypes .= "d";
                }
                if (in_array('longitude', $attCols)) {
                    $insCols[] = "`longitude`";
                    $insVals[] = $lng;
                    $insTypes .= "d";
                }
                if (in_array('lng', $attCols)) {
                    $insCols[] = "`lng`";
                    $insVals[] = $lng;
                    $insTypes .= "d";
                }

                $placeholders = implode(", ", array_fill(0, count($insCols), "?"));
                $insSql = "INSERT INTO `attendance` (" . implode(", ", $insCols) . ") VALUES ($placeholders)";
                $insStmt = $conn->prepare($insSql);
                if ($insStmt) {
                    $insStmt->bind_param($insTypes, ...$insVals);
                    $insStmt->execute();
                    $insertId = $conn->insert_id;
                    $insStmt->close();
                    if (!isset($id)) {
                        $id = (string)$insertId;
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(["success" => false, "error" => "Failed to prepare attendance insert: " . $conn->error]);
                    exit;
                }
            }

            echo json_encode([
                "success" => true,
                "message" => "Attendance recorded in database",
                "data" => [
                    "id" => (string)$id,
                    "empId" => $empId,
                    "empName" => $empName,
                    "date" => $today,
                    "time" => $time,
                    "signOutTime" => $signOutTime,
                    "workingHours" => $workingHours,
                    "status" => "PRESENT",
                    "distanceMeters" => $distanceMeters,
                    "accuracy" => $accuracy,
                    "withinPerimeter" => (bool)$withinPerimeter,
                    "capturedPhoto" => $capturedPhoto,
                    "location" => ($lat !== null && $lng !== null) ? ["lat" => $lat, "lng" => $lng] : null
                ]
            ], JSON_INVALID_UTF8_SUBSTITUTE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error marking attendance: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 9. SIGN OUT (PUNCH OUT) - RECORD WORKING HOURS
    // -------------------------------------------------------------
    case 'sign_out':
        try {
            $empId = isset($payload['empId']) ? trim($payload['empId']) : (!empty($payload['employee_id']) ? trim($payload['employee_id']) : '');
            if (empty($empId)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "empId is required"]);
                exit;
            }

            $today = !empty($payload['date']) ? trim($payload['date']) : date("Y-m-d");
            $signOutTime = !empty($payload['signOutTime']) ? trim($payload['signOutTime']) : date("h:i A");
            $distanceMeters = isset($payload['distanceMeters']) ? (int)$payload['distanceMeters'] : 0;
            $signOutPhoto = isset($payload['capturedPhoto']) ? $payload['capturedPhoto'] : (isset($payload['signOutPhoto']) ? $payload['signOutPhoto'] : '');

            $attCols = getTableColumns($conn, 'attendance');

            // Find check-in record for today
            $whereCheck = [];
            $checkParams = [];
            $checkTypes = "";

            if (in_array('employee_id', $attCols)) {
                $whereCheck[] = "`employee_id` = ?";
                $checkParams[] = $empId;
                $checkTypes .= "s";
            } elseif (in_array('empId', $attCols)) {
                $whereCheck[] = "`empId` = ?";
                $checkParams[] = $empId;
                $checkTypes .= "s";
            }

            if (in_array('attendance_date', $attCols)) {
                $whereCheck[] = "`attendance_date` = ?";
                $checkParams[] = $today;
                $checkTypes .= "s";
            } elseif (in_array('date', $attCols)) {
                $whereCheck[] = "`date` = ?";
                $checkParams[] = $today;
                $checkTypes .= "s";
            }

            $record = null;
            if (!empty($whereCheck)) {
                $checkStmt = $conn->prepare("SELECT * FROM `attendance` WHERE " . implode(" AND ", $whereCheck) . " ORDER BY id DESC LIMIT 1");
                if ($checkStmt) {
                    $checkStmt->bind_param($checkTypes, ...$checkParams);
                    $checkStmt->execute();
                    $record = $checkStmt->get_result()->fetch_assoc();
                    $checkStmt->close();
                }
            }

            if (!$record) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "No check-in record found for today. Please check-in first."]);
                exit;
            }

            // Calculate working hours between check-in time and sign-out time
            $checkInTime = $record['attendance_time'] ?? ($record['time'] ?? '09:00 AM');
            $workingHours = "0 hrs";

            $inTimestamp = strtotime($today . " " . $checkInTime);
            $outTimestamp = strtotime($today . " " . $signOutTime);
            if ($inTimestamp && $outTimestamp) {
                $diffSeconds = $outTimestamp - $inTimestamp;
                if ($diffSeconds < 0) $diffSeconds += 86400; // Across midnight
                $h = floor($diffSeconds / 3600);
                $m = floor(($diffSeconds % 3600) / 60);
                if ($h == 0) {
                    $workingHours = "{$m} mins";
                } elseif ($m == 0) {
                    $workingHours = "{$h} hrs";
                } else {
                    $workingHours = "{$h}h {$m}m";
                }
            }

            // Update attendance record with sign-out info if columns exist
            $upFields = [];
            $upVals = [];
            $upTypes = "";

            if (in_array('signOutTime', $attCols)) {
                $upFields[] = "`signOutTime` = ?";
                $upVals[] = $signOutTime;
                $upTypes .= "s";
            }
            if (in_array('workingHours', $attCols)) {
                $upFields[] = "`workingHours` = ?";
                $upVals[] = $workingHours;
                $upTypes .= "s";
            }
            if (in_array('signOutPhoto', $attCols)) {
                $upFields[] = "`signOutPhoto` = ?";
                $upVals[] = $signOutPhoto;
                $upTypes .= "s";
            }

            if (!empty($upFields)) {
                $upSql = "UPDATE `attendance` SET " . implode(", ", $upFields) . " WHERE `id` = ?";
                $upVals[] = $record['id'];
                $upTypes .= is_numeric($record['id']) ? "i" : "s";
                $upStmt = $conn->prepare($upSql);
                if ($upStmt) {
                    $upStmt->bind_param($upTypes, ...$upVals);
                    $upStmt->execute();
                    $upStmt->close();
                }
            }

            $empName = $record['empName'] ?? 'Employee';
            $lat = $record['latitude'] ?? ($record['lat'] ?? null);
            $lng = $record['longitude'] ?? ($record['lng'] ?? null);

            echo json_encode([
                "success" => true,
                "message" => "Sign-out recorded successfully",
                "data" => [
                    "id" => (string)$record['id'],
                    "empId" => $empId,
                    "empName" => $empName,
                    "date" => $today,
                    "time" => $checkInTime,
                    "signOutTime" => $signOutTime,
                    "workingHours" => $workingHours,
                    "status" => "PRESENT",
                    "distanceMeters" => isset($record['distance_from_location']) ? (int)$record['distance_from_location'] : (isset($record['distanceMeters']) ? (int)$record['distanceMeters'] : 0),
                    "accuracy" => isset($record['accuracy']) ? (string)$record['accuracy'] : "99.0",
                    "withinPerimeter" => true,
                    "capturedPhoto" => $record['capturedPhoto'] ?? '',
                    "signOutPhoto" => $signOutPhoto,
                    "location" => ($lat !== null && $lng !== null) ? ["lat" => (float)$lat, "lng" => (float)$lng] : null
                ]
            ], JSON_INVALID_UTF8_SUBSTITUTE);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error signing out: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 10. TOGGLE / ADJUST ATTENDANCE (Admin Manual Attendance & Time Entry)
    // -------------------------------------------------------------
    case 'toggle_attendance':
    case 'save_attendance_time':
    case 'adjust_attendance':
        try {
            $empId = isset($payload['empId']) ? trim($payload['empId']) : (!empty($payload['employee_id']) ? trim($payload['employee_id']) : '');
            $status = isset($payload['status']) ? trim($payload['status']) : 'PRESENT';
            $targetDate = !empty($payload['date']) ? trim($payload['date']) : (!empty($payload['attendance_date']) ? trim($payload['attendance_date']) : date("Y-m-d"));
            
            // Check-in Time
            $time = !empty($payload['time']) ? trim($payload['time']) : (!empty($payload['checkInTime']) ? trim($payload['checkInTime']) : date("h:i A"));
            
            // Sign-out Time (optional)
            $signOutTime = !empty($payload['signOutTime']) ? trim($payload['signOutTime']) : null;
            
            // Working hours calculation (if not provided, calculate if both check-in and sign-out exist)
            $workingHours = !empty($payload['workingHours']) ? trim($payload['workingHours']) : null;
            if (empty($workingHours) && !empty($time) && !empty($signOutTime)) {
                $inTs = strtotime($targetDate . " " . $time);
                $outTs = strtotime($targetDate . " " . $signOutTime);
                if ($inTs && $outTs) {
                    $diffSec = $outTs - $inTs;
                    if ($diffSec < 0) $diffSec += 86400; // Across midnight
                    $h = floor($diffSec / 3600);
                    $m = floor(($diffSec % 3600) / 60);
                    if ($h == 0) {
                        $workingHours = "{$m} mins";
                    } elseif ($m == 0) {
                        $workingHours = "{$h} hrs";
                    } else {
                        $workingHours = "{$h}h {$m}m";
                    }
                }
            }

            if (empty($empId)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "empId is required"]);
                exit;
            }

            $attCols = getTableColumns($conn, 'attendance');
            $whereEmp = in_array('employee_id', $attCols) ? "`employee_id` = '$empId'" : "`empId` = '$empId'";
            $whereDate = in_array('attendance_date', $attCols) ? "`attendance_date` = '$targetDate'" : "`date` = '$targetDate'";

            if ($status === 'ABSENT') {
                $conn->query("DELETE FROM `attendance` WHERE $whereEmp AND $whereDate");
                echo json_encode([
                    "success" => true,
                    "message" => "Attendance record removed for $targetDate (Marked ABSENT)",
                    "empId" => $empId,
                    "status" => "ABSENT"
                ]);
            } else {
                // Fetch employee details (name, photo)
                $empCols = getTableColumns($conn, 'employees');
                $eWhere = in_array('employee_id', $empCols) ? "(`id` = '$empId' OR `employee_id` = '$empId')" : "`id` = '$empId'";
                $eRes = $conn->query("SELECT * FROM `employees` WHERE $eWhere");
                $eRow = $eRes ? $eRes->fetch_assoc() : null;
                $empName = $eRow ? ($eRow['employee_name'] ?? ($eRow['name'] ?? 'Employee')) : 'Employee';
                $facePhoto = !empty($payload['capturedPhoto']) ? $payload['capturedPhoto'] : ($eRow['facePhoto'] ?? '');

                // Remove existing for this employee on targetDate
                $conn->query("DELETE FROM `attendance` WHERE $whereEmp AND $whereDate");

                // Insert record
                $insCols = [];
                $insVals = [];
                $insTypes = "";

                if (in_array('id', $attCols)) {
                    $idColInfo = $conn->query("SHOW COLUMNS FROM `attendance` LIKE 'id'")->fetch_assoc();
                    if ($idColInfo && strpos(strtolower($idColInfo['Type']), 'varchar') !== false) {
                        $insCols[] = "`id`";
                        $insVals[] = "ATT-" . substr(time(), -4) . rand(10, 99);
                        $insTypes .= "s";
                    }
                }
                if (in_array('employee_id', $attCols)) {
                    $insCols[] = "`employee_id`";
                    $insVals[] = $empId;
                    $insTypes .= "s";
                }
                if (in_array('empId', $attCols)) {
                    $insCols[] = "`empId`";
                    $insVals[] = $empId;
                    $insTypes .= "s";
                }
                if (in_array('empName', $attCols)) {
                    $insCols[] = "`empName`";
                    $insVals[] = $empName;
                    $insTypes .= "s";
                }
                if (in_array('attendance_date', $attCols)) {
                    $insCols[] = "`attendance_date`";
                    $insVals[] = $targetDate;
                    $insTypes .= "s";
                }
                if (in_array('date', $attCols)) {
                    $insCols[] = "`date`";
                    $insVals[] = $targetDate;
                    $insTypes .= "s";
                }
                if (in_array('attendance_time', $attCols)) {
                    $insCols[] = "`attendance_time`";
                    $insVals[] = $time;
                    $insTypes .= "s";
                }
                if (in_array('time', $attCols)) {
                    $insCols[] = "`time`";
                    $insVals[] = $time;
                    $insTypes .= "s";
                }
                if (in_array('signOutTime', $attCols) && !empty($signOutTime)) {
                    $insCols[] = "`signOutTime`";
                    $insVals[] = $signOutTime;
                    $insTypes .= "s";
                }
                if (in_array('workingHours', $attCols) && !empty($workingHours)) {
                    $insCols[] = "`workingHours`";
                    $insVals[] = $workingHours;
                    $insTypes .= "s";
                }
                if (in_array('status', $attCols)) {
                    $insCols[] = "`status`";
                    $insVals[] = "PRESENT";
                    $insTypes .= "s";
                }
                if (in_array('withinPerimeter', $attCols)) {
                    $insCols[] = "`withinPerimeter`";
                    $insVals[] = 1;
                    $insTypes .= "i";
                }
                if (in_array('distance_from_location', $attCols)) {
                    $insCols[] = "`distance_from_location`";
                    $insVals[] = 0;
                    $insTypes .= "i";
                }
                if (in_array('distanceMeters', $attCols)) {
                    $insCols[] = "`distanceMeters`";
                    $insVals[] = 0;
                    $insTypes .= "i";
                }
                if (in_array('accuracy', $attCols)) {
                    $insCols[] = "`accuracy`";
                    $insVals[] = "99.0";
                    $insTypes .= "s";
                }
                if (in_array('capturedPhoto', $attCols) && !empty($facePhoto)) {
                    $insCols[] = "`capturedPhoto`";
                    $insVals[] = $facePhoto;
                    $insTypes .= "s";
                }

                $placeholders = implode(", ", array_fill(0, count($insCols), "?"));
                $insStmt = $conn->prepare("INSERT INTO `attendance` (" . implode(", ", $insCols) . ") VALUES ($placeholders)");
                if ($insStmt) {
                    $insStmt->bind_param($insTypes, ...$insVals);
                    $insStmt->execute();
                    $insStmt->close();
                }
                echo json_encode([
                    "success" => true,
                    "message" => "Attendance marked PRESENT for $empName on $targetDate (Check-in: $time" . ($signOutTime ? ", Sign-out: $signOutTime" : "") . ")",
                    "data" => [
                        "empId" => $empId,
                        "empName" => $empName,
                        "date" => $targetDate,
                        "time" => $time,
                        "signOutTime" => $signOutTime,
                        "workingHours" => $workingHours,
                        "status" => "PRESENT"
                    ]
                ]);
            }
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error adjusting attendance: " . $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 11. OFFICE GEOFENCE SETTINGS
    // -------------------------------------------------------------
    case 'get_office':
        try {
            $res = $conn->query("SELECT name, address, lat, lng, radiusMeters FROM `office_settings` ORDER BY id DESC LIMIT 1");
            if ($res && ($row = $res->fetch_assoc())) {
                echo json_encode([
                    "success" => true,
                    "data" => [
                        "name" => $row['name'],
                        "address" => $row['address'],
                        "lat" => (float)$row['lat'],
                        "lng" => (float)$row['lng'],
                        "radiusMeters" => (int)$row['radiusMeters']
                    ]
                ]);
            } else {
                // Default office
                echo json_encode([
                    "success" => true,
                    "data" => [
                        "name" => "GSR Broadband Main Office (Powerpet, Eluru)",
                        "address" => "22C-11-21, Chunduri Vari Choultry, Powerpet, Eluru, Andhra Pradesh 534002",
                        "lat" => 16.7107,
                        "lng" => 81.0952,
                        "radiusMeters" => 50
                    ]
                ]);
            }
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        break;

    case 'save_office':
        try {
            $name = isset($payload['name']) ? $payload['name'] : 'GSR Broadband Office';
            $address = isset($payload['address']) ? $payload['address'] : '';
            $lat = isset($payload['lat']) ? (float)$payload['lat'] : 16.7107;
            $lng = isset($payload['lng']) ? (float)$payload['lng'] : 81.0952;
            $radiusMeters = isset($payload['radiusMeters']) ? (int)$payload['radiusMeters'] : 50;

            $conn->query("DELETE FROM `office_settings`");
            $stmt = $conn->prepare("INSERT INTO `office_settings` (`name`, `address`, `lat`, `lng`, `radiusMeters`) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssddi", $name, $address, $lat, $lng, $radiusMeters);
            $stmt->execute();
            $stmt->close();

            echo json_encode(["success" => true, "message" => "Office location saved"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        break;

    // -------------------------------------------------------------
    // 12. CLEAR ALL ATTENDANCE DATA (Permanent Removal)
    // -------------------------------------------------------------
    case 'clear_attendance':
        try {
            $conn->query("DELETE FROM `attendance`");
            $affected = $conn->affected_rows;
            @$conn->query("ALTER TABLE `attendance` AUTO_INCREMENT = 1");

            echo json_encode([
                "success" => true,
                "message" => "All attendance records permanently removed from database",
                "affectedRows" => $affected
            ]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Database error clearing attendance: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid action specified: " . htmlspecialchars($action)]);
        break;
}
