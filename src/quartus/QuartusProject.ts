/**
 * @fileoverview the class that represents each Quartus Project.
 * It will automatically generate the TCL scripts required for the quartus project.
 */

import { assert } from 'console';
import * as vscode from 'vscode';



export class QuartusProject {
    deviceFamily: string;
    partNumber: string;
    projectName: string;

    constructor(deviceFamily: string, partNumber: string, projectName: string) {
        if (QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
            throw new Error('Device family is not supported');
        } else {
            this.deviceFamily = deviceFamily;
        }

        if (QuartusProject.checkPartNumber(partNumber, deviceFamily) !== null) {
            throw new Error('Part number is not supported');
        } else {
            this.partNumber = partNumber;
        }

        if (QuartusProject.checkProjectName(projectName) !== null) {
            throw new Error('Project name is not valid');
        } else {
            this.projectName = projectName;
        }
    }

    async init() {
        console.log("CREATED");
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
            throw new Error('Device family is not supported');
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
}
