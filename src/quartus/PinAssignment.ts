import * as vscode from "vscode";

export class PinAssignment {
    pins: Pin[] = [];

    // TODO: Fix this god awful mess.
    // Apologies to whoever has to read this.
    static async fromCSV(file: string): Promise<PinAssignment | undefined> {
        const pinAssignment = new PinAssignment();

        console.log(file);

        // Open CSV file
        const CSVFile = await vscode.workspace.openTextDocument(file);

        // Parse CSV file
        const lines = CSVFile.getText().split("\n");

        let header: string[] = [];
        
        let nameIndex = -1;
        let directionIndex = -1;
        let locationIndex = -1;
        let IOBankIndex = -1;
        let VrefGroupIndex = -1;
        let IOStandardIndex = -1;
        
        // Parse each line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(",");
            if (line.length < 6) {
                continue;
            }


            // First line after comments is the header
            if (header.length === 0) {
                header = line;
                if (
                    !header.includes("To") ||
                    !header.includes("Direction") ||
                    !header.includes("Location") ||
                    !header.includes("I/O Bank") ||
                    !header.includes("VREF Group") ||
                    !header.includes("I/O Standard")
                ) {
                    vscode.window.showErrorMessage("Invalid pin assignment file. Missing required columns.");
                    return undefined;
                }
                nameIndex = header.indexOf("To");
                directionIndex = header.indexOf("Direction");
                locationIndex = header.indexOf("Location");
                IOBankIndex = header.indexOf("I/O Bank");
                VrefGroupIndex = header.indexOf("VREF Group");
                IOStandardIndex = header.indexOf("I/O Standard");

                continue;
            }

            const pin = {
                name: line[nameIndex],
                direction: line[directionIndex] as PinDirection,
                location: line[locationIndex],
                IOBank: parseInt(line[IOBankIndex]),
                VrefGroup: line[VrefGroupIndex],
                IOStandard: line[IOStandardIndex]
            } as Pin;

            pinAssignment.pins.push(pin);
        }

        return pinAssignment;
    }
}

export interface Pin {
    name: string;
    direction: PinDirection;
    location: string;
    IOBank: number;
    VrefGroup: string;
    IOStandard: string;
}

type PinDirection = "Output" | "Input" | "Unknown" | "Bidir";
