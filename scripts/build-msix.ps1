# NOVA NOTCH — Microsoft Store MSIX Automated Multi-Architecture Packaging & WACK Certification Script
# Runtime: Electron + Electron Builder (Desktop Bridge / Windows.FullTrustApplication)
# Target Platforms: Windows 10 (Build 17763+), Windows 11 (x64 / ARM64)
# Requirements: Windows 10/11 SDK (MakeAppx.exe, SignTool.exe, appcert.exe), Node.js 22+

param(
    [string]$IdentityName = "ChetanDixit.NOVANOTCH",
    [string]$Publisher = "CN=1635A490-94F8-403E-9B36-79A1AE02E253",
    [string]$PublisherDisplayName = "Chetan Dixit",
    [string]$ProductName = "NOVA NOTCH",
    [string]$Version = "1.0.2.0",
    [string]$StoreID = "9PNBBD1G9ZW9",
    [string]$PackageFamilyName = "ChetanDixit.NOVANOTCH_r4gq9kq12zn2y",
    [ValidateSet("x64", "arm64", "both")]
    [string]$Architecture = "both",
    [switch]$SkipWack = $false,
    [switch]$SelfSign = $false
)

$ErrorActionPreference = "Stop"
$RootPath = Resolve-Path "$PSScriptRoot\.."
Set-Location $RootPath

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  NOVA NOTCH — Electron Microsoft Store MSIX Packaging Pipeline  " -ForegroundColor Cyan
Write-Host "  Product:   $ProductName" -ForegroundColor White
Write-Host "  Identity:  $IdentityName" -ForegroundColor White
Write-Host "  Publisher: $Publisher" -ForegroundColor White
Write-Host "  Display:   $PublisherDisplayName" -ForegroundColor White
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

Write-Host "  MakeAppx: $($MakeAppx ?? 'Bundled via Electron Builder / Install Windows SDK for MSIXBundle')" -ForegroundColor $(if ($MakeAppx) { "Green" } else { "Yellow" })
Write-Host "  SignTool: $($SignTool ?? 'Optional (Partner Center signs Store submissions automatically)')" -ForegroundColor $(if ($SignTool) { "Green" } else { "Yellow" })
Write-Host "  WACK:     $($WackExe ?? 'NOT FOUND (Install Windows App Certification Kit)')" -ForegroundColor $(if ($WackExe) { "Green" } else { "Yellow" })

# 2. Synchronize Version & Partner Center Identity in package.json and electron-builder.json
Write-Host "`n[2/6] Synchronizing Store Identity & Quad-Version ($Version)..." -ForegroundColor Yellow
$versionParts = $Version -split '\.'
while ($versionParts.Count -lt 4) { $versionParts += "0" }
$semVer = "$($versionParts[0]).$($versionParts[1]).$($versionParts[2])"
$revisionNum = $versionParts[3]

$packageJsonPath = "$RootPath\package.json"
$builderJsonPath = "$RootPath\electron-builder.json"

if (Test-Path $packageJsonPath) {
    $pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    $pkg.version = $semVer
    $pkg.productName = $ProductName
    $pkg | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath -Encoding UTF8
    Write-Host "  Updated package.json -> version: $semVer, productName: $ProductName" -ForegroundColor Green
}

if (Test-Path $builderJsonPath) {
    $eb = Get-Content $builderJsonPath -Raw | ConvertFrom-Json
    $eb.appId = $IdentityName
    $eb.productName = $ProductName
    $eb.buildVersion = $Version
    if ($revisionNum -ne "0") {
        $eb | Add-Member -NotePropertyName "buildNumber" -NotePropertyValue $revisionNum -Force
        $eb.appx | Add-Member -NotePropertyName "setBuildNumber" -NotePropertyValue $true -Force
    }
    $eb.appx.identityName = $IdentityName
    $eb.appx.publisher = $Publisher
    $eb.appx.publisherDisplayName = $PublisherDisplayName
    $eb.appx.displayName = $ProductName
    $eb.appx.artifactName = "NOVA-NOTCH-${Version}-`${arch}.msix"
    $eb | ConvertTo-Json -Depth 12 | Set-Content -Path $builderJsonPath -Encoding UTF8
    Write-Host "  Updated electron-builder.json -> Identity: $IdentityName, Version: $Version" -ForegroundColor Green
}

