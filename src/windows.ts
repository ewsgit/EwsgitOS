import fs, { cp, cpSync, existsSync } from "fs"

async function installWingetPackage(packageId: string, notAdmin?: boolean) {
    console.log(`Installing '${packageId}'...`)

    let proc;

    if (notAdmin) {
        proc = Bun.spawn([ "runas", "/trustlevel:0x20000", `${process.env.LOCALAPPDATA}/Microsoft/WindowsApps/winget.exe install --silent --accept-source-agreements --id ${packageId}` ], { stdout: "pipe", stderr: "pipe" })
        console.warn("This package was installed without admin privileges, we cannot verify if it was installed successfully!")
        return true
    } else {
        proc = Bun.spawn([ `${process.env.LOCALAPPDATA}/Microsoft/WindowsApps/winget.exe`, "install", "--silent", "--accept-source-agreements", "--id", packageId ], { stdout: "pipe", stderr: "pipe" })
    }

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

    if (fullStdout.includes("Successfully installed") || fullStdout.includes("No newer package versions are available") || fullStdout.includes("The package cannot be upgraded using winget."))
        return true

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
    await exitOnFalse(() => installWingetPackage("Alacritty.Alacritty"))
    await exitOnFalse(() => installWingetPackage("Microsoft.VisualStudioCode"))
    await exitOnFalse(() => installWingetPackage("Neovim.Neovim"))
    await exitOnFalse(() => installWingetPackage("Git.Git"))
    await exitOnFalse(() => installWingetPackage("Docker.DockerDesktop"))
    await exitOnFalse(() => installWingetPackage("Alex313031.Thorium.AVX2"))
    await exitOnFalse(() => installWingetPackage("Microsoft.PowerToys"))
    await exitOnFalse(() => installWingetPackage("Microsoft.Powershell"))
    await exitOnFalse(() => installWingetPackage("AltSnap.AltSnap"))
    await exitOnFalse(() => installWingetPackage("VideoLAN.VLC"))
    await exitOnFalse(() => installWingetPackage("OBSProject.OBSStudio"))
    await exitOnFalse(() => installWingetPackage("Valve.Steam"))
    await exitOnFalse(() => installWingetPackage("EpicGames.EpicGamesLauncher"))
    await exitOnFalse(() => installWingetPackage("Discord.Discord"))
    await exitOnFalse(() => installWingetPackage("Spotify.Spotify", true))
    await exitOnFalse(() => installWingetPackage("Google.QuickShare"))
    await exitOnFalse(() => installWingetPackage("Mozilla.Thunderbird"))
    await exitOnFalse(() => installWingetPackage("OO-Software.ShutUp10"))
    await exitOnFalse(() => installWingetPackage("Figma.Figma"))
    await exitOnFalse(() => installWingetPackage("dbeaver.dbeaver"))
    // maybe docker
    // await exitOnFalse(() => installWingetPackage("PostgreSQL.PostgreSQL.16"))
    await exitOnFalse(() => installWingetPackage("Docker.DockerDesktop"))
    // await exitOnFalse(() => installWingetPackage("TwinGate.Client"))
    await exitOnFalse(() => installWingetPackage("VoidTools.Everything"))
    await exitOnFalse(() => installWingetPackage("WiresharkFoundation.Wireshark"))
    await exitOnFalse(() => installWingetPackage("Modrinth.ModrinthApp"))
    await exitOnFalse(() => installWingetPackage("WinSCP.WinSCP"))
    await exitOnFalse(() => installWingetPackage("RARLab.WinRAR"))
    await exitOnFalse(() => installWingetPackage("Nextcloud.NextcloudDesktop"))
    await exitOnFalse(() => installWingetPackage("MacType.MacType"))
    await exitOnFalse(() => installWingetPackage("Ollama.Ollama"))
    await exitOnFalse(() => installWingetPackage("flxzt.rnote"))
    await exitOnFalse(() => installWingetPackage("GIMP.GIMP"))
    await exitOnFalse(() => installWingetPackage("eza-community.eza"))
    await exitOnFalse(() => installWingetPackage("nepnep.neofetch-win"))

    console.log("Packages installed successfully!")

    console.log("Modding Discord...")

    await exitOnFalse(() => installWingetPackage("Vendicated.Vencord"))

    console.log("Modding Spotify...")

    await exitOnFalse(() => installWingetPackage("Spicetify.Spicetify"))

    console.log("Configuring Alacritty...")

    try {
        cpSync("configuration/windows/alacritty.toml", `${process.env.USERPROFILE}/AppData/Local/alacritty/alacritty.toml`, { recursive: true, force: true })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

    console.log("Configuring Powershell...")

    try {
        cpSync("configuration/windows/Microsoft.PowerShell_profile.ps1", `${process.env.USERPROFILE}/Documents/PowerShell/Microsoft.PowerShell_profile.ps1`, { recursive: true, force: true })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

    console.log("Configuring Windows Terminal...")

    try {
        cpSync("configuration/windows/windows_terminal_settings.json", `${process.env.USERPROFILE}/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`, { recursive: true, force: true })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }

    console.log("Configuring Neovim...")

    await executeCommand([ "git", "clone", "https://github.com/NvChad/starter", `${process.env.USERPROFILE}/AppData/Local/nvim` ])

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
            executeCommand([ "pwsh.exe", "-Command", `Import-Module Microsoft.PowerShell.Archive && Expand-Archive -Force -Path fonts/${fontName}.zip -DestinationPath C:\\Windows\\Fonts` ])
            console.log(`${fontDisplayName} installed successfully!`)
        } catch (e) {
            console.error(`Failed to install font ${fontDisplayName}!`)
            console.error(e)
            process.exit(1)
        }
    }

    await installFont(
        "JetBrainsMono",
        "JetBrains Mono",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip"
    )
    await installFont(
        "Gohu",
        "Gohu",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Gohu.zip"
    )
    await installFont(
        "Hack",
        "Hack",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Hack.zip"
    )
    await installFont(
        "FiraCode",
        "Fira Code",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/FiraCode.zip"
    )
    await installFont(
        "Meslo",
        "Meslo",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Meslo.zip"
    )
    await installFont(
        "MartianMono",
        "Martian Mono",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/MartianMono.zip"
    )
    await installFont(
        "DepartureMono",
        "Departure Mono",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/DepartureMono.zip"
    )
    await installFont(
        "BigBlueTerminal",
        "Big Blue Terminal",
        "https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/BigBlueTerminal.zip"
    )
    await installFont(
        "IntelOneMono",
        "Intel One Mono",
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