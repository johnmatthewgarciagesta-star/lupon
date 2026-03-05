$word = New-Object -ComObject Word.Application
$files = Get-ChildItem "C:\Users\Gabriel\Desktop\CAPSTONE\WORD NG LUPON\*.docx"
foreach ($file in $files) {
    if ($file.Name -match "^([a-z_]+)_\d{8}_\d{6}\.docx$") {
        $type = $matches[1]
        $pdfPath = "C:\Users\Gabriel\Herd\Lupon\public\forms\" + $type + ".pdf"
        $wordPath = "C:\Users\Gabriel\Herd\Lupon\public\forms\" + $type + ".docx"
        
        Write-Host "Converting $($file.Name) to $type"
        
        # Copy docx for download purposes
        Copy-Item $file.FullName -Destination $wordPath -Force
        
        # Convert to PDF for system preview
        $doc = $word.Documents.Open($file.FullName)
        $doc.SaveAs([ref]$pdfPath, [ref]17)
        $doc.Close()
    }
}
$word.Quit()
Write-Host "Done"
