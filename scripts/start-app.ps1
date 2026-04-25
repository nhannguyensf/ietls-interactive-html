$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$port = 8080
$prefix = "http://127.0.0.1:$port/"
$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
}

function Send-Response($stream, $status, $contentType, [byte[]] $body) {
  $reason = if ($status -eq 200) { "OK" } else { "Not Found" }
  $header = "HTTP/1.1 $status $reason`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $port)
$listener.Start()

Write-Host "IELTS Practice app is running at $prefix"
Write-Host "Open $($prefix)app/listening_test.html"
Write-Host "Press Ctrl+C to stop."

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $buffer = New-Object byte[] 4096
    $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
    if ($bytesRead -le 0) { continue }

    $request = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
    $requestLine = ($request -split "`r?`n")[0]
    $parts = $requestLine -split " "
    $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
    $requestPath = [Uri]::UnescapeDataString(($requestPath -split "\?")[0].TrimStart("/"))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "app/listening_test.html"
    }

    $candidatePath = Join-Path $root $requestPath
    $resolvedPath = [System.IO.Path]::GetFullPath($candidatePath)
    $resolvedRoot = [System.IO.Path]::GetFullPath($root)

    if (-not $resolvedPath.StartsWith($resolvedRoot) -or -not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
      Send-Response $stream 404 "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("Not found"))
      continue
    }

    $extension = [System.IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()
    $contentType = $mimeTypes[$extension]
    if (-not $contentType) {
      $contentType = "application/octet-stream"
    }

    Send-Response $stream 200 $contentType ([System.IO.File]::ReadAllBytes($resolvedPath))
  } finally {
    $client.Close()
  }
}
