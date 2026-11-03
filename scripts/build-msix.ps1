# NOVA — Microsoft Store MSIX Automated Multi-Architecture Packaging & WACK Certification Script
# Target Platforms: Windows 10 (Build 17763+), Windows 11 (64-bit / ARM64)
# Requirements: Windows SDK (MakeAppx.exe, SignTool.exe, appcert.exe), Node.js 22, Rust (x86_64 and aarch64 MSVC targets)

param(
    [string]$IdentityName = "ChetanDixit.NOVANOTCH",
    [string]$Publisher = "CN=1635A490-94F8-403E-9B36-79A1AE02E253",
    [string]$PublisherDisplayName = "Chetan Dixit",
    [string]$Version = "1.0.0.0",
    [string]$StoreID = "9PNBBD1G9ZW9",
    [string]$PackageFamilyName = "ChetanDixit.NOVANOTCH_r4gq9kq12zn2y",
    [ValidateSet("x64", "arm64", "both")]
    [string]$Architecture = "both",
    [switch]$SkipWack = $false,
    [switch]$SelfSign = $true
)

$ErrorActionPreference = "Stop"
$RootPath = Resolve-Path "$PSScriptRoot\.."
Set-Location $RootPath

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  NOVA — Microsoft Store Packaging & Certification Pipeline      " -ForegroundColor Cyan
Write-Host "  Identity:  $IdentityName" -ForegroundColor White
Write-Host "  Publisher: $Publisher" -ForegroundColor White
Write-Host "  Version:   $Version" -ForegroundColor White
Write-Host "  Target:    $Architecture" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Locate Windows SDK Tools
Write-Host "`n[1/6] Scanning for Windows 10/11 SDK Toolchain..." -ForegroundColor Yellow
$sdkBin = Get-ChildItem -Path "${env:ProgramFiles(x86)}\Windows Kits\10\bin\10.*" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1

$MakeAppx = $null
$SignTool = $null
$WackExe = $null

if ($sdkBin) {
    $x64Bin = Join-Path $sdkBin.FullName "x64"
    if (Test-Path "$x64Bin\MakeAppx.exe") { $MakeAppx = "$x64Bin\MakeAppx.exe" }
    if (Test-Path "$x64Bin\signtool.exe") { $SignTool = "$x64Bin\signtool.exe" }
}

$wackSearch = Get-ChildItem -Path "${env:ProgramFiles(x86)}\Windows Kits\10\App Certification Kit" -Filter "appcert.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if ($wackSearch) { $WackExe = $wackSearch.FullName }

if (-not $MakeAppx) {
    $MakeAppx = (Get-Command MakeAppx.exe -ErrorAction SilentlyContinue).Source
}
if (-not $SignTool) {
    $SignTool = (Get-Command signtool.exe -ErrorAction SilentlyContinue).Source
}

Write-Host "  MakeAppx: $($MakeAppx ?? 'NOT FOUND (Install Windows SDK)')" -ForegroundColor $(if ($MakeAppx) { "Green" } else { "Red" })
Write-Host "  SignTool: $($SignTool ?? 'NOT FOUND (Install Windows SDK)')" -ForegroundColor $(if ($SignTool) { "Green" } else { "Yellow" })
Write-Host "  WACK:     $($WackExe ?? 'NOT FOUND (Install Windows App Certification Kit)')" -ForegroundColor $(if ($WackExe) { "Green" } else { "Yellow" })

# 2. Update Manifest & Configuration with Exact Identity Values
Write-Host "`n[2/6] Applying Package Identity & Publisher Configurations..." -ForegroundColor Yellow
$manifestPath = "$RootPath\src-tauri\AppxManifest.xml"
$tauriConfPath = "$RootPath\src-tauri\tauri.conf.json"

