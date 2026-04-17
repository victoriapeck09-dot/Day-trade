$env:PATH = "C:\Program Files\nodejs;$env:PATH"
$env:NODE_PATH = "C:\Program Files\nodejs"
cd "C:\Users\Family\Documents\Code Elevation\Day trading"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& "C:\Program Files\nodejs\npm.cmd" run dev