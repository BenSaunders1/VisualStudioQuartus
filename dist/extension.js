"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// supported-devices.json
var require_supported_devices = __commonJS({
  "supported-devices.json"(exports2, module2) {
    module2.exports = {
      device_family: [{ name: "MAX10", part_numbers: ["10M50DAF484C7G"] }]
    };
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));

// src/quartus/newProject.ts
var vscode = __toESM(require("vscode"));

// src/quartus/QuartusProject.ts
var QuartusProject = class _QuartusProject {
  deviceFamily;
  partNumber;
  projectName;
  constructor(deviceFamily, partNumber, projectName) {
    if (_QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
      throw new Error("Device family is not supported");
    } else {
      this.deviceFamily = deviceFamily;
    }
    if (_QuartusProject.checkPartNumber(partNumber, deviceFamily) !== null) {
      throw new Error("Part number is not supported");
    } else {
      this.partNumber = partNumber;
    }
    if (_QuartusProject.checkProjectName(projectName) !== null) {
      throw new Error("Project name is not valid");
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
  static getDeviceFamilyList() {
    const supportedDevices = require_supported_devices();
    return supportedDevices.device_family.map((deviceFamily) => {
      return deviceFamily.name;
    });
  }
  /**
   * Generates a list of supported part numbers.
   * @returns string[] list of supported part numbers
   * @param deviceFamily string input for the device family
   * @returns string[] list of supported part numbers
   */
  static getPartNumberList(deviceFamily) {
    const supportedDevices = require_supported_devices();
    if (_QuartusProject.checkDeviceFamily(deviceFamily) !== null) {
      throw new Error("Device family is not supported");
    }
    const partNumbers = supportedDevices.device_family.filter((family) => {
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
  static checkDeviceFamily(deviceFamily) {
    const supportedDevices = require_supported_devices();
    const deviceFamilyNames = supportedDevices.device_family.map((deviceFamily2) => {
      return deviceFamily2.name;
    });
    if (!deviceFamilyNames.includes(deviceFamily)) {
      return "Invalid device family";
    }
    return null;
  }
  /**
   * Ensures the inputed part number is supported by the extension.
   * Supported devices can be found in the supported-devices.json file.
   * @param partNumber string input for the part number
   * @returns null if good, and error message string if bad (as per "validateInput" in vscode.window.showInputBox)
   */
  static checkPartNumber(partNumber, deviceFamily) {
    const supportedDevices = require_supported_devices();
    if (!_QuartusProject.checkDeviceFamily(deviceFamily)) {
      throw new Error("Device family is not supported");
    }
    const partNumbers = supportedDevices.device_family[deviceFamily].part_numbers;
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
  static checkProjectName(projectName) {
    if (projectName === "") {
      return "Project name must not be empty";
    }
    if (projectName.includes(" ")) {
      return "Project name must not contain spaces";
    }
    if (!projectName.match(/^[0-9a-zA-Z]+$/)) {
      return "Project name must only contain alphanumeric characters";
    }
    return null;
  }
};

// src/quartus/newProject.ts
function getCommand() {
  return async () => {
    const options = {
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Open Folder"
    };
    const folderUri = await vscode.window.showOpenDialog(options);
    if (folderUri && folderUri.length > 0) {
      console.log(folderUri[0]);
      vscode.commands.executeCommand("vscode.openFolder", folderUri[0]);
    }
    vscode.window.showInformationMessage("Quartus: Making new project. Please fill in the required prompts to get started.");
    const selectedProjectName = await vscode.window.showInputBox({
      placeHolder: "Enter the name of the project",
      prompt: "This is the name of the project that will be created (You must not use spaces in the project title)",
      validateInput: QuartusProject.checkProjectName
    }) ?? "";
    const selectedDeviceFamily = await vscode.window.showQuickPick(QuartusProject.getDeviceFamilyList(), {
      placeHolder: "Select the device family"
    }) ?? "";
    const selectedPartNumber = await vscode.window.showQuickPick(QuartusProject.getPartNumberList(selectedDeviceFamily), {
      placeHolder: "Select the part number"
    }) ?? "";
    const project = new QuartusProject(selectedDeviceFamily, selectedPartNumber, selectedProjectName);
    await project.init();
  };
}

// src/extension.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var commands3 = [
  { alias: "quartusextension.newProject", callback: getCommand() }
];
function activate(context) {
  const detectQuartusProject = () => {
    const workspaceFolders = vscode2.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return false;
    }
    const folderPath = workspaceFolders[0].uri.fsPath;
    return fs.existsSync(path.join(folderPath, ".quartus"));
  };
  vscode2.commands.executeCommand("setContext", "detectQuartusProject", detectQuartusProject());
  console.log('Congratulations, your extension "quartusextension" is now active!');
  const disposable = vscode2.commands.registerCommand("quartusextension.helloWorld", () => {
    vscode2.window.showInformationMessage("Hello World from QuartusExtension!");
  });
  context.subscriptions.push(disposable);
  for (const command of commands3) {
    const disposable2 = vscode2.commands.registerCommand(command.alias, command.callback);
    context.subscriptions.push(disposable2);
  }
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
