import * as vscode from "vscode";
import { TclScript } from "../tcl-utils/TclScript";
import { QuartusProject } from "./QuartusProject";
import { PATHS, FILE_TYPES } from "../constants";

export function getCommand() {
  return async () => {
    const project = await QuartusProject.import();

    if (!project) {
      vscode.window.showErrorMessage(
        "No project found. Please create a project first."
      );
      return;
    }

    const selectedFileName =
      (await vscode.window.showInputBox({
        placeHolder: "Enter the name of the file",
        prompt:
          "This is the name of the file that will be file (You must not use spaces in the file title)",
        validateInput: QuartusProject.checkFileName,
      })) ?? "";

    const fileExt = selectedFileName.split(".").pop();

    var fileType;

    switch (fileExt) {
      case "v":
        fileType = FILE_TYPES.VERILOG;
        break;
      case "vhdl":
        fileType = FILE_TYPES.VHDL;
        break;
      case "vhd":
        fileType = FILE_TYPES.VHDL;
        break;
      default:
        fileType = FILE_TYPES.VERILOG;
        break;
    }

    vscode.workspace.fs.writeFile(
      vscode.Uri.joinPath(project.directory, selectedFileName),
      new Uint8Array(0)
    );

    const script = new TclScript(
      "add_project_files.tcl",
      vscode.Uri.joinPath(project.directory, PATHS.VSQUARTUS_DIR)
    );

    script.addCommand("project_open " + project.projectName);
    script.addCommand(
      `set_global_assignment -name ${fileType} ${selectedFileName}`
    );
    script.addCommand("project_close");

    console.log(script.scriptContents);

    await script.execute();

    script.delete();

    vscode.commands.executeCommand("quartus-design-files.refresh");
  };
}
