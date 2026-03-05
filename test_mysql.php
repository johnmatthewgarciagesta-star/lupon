<?php
try {
    $dbh = new PDO('mysql:host=127.0.0.1', 'root', 'root');
    $dbh->exec('CREATE DATABASE IF NOT EXISTS lupon');
    echo 'Connected and DB lupon created/exists.';
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