if (Test-Path $manifestPath) {
    $manifestContent = Get-Content $manifestPath -Raw
    $manifestContent = [regex]::Replace($manifestContent, 'Name="[^"]+"', "Name=`"$IdentityName`"", 1)
    $manifestContent = [regex]::Replace($manifestContent, 'Publisher="[^"]+"', "Publisher=`"$Publisher`"", 1)
    $manifestContent = [regex]::Replace($manifestContent, 'Version="[^"]+"', "Version=`"$Version`"", 1)
    $manifestContent = [regex]::Replace($manifestContent, '<PublisherDisplayName>[^<]+</PublisherDisplayName>', "<PublisherDisplayName>$PublisherDisplayName</PublisherDisplayName>")
    Set-Content -Path $manifestPath -Value $manifestContent -Encoding UTF8
    Write-Host "  Updated $manifestPath" -ForegroundColor Green
}

if (Test-Path $tauriConfPath) {
    $tauriContent = Get-Content $tauriConfPath -Raw
    $tauriContent = [regex]::Replace($tauriContent, '"name":\s*"[^"]+"', "`"name`": `"$IdentityName`"")
    $tauriContent = [regex]::Replace($tauriContent, '"publisher":\s*"[^"]+"', "`"publisher`": `"$Publisher`"")
    $tauriContent = [regex]::Replace($tauriContent, '"version":\s*"[^"]+"', "`"version`": `"$Version`"")
    Set-Content -Path $tauriConfPath -Value $tauriContent -Encoding UTF8
    Write-Host "  Updated $tauriConfPath" -ForegroundColor Green
}

# 3. Compile Production Web Bundle
Write-Host "`n[3/6] Building Production React/Vite Frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Vite build failed with code $LASTEXITCODE" }
Write-Host "  Vite production bundle ready in ./dist" -ForegroundColor Green

# 4. Compile Native Tauri Packages
Write-Host "`n[4/6] Compiling Tauri Native Windows Packages ($Architecture)..." -ForegroundColor Yellow
$OutputDir = "$RootPath\target\store_packages"
$StagingDir = "$RootPath\target\bundle_staging"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $StagingDir | Out-Null

$targets = @()
if ($Architecture -eq "x64" -or $Architecture -eq "both") { $targets += "x86_64-pc-windows-msvc" }
if ($Architecture -eq "arm64" -or $Architecture -eq "both") { $targets += "aarch64-pc-windows-msvc" }

foreach ($target in $targets) {
    $archTag = if ($target -match "x86_64") { "x64" } else { "arm64" }
    Write-Host "  --> Compiling target: $target ($archTag)..." -ForegroundColor Cyan
    npx @tauri-apps/cli build --target $target --bundles msix
    
    $generatedMsix = Get-ChildItem -Path "$RootPath\src-tauri\target\$target\release\bundle\msix\*.msix" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($generatedMsix) {
        $destName = "NOVA_${Version}_$archTag.msix"
        Copy-Item -Path $generatedMsix.FullName -Destination "$OutputDir\$destName" -Force
        Copy-Item -Path $generatedMsix.FullName -Destination "$StagingDir\$destName" -Force
        Write-Host "  Successfully staged: $OutputDir\$destName" -ForegroundColor Green
    } else {
        Write-Warning "Tauri CLI did not output .msix for $target. Check build logs."
    }
}

# 5. Create MSIXBundle (if both architectures or MakeAppx is present)
$BundleFile = "$OutputDir\NOVA_${Version}_MultiArch.msixbundle"
if ($MakeAppx) {
    $msixCount = (Get-ChildItem -Path $StagingDir -Filter "*.msix").Count
    if ($msixCount -gt 0) {
        Write-Host "`n[5/6] Creating Unified Multi-Architecture MSIXBundle..." -ForegroundColor Yellow
        & $MakeAppx bundle /d $StagingDir /p $BundleFile /v
        if (Test-Path $BundleFile) {
            Write-Host "  MSIXBundle created: $BundleFile" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n[5/6] MakeAppx not found in PATH. Skipping local bundle generation." -ForegroundColor Yellow
}

# 6. Windows App Certification Kit (WACK) Real Execution
if (-not $SkipWack) {
    Write-Host "`n[6/6] Executing Windows App Certification Kit (WACK)..." -ForegroundColor Yellow
    if ($WackExe) {
        $packageToTest = if (Test-Path $BundleFile) { $BundleFile } else { (Get-ChildItem -Path $OutputDir -Filter "*.msix" | Select-Object -First 1).FullName }
        if ($packageToTest) {
            $reportXml = "$OutputDir\WACK-Certification-Report.xml"
            Write-Host "  Testing package: $packageToTest" -ForegroundColor Cyan
            Write-Host "  Output report:   $reportXml" -ForegroundColor Cyan
            & $WackExe test -appxpackagepath $packageToTest -reportoutputpath $reportXml
            Write-Host "  WACK Execution completed! Real report saved to $reportXml" -ForegroundColor Green
        } else {
            Write-Warning "No generated MSIX/MSIXBundle found in $OutputDir to test."
        }
    } else {
        Write-Warning "appcert.exe not found on this machine. WACK can be executed on any Windows machine with Windows SDK installed or via GitHub Actions."
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  Packaging Pipeline Finished!" -ForegroundColor Green
Write-Host "  Output Directory: $OutputDir" -ForegroundColor White
Get-ChildItem -Path $OutputDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
Write-Host "=================================================================" -ForegroundColor Cyan
