$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $projectRoot 'docker.test.env'

if (Test-Path $configPath) {
  throw 'docker.test.env already exists. Keep it private; remove it yourself only if you intend to regenerate local test credentials.'
}

function New-RandomBytes([int]$byteCount) {
  $bytes = New-Object byte[] $byteCount
  $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $generator.GetBytes($bytes)
  } finally {
    $generator.Dispose()
  }
  return ,$bytes
}

$mysqlPassword = [BitConverter]::ToString((New-RandomBytes 32)).Replace('-', '')
$jwtSecret = [BitConverter]::ToString((New-RandomBytes 32)).Replace('-', '')
$encryptionKey = [Convert]::ToBase64String((New-RandomBytes 32))

$contents = @(
  "MYSQL_PASSWORD=$mysqlPassword"
  'MYSQL_DATABASE=chopwise'
  "JWT_SECRET=$jwtSecret"
  "CONFIG_ENCRYPTION_KEY=$encryptionKey"
  'ADMIN_UIDS='
  'GEMINI_API_KEY='
  'GEMINI_MODEL='
)
[System.IO.File]::WriteAllLines($configPath, $contents, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Created docker.test.env with random local-only credentials. Do not share or commit this file.'
