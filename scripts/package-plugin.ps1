$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $root 'release'
$stagingDir = Join-Path $releaseDir 'plugin-package'
$pluginManifest = Join-Path $root 'plugin.json'
$pluginData = Get-Content -Raw -Path $pluginManifest | ConvertFrom-Json
$zipPath = Join-Path $releaseDir ("{0}-{1}.zip" -f $pluginData.name, $pluginData.version)
$tempZipPath = Join-Path $releaseDir ("{0}-{1}.tmp.zip" -f $pluginData.name, $pluginData.version)

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force -Path $stagingDir
}

New-Item -ItemType Directory -Force -Path $stagingDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stagingDir 'agents') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $stagingDir '.github\plugin') | Out-Null

Copy-Item -Path (Join-Path $root 'plugin.json') -Destination (Join-Path $stagingDir 'plugin.json') -Force
Copy-Item -Path (Join-Path $root 'README.md') -Destination (Join-Path $stagingDir 'README.md') -Force
Copy-Item -Path (Join-Path $root 'CHANGELOG.md') -Destination (Join-Path $stagingDir 'CHANGELOG.md') -Force
Copy-Item -Path (Join-Path $root 'LICENSE') -Destination (Join-Path $stagingDir 'LICENSE') -Force
Copy-Item -Path (Join-Path $root '.github\plugin\plugin.json') -Destination (Join-Path $stagingDir '.github\plugin\plugin.json') -Force
Copy-Item -Path (Join-Path $root 'agents\*') -Destination (Join-Path $stagingDir 'agents') -Recurse -Force

if (Test-Path $tempZipPath) {
    Remove-Item -Force -Path $tempZipPath
}

Compress-Archive -Path (Join-Path $stagingDir '*') -DestinationPath $tempZipPath -Force

$finalZipPath = $zipPath

try {
    if (Test-Path $zipPath) {
        Remove-Item -Force -Path $zipPath
    }

    Move-Item -Path $tempZipPath -Destination $zipPath -Force
}
catch {
    $finalZipPath = Join-Path $releaseDir ("{0}-{1}-{2}.zip" -f $pluginData.name, $pluginData.version, (Get-Date -Format 'yyyyMMddHHmmss'))

    if (Test-Path $finalZipPath) {
        Remove-Item -Force -Path $finalZipPath
    }

    Move-Item -Path $tempZipPath -Destination $finalZipPath -Force
}

Write-Host ("Packaged Agent Plugin: {0}" -f $finalZipPath)