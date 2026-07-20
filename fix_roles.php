<?php
try {
    $dbh = new PDO('mysql:host=127.0.0.1;dbname=lupon', 'root', 'root');
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the user ID for kataru@gmail.com
    $stmt = $dbh->prepare("SELECT id FROM users WHERE email = 'kataru@gmail.com'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $userId = $user['id'];

        // Get the role ID for 'administrator'
        $stmt = $dbh->prepare("SELECT id FROM roles WHERE name = 'administrator'");
        $stmt->execute();
        $administratorRole = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$administratorRole) {
            echo "Role 'administrator' not found! Falling back to search...\n";
            $stmt = $dbh->prepare("SELECT * FROM roles");
            $stmt->execute();
            $allRoles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            print_r($allRoles);
        } else {
            $administratorRoleId = $administratorRole['id'];

            // Assign user to 'administrator' role
            // First delete existing roles for user
            $stmt = $dbh->prepare("DELETE FROM model_has_roles WHERE model_id = ?");
            $stmt->execute([$userId]);

            // Insert new role
            $stmt = $dbh->prepare("INSERT INTO model_has_roles (role_id, model_type, model_id) VALUES (?, 'App\\\\Models\\\\User', ?)");
            $stmt->execute([$administratorRoleId, $userId]);
            echo "Assigned 'administrator' role to kataru@gmail.com.\n";
        }
    } else {
        echo "User 'kataru@gmail.com' not found.\n";
    }

    // Now delete the 'Admin' role we incorrectly created
    $stmt = $dbh->prepare("SELECT id FROM roles WHERE name = 'Admin'");
    $stmt->execute();
    $adminRole = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($adminRole) {
        $adminRoleId = $adminRole['id'];
        
        // Remove mappings for the 'Admin' role
        $stmt = $dbh->prepare("DELETE FROM model_has_roles WHERE role_id = ?");
        $stmt->execute([$adminRoleId]);

        $stmt = $dbh->prepare("DELETE FROM role_has_permissions WHERE role_id = ?");
        $stmt->execute([$adminRoleId]);

        // Delete the role
        $stmt = $dbh->prepare("DELETE FROM roles WHERE id = ?");
        $stmt->execute([$adminRoleId]);
        echo "Deleted the incorrectly created 'Admin' role.\n";
    }

} catch (PDOException $e) {
    echo 'Error: ' . $e->getMessage();
}
