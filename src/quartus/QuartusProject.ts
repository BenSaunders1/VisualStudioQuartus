/**
 * @fileoverview the class that represents each Quartus Project.
 * It will automatically generate the TCL scripts required for the quartus project.
 */

import { assert } from 'console';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { TclScript } from '../tcl-utils/TclScript';



export class QuartusProject {
    deviceFamily: string;
    partNumber: string;
    projectName: string;
    directory: vscode.Uri;

    constructor(deviceFamily: string, partNumber: string, projectName: string, directory: vscode.Uri) {
        this.directory = directory;

        console.log("Checking Device Family");
        if (QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
            console.error('Device family is not supported');
        }
        this.deviceFamily = deviceFamily;

        console.log("Checking Part Number");
        if (QuartusProject.checkPartNumber(partNumber, deviceFamily) !== null) {
            console.error('Part number is not supported');
        }
        this.partNumber = partNumber;

        console.log("Checking Project Name");
        if (QuartusProject.checkProjectName(projectName) !== null) {
            console.error('Project name is not valid');
        }
        this.projectName = projectName;

        console.log("Contructor Complete");
        QuartusProject.export(this);
    }

    async init() {
        // Make VSQ Dir
        vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(this.directory, '.vsquartus'));
        vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(this.directory, '.vsquartus', 'tcl-scripts'));

        // Make the TCL Script
        const script = new TclScript('create_project.tcl', vscode.Uri.joinPath(this.directory, '.vsquartus'));


        // script.addCommand("set output_dir " + this.directory.fsPath);

        script.addCommand("project_new " + this.projectName + " -overwrite");
        script.addCommand("set_global_assignment -name FAMILY \"" + this.deviceFamily + "\"");
        script.addCommand("set_global_assignment -name DEVICE " + this.partNumber);
        script.addCommand("project_close");

        // Execute the script
        await script.execute();

        // Delete the script
        script.delete();
    }

    /**
     * Converts the QuartusProject object to a JSON object.
     * @returns JSON object
     */
    toJSON() {
        return {
            deviceFamily: this.deviceFamily,
            partNumber: this.partNumber,
            projectName: this.projectName,
            directory: this.directory.toString()
        };
    }

    /**
     * Converts a JSON object to a QuartusProject object.
     * @param json JSON object
     * @returns QuartusProject object
     */
    static fromJSON(json: any): QuartusProject {
        console.log(json.directory);
        const pathUri = vscode.Uri.parse(json.directory);
        console.log(pathUri);
        const project = new QuartusProject(json.deviceFamily, json.partNumber, json.projectName, pathUri);
        return project;
    }

    /**
     * Exports the QuartusProject object to the project directory.
     * @param project QuartusProject object
     */
    static async export(project: QuartusProject) {
        const projectJSON = project.toJSON();   
        const directory = vscode.Uri.joinPath(project.directory, '.vsquartus', 'config.json');
        const buffer = Buffer.from(JSON.stringify(projectJSON));
        vscode.workspace.fs.writeFile(directory, buffer);
    }

    /**
     * Imports a QuartusProject object from the project directory.
     * @param directory vscode.Uri of the project directory
     * @returns QuartusProject object
     */
    static async import(): Promise<QuartusProject | undefined> {
        const directory = vscode.workspace.workspaceFolders?.[0].uri;
        if (!directory) {
            console.error('No workspace folder is open');
            return;
        }

        const projectString = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(directory, '.vsquartus', 'config.json'));
        const projectJSON = JSON.parse(projectString.toString());
        return QuartusProject.fromJSON(projectJSON);
    }

    /**
     * Generates a list of supported device families.
     * @returns string[] list of supported device families
     */
    static getDeviceFamilyList(): string[] {
        // Load in the supported-devices.json file
        const supportedDevices = require('../../supported-devices.json');
        return supportedDevices.device_family.map((deviceFamily: {name: string, part_numbers: Array<string>}) => {
            return deviceFamily.name;
        });
    }

    /**
     * Generates a list of supported part numbers.
     * @returns string[] list of supported part numbers
     * @param deviceFamily string input for the device family
     * @returns string[] list of supported part numbers
     */
    static getPartNumberList(deviceFamily: string): string[] {
        // Load in the supported-devices.json file
        const supportedDevices = require('../../supported-devices.json');

        if (QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
            throw new Error('Device family is not supported');
        }

        const partNumbers = supportedDevices.device_family.filter((family: {name: string, part_numbers: Array<string>}) => {
            return family.name === deviceFamily;
        })[0].part_numbers;

        return partNumbers;
    }

    /**
     * Ensures the inputed device family is supported by the extension. 
     * Supported devices can be found in the supported-devices.json file.
     * @param deviceFamily string input for the device family
     * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
     */
    static checkDeviceFamily(deviceFamily: string): string | null {
        // Load in the supported-devices.json file
        const supportedDevices = require('../../supported-devices.json');

        const deviceFamilyNames = supportedDevices.device_family.map((deviceFamily: {name: string, part_numbers: Array<string>}) => {
            return deviceFamily.name;
        });

        // Check the device family is in the list of supported devices
        if (!deviceFamilyNames.includes(deviceFamily)) {
            return 'Invalid device family';
        }

        return null;
    }

    /**
     * Ensures the inputed part number is supported by the extension.
     * Supported devices can be found in the supported-devices.json file.
     * @param partNumber string input for the part number
     * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
     */
    static checkPartNumber(partNumber: string, deviceFamily: string): string | null {
        // Load in the supported-devices.json file
        const supportedDevices = require('../../supported-devices.json');

        if (!QuartusProject.checkDeviceFamily(deviceFamily)) {
            return "Invalid device family";
        }

        const partNumbers = supportedDevices.device_family[deviceFamily].part_numbers;

        // Check the device name is in the list of supported devices
        if (!partNumbers.includes(partNumber)) {
            return "Invalid part number for the chosen device family";
        }

        return null;
    }

    /**
     * Ensures the inputed project name is valid.
     * @param projectName string input for the project name
     * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
     */
    static checkProjectName(projectName: string): string | null {
        // Check for empty string
        if (projectName === "") {
            return "Project name must not be empty";
        }

        // Check for spaces
        if (projectName.includes(' ')) {
            return "Project name must not contain spaces";
        }
        
        // Check alphanumeric characters
        if (!projectName.match(/^[0-9a-zA-Z]+$/)) {
            return "Project name must only contain alphanumeric characters";
        }

        return null;
    }

    /**
     * Ensures the inputed file name is valid.
     * @param fileName string input for the file name
     * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
     */
    static checkFileName(fileName: string): string | null {
        // Check for empty string
        if (fileName === "") {
            return "File name must not be empty";
        }

        // Check for spaces
        if (fileName.includes(' ')) {
            return "File name must not contain spaces";
        }
        
        // Check alphanumeric characters
        if (!fileName.match(/^[0-9a-zA-Z.]+$/)) {
            return "File name must only contain alphanumeric characters";
        }

        const supportedFileTypes = ['.v', '.vhdl', '.vhd'];

        // Check for file extension
        if (!supportedFileTypes.includes(fileName.slice(-2))) {
            return "File name must have a valid file extension: " + supportedFileTypes.join(', ');
        }

        return null;
    }
}
