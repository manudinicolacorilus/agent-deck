# mock-agent.ps1 — Simulates a Copilot-like agent for development
param(
    [string]$Prompt = "Hello"
)

$ESC = [char]27

Write-Host "${ESC}[1;36m╔══════════════════════════════════════╗${ESC}[0m"
Write-Host "${ESC}[1;36m║  Mock Copilot Agent v0.1.0           ║${ESC}[0m"
Write-Host "${ESC}[1;36m╚══════════════════════════════════════╝${ESC}[0m"
Write-Host ""
Write-Host "${ESC}[33m▶ Received prompt:${ESC}[0m $Prompt"
Write-Host ""

# Simulate thinking
for ($i = 1; $i -le 5; $i++) {
    Write-Host "${ESC}[2m  Thinking... step $i/5${ESC}[0m"
    Start-Sleep -Milliseconds 800
}

Write-Host ""
Write-Host "${ESC}[1;32m✔ Analysis complete${ESC}[0m"
Write-Host ""
Write-Host "${ESC}[37mI would help you with: ${ESC}[1m$Prompt${ESC}[0m"
Write-Host ""
Write-Host "${ESC}[2mFiles analyzed: 42 | Tokens used: 1,337${ESC}[0m"
Write-Host ""

# Interactive loop
while ($true) {
    Write-Host -NoNewline "${ESC}[1;35m❯ ${ESC}[0m"
    $input = Read-Host
    if ($input -eq "exit" -or $input -eq "quit") {
        Write-Host "${ESC}[33mGoodbye!${ESC}[0m"
        break
    }
    Write-Host "${ESC}[36m  Echo: $input${ESC}[0m"
}
