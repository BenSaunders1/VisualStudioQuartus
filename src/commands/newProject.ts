import * as vscode from "vscode";
import { QuartusProject } from "../quartus/QuartusProject";
import { INFO_MESSAGES } from "../constants";

export const newProjectSetup = async (newDir: vscode.Uri) => {
  vscode.window.showInformationMessage(INFO_MESSAGES.NEW_PROJECT);

  const selectedProjectName =
    (await vscode.window.showInputBox({
      placeHolder: "Enter the name of the project",
      prompt:
        "This is the name of the project that will be created (You must not use spaces in the project title)",
      validateInput: QuartusProject.checkProjectName,
    })) ?? "";

  const selectedDeviceFamily =
    (await vscode.window.showQuickPick(QuartusProject.getDeviceFamilyList(), {
      placeHolder: "Select the device family",
    })) ?? "";

  const selectedPartNumber =
    (await vscode.window.showQuickPick(
      QuartusProject.getPartNumberList(selectedDeviceFamily),
      {
        placeHolder: "Select the part number",
      }
    )) ?? "";

  // TODO: Make sure project does not already exist

  const project = new QuartusProject(
    selectedDeviceFamily,
    selectedPartNumber,
    selectedProjectName,
    newDir
  );

  await project.init();
};

export function getCommand() {
  return async () => {
    const options: vscode.OpenDialogOptions = {
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Open Folder",
    };

    const folderUri = await vscode.window.showOpenDialog(options);

    if (folderUri && folderUri.length > 0) {
      console.log(folderUri[0]);

      // TODO: Extrapolate project from a quartus project that already exists.

      await newProjectSetup(folderUri[0]);

      vscode.commands.executeCommand("vscode.openFolder", folderUri[0]);
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
  };
}
