# Script to reset MySQL root password
Write-Host "Stopping MySQL80 service..."
Stop-Service -Name "MySQL80" -Force -ErrorAction SilentlyContinue
net stop MySQL80

Write-Host "Resetting MySQL root password..."
$mysqldPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
$defaultsFile = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$initFile = "c:\Users\Gabriel\Herd\Lupon\mysql-init.txt"

$proc = Start-Process -FilePath $mysqldPath -ArgumentList "--defaults-file=`"$defaultsFile`"", "--init-file=`"$initFile`"" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 6

if ($proc -and -not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting MySQL80 service..."
Start-Service -Name "MySQL80" -ErrorAction SilentlyContinue
net start MySQL80
Write-Host "Password reset completed!"
