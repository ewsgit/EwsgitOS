# Powershell Initialization Script
# EwsgitOS © 2025 Ewsgit

# Is running as admin
if (!(New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "EwsgitOS installation script must be run as admin! EwsgitOS installation will not continue."
    exit
}

# Does WinGet exist
if (!(Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error "WinGet is not installed! EwsgitOS installation will not continue."
    exit
}

# Install NodeJS LTS
winget.exe install --id OpenJS.NodeJS.LTS

# Reload path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Enable CorePack
corepack.cmd enable

# Install dependencies for EwsgitOS installation
pnpm.ps1 install

# Install BunJS
winget.exe install --id Oven-sh.Bun

# Reload path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$env:HAS_STARTED_FROM_SCRIPT = 1

# Install EwsgitOS
pnpm run install-ewsgitos