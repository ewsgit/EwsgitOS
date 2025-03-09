// EwsgitOS © 2025 Ewsgit

import process from "process";
import installWindows from "./windows";

// Welcome to the EwsgitOS installer!

async function main() {
    const operatingSystem = process.platform;

    try {
        switch (operatingSystem) {
            case "win32":
                console.log("Installing EwsgitOS on Windows...")

                // @ts-ignore
                if (process.env.HAS_STARTED_FROM_SCRIPT !== "1") {
                    console.error("The EwsgitOS Installer must be started using the platform-specific script.\nAs you are on Windows, please run the ./init.ps1 from the project root.")
                    process.exit(1)
                }

                await installWindows()
                break;
            case "linux":
                console.log("Installing EwsgitOS on Linux...")

                // @ts-ignore
                if (process.env.HAS_STARTED_FROM_SCRIPT !== 1) {
                    console.error("The EwsgitOS Installer must be started using the platform-specific script.\nAs you are on Linux, please run the ./init.sh from the project root.")
                }

                // TODO: implement me
                console.log("Not yet implemented for Linux!")
                break;
            default:
                console.log(`Unsupported operating system ${process.platform}.`)
                process.exit(1)
        }

        console.log("EwsgitOS installed successfully!")
    } catch (error) {
        console.error("Error installing EwsgitOS:", error)
        process.exit(1)
    }
}

main()