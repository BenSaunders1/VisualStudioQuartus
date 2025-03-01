/**
 * @fileoverview the class that represents each Quartus Project.
 * It will automatically generate the TCL scripts required for the quartus project.
 */

import { assert } from "console";
import * as vscode from "vscode";
import { TclScript } from "../tcl-utils/TclScript";
import {
  ERRORS,
  PATHS,
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_DEVICES,
} from "../constants";

export class QuartusProject {
  deviceFamily: string;
  partNumber: string;
  projectName: string;
  directory: vscode.Uri;

  constructor(
    deviceFamily: string,
    partNumber: string,
    projectName: string,
    directory: vscode.Uri
  ) {
    this.directory = directory;

    console.log("Checking Device Family");
    const deviceFamilyCheck = QuartusProject.checkDeviceFamily(deviceFamily)
    if (deviceFamilyCheck !== null) {
      console.error(deviceFamilyCheck);
    }
    this.deviceFamily = deviceFamily;

    console.log("Checking Part Number");
    const partNumberCheck = QuartusProject.checkPartNumber(partNumber, deviceFamily);
    if (partNumberCheck !== null) {
      console.error(partNumberCheck);
    }
    this.partNumber = partNumber;

    console.log("Checking Project Name");
    const projectNameCheck = QuartusProject.checkProjectName(projectName);
    if (projectNameCheck !== null) {
      console.error(projectNameCheck);
    }
    this.projectName = projectName;

    console.log("Contructor Complete");
    QuartusProject.export(this);
  }

  async init() {
    // Make VSQ Dir
    vscode.workspace.fs.createDirectory(
      vscode.Uri.joinPath(this.directory, PATHS.VSQUARTUS_DIR)
    );
    vscode.workspace.fs.createDirectory(
      vscode.Uri.joinPath(this.directory, PATHS.VSQUARTUS_DIR, PATHS.TCL_SCRIPTS_DIR)
    );

    // Make the TCL Script
    const script = new TclScript(
      "create_project.tcl",
      vscode.Uri.joinPath(this.directory, PATHS.VSQUARTUS_DIR)
    );

    // script.addCommand("set output_dir " + this.directory.fsPath);

    script.addCommand("project_new " + this.projectName + " -overwrite");
    script.addCommand(
      'set_global_assignment -name FAMILY "' + this.deviceFamily + '"'
    );
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
      directory: this.directory.toString(),
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
    const project = new QuartusProject(
      json.deviceFamily,
      json.partNumber,
      json.projectName,
      pathUri
    );
    return project;
  }

  /**
   * Exports the QuartusProject object to the project directory.
   * @param project QuartusProject object
   */
  static async export(project: QuartusProject) {
    const projectJSON = project.toJSON();
    const directory = vscode.Uri.joinPath(
      project.directory,
      PATHS.VSQUARTUS_DIR,
      PATHS.CONFIG_FILE
    );
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
      console.error("No workspace folder is open");
      return;
    }

    const projectString = await vscode.workspace.fs.readFile(
      vscode.Uri.joinPath(directory, PATHS.VSQUARTUS_DIR, PATHS.CONFIG_FILE)
    );
    const projectJSON = JSON.parse(projectString.toString());
    return QuartusProject.fromJSON(projectJSON);
  }

  /**
   * Generates a list of supported device families.
   * @returns string[] list of supported device families
   */
  static getDeviceFamilyList(): string[] {
    return SUPPORTED_DEVICES.map(
      (deviceFamily: { name: string; part_numbers: Array<string> }) => {
        return deviceFamily.name;
      }
    );
  }

  /**
   * Generates a list of supported part numbers.
   * @returns string[] list of supported part numbers
   * @param deviceFamily string input for the device family
   * @returns string[] list of supported part numbers
   */
  static getPartNumberList(deviceFamily: string): string[] {

    if (QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
        console.log(ERRORS.INVALID_DEVICE_FAMILY);
      throw new Error(ERRORS.INVALID_DEVICE_FAMILY); //? do we need this
    }

    const partNumbers = SUPPORTED_DEVICES.filter(
      (family: { name: string; part_numbers: Array<string> }) => {
        return family.name === deviceFamily;
      }
    )[0].part_numbers;

    return partNumbers;
  }

  /**
   * Ensures the inputed device family is supported by the extension.
   * Supported devices can be found in the supported-devices.json file.
   * @param deviceFamily string input for the device family
   * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
   */
  static checkDeviceFamily(deviceFamily: string): string | null {
    const deviceFamilyNames = SUPPORTED_DEVICES.map(
      (deviceFamily: { name: string; part_numbers: Array<string> }) => {
        return deviceFamily.name;
      }
    );
    console.log("device famililes: ", deviceFamilyNames);
    // Check the device family is in the list of supported devices
    if (!deviceFamilyNames.includes(deviceFamily)) {
      return ERRORS.INVALID_DEVICE_FAMILY;
    }

    return null;
  }

  /**
   * Ensures the inputed part number is supported by the extension.
   * Supported devices can be found in the supported-devices.json file.
   * @param partNumber string input for the part number
   * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
   */
  static checkPartNumber(
    partNumber: string,
    deviceFamily: string
  ): string | null {
    if (QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
      return ERRORS.INVALID_DEVICE_FAMILY;
    }

    const partNumbers = SUPPORTED_DEVICES.filter(
      (d) => d.name === deviceFamily
    ).map((deviceFamily: { name: string; part_numbers: Array<string> }) => {
      return deviceFamily.part_numbers;
    }).flat(); //! fix later

    // Check the device name is in the list of supported devices
    if (!partNumbers.includes(partNumber)) {
      return ERRORS.INVALID_PART_NUMBER;
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
      return ERRORS.EMPTY_PROJECT_NAME;
    }

    // Check for spaces
    if (projectName.includes(" ")) {
      return ERRORS.SPACES_PROJECT_NAME;
    }

    // Check alphanumeric characters
    if (!projectName.match(/^[0-9a-zA-Z]+$/)) {
      return ERRORS.INVALID_PROJECT_NAME;
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
      return ERRORS.EMPTY_FILE_NAME;
    }

    // Check for spaces
    if (fileName.includes(" ")) {
      return ERRORS.EMPTY_FILE_NAME;
    }

    // Check alphanumeric characters
    if (!fileName.match(/^[0-9a-zA-Z.]+$/)) {
      return ERRORS.INVALID_FILE_NAME;
    }

    // Check for file extension
    if (
      !fileName.includes(".") ||
      (fileName.includes(".") &&
        !SUPPORTED_FILE_EXTENSIONS.includes("." + fileName.split(".").pop()!))
    ) {
      return (
        "File name must have a valid file extension: " +
        SUPPORTED_FILE_EXTENSIONS.join(", ")
      );
    }

    return null;
  }
}