# 3. Compile Production React + Vite Frontend
Write-Host "`n[3/6] Building Production React + Vite Frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Vite production build failed with code $LASTEXITCODE" }
Write-Host "  Vite production bundle ready in ./dist" -ForegroundColor Green

# 4. Build Electron MSIX Packages via Electron Builder
Write-Host "`n[4/6] Building Electron MSIX Packages ($Architecture)..." -ForegroundColor Yellow
$OutputDir = "$RootPath\release\store_packages"
$StagingDir = "$RootPath\release\bundle_staging"
if (Test-Path $OutputDir) { Remove-Item -Recurse -Force $OutputDir }
if (Test-Path $StagingDir) { Remove-Item -Recurse -Force $StagingDir }
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $StagingDir | Out-Null

if (-not $SelfSign) {
    # Partner Center signs uploaded MSIX packages with Microsoft's Store certificate.
    $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
}

$archFlags = @()
if ($Architecture -eq "x64" -or $Architecture -eq "both") { $archFlags += "--x64" }
if ($Architecture -eq "arm64" -or $Architecture -eq "both") { $archFlags += "--arm64" }

$ebArgs = @("electron-builder", "--win", "appx") + $archFlags + @("--publish", "never", "--config", "electron-builder.json")
Write-Host "  --> Running: npx $($ebArgs -join ' ')" -ForegroundColor Cyan
& npx @ebArgs
if ($LASTEXITCODE -ne 0) { throw "Electron Builder MSIX packaging failed with code $LASTEXITCODE" }

$generatedMsixFiles = Get-ChildItem -Path "$RootPath\release\*.msix" -ErrorAction SilentlyContinue
if (-not $generatedMsixFiles -or $generatedMsixFiles.Count -eq 0) {
    throw "No .msix packages were found in ./release after electron-builder completed."
}

foreach ($msix in $generatedMsixFiles) {
    Copy-Item -Path $msix.FullName -Destination "$OutputDir\$($msix.Name)" -Force
    Copy-Item -Path $msix.FullName -Destination "$StagingDir\$($msix.Name)" -Force
    Write-Host "  Staged MSIX package: $OutputDir\$($msix.Name)" -ForegroundColor Green
}

# 5. Create Unified Multi-Architecture MSIXBundle (when MakeAppx is available and >1 arch or requested)
$BundleFile = "$OutputDir\NOVA-NOTCH_${Version}_MultiArch.msixbundle"
if ($MakeAppx) {
    $msixCount = (Get-ChildItem -Path $StagingDir -Filter "*.msix").Count
    if ($msixCount -gt 0) {
        Write-Host "`n[5/6] Creating Unified Multi-Architecture MSIXBundle..." -ForegroundColor Yellow
        & $MakeAppx bundle /o /d $StagingDir /p $BundleFile /v
        if (Test-Path $BundleFile) {
            Write-Host "  MSIXBundle created: $BundleFile" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`n[5/6] MakeAppx.exe not found in PATH; individual .msix packages are ready in $OutputDir." -ForegroundColor Yellow
}

# 6. Windows App Certification Kit (WACK) Execution
if (-not $SkipWack) {
    Write-Host "`n[6/6] Executing Windows App Certification Kit (WACK)..." -ForegroundColor Yellow
    if ($WackExe) {
        $packageToTest = if (Test-Path $BundleFile) { $BundleFile } else { (Get-ChildItem -Path $OutputDir -Filter "*.msix" | Select-Object -First 1).FullName }
        if ($packageToTest) {
            $reportXml = "$OutputDir\WACK-Certification-Report.xml"
            Write-Host "  Testing package: $packageToTest" -ForegroundColor Cyan
            Write-Host "  Output report:   $reportXml" -ForegroundColor Cyan
            & $WackExe test -appxpackagepath $packageToTest -reportoutputpath $reportXml
            Write-Host "  WACK Execution completed! Report saved to $reportXml" -ForegroundColor Green
        } else {
            Write-Warning "No generated MSIX/MSIXBundle found in $OutputDir to test."
        }
    } else {
        Write-Warning "appcert.exe not found on this machine. Install the Windows App Certification Kit via Windows SDK to run local WACK validation."
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  Electron MSIX Packaging Pipeline Finished!" -ForegroundColor Green
Write-Host "  Output Directory: $OutputDir" -ForegroundColor White
Get-ChildItem -Path $OutputDir | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
Write-Host "=================================================================" -ForegroundColor Cyan
