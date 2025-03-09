import { Subprocess } from "bun";
import fs, { cpSync, existsSync } from "fs"

async function installWingetPackage(packageId: string, notAdmin?: boolean) {
  console.log(`Installing '${packageId}'...`)

  let proc: Subprocess<"ignore", "pipe", "pipe">;

  if (notAdmin) {
    proc = Bun.spawn([
                       "runas",
                       "/trustlevel:0x20000",
                       `${process.env.LOCALAPPDATA}/Microsoft/WindowsApps/winget.exe install --silent --accept-source-agreements --id ${packageId}`
                     ], { stdout: "pipe", stderr: "pipe" })
    console.warn(
        "This package was installed without admin privileges, we cannot verify if it was installed successfully!")
    return true
  } else {
    proc = Bun.spawn([
                       `${process.env.LOCALAPPDATA}/Microsoft/WindowsApps/winget.exe`,
                       "install",
                       "--silent",
                       "--accept-source-agreements",
                       "--id",
                       packageId
                     ], { stdout: "pipe", stderr: "pipe" })
  }

  let fullStdout = ""
  let textDecoder = new TextDecoder()

  // @ts-ignore
  for await (const chunk of proc.stdout) {
    process.stdout.write(packageId + ": ")
    process.stdout.write(chunk)
    fullStdout += textDecoder.decode(chunk)
  }

  // @ts-ignore
  for await (const chunk of proc.stderr) {
    process.stderr.write(packageId + ": ")
    process.stderr.write(chunk)
    fullStdout += packageId + ": "
  }

  if (fullStdout.includes("Successfully installed") || fullStdout.includes(
      "No newer package versions are available") || fullStdout.includes(
      "The package cannot be upgraded using winget.") || fullStdout.includes(
      " install technology is different from the current version installed.")) return true

  return false
}

async function executeCommand(command: string[]) {
  const proc = Bun.spawn(command, { stdout: "pipe", stderr: "pipe" })

  let fullStdout = ""
  let textDecoder = new TextDecoder()

  // @ts-ignore
  for await (const chunk of proc.stdout) {
    process.stdout.write(chunk)
    fullStdout += textDecoder.decode(chunk)
  }

  // @ts-ignore
  for await (const chunk of proc.stderr) {
    process.stderr.write(chunk)
  }
}

async function exitOnFalse(func: () => boolean | Promise<boolean>) {
  if (!(await func())) {
    console.error("Installation failed!")
    process.exit(1)
  }
}

