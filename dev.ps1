# dev.ps1
param (
    [ValidateSet("start", "stop")]
    [string]$action = "start"
)

# Paths (adjust if your folders are named differently)
$backendPath = "C:\Users\Mizo\vmserver\sokirka.com\photography-portfolio\backend"
$frontendPath = "C:\Users\Mizo\vmserver\sokirka.com\photography-portfolio\frontend"

# PIDs storage file
$pidFile = ".\dev-processes.json"

function Start-Backend {
    Write-Host "🚀 Starting Backend (NestJS)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backendPath`"; npm run start:dev" -PassThru
}

function Start-Frontend {
    Write-Host "🚀 Starting Frontend (Next.js)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontendPath`"; npm run dev" -PassThru
}

function Start-All {
    $backend = Start-Backend
    $frontend = Start-Frontend

    $processes = @{
        backend  = $backend.Id
        frontend = $frontend.Id
    }

    $processes | ConvertTo-Json | Out-File $pidFile
    Write-Host "✅ Both backend and frontend started."
}

function Stop-All {
    if (Test-Path $pidFile) {
        $processes = Get-Content $pidFile | ConvertFrom-Json
        foreach ($pid in $processes.PSObject.Properties.Value) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "🛑 Stopped process ID $pid"
            } catch {
                Write-Host "⚠️ Could not stop process ID $pid (might already be closed)."
            }
        }
        Remove-Item $pidFile
    } else {
        Write-Host "⚠️ No process file found. Nothing to stop."
    }
}

if ($action -eq "start") {
    Start-All
} elseif ($action -eq "stop") {
    Stop-All
}
