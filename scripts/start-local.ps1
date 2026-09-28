param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$appUrl = 'http://127.0.0.1:8087/'
$runtimeDir = Join-Path $projectDir '.launcher'

function Test-App {
    try {
        $response = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content.Contains('Aesthetic Sample Analyzer')
    } catch { return $false }
}

try {
    if (Test-App) {
        Write-Host 'Already running. Opening your local library.'
        if (-not $NoBrowser) { Start-Process $appUrl }
        exit 0
    }
    $probe = New-Object System.Net.Sockets.TcpClient
    try {
        $connection = $probe.ConnectAsync('127.0.0.1', 8087)
        if ($connection.Wait(500) -and $probe.Connected) {
            throw 'Port 8087 is occupied or the app is still starting. Wait a moment and try again. No other process was stopped.'
        }
    } catch [System.AggregateException] {
        # Connection refused: the fixed library origin is available.
    } finally { $probe.Dispose() }

    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    $nodeExe = if ($nodeCommand) { $nodeCommand.Source } else {
        Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    }
    if (-not (Test-Path -LiteralPath $nodeExe)) { throw 'Node.js was not found. Install Node.js or start from Codex.' }
    $viteFile = Join-Path $projectDir 'node_modules\vite\bin\vite.js'
    if (-not (Test-Path -LiteralPath $viteFile)) { throw 'Project dependencies are missing. Install them with npm ci before starting.' }

    # Match the existing app-env wrapper: only VITE_ strings, existing env wins.
    $configPath = Join-Path $projectDir '.grok\app-env.json'
    if (Test-Path -LiteralPath $configPath) {
        $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
        foreach ($property in $config.PSObject.Properties) {
            if ($property.Name.StartsWith('VITE_') -and $property.Value -is [string] -and $null -eq [Environment]::GetEnvironmentVariable($property.Name)) {
                [Environment]::SetEnvironmentVariable($property.Name, $property.Value, 'Process')
            }
        }
    }
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $outLog = Join-Path $runtimeDir "$stamp-output.log"
    $errLog = Join-Path $runtimeDir "$stamp-error.log"
    $server = Start-Process -FilePath $nodeExe -ArgumentList @('"' + $viteFile + '"', 'dev', '--host', '127.0.0.1', '--port', '8087', '--strictPort') -WorkingDirectory $projectDir -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
    Write-Host 'Starting Aesthetic Sample Analyzer...'
    $deadline = (Get-Date).AddSeconds(60)
    while ((Get-Date) -lt $deadline) {
        if (Test-App) {
            Write-Host "Ready: $appUrl"
            Write-Host 'The local server runs in the background until Windows restarts.'
            Write-Host 'Your images stay in this browser. Use Profile > Export library for backups.'
            if (-not $NoBrowser) { Start-Process $appUrl }
            exit 0
        }
        $server.Refresh()
        if ($server.HasExited) { throw "The server stopped. See logs in $runtimeDir" }
        Start-Sleep -Milliseconds 500
    }
    throw "Startup did not finish within 60 seconds. See logs in $runtimeDir. No other process was stopped."
} catch {
    Write-Host "Could not start: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