export default async function installWindows() {
  console.log("Starting package installation...")
  await Promise.all([
                      exitOnFalse(() => installWingetPackage("Alacritty.Alacritty")),
                      exitOnFalse(() => installWingetPackage("Microsoft.VisualStudioCode")),
                      exitOnFalse(() => installWingetPackage("Neovim.Neovim")),
                      exitOnFalse(() => installWingetPackage("Git.Git")),
                      exitOnFalse(() => installWingetPackage("Docker.DockerDesktop")),
                      exitOnFalse(() => installWingetPackage("Alex313031.Thorium.AVX2")),
                      exitOnFalse(() => installWingetPackage("Microsoft.PowerToys")),
                      exitOnFalse(() => installWingetPackage("Microsoft.Powershell")),
                      exitOnFalse(() => installWingetPackage("AltSnap.AltSnap")),
                      exitOnFalse(() => installWingetPackage("VideoLAN.VLC")),
                      exitOnFalse(() => installWingetPackage("OBSProject.OBSStudio")),
                      exitOnFalse(() => installWingetPackage("Valve.Steam")),
                      exitOnFalse(() => installWingetPackage("EpicGames.EpicGamesLauncher")),
                      exitOnFalse(() => installWingetPackage("Discord.Discord")),
                      exitOnFalse(() => installWingetPackage("Spotify.Spotify", true)),
                      exitOnFalse(() => installWingetPackage("Google.QuickShare")),
                      exitOnFalse(() => installWingetPackage("Mozilla.Thunderbird")),
                      exitOnFalse(() => installWingetPackage("OO-Software.ShutUp10")),
                      exitOnFalse(() => installWingetPackage("Figma.Figma")),
                      exitOnFalse(() => installWingetPackage("dbeaver.dbeaver")),
                      // maybe docker
                      // exitOnFalse(() => installWingetPackage("PostgreSQL.PostgreSQL.16"))
                      exitOnFalse(() => installWingetPackage("Docker.DockerDesktop")),
                      // exitOnFalse(() => installWingetPackage("TwinGate.Client"))
                      exitOnFalse(() => installWingetPackage("VoidTools.Everything")),
                      exitOnFalse(() => installWingetPackage("WiresharkFoundation.Wireshark")),
                      exitOnFalse(() => installWingetPackage("Modrinth.ModrinthApp")),
                      exitOnFalse(() => installWingetPackage("WinSCP.WinSCP")),
                      exitOnFalse(() => installWingetPackage("RARLab.WinRAR")),
                      exitOnFalse(() => installWingetPackage("Nextcloud.NextcloudDesktop")),
                      exitOnFalse(() => installWingetPackage("MacType.MacType")),
                      exitOnFalse(() => installWingetPackage("Ollama.Ollama")),
                      exitOnFalse(() => installWingetPackage("flxzt.rnote")),
                      exitOnFalse(() => installWingetPackage("GIMP.GIMP")),
                      exitOnFalse(() => installWingetPackage("eza-community.eza")),
                      exitOnFalse(() => installWingetPackage("nepnep.neofetch-win")),
                    ])

  console.log("Packages installed successfully!")

  console.log("Modding Discord...")

  await exitOnFalse(() => installWingetPackage("Vendicated.Vencord", true))

  console.log("Modding Spotify...")

  await exitOnFalse(() => installWingetPackage("Spicetify.Spicetify", true))

  console.log("Configuring Alacritty...")

  try {
    cpSync(
        "configuration/windows/alacritty.toml", `${process.env.USERPROFILE}/AppData/Local/alacritty/alacritty.toml`,
        { recursive: true, force: true }
    )
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  console.log("Configuring Powershell...")

  try {
    cpSync(
        "configuration/windows/Microsoft.PowerShell_profile.ps1",
        `${process.env.USERPROFILE}/Documents/PowerShell/Microsoft.PowerShell_profile.ps1`,
        { recursive: true, force: true }
    )
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  console.log("Configuring Windows Terminal...")

  try {
    cpSync(
        "configuration/windows/windows_terminal_settings.json",
        `${process.env.USERPROFILE}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`,
        { recursive: true, force: true }
    )
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  console.log("Configuring Neovim...")

  await executeCommand(
      [ "git", "clone", "https://github.com/NvChad/starter", `${process.env.USERPROFILE}/AppData/Local/nvim` ])

  console.log("Installing fonts...")

  async function installFont(fontName: string, fontDisplayName: string, url: string) {
    try {
      console.log(`Installing ${fontDisplayName}...`)
      // does the font exist?
      if (!existsSync(`fonts/${fontName}.zip`)) {
        console.log(`Downloading ${fontDisplayName}...`)

        let resp = (await (await fetch(url)).bytes())
        const file = Bun.file(`fonts/${fontName}.zip`)
        file.write(resp)
      } else {
        console.log(`Using cached ${fontDisplayName}!`)
      }

      console.log(`Extracting ${fontDisplayName}...`)
      await executeCommand([
                             "pwsh.exe",
                             "-Command",
                             `Import-Module Microsoft.PowerShell.Archive && Expand-Archive -Force -Path fonts/${fontName}.zip -DestinationPath C:\\Windows\\Fonts`
                           ])
      console.log(`${fontDisplayName} installed successfully!`)
    } catch (e) {
      console.error(`Failed to install font ${fontDisplayName}!`)
      console.error(e)
      process.exit(1)
    }
  }

  await installFont(
      "JetBrainsMono", "JetBrains Mono",
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip"
  )
  await installFont("Gohu", "Gohu", "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Gohu.zip")
  await installFont("Hack", "Hack", "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Hack.zip")
  await installFont(
      "FiraCode", "Fira Code",
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/FiraCode.zip"
  )
  await installFont("Meslo", "Meslo", "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Meslo.zip")
  await installFont(
      "MartianMono", "Martian Mono",
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/MartianMono.zip"
  )
  await installFont(
      "DepartureMono", "Departure Mono",
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/DepartureMono.zip"
  )
  await installFont(
      "BigBlueTerminal", "Big Blue Terminal",
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/BigBlueTerminal.zip"
  )
  await installFont(
      "IntelOneMono", "Intel One Mono",
      "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/IntelOneMono.zip"
  )

  try {
    fs.rmSync("C:\\Windows\\Fonts\\License")
  } catch (err) {
    // do nothing
  }

  try {
    fs.rmSync("C:\\Windows\\Fonts\\LICENSE.txt")
  } catch (err) {
    // do nothing
  }

  try {
    fs.rmSync("C:\\Windows\\Fonts\\README.md")
  } catch (err) {
    // do nothing
  }

  return
}