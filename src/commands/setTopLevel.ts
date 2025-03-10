import * as vscode from "vscode";
import { TclScript } from "../tcl-utils/TclScript";
import { QuartusProject } from "../quartus/QuartusProject";
import { PATHS, FILE_TYPES } from "../constants";
import { DesignFile } from "../views/DesignFilesDataProvider";

export function getCommand() {
  return async (designFile: DesignFile) => {
    const project = await QuartusProject.import();

    if (!project) {
      vscode.window.showErrorMessage(
        "No project found. Please create a project first."
      );
      return;
    }

    const script = new TclScript(
      "set_top_level_module.tcl",
      vscode.Uri.joinPath(project.directory, PATHS.VSQUARTUS_DIR)
    );

    const selectedFileName = designFile.label as string;

    if (!selectedFileName) {
      return;
    }

    console.log(designFile);
    console.log(selectedFileName);

    const selectedDesignEntity = selectedFileName.split(".")[0];

    //TODO: Add a check to ensure the file is in the quartus project

    script.addCommand("project_open " + project.projectName);
    script.addCommand(
      `set_global_assignment -name TOP_LEVEL_ENTITY  ${selectedDesignEntity}`
    );
    script.addCommand("project_close");

    console.log(script.scriptContents);

    await script.execute();

    script.delete();

    vscode.commands.executeCommand("quartus-design-files.refresh");
  };
}
